import React from 'react';
import { TomatoQualityClass } from '../../types';
import { CLASS_CONFIG } from '../../config/api';

interface SortingOverviewProps {
  ripe: number;
  unripe: number;
  damaged: number;
  old: number;
  total: number;
}

export const SortingOverview: React.FC<SortingOverviewProps> = ({
  ripe,
  unripe,
  damaged,
  old,
  total
}) => {
  const cards: { key: TomatoQualityClass; count: number }[] = [
    { key: 'Ripe', count: ripe },
    { key: 'Unripe', count: unripe },
    { key: 'Damaged', count: damaged },
    { key: 'Old', count: old }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map(({ key, count }) => {
        const cfg = CLASS_CONFIG[key];
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <div
            key={key}
            className="bg-white rounded-xl border border-[#E5E7EB] px-4 py-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-gray-600">{key}</span>
              <span className="text-lg">{cfg.emoji}</span>
            </div>
            <div className="mt-1 text-3xl font-bold text-[#1F2937] leading-none">{count}</div>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>{cfg.bin}</span>
              <span style={{ color: cfg.color }} className="font-semibold">
                {pct}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
