import React from 'react';
import { CONFIDENCE_BUCKETS } from '../../data/demoData';

export const ConfidenceChart: React.FC = () => {
  const maxPercent = Math.max(...CONFIDENCE_BUCKETS.map((b) => b.percentage));

  return (
    <div className="bg-white rounded-lg border border-stone-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-stone-900">AI Confidence Distribution</h3>
          <p className="text-xs text-stone-500">
            Model certainty levels across historic inference requests
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono font-bold text-emerald-700">94.6% Avg</span>
        </div>
      </div>

      <div className="space-y-3 pt-1">
        {CONFIDENCE_BUCKETS.map((bucket) => {
          const isFlagged = bucket.range.includes('Flagged');
          return (
            <div key={bucket.range} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span
                  className={`font-medium ${
                    isFlagged ? 'text-rose-700 font-semibold' : 'text-stone-700'
                  }`}
                >
                  {bucket.range}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-stone-500 text-[11px]">
                    {bucket.count} tomatoes
                  </span>
                  <span className="font-mono font-semibold text-stone-800 w-12 text-right">
                    {bucket.percentage}%
                  </span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isFlagged ? 'bg-rose-500' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${(bucket.percentage / maxPercent) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
        <span>Confidence Threshold: <span className="font-mono font-medium text-stone-700">70.0%</span></span>
        <span>Low-confidence rate: <span className="font-mono font-semibold text-amber-700">1.6%</span></span>
      </div>
    </div>
  );
};
