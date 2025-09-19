"use client";

import React from 'react';

export interface HeatMapDataPoint {
  label: string;
  value: number;
  x: string;
  y: string;
}

interface HeatMapProps {
  title: string;
  data: HeatMapDataPoint[];
  formatValue?: (value: number) => string;
}

export function HeatMap({
  title,
  data,
  formatValue = (value) => value.toLocaleString(),
}: HeatMapProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="flex items-center justify-center h-48 text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  const values = data.map(d => d.value);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);

  const getCircleSize = (value: number) => {
    if (maxValue === minValue) return 15; // Default size if all values are the same
    const scale = (value - minValue) / (maxValue - minValue);
    return 10 + scale * 40; // Circle size from 10px to 50px
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="relative w-full aspect-[4/3] bg-gray-700 rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-gray-900/50" />
        
        {data.map((point) => {
          const size = getCircleSize(point.value);

          return (
            <div
              key={point.label}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: point.x, top: point.y }}
            >
              <div
                className="rounded-full bg-blue-500/50 border-2 border-blue-400 transition-all duration-300 group-hover:scale-110"
                style={{ width: `${size}px`, height: `${size}px` }}
              />
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-10">
                <div className="font-bold">{point.label}</div>
                <div>{formatValue(point.value)}</div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-1 w-1.5 h-1.5 bg-gray-900 rotate-45" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}