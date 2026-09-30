import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { InspectionRecord, QualityStatistics } from '../types';
import { CLASS_CONFIG } from '../config/api';

interface HistoryPageProps {
  inspections: InspectionRecord[];
  stats: QualityStatistics;
  onClearHistory: () => void;
  onNavigateHome: () => void;
}

function formatTime(value: string): string {
  try {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  } catch {
    /* ignore */
  }
  return value;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  inspections,
  stats,
  onClearHistory,
  onNavigateHome
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] bg-white cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </button>
          <div>
            <h2 className="text-lg font-bold text-[#1F2937]">Inspection History</h2>
            <p className="text-xs text-gray-500">{stats.total} tomatoes inspected</p>
          </div>
        </div>
        {inspections.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-sm text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 cursor-pointer"
          >
            Clear history
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        {inspections.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-12">
            No inspections yet. Check a tomato to build history.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F7F9F8] text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Time</th>
                  <th className="px-4 py-3 font-semibold">Quality</th>
                  <th className="px-4 py-3 font-semibold">Confidence</th>
                  <th className="px-4 py-3 font-semibold">Bin</th>
                </tr>
              </thead>
              <tbody>
                {inspections.map((item) => {
                  const cfg = CLASS_CONFIG[item.predictedClass];
                  return (
                    <tr key={item.id} className="border-t border-[#E5E7EB]">
                      <td className="px-4 py-3 text-gray-600">{formatTime(item.timestamp)}</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: cfg.color }}>
                        {cfg.emoji} {item.predictedClass}
                      </td>
                      <td className="px-4 py-3">{Math.round(item.confidence * 100)}%</td>
                      <td className="px-4 py-3">{item.sortingBin}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
