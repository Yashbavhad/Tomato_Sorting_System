import React from 'react';
import { TomatoQualityClass } from '../../types';
import { CLASS_CONFIG } from '../../config/api';

interface QualityDonutChartProps {
  ripe: number;
  unripe: number;
  damaged: number;
  old: number;
  total: number;
}

export const QualityDonutChart: React.FC<QualityDonutChartProps> = ({
  ripe,
  unripe,
  damaged,
  old,
  total
}) => {
  const safeTotal = total > 0 ? total : 1;

  const data: { name: TomatoQualityClass; count: number; color: string }[] = [
    { name: 'Ripe', count: ripe, color: CLASS_CONFIG.Ripe.color },
    { name: 'Unripe', count: unripe, color: CLASS_CONFIG.Unripe.color },
    { name: 'Damaged', count: damaged, color: CLASS_CONFIG.Damaged.color },
    { name: 'Old', count: old, color: CLASS_CONFIG.Old.color }
  ];

  const radius = 54;
  const innerRadius = 34;
  const cx = 70;
  const cy = 70;

  let accumulatedAngle = -90;
  const slices = data.map((item) => {
    const angle = total === 0 ? 90 : (item.count / safeTotal) * 360;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + (total === 0 ? 90 : angle);
    accumulatedAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);
    const x3 = cx + innerRadius * Math.cos(endRad);
    const y3 = cy + innerRadius * Math.sin(endRad);
    const x4 = cx + innerRadius * Math.cos(startRad);
    const y4 = cy + innerRadius * Math.sin(startRad);

    const largeArc = angle > 180 ? 1 : 0;
    const path = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
      'Z'
    ].join(' ');

    return { ...item, path, percent: total === 0 ? 0 : (item.count / safeTotal) * 100 };
  });

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
      <h3 className="text-sm font-bold uppercase tracking-wide text-gray-600 mb-3">
        Quality Distribution
      </h3>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        <svg width="140" height="140" viewBox="0 0 140 140" className="shrink-0">
          {total === 0 ? (
            <circle cx={cx} cy={cy} r={(radius + innerRadius) / 2} fill="none" stroke="#E5E7EB" strokeWidth={radius - innerRadius} />
          ) : (
            slices.map((slice) => (
              <path key={slice.name} d={slice.path} fill={slice.color} />
            ))
          )}
          <text x={cx} y={cy - 4} textAnchor="middle" className="fill-[#1F2937]" fontSize="18" fontWeight="700">
            {total}
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" className="fill-gray-500" fontSize="10">
            total
          </text>
        </svg>

        <div className="flex-1 w-full space-y-2.5">
          {data.map((item) => {
            const pct = total === 0 ? 0 : Math.round((item.count / safeTotal) * 100);
            return (
              <div key={item.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">
                    {CLASS_CONFIG[item.name].emoji} {item.name}
                  </span>
                  <span className="font-semibold text-[#1F2937]">
                    {item.count} ({pct}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: item.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
