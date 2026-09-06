import React from 'react';

export default function ConfidenceGauge({ value }) {
  const color = value >= 90 ? "#4C7A4A" : value >= 60 ? "#C4872A" : "#B5482E";
  const strokeDasharray = `${value}, 100`;

  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
        <path
          className="text-parchment-200"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={strokeDasharray}
        />
      </svg>
      <span className="absolute text-[10px] font-mono font-medium text-ink-700">{Math.round(value)}</span>
    </div>
  );
}
