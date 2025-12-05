export enum DeviceType {
  LIGHT = 'LIGHT',
  THERMOSTAT = 'THERMOSTAT',
  SMART_PLUG = 'SMART_PLUG',
  SENSOR = 'SENSOR',
  BLINDS = 'BLINDS',
  VACUUM = 'VACUUM',
  MOWER = 'MOWER',
  POOL_CLEANER = 'POOL_CLEANER',
  SECURITY = 'SECURITY',
  LOCK = 'LOCK'
}

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  isOn: boolean;
  value?: number | string; // e.g., temperature for thermostat, brightness for light
  unit?: string;
  energyConsumption: number; // Watts
  location: string;
  position?: { x: number; y: number }; // Position on floorplan (percentage: 0-100)
}

export interface SimulationLog {
  id: string;
  timestamp: string;
  source: 'SYSTEM' | 'AI' | 'USER';
  message: string;
  type: 'info' | 'warning' | 'success' | 'action';
}

export interface EnvironmentState {
  time: number; // 0 - 23 (Hour of day)
  temperature: number; // External temp in Celsius
  energyPrice: number; // $/kWh
  occupancy: boolean;
  totalSavings: number;
}

export interface AiActionResponse {
  reasoning: string;
  actions: {
    deviceId: string;
    action: 'TURN_ON' | 'TURN_OFF' | 'SET_VALUE';
    value?: number | string;
  }[];
  estimatedSavings: number;
}

export interface FloorPlan {
  id: string;
  name: string;
  image: string;
}