import React, { useEffect, useRef } from 'react';
import { SimulationLog } from '../types';
import { Terminal, Cpu, User, AlertCircle } from 'lucide-react';

interface ConsoleLogProps {
  logs: SimulationLog[];
}

const ConsoleLog: React.FC<ConsoleLogProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getIcon = (source: string) => {
    switch(source) {
      case 'AI': return <Cpu size={14} className="text-purple-400" />;
      case 'USER': return <User size={14} className="text-blue-400" />;
      default: return <Terminal size={14} className="text-slate-400" />;
    }
  };

  const getColor = (type: string) => {
    switch(type) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-orange-400';
      case 'action': return 'text-purple-300';
      default: return 'text-slate-300';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden font-mono text-sm">
      <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center gap-2">
        <Terminal size={16} className="text-slate-400" />
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">System Logs</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3 terminal-scroll bg-slate-950/50">
        {logs.length === 0 && (
          <div className="text-slate-600 italic text-center mt-10">System Initialized. Waiting for events...</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
            <span className="text-slate-600 text-xs whitespace-nowrap pt-0.5">{log.timestamp}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                {getIcon(log.source)}
                <span className={`text-xs font-bold ${log.source === 'AI' ? 'text-purple-400' : log.source === 'USER' ? 'text-blue-400' : 'text-slate-400'}`}>
                  [{log.source}]
                </span>
              </div>
              <p className={`${getColor(log.type)} leading-relaxed`}>
                {log.message}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default ConsoleLog;