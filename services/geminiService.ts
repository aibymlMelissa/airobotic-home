import { GoogleGenAI, Type } from "@google/genai";
import { Device, EnvironmentState, AiActionResponse } from '../types';

const getGeminiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found. Simulation will use fallback logic.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const getAiDecision = async (
  userCommand: string,
  devices: Device[],
  envState: EnvironmentState
): Promise<AiActionResponse> => {
  const client = getGeminiClient();

  // Fallback mock logic if no API key is present
  if (!client) {
    return {
      reasoning: "API Key missing. Simulating local logic: Toggling device based on command.",
      actions: [],
      estimatedSavings: 0
    };
  }

  const prompt = `
    You are an intelligent Edge AI Matter Coordinator running locally on a Raspberry Pi.
    Your goal is to interpret user commands and optimize home energy usage based on current conditions.
    
    CURRENT CONTEXT:
    - Time: ${envState.time}:00
    - Energy Price: $${envState.energyPrice.toFixed(2)} / kWh (High price > $0.40)
    - External Temp: ${envState.temperature}°C
    - Occupancy: ${envState.occupancy ? 'Yes' : 'No'}
    
    AVAILABLE DEVICES:
    ${JSON.stringify(devices.map(d => ({ id: d.id, name: d.name, type: d.type, isOn: d.isOn, location: d.location })))}

    USER COMMAND: "${userCommand}"

    INSTRUCTIONS:
    1. Analyze the command and context.
    2. If energy price is high and the request is high-energy (like HVAC/Laundry), suggest delays or eco-modes unless it's an emergency.
    3. Return a JSON object with your reasoning, specific actions to take on devices, and estimated savings (in dollars) if you optimized the action.
    4. If the user command is vague (e.g., "Good morning"), execute a scene suitable for the time.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reasoning: { type: Type.STRING },
            actions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  deviceId: { type: Type.STRING },
                  action: { type: Type.STRING, enum: ['TURN_ON', 'TURN_OFF', 'SET_VALUE'] },
                  value: { type: Type.NUMBER } // Optional value for dimming/temp
                },
                required: ['deviceId', 'action']
              }
            },
            estimatedSavings: { type: Type.NUMBER }
          },
          required: ['reasoning', 'actions', 'estimatedSavings']
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AiActionResponse;
    }
    throw new Error("Empty response from AI");

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      reasoning: "I encountered an error processing that request. Please try again.",
      actions: [],
      estimatedSavings: 0
    };
  }
};