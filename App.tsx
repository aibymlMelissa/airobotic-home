import React, { useState, useEffect, useRef } from 'react';
import {
  Device, DeviceType, SimulationLog, EnvironmentState, AiActionResponse, FloorPlan
} from './types';
import DeviceCard from './components/DeviceCard';
import ConsoleLog from './components/ConsoleLog';
import EnergyChart from './components/EnergyChart';
import FloorPlanView from './components/FloorPlanView';
import { getAiDecision } from './services/geminiService';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import {
  Zap, Clock, Sun, Send, ShieldCheck, DollarSign,
  PlayCircle, PauseCircle, Activity, Settings,
  Home, Sliders, MessageSquare, Menu, Map, Mic, MicOff
} from 'lucide-react';

// --- INITIAL MOCK DATA ---
const INITIAL_DEVICES: Device[] = [
  // Original Core Devices
  { id: '1', name: 'Living Room Lights', type: DeviceType.LIGHT, isOn: false, location: 'Living Room', energyConsumption: 60, value: 0, unit: '%' },
  { id: '2', name: 'Main HVAC', type: DeviceType.THERMOSTAT, isOn: true, location: 'Hallway', energyConsumption: 3500, value: 21, unit: '°C' },
  { id: '3', name: 'Washer/Dryer', type: DeviceType.SMART_PLUG, isOn: false, location: 'Laundry', energyConsumption: 2000 },
  { id: '4', name: 'Kitchen Strip', type: DeviceType.SMART_PLUG, isOn: true, location: 'Kitchen', energyConsumption: 150 },
  { id: '5', name: 'Motion Sensor', type: DeviceType.SENSOR, isOn: true, location: 'Entry', energyConsumption: 5 },
  
  // Newly Added Devices
  { id: '6', name: 'Smart Blinds', type: DeviceType.BLINDS, isOn: true, location: 'Master Bedroom', energyConsumption: 10, value: 100, unit: '%' },
  { id: '7', name: 'Sensor Curtains', type: DeviceType.BLINDS, isOn: false, location: 'Living Room', energyConsumption: 15, value: 0, unit: '%' },
  { id: '8', name: 'Robotic Vacuum', type: DeviceType.VACUUM, isOn: false, location: 'Ground Floor', energyConsumption: 600, value: 'Docked' },
  { id: '9', name: 'AI Lawn Mower', type: DeviceType.MOWER, isOn: false, location: 'Garden', energyConsumption: 800, value: 'Docked' },
  { id: '10', name: 'AI Pool Cleaner', type: DeviceType.POOL_CLEANER, isOn: false, location: 'Pool', energyConsumption: 1200 },
  { id: '11', name: 'Dining Lights', type: DeviceType.LIGHT, isOn: false, location: 'Dining Room', energyConsumption: 45, value: 0, unit: '%' },
  { id: '12', name: 'Security System', type: DeviceType.SECURITY, isOn: true, location: 'Perimeter', energyConsumption: 50 },
  { id: '13', name: 'Access Control', type: DeviceType.LOCK, isOn: true, location: 'Front Gate', energyConsumption: 10 },
];

const INITIAL_ENV: EnvironmentState = {
  time: 14, // 2 PM
  temperature: 22,
  energyPrice: 0.12,
  occupancy: true,
  totalSavings: 0.00
};

const AVAILABLE_FLOORPLANS: FloorPlan[] = [
  { id: '1', name: 'Apartment', image: '/FloorPlan/ApartmentFP.jpg' },
  { id: '2', name: 'Detached House', image: '/FloorPlan/DetachedHouseFP.webp' },
  { id: '3', name: 'Semi-Detached House', image: '/FloorPlan/SemiDetachedFP.png' },
  { id: '4', name: 'Town House', image: '/FloorPlan/TownHouseFP.webp' },
  { id: '5', name: '2 Floor Town House', image: '/FloorPlan/2FloorTownHouseFP.webp' },
  { id: '6', name: 'Garage House', image: '/FloorPlan/GarageHouseFP.jpg' },
];

