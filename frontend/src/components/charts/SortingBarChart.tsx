import React from 'react';
import { CLASS_CONFIG } from '../../config/api';
import { TomatoQualityClass } from '../../types';

interface SortingBarChartProps {
  ripe: number;
  unripe: number;
  damaged: number;
  old: number;
}

export const SortingBarChart: React.FC<SortingBarChartProps> = ({
  ripe,
  unripe,
  damaged,
  old
}) => {
  const items = [
    { name: 'Ripe' as TomatoQualityClass, count: ripe, color: '#16a34a', bin: 'Bin 1' },
    { name: 'Unripe' as TomatoQualityClass, count: unripe, color: '#0284c7', bin: 'Bin 2' },
    { name: 'Damaged' as TomatoQualityClass, count: damaged, color: '#dc2626', bin: 'Bin 3' },
    { name: 'Old' as TomatoQualityClass, count: old, color: '#d97706', bin: 'Bin 4' }
  ];

  const maxVal = Math.max(...items.map((i) => i.count), 1);

  return (
    <div className="bg-white rounded-lg border border-stone-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-stone-900">Sorting Count by Bin</h3>
          <p className="text-xs text-stone-500">
            Physical distribution of processed tomatoes per sorting actuator
          </p>
        </div>
      </div>

      <div className="space-y-4 pt-1">
        {items.map((item) => {
          const config = CLASS_CONFIG[item.name];
          const widthPercent = (item.count / maxVal) * 100;

          return (
            <div key={item.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-medium text-stone-800">
                  <span>{config.emoji}</span>
                  <span>{item.name}</span>
                  <span className="text-stone-400">→</span>
                  <span className="font-mono text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded text-[11px]">
                    {item.bin}
                  </span>
                </div>
                <div className="font-mono font-semibold text-stone-900">
                  {item.count.toLocaleString()}{' '}
                  <span className="text-stone-400 font-normal text-[11px]">units</span>
                </div>
              </div>

              <div className="w-full h-3.5 bg-stone-100 rounded-full overflow-hidden flex">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: item.color
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
