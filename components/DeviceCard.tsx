import React from 'react';
import { Device, DeviceType } from '../types';
import { 
  Lightbulb, Thermometer, Plug, Radio, Power, 
  Blinds, Waves, Shield, Lock, Leaf, Disc, Loader2
} from 'lucide-react';

interface DeviceCardProps {
  device: Device;
  onToggle: (id: string) => void;
  isExpanded: boolean;
  onExpandToggle: (id: string) => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onToggle, isExpanded, onExpandToggle }) => {
  const getIcon = () => {
    switch (device.type) {
      case DeviceType.LIGHT: return <Lightbulb className={device.isOn ? "text-yellow-400" : "text-slate-500"} />;
      case DeviceType.THERMOSTAT: return <Thermometer className={device.isOn ? "text-red-400" : "text-slate-500"} />;
      case DeviceType.SMART_PLUG: return <Plug className={device.isOn ? "text-green-400" : "text-slate-500"} />;
      case DeviceType.SENSOR: return <Radio className="text-blue-400" />;
      case DeviceType.BLINDS: return <Blinds className={device.isOn ? "text-indigo-400" : "text-slate-500"} />;
      case DeviceType.VACUUM: return <Disc className={device.isOn ? "text-teal-400 animate-spin-slow" : "text-slate-500"} />;
      case DeviceType.MOWER: return <Leaf className={device.isOn ? "text-green-500" : "text-slate-500"} />;
      case DeviceType.POOL_CLEANER: return <Waves className={device.isOn ? "text-cyan-400" : "text-slate-500"} />;
      case DeviceType.SECURITY: return <Shield className={device.isOn ? "text-emerald-400" : "text-slate-500"} />;
      case DeviceType.LOCK: return <Lock className={device.isOn ? "text-rose-400" : "text-slate-500"} />;
      default: return <Plug className="text-slate-500" />;
    }
  };

  const getStatusText = () => {
    if (device.type === DeviceType.LOCK) return device.isOn ? 'Locked' : 'Unlocked';
    if (device.type === DeviceType.SECURITY) return device.isOn ? 'Armed' : 'Disarmed';
    if (device.type === DeviceType.BLINDS) return device.isOn ? 'Open' : 'Closed';
    return device.isOn ? 'Active' : 'Standby';
  };

  return (
    <div
      className={`
        relative rounded-lg border transition-all duration-300
        ${isExpanded ? 'col-span-2' : ''}
        ${device.isOn
          ? 'bg-white border-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.15)]'
          : 'bg-slate-50 border-slate-200 opacity-70'}
      `}
    >
      {/* Compact View */}
      {!isExpanded ? (
        <div
          onClick={() => onExpandToggle(device.id)}
          className="p-2 cursor-pointer hover:bg-slate-100 rounded-lg transition-colors"
        >
          <div className="flex flex-col items-center gap-1.5">
            <div className="p-2 rounded-md bg-slate-100 border border-slate-200">
              {getIcon()}
            </div>
            <h3 className="font-medium text-xs text-slate-800 text-center truncate w-full px-1" title={device.name}>
              {device.name}
            </h3>
          </div>
        </div>
      ) : (
        /* Expanded View */
        <div className="p-3">
          <div className="flex justify-between items-start mb-3">
            <div
              className="p-2 rounded-lg bg-slate-100 border border-slate-200 cursor-pointer"
              onClick={() => onExpandToggle(device.id)}
            >
              {getIcon()}
            </div>
            {device.type !== DeviceType.SENSOR && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(device.id);
                }}
                className={`
                  p-2 rounded-full transition-colors
                  ${device.isOn ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-600'}
                `}
              >
                <Power size={16} />
              </button>
            )}
          </div>

          <div className="mb-3">
            <h3 className="font-semibold text-slate-800 mb-1">{device.name}</h3>
            <p className="text-xs text-slate-600 uppercase tracking-wider">{device.location}</p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Status:</span>
              <span className={`font-medium ${device.isOn ? 'text-green-600' : 'text-slate-500'}`}>
                {getStatusText()}
              </span>
            </div>

            {device.value !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Value:</span>
                <span className="font-mono text-blue-600">
                  {device.value}{device.unit}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Power:</span>
              <span className="font-mono text-slate-700">{device.energyConsumption}W</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceCard;