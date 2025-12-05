import React, { useState } from 'react';
import { Device, DeviceType, FloorPlan } from '../types';
import {
  Lightbulb, Thermometer, Plug, Radio,
  Blinds, Waves, Shield, Lock, Leaf, Disc, MapPin
} from 'lucide-react';

interface FloorPlanViewProps {
  devices: Device[];
  selectedFloorPlan: FloorPlan | null;
  deviceToPosition: string | null;
  onDeviceClick?: (deviceId: string) => void;
  onDevicePositionChange?: (deviceId: string, position: { x: number; y: number }) => void;
}

const FloorPlanView: React.FC<FloorPlanViewProps> = ({
  devices,
  selectedFloorPlan,
  deviceToPosition,
  onDeviceClick,
  onDevicePositionChange
}) => {

  const getDeviceIcon = (type: DeviceType, isOn: boolean) => {
    const iconProps = { size: 16, className: isOn ? 'text-white' : 'text-slate-400' };

    switch (type) {
      case DeviceType.LIGHT: return <Lightbulb {...iconProps} />;
      case DeviceType.THERMOSTAT: return <Thermometer {...iconProps} />;
      case DeviceType.SMART_PLUG: return <Plug {...iconProps} />;
      case DeviceType.SENSOR: return <Radio {...iconProps} />;
      case DeviceType.BLINDS: return <Blinds {...iconProps} />;
      case DeviceType.VACUUM: return <Disc {...iconProps} />;
      case DeviceType.MOWER: return <Leaf {...iconProps} />;
      case DeviceType.POOL_CLEANER: return <Waves {...iconProps} />;
      case DeviceType.SECURITY: return <Shield {...iconProps} />;
      case DeviceType.LOCK: return <Lock {...iconProps} />;
      default: return <Plug {...iconProps} />;
    }
  };

  const handleFloorPlanClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onDevicePositionChange || !deviceToPosition) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    onDevicePositionChange(deviceToPosition, { x, y });
  };

  const deviceBeingPositioned = devices.find(d => d.id === deviceToPosition);

  if (!selectedFloorPlan) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900 rounded-xl border border-slate-800">
        <div className="text-center">
          <MapPin size={48} className="mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400 text-sm">Select a floor plan to visualize your devices</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
      {/* Active Positioning Banner */}
      {deviceToPosition && deviceBeingPositioned && (
        <div className="bg-primary-600 text-white px-4 py-2 text-sm font-medium flex items-center justify-between">
          <span>
            📍 Click anywhere on the floor plan to place: <strong>{deviceBeingPositioned.name}</strong>
          </span>
        </div>
      )}

      {/* FloorPlan Image with Devices */}
      <div
        className={`relative flex-1 bg-slate-950 overflow-auto flex items-center justify-center ${
          deviceToPosition ? 'cursor-crosshair' : 'cursor-default'
        }`}
      >
        <div
          className="relative min-w-full min-h-full flex items-center justify-center"
          onClick={handleFloorPlanClick}
        >
          <img
            src={selectedFloorPlan.image}
            alt={selectedFloorPlan.name}
            className="max-w-full max-h-full w-auto h-auto object-contain pointer-events-none"
            draggable={false}
            style={{ imageRendering: 'crisp-edges' }}
          />

          {/* Overlay Devices on FloorPlan */}
          {devices
            .filter(device => device.position)
            .map(device => (
              <div
                key={device.id}
                className={`
                  absolute transform -translate-x-1/2 -translate-y-1/2
                  cursor-pointer transition-all duration-200 group
                  ${device.isOn ? 'z-10' : 'z-0'}
                `}
                style={{
                  left: `${device.position!.x}%`,
                  top: `${device.position!.y}%`
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeviceClick?.(device.id);
                }}
              >
              {/* Device Marker */}
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  border-2 shadow-lg transition-all
                  ${device.isOn
                    ? 'bg-primary-600 border-primary-400 shadow-primary-500/50'
                    : 'bg-slate-700 border-slate-600'
                  }
                  group-hover:scale-125 group-hover:shadow-xl
                `}
              >
                {getDeviceIcon(device.type, device.isOn)}
              </div>

              {/* Device Label */}
              <div
                className="
                  absolute top-full mt-1 left-1/2 transform -translate-x-1/2
                  bg-slate-900/95 text-white text-xs px-2 py-1 rounded
                  whitespace-nowrap opacity-0 group-hover:opacity-100
                  transition-opacity pointer-events-none border border-slate-700
                "
              >
                {device.name}
              </div>

              {/* Pulse animation for active devices */}
              {device.isOn && (
                <div className="absolute inset-0 rounded-full bg-primary-500 animate-ping opacity-20" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-slate-900 border-t border-slate-800 p-3 text-xs text-slate-400">
        <div className="flex items-center justify-between">
          <span>
            {devices.filter(d => d.position).length} / {devices.length} devices positioned
          </span>
          <span className="text-slate-500">Click a device in the list to place it</span>
        </div>
      </div>
    </div>
  );
};

export default FloorPlanView;
