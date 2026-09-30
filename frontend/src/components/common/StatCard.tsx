import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trendText?: string;
  trendPositive?: boolean;
  icon?: React.ReactNode;
  badgeText?: string;
  accentColor?: 'emerald' | 'blue' | 'amber' | 'red' | 'stone';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trendText,
  trendPositive,
  icon,
  badgeText,
  accentColor = 'stone'
}) => {
  const borderTopMap = {
    emerald: 'border-t-4 border-t-emerald-600',
    blue: 'border-t-4 border-t-sky-600',
    amber: 'border-t-4 border-t-amber-600',
    red: 'border-t-4 border-t-rose-600',
    stone: 'border-t-4 border-t-stone-700'
  };

  return (
    <div
      className={`bg-white rounded-lg border border-stone-200 p-5 shadow-xs transition-shadow hover:shadow-sm ${borderTopMap[accentColor]}`}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          {title}
        </span>
        {icon && <div className="text-stone-400">{icon}</div>}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-stone-900 font-mono">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {badgeText && (
          <span className="text-xs font-medium text-stone-500">
            {badgeText}
          </span>
        )}
      </div>

      {(subtitle || trendText) && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-stone-500">
          {trendText && (
            <span
              className={`font-semibold ${
                trendPositive === true
                  ? 'text-emerald-700'
                  : trendPositive === false
                  ? 'text-rose-700'
                  : 'text-stone-700'
              }`}
            >
              {trendText}
            </span>
          )}
          {trendText && subtitle && <span aria-hidden="true">·</span>}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
