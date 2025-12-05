import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface EnergyChartProps {
  currentTime: number;
}

const data = Array.from({ length: 24 }, (_, i) => {
  // Simulate pricing curve: Cheap at night, expensive 4pm-9pm
  let price = 0.12; // Base
  if (i >= 16 && i <= 21) price = 0.45; // Peak
  else if (i >= 7 && i < 16) price = 0.22; // Shoulder
  
  return {
    hour: i,
    price: price,
    formattedTime: `${i}:00`
  };
});

const EnergyChart: React.FC<EnergyChartProps> = ({ currentTime }) => {
  return (
    <div className="h-full w-full">
       <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="hour" 
            tick={{ fill: '#64748b', fontSize: 10 }} 
            tickLine={false}
            axisLine={false}
            interval={3}
          />
          <YAxis 
            tick={{ fill: '#64748b', fontSize: 10 }} 
            tickLine={false}
            axisLine={false}
            domain={[0, 0.6]}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
            itemStyle={{ color: '#e2e8f0' }}
            labelStyle={{ color: '#94a3b8' }}
            formatter={(value: number) => [`$${value.toFixed(2)}/kWh`, 'Rate']}
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="#3B82F6" 
            fillOpacity={1} 
            fill="url(#colorPrice)" 
            strokeWidth={2}
          />
          <ReferenceLine x={currentTime} stroke="#10B981" strokeDasharray="3 3" label={{ value: 'NOW', position: 'insideTopRight', fill: '#10B981', fontSize: 10 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EnergyChart;