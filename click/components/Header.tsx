"use client";
import React, { useEffect, useState } from 'react';
import { Coffee } from 'lucide-react';

export default function Header({ selectionSum }: { selectionSum: number }) {
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    setDate(new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
  }, []);

  return (
    <header className="p-4 flex justify-between items-center glass rounded-b-xl mb-6 shadow-neon sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Coffee className="w-10 h-10 text-neon-cyan animate-bounce-slow" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-neon-pink rounded-full animate-pulse" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-neon-cyan text-shadow-neon tracking-wider">click</h1>
          <p className="text-xs text-neon-pink font-semibold">management system ☕</p>
        </div>
      </div>
      
      <div className="text-right">
        <p className="text-sm text-gray-400">{date}</p>
        {selectionSum > 0 && (
          <div className="animate-float bg-neon-cyan/20 px-3 py-1 rounded-full border border-neon-cyan/50 mt-1">
            <span className="text-neon-cyan font-bold text-sm">Selected: ${selectionSum.toFixed(2)}</span>
          </div>
        )}
      </div>
    </header>
  );
}