type Tab = 'home' | 'controls' | 'ai' | 'floorplan';

export default function App() {
  // --- STATE ---
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
  const [env, setEnv] = useState<EnvironmentState>(INITIAL_ENV);
  const [logs, setLogs] = useState<SimulationLog[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [expandedDeviceId, setExpandedDeviceId] = useState<string | null>(null);
  const [selectedFloorPlan, setSelectedFloorPlan] = useState<FloorPlan | null>(AVAILABLE_FLOORPLANS[0]);
  const [deviceToPosition, setDeviceToPosition] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Speech Recognition
  const { transcript, isListening, isSupported, startListening, stopListening, resetTranscript } = useSpeechRecognition();

  // Update input when transcript changes
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  // --- LOGGING HELPER ---
  const addLog = (message: string, source: 'SYSTEM' | 'AI' | 'USER', type: 'info' | 'warning' | 'success' | 'action' = 'info') => {
    const newLog: SimulationLog = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' }),
      source,
      message,
      type
    };
    setLogs(prev => [...prev, newLog]);
  };

  // --- SIMULATION LOGIC ---
  
  // Update energy price based on time
  useEffect(() => {
    let newPrice = 0.12;
    if (env.time >= 16 && env.time <= 21) newPrice = 0.45; // Peak
    else if (env.time >= 7 && env.time < 16) newPrice = 0.22; // Shoulder
    
    if (newPrice !== env.energyPrice) {
      setEnv(prev => ({ ...prev, energyPrice: newPrice }));
      addLog(`Energy Rate Change: Now $${newPrice.toFixed(2)}/kWh`, 'SYSTEM', 'warning');
    }
  }, [env.time]);

  // Auto-play clock
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setEnv(prev => ({ ...prev, time: (prev.time + 1) % 24 }));
      }, 2000); // 2 seconds = 1 hour
    }
    return () => clearInterval(interval);
  }, [isPlaying]);


  // --- HANDLERS ---

  const handleToggleDevice = (id: string) => {
    setDevices(prev => prev.map(d => {
      if (d.id === id) {
        const newState = !d.isOn;
        let logMsg = `${d.name} turned ${newState ? 'ON' : 'OFF'} manually`;
        if (d.type === DeviceType.LOCK) logMsg = `${d.name} ${newState ? 'LOCKED' : 'UNLOCKED'} manually`;
        if (d.type === DeviceType.SECURITY) logMsg = `${d.name} ${newState ? 'ARMED' : 'DISARMED'} manually`;
        if (d.type === DeviceType.BLINDS) logMsg = `${d.name} ${newState ? 'OPENED' : 'CLOSED'} manually`;
        
        addLog(logMsg, 'USER', 'info');
        return { ...d, isOn: newState };
      }
      return d;
    }));
  };

  const handleScenarioInject = (scenario: 'PEAK' | 'AWAY' | 'MORNING') => {
    switch (scenario) {
      case 'PEAK':
        setEnv(prev => ({ ...prev, time: 18 })); // 6 PM
        addLog('SCENARIO: Simulated Peak Hours (6 PM)', 'SYSTEM', 'warning');
        break;
      case 'AWAY':
        setEnv(prev => ({ ...prev, occupancy: false }));
        addLog('SCENARIO: Home occupants left (Empty House)', 'SYSTEM', 'info');
        // Trigger AI reaction to empty house
        setTimeout(() => handleAiCheck(false), 1000);
        break;
      case 'MORNING':
        setEnv(prev => ({ ...prev, time: 7, occupancy: true }));
        addLog('SCENARIO: Morning Routine (7 AM)', 'SYSTEM', 'success');
        break;
    }
  };

  const handleAiCheck = async (occupancyOverride?: boolean) => {
     // Mocking an internal AI check based on environment changes
     const currentEnv = { ...env, occupancy: occupancyOverride ?? env.occupancy };
     if (!currentEnv.occupancy) {
       // Simple heuristic simulation if API not involved for this specific trigger
       const activeDevices = devices.filter(d => d.isOn && d.type !== DeviceType.SENSOR && d.type !== DeviceType.SECURITY && d.type !== DeviceType.LOCK);
       if (activeDevices.length > 0) {
          const aiResponse = await getAiDecision("The house is empty, what should I do?", devices, currentEnv);
          processAiResponse(aiResponse);
       }
     }
  };

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const command = input;
    setInput('');
    addLog(command, 'USER', 'info');
    setIsProcessing(true);

    try {
      const decision = await getAiDecision(command, devices, env);
      processAiResponse(decision);
    } catch (err) {
      addLog("Failed to process command.", 'SYSTEM', 'warning');
    } finally {
      setIsProcessing(false);
    }
  };

  const processAiResponse = (decision: AiActionResponse) => {
    // Log Reasoning
    addLog(decision.reasoning, 'AI', 'action');

    // Apply Actions
    if (decision.actions.length > 0) {
      setDevices(prev => prev.map(d => {
        const action = decision.actions.find(a => a.deviceId === d.id);
        if (action) {
          let updates: Partial<Device> = {};
          if (action.action === 'TURN_ON') updates.isOn = true;
          if (action.action === 'TURN_OFF') updates.isOn = false;
          if (action.action === 'SET_VALUE' && action.value !== undefined) updates.value = action.value;

          return { ...d, ...updates };
        }
        return d;
      }));
    }

    // Update Savings
    if (decision.estimatedSavings > 0) {
      setEnv(prev => ({ ...prev, totalSavings: prev.totalSavings + decision.estimatedSavings }));
      addLog(`Projected Savings: $${decision.estimatedSavings.toFixed(2)}`, 'AI', 'success');
    }
  };

  const handleDevicePositionChange = (deviceId: string, position: { x: number; y: number }) => {
    setDevices(prev => prev.map(d =>
      d.id === deviceId ? { ...d, position } : d
    ));
    setDeviceToPosition(null);
    addLog(`${devices.find(d => d.id === deviceId)?.name} positioned on floor plan`, 'USER', 'info');
  };

  const handleMicrophoneToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
      addLog('Listening for voice command...', 'SYSTEM', 'info');
    }
  };

  // --- COMPONENT SECTIONS ---

  // 1. CONTROLS SECTION (Left Column in Desktop, 'Controls' Tab in Mobile)
  const ControlsSection = () => (
    <div className="flex flex-col gap-6 pb-20 lg:pb-0">
      {/* Environment Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Activity size={100} />
        </div>
        
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Settings size={14} /> Environment
        </h2>

        <div className="space-y-6 relative z-10">
          {/* Time Control */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="flex items-center gap-2 text-slate-300">
                <Clock size={16} /> Time
              </span>
              <span className="font-mono text-primary-400 text-lg font-bold">
                {env.time.toString().padStart(2, '0')}:00
              </span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="23" 
              value={env.time}
              onChange={(e) => setEnv({...env, time: parseInt(e.target.value)})}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <div className="flex justify-between mt-2">
                <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  {isPlaying ? <PauseCircle size={14}/> : <PlayCircle size={14}/>}
                  {isPlaying ? 'PAUSE' : 'AUTO-PLAY'}
                </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-500 mb-1">Energy Rate</div>
              <div className={`text-lg font-mono font-bold ${env.energyPrice > 0.3 ? 'text-red-400' : 'text-green-400'}`}>
                ${env.energyPrice.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-600">per kWh</div>
            </div>
            <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-500 mb-1">Total Savings</div>
              <div className="text-lg font-mono font-bold text-success-500 flex items-center">
                <DollarSign size={14} />
                {env.totalSavings.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-600">This Session</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between bg-slate-950/50 p-3 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2">
                <Sun size={16} className="text-orange-400" />
                <span className="text-sm text-slate-300">External Temp</span>
              </div>
              <span className="font-mono font-bold">{env.temperature}°C</span>
          </div>
        </div>
      </div>

      {/* Scenario Injector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg shrink-0">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Simulate Scenario
        </h2>
        <div className="grid grid-cols-1 gap-2">
          <button 
            onClick={() => handleScenarioInject('PEAK')}
            className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-xs text-left transition-all flex items-center justify-between group"
          >
            <span>Trigger Peak Rates</span>
            <span className="text-slate-500 group-hover:text-red-400">18:00</span>
          </button>
          <button 
            onClick={() => handleScenarioInject('AWAY')}
            className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-xs text-left transition-all flex items-center justify-between group"
          >
            <span>House Empty (Away Mode)</span>
            <span className="text-slate-500 group-hover:text-blue-400">Auto</span>
          </button>
          <button 
            onClick={() => handleScenarioInject('MORNING')}
            className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-xs text-left transition-all flex items-center justify-between group"
          >
            <span>Morning Routine</span>
            <span className="text-slate-500 group-hover:text-yellow-400">07:00</span>
          </button>
        </div>
      </div>
      
      {/* Energy Graph */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex-1 min-h-[250px] lg:min-h-[200px] flex flex-col shrink-0">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            Cost Forecast (24h)
        </h2>
        <div className="flex-1 w-full -ml-4">
          <EnergyChart currentTime={env.time} />
        </div>
      </div>
    </div>
  );

  // 2. DEVICES SECTION (Center Column in Desktop, 'Home' Tab in Mobile)
  const DevicesSection = () => (
    <div className="flex flex-col pb-20 lg:pb-0">
        <div className="mb-4 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-white">My Home</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('floorplan')}
              className="hidden lg:flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors"
            >
              <Map size={14} />
              Floor Plan
            </button>
            <div className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
              {devices.filter(d => d.isOn).length} Active
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2">
          {devices.map(device => (
            <DeviceCard
              key={device.id}
              device={device}
              onToggle={handleToggleDevice}
              isExpanded={expandedDeviceId === device.id}
              onExpandToggle={(id) => setExpandedDeviceId(expandedDeviceId === id ? null : id)}
            />
          ))}
          {/* Add a dummy card to show expandability */}
          <div className="border border-dashed border-slate-800 rounded-lg flex items-center justify-center p-3 text-slate-600 hover:text-slate-500 hover:border-slate-700 transition-colors cursor-pointer group">
            <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center group-hover:bg-slate-800 mr-2">
              <span className="text-sm">+</span>
            </div>
            <span className="text-xs font-semibold">Add Device</span>
          </div>
        </div>
    </div>
  );

  // 3. FLOORPLAN SECTION
  const FloorPlanSection = () => (
    <div className="flex flex-col gap-4 pb-20 lg:pb-0 h-full">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-white">Floor Plan View</h2>
        <button
          onClick={() => setActiveTab('home')}
          className="hidden lg:flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors"
        >
          <Home size={14} />
          Back to Devices
        </button>
      </div>

      {/* FloorPlan Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg shrink-0">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          Select Floor Plan
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {AVAILABLE_FLOORPLANS.map(plan => (
            <button
              key={plan.id}
              onClick={() => setSelectedFloorPlan(plan)}
              className={`
                p-2 rounded-lg text-xs font-medium transition-all border
                ${selectedFloorPlan?.id === plan.id
                  ? 'bg-primary-600 text-white border-primary-500'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }
              `}
            >
              {plan.name}
            </button>
          ))}
        </div>
      </div>

      {/* FloorPlan View */}
      <div className="flex-1 min-h-[400px]">
        <FloorPlanView
          devices={devices}
          selectedFloorPlan={selectedFloorPlan}
          deviceToPosition={deviceToPosition}
          onDeviceClick={(id) => setExpandedDeviceId(expandedDeviceId === id ? null : id)}
          onDevicePositionChange={handleDevicePositionChange}
        />
      </div>

      {/* Device List for Positioning */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg shrink-0">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          Click to Place on Floor Plan
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
          {devices.map(device => (
            <button
              key={device.id}
              onClick={() => {
                setDeviceToPosition(device.id);
                setActiveTab('floorplan');
              }}
              className={`
                p-2 rounded-lg text-xs text-left transition-all border
                ${device.position
                  ? 'bg-green-900/30 border-green-700 text-green-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }
              `}
            >
              {device.name}
              {device.position && ' ✓'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // 4. AI SECTION (Right Column in Desktop, 'AI' Tab in Mobile)
  const AiSection = () => (
    <div className="flex flex-col gap-4 pb-20 lg:pb-0">
       {/* Terminal/Logs */}
       <div className="min-h-[300px] lg:min-h-[400px] bg-slate-950 rounded-xl shadow-lg flex flex-col border border-slate-800">
          <ConsoleLog logs={logs} />
       </div>

       {/* Chat Interface */}
       <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-[0_-5px_20px_rgba(0,0,0,0.3)] shrink-0">
         <div className="mb-3 flex items-center justify-between">
           <div>
             <h3 className="text-sm font-semibold text-white">Voice Command</h3>
             <p className="text-xs text-slate-400">
               {isListening ? '🎤 Listening...' : 'Type or speak your command'}
             </p>
           </div>
           {!isSupported && (
             <span className="text-xs text-orange-400">Speech not supported</span>
           )}
         </div>
         <form onSubmit={handleCommandSubmit} className="relative">
           <input
             type="text"
             value={input}
             onChange={(e) => setInput(e.target.value)}
             placeholder={
               isListening
                 ? "Listening..."
                 : isProcessing
                 ? "AI is thinking..."
                 : "e.g., 'I want to watch a movie'"
             }
             disabled={isProcessing}
             className={`w-full bg-slate-950 border text-sm text-white rounded-lg pl-4 pr-24 py-3 focus:outline-none focus:ring-1 transition-all disabled:opacity-50 ${
               isListening
                 ? 'border-red-500 focus:border-red-400 focus:ring-red-500'
                 : 'border-slate-700 focus:border-primary-500 focus:ring-primary-500'
             }`}
           />

           {/* Microphone Button */}
           {isSupported && (
             <button
               type="button"
               onClick={handleMicrophoneToggle}
               disabled={isProcessing}
               className={`absolute right-14 top-2 p-1.5 rounded-md transition-all disabled:opacity-50 ${
                 isListening
                   ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                   : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
               }`}
               title={isListening ? 'Stop listening' : 'Start voice input'}
             >
               {isListening ? <MicOff size={16} /> : <Mic size={16} />}
             </button>
           )}

           {/* Send Button */}
           <button
             type="submit"
             disabled={!input.trim() || isProcessing}
             className="absolute right-2 top-2 p-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded-md transition-colors disabled:bg-slate-800 disabled:text-slate-500"
           >
             {isProcessing ? (
               <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
             ) : (
               <Send size={16} />
             )}
           </button>
         </form>
         <div className="mt-3">
          <select
            onChange={(e) => {
              if (e.target.value) {
                setInput(e.target.value);
                e.target.value = ''; // Reset dropdown after selection
              }
            }}
            className="w-full bg-slate-800 border border-slate-700 text-slate-300 text-xs px-3 py-2 rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all cursor-pointer"
            defaultValue=""
          >
            <option value="" disabled>📋 Select a pre-made voice command...</option>
            <optgroup label="Temperature & Climate">
              <option value="It's too hot in here">It's too hot in here</option>
              <option value="It's too cold in here">It's too cold in here</option>
              <option value="Set temperature to 22 degrees">Set temperature to 22 degrees</option>
              <option value="Make the house comfortable">Make the house comfortable</option>
            </optgroup>
            <optgroup label="Cleaning & Maintenance">
              <option value="Clean the house">Clean the house</option>
              <option value="Start the vacuum">Start the vacuum</option>
              <option value="Mow the lawn">Mow the lawn</option>
              <option value="Clean the pool">Clean the pool</option>
            </optgroup>
            <optgroup label="Security & Safety">
              <option value="Secure the perimeter">Secure the perimeter</option>
              <option value="Lock all doors">Lock all doors</option>
              <option value="Arm security system">Arm security system</option>
              <option value="I'm leaving home">I'm leaving home</option>
            </optgroup>
            <optgroup label="Lighting & Ambiance">
              <option value="Turn on all lights">Turn on all lights</option>
              <option value="Turn off all lights">Turn off all lights</option>
              <option value="Dim the lights">Dim the lights</option>
              <option value="Movie mode">Movie mode</option>
            </optgroup>
            <optgroup label="Energy Saving">
              <option value="Save energy">Save energy</option>
              <option value="Turn off unnecessary devices">Turn off unnecessary devices</option>
              <option value="Optimize power consumption">Optimize power consumption</option>
            </optgroup>
            <optgroup label="Routines">
              <option value="Good morning">Good morning</option>
              <option value="Good night">Good night</option>
              <option value="I'm watching a movie">I'm watching a movie</option>
              <option value="Party mode">Party mode</option>
            </optgroup>
          </select>
         </div>
       </div>
    </div>
  );

  return (
    <div className="h-screen bg-slate-950 text-slate-200 flex flex-col font-sans overflow-hidden">

      {/* HEADER */}
      <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 sticky top-0 z-50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-600 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.5)]">
            <Zap className="text-white fill-current" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white hidden md:block">AI Matter Coordinator</h1>
            <h1 className="text-lg font-bold tracking-tight text-white md:hidden">AI Home</h1>
            <p className="text-xs text-slate-400">Local Simulation • v1.2.0</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="hidden md:flex items-center gap-2 bg-slate-900/50 py-1.5 px-3 rounded-full border border-slate-800">
             <ShieldCheck size={14} className="text-green-500" />
             <span className="text-xs font-mono text-green-500">SECURE</span>
           </div>
           <div className="flex items-center gap-2 bg-slate-900/50 py-1.5 px-3 rounded-full border border-slate-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
             <span className="text-xs font-mono text-primary-400 hidden md:inline">GEMINI 2.5 CONNECTED</span>
             <span className="text-xs font-mono text-primary-400 md:hidden">ONLINE</span>
           </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      {/* Desktop: Grid Layout. Mobile: Tabbed Layout handled by conditional rendering */}
      <main className="flex-1 p-4 md:p-6 lg:grid lg:grid-cols-12 gap-6 overflow-y-auto relative max-w-[2000px] mx-auto w-full">

        {/* LEFT COLUMN: Controls & Stats */}
        <div className={`lg:col-span-2 ${activeTab === 'controls' ? 'block' : 'hidden lg:block'}`}>
          <ControlsSection />
        </div>

        {/* CENTER COLUMN: Devices or FloorPlan - Wider for FloorPlan */}
        <div className={`${activeTab === 'floorplan' ? 'lg:col-span-7' : 'lg:col-span-6'} ${activeTab === 'home' || activeTab === 'floorplan' ? 'block' : 'hidden lg:block'}`}>
           {activeTab === 'floorplan' ? <FloorPlanSection /> : <DevicesSection />}
        </div>

        {/* RIGHT COLUMN: AI Brain & Chat */}
        <div className={`${activeTab === 'floorplan' ? 'lg:col-span-3' : 'lg:col-span-4'} ${activeTab === 'ai' ? 'block' : 'hidden lg:block'}`}>
           <AiSection />
        </div>

      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-950 border-t border-slate-800 pb-safe z-50">
        <div className="flex justify-around items-center h-16">
          <button
            onClick={() => setActiveTab('controls')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'controls' ? 'text-primary-500' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Sliders size={18} />
            <span className="text-[10px] font-medium">Controls</span>
          </button>

          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'home' ? 'text-primary-500' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Home size={18} />
            <span className="text-[10px] font-medium">Devices</span>
          </button>

          <button
            onClick={() => setActiveTab('floorplan')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'floorplan' ? 'text-primary-500' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Map size={18} />
            <span className="text-[10px] font-medium">Floor Plan</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'ai' ? 'text-primary-500' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <MessageSquare size={18} />
            <span className="text-[10px] font-medium">AI Log</span>
          </button>
        </div>
      </nav>

    </div>
  );
}