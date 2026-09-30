import React, { useState } from 'react';
import { DAILY_INSPECTIONS, HOURLY_INSPECTIONS_TODAY } from '../../data/demoData';

interface InspectionTrendChartProps {
  className?: string;
}

export const InspectionTrendChart: React.FC<InspectionTrendChartProps> = ({ className = '' }) => {
  const [viewMode, setViewMode] = useState<'weekly' | 'today'>('weekly');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const data = viewMode === 'weekly'
    ? DAILY_INSPECTIONS.map((d) => ({ label: d.day, count: d.count }))
    : HOURLY_INSPECTIONS_TODAY.map((d) => ({ label: d.time, count: d.count }));

  const maxCount = Math.max(...data.map((d) => d.count), 50);
  const chartHeight = 135;
  const chartWidth = 460;
  const paddingX = 35;
  const paddingY = 18;

  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;

  const points = data.map((item, idx) => {
    const x = paddingX + (idx / (data.length - 1)) * innerWidth;
    const y = paddingY + innerHeight - (item.count / maxCount) * innerHeight;
    return { x, y, ...item, index: idx };
  });

  const linePath = points.reduce(
    (acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`,
    ''
  );

  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(
    paddingY + innerHeight
  ).toFixed(1)} L ${points[0].x.toFixed(1)} ${(paddingY + innerHeight).toFixed(1)} Z`;

  const hoveredData = hoveredPoint !== null ? points[hoveredPoint] : null;

  return (
    <div className={`bg-white rounded-[10px] border border-[#E5E7EB] p-4 ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2937]">
            Daily Inspection Trend
          </h3>
          <p className="text-xs text-[#6B7280]">
            Tomatoes processed over time
          </p>
        </div>

        <div className="flex items-center gap-1 p-0.5 bg-[#F7F9F8] rounded-[6px] border border-[#E5E7EB]">
          <button
            onClick={() => {
              setViewMode('weekly');
              setHoveredPoint(null);
            }}
            className={`px-2 py-0.5 text-xs font-semibold rounded-[4px] transition-colors cursor-pointer ${
              viewMode === 'weekly'
                ? 'bg-white text-[#1F2937] shadow-xs'
                : 'text-[#6B7280] hover:text-[#1F2937]'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => {
              setViewMode('today');
              setHoveredPoint(null);
            }}
            className={`px-2 py-0.5 text-xs font-semibold rounded-[4px] transition-colors cursor-pointer ${
              viewMode === 'today'
                ? 'bg-white text-[#1F2937] shadow-xs'
                : 'text-[#6B7280] hover:text-[#1F2937]'
            }`}
          >
            Hourly
          </button>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-36 overflow-visible"
        >
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#087F5B" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#087F5B" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {[0, 0.5, 1].map((ratio) => {
            const y = paddingY + innerHeight * (1 - ratio);
            const val = Math.round(maxCount * ratio);
            return (
              <g key={ratio}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="#E5E7EB"
                  strokeDasharray="2 2"
                />
                <text
                  x={paddingX - 5}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill="#6B7280"
                  className="font-mono"
                >
                  {val}
                </text>
              </g>
            );
          })}

          <path d={areaPath} fill="url(#trendGradient)" />

          <path
            d={linePath}
            fill="none"
            stroke="#087F5B"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((p) => {
            const isHovered = hoveredPoint === p.index;
            return (
              <g key={p.index}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 5 : 3.5}
                  fill={isHovered ? '#087F5B' : '#ffffff'}
                  stroke="#087F5B"
                  strokeWidth="2"
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredPoint(p.index)}
                />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={14}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(p.index)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                <text
                  x={p.x}
                  y={chartHeight - 2}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#6B7280"
                  fontWeight="500"
                >
                  {p.label}
                </text>
              </g>
            );
          })}
        </svg>

        {hoveredData && (
          <div className="absolute top-1 left-1/2 transform -translate-x-1/2 bg-[#1F2937] text-white text-[11px] px-2.5 py-1 rounded shadow pointer-events-none flex items-center gap-1.5 z-10">
            <span className="text-stone-300">{hoveredData.label}:</span>
            <span className="font-mono font-bold text-[#A7E3CA]">
              {hoveredData.count} tomatoes
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
