"use client";
import React, { useState, useEffect } from 'react';

export default function BrightnessControl() {
  const [brightness, setBrightness] = useState(1);

  useEffect(() => {
    const contrast = 1 + (brightness - 1) * 0.2;
    document.body.style.filter = `brightness(${brightness}) contrast(${contrast.toFixed(3)})`;
    return () => {
      document.body.style.filter = '';
    };
  }, [brightness]);

  const isHigh = brightness >= 1.5;

  return (
    <div className="flex items-center gap-1.5" title="Adjust Brightness">
      <span
        className={`text-base select-none transition-all duration-200 ${
          isHigh ? 'text-yellow-400 drop-shadow-md' : ''
        }`}
      >
        {isHigh ? '🔥' : '🔆'}
      </span>
      <input
        type="range"
        min="0.5"
        max="2.5"
        step="0.01"
        value={brightness}
        onChange={(e) => setBrightness(parseFloat(e.target.value))}
        className="w-20 h-1.5 accent-white cursor-pointer"
      />
    </div>
  );
}
