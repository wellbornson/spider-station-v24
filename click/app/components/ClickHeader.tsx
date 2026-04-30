import React from 'react';

interface ClickHeaderProps {
  selectedTotal: number;
}

export function ClickHeader({ selectedTotal }: ClickHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-2 bg-[#020617] border-b border-cyan-900/50 sticky top-0 z-10">
      <div className="flex items-center gap-2">
        {/* Logo Placeholder */}
        <div className="text-cyan-400 font-bold text-2xl tracking-tighter uppercase drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">
          Click
        </div>
        <span className="text-slate-500 text-xs tracking-widest uppercase ml-2">Cafe Dashboard</span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="bg-slate-900/80 px-4 py-1 rounded border border-slate-800">
          <span className="text-slate-400 text-xs uppercase mr-2">Selection Total:</span>
          <span className="text-cyan-400 font-mono font-bold text-lg">
            {selectedTotal.toFixed(2)}
          </span>
        </div>
      </div>
    </header>
  );
}
