import React, { useState } from 'react';
import { BarChart3, TrendingUp, CheckCircle, Percent, ShieldCheck } from 'lucide-react';
import { QualityStatistics } from '../types';
import { StatCard } from '../components/common/StatCard';
import { QualityDonutChart } from '../components/charts/QualityDonutChart';
import { InspectionTrendChart } from '../components/charts/InspectionTrendChart';
import { SortingBarChart } from '../components/charts/SortingBarChart';
import { ConfidenceChart } from '../components/charts/ConfidenceChart';

interface AnalyticsPageProps {
  stats: QualityStatistics;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ stats }) => {
  const [timeRange, setTimeRange] = useState<'today' | '7days' | '30days'>('7days');

  // Multiplier for mock time range demonstration
  const multiplier = timeRange === 'today' ? 0.15 : timeRange === '30days' ? 4.2 : 1;

  const currentTotal = Math.round(stats.total * multiplier);
  const currentRipe = Math.round(stats.ripe * multiplier);
  const currentUnripe = Math.round(stats.unripe * multiplier);
  const currentDamaged = Math.round(stats.damaged * multiplier);
  const currentOld = Math.round(stats.old * multiplier);

  const safeTotal = currentTotal > 0 ? currentTotal : 1;
  const ripePercent = ((currentRipe / safeTotal) * 100).toFixed(1);
  const unripePercent = ((currentUnripe / safeTotal) * 100).toFixed(1);
  const damagedPercent = ((currentDamaged / safeTotal) * 100).toFixed(1);
  const oldPercent = ((currentOld / safeTotal) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header and Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-700" />
            Quality Analytics & Sorting Metrics
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Statistical breakdown of batch quality, defect trends, and classification reliability
          </p>
        </div>

        {/* Date Filter: Today | 7 Days | 30 Days */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg border border-stone-200 self-start sm:self-auto">
          <button
            onClick={() => setTimeRange('today')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              timeRange === 'today'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeRange('7days')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              timeRange === '7days'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setTimeRange('30days')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              timeRange === '30days'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 bg-white rounded-lg border border-stone-200 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block">
            Total Inspected
          </span>
          <span className="text-2xl font-bold font-mono text-stone-900 mt-1 block">
            {currentTotal.toLocaleString()}
          </span>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
            100% evaluated
          </span>
        </div>

        <div className="p-4 bg-white rounded-lg border border-stone-200 shadow-xs border-t-4 border-t-emerald-600">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block">
            Ripe %
          </span>
          <span className="text-2xl font-bold font-mono text-emerald-800 mt-1 block">
            {ripePercent}%
          </span>
          <span className="text-[11px] text-stone-500 mt-1 block">
            {currentRipe.toLocaleString()} tomatoes
          </span>
        </div>

        <div className="p-4 bg-white rounded-lg border border-stone-200 shadow-xs border-t-4 border-t-sky-600">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block">
            Unripe %
          </span>
          <span className="text-2xl font-bold font-mono text-sky-800 mt-1 block">
            {unripePercent}%
          </span>
          <span className="text-[11px] text-stone-500 mt-1 block">
            {currentUnripe.toLocaleString()} tomatoes
          </span>
        </div>

        <div className="p-4 bg-white rounded-lg border border-stone-200 shadow-xs border-t-4 border-t-rose-600">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block">
            Damaged %
          </span>
          <span className="text-2xl font-bold font-mono text-rose-800 mt-1 block">
            {damagedPercent}%
          </span>
          <span className="text-[11px] text-stone-500 mt-1 block">
            {currentDamaged.toLocaleString()} tomatoes
          </span>
        </div>

        <div className="p-4 bg-white rounded-lg border border-stone-200 shadow-xs border-t-4 border-t-amber-600">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block">
            Old %
          </span>
          <span className="text-2xl font-bold font-mono text-amber-800 mt-1 block">
            {oldPercent}%
          </span>
          <span className="text-[11px] text-stone-500 mt-1 block">
            {currentOld.toLocaleString()} tomatoes
          </span>
        </div>
      </div>

      {/* Grid of Charts (4 Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Quality Distribution (Donut chart) */}
        <QualityDonutChart
          ripe={currentRipe}
          unripe={currentUnripe}
          damaged={currentDamaged}
          old={currentOld}
          total={currentTotal}
        />

        {/* 2. Daily Inspections (Line chart) */}
        <InspectionTrendChart />

        {/* 3. Sorting Count (Bar chart) */}
        <SortingBarChart
          ripe={currentRipe}
          unripe={currentUnripe}
          damaged={currentDamaged}
          old={currentOld}
        />

        {/* 4. AI Confidence (Confidence distribution chart) */}
        <ConfidenceChart />
      </div>
    </div>
  );
};
