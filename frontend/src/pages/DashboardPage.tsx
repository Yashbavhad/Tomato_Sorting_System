import React from 'react';
import { Camera } from 'lucide-react';
import { InspectionRecord, QualityStatistics } from '../types';
import { SortingOverview } from '../components/dashboard/SortingOverview';
import { QualityDonutChart } from '../components/charts/QualityDonutChart';
import { CLASS_CONFIG } from '../config/api';

interface DashboardPageProps {
  stats: QualityStatistics;
  inspections: InspectionRecord[];
  isBackendConnected: boolean;
  onNavigateToDetection: () => void;
  onOpenTechnicalModal: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  stats,
  inspections,
  isBackendConnected,
  onNavigateToDetection,
  onOpenTechnicalModal
}) => {
  const recent = inspections.slice(0, 5);

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1F2937]">Check Your Tomato</h2>
          <p className="text-sm text-gray-500 mt-1">
            Place a tomato in front of the camera and check its quality.
          </p>
          <p className="text-xs mt-2 font-medium" style={{ color: isBackendConnected ? '#087F5B' : '#B45309' }}>
            {isBackendConnected
              ? 'AI service is ready.'
              : 'AI service is not running. Please start the Python server.'}
          </p>
        </div>
        <button
          onClick={onNavigateToDetection}
          className="px-6 py-3 text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          style={{ background: '#087F5B' }}
        >
          <Camera className="w-5 h-5" />
          CHECK TOMATO
        </button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-600">
            Today&apos;s Sorting
          </h3>
          <span className="text-sm text-gray-500">
            Total Tomatoes Inspected:{' '}
            <strong className="text-[#1F2937]">{stats.total}</strong>
          </span>
        </div>
        <SortingOverview
          ripe={stats.ripe}
          unripe={stats.unripe}
          damaged={stats.damaged}
          old={stats.old}
          total={stats.total}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7">
          <QualityDonutChart
            ripe={stats.ripe}
            unripe={stats.unripe}
            damaged={stats.damaged}
            old={stats.old}
            total={stats.total}
          />
        </div>

        <div className="lg:col-span-5 bg-white rounded-xl border border-[#E5E7EB] p-4">
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-600 mb-3">
            Recent Inspections
          </h3>
          {recent.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">
              No tomatoes checked yet. Click CHECK TOMATO to start.
            </p>
          ) : (
            <ul className="space-y-2">
              {recent.map((item) => {
                const cfg = CLASS_CONFIG[item.predictedClass];
                return (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-[#E5E7EB]"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span>{cfg.emoji}</span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate">{item.predictedClass}</div>
                        <div className="text-xs text-gray-500">
                          {(() => {
                            try {
                              const d = new Date(item.timestamp);
                              if (!Number.isNaN(d.getTime())) {
                                return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                              }
                            } catch {
                              /* ignore */
                            }
                            return item.timestamp;
                          })()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold" style={{ color: cfg.color }}>
                        {Math.round(item.confidence * 100)}%
                      </div>
                      <div className="text-[11px] text-gray-500">{item.sortingBin}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="text-xs text-gray-500 flex justify-end">
        <button onClick={onOpenTechnicalModal} className="text-[#087F5B] hover:underline cursor-pointer">
          About the model
        </button>
      </div>
    </div>
  );
};
