import React, { useState, useMemo } from 'react';
import { Search, Download, Trash2, ArrowUpDown, Filter, CheckCircle2, AlertTriangle } from 'lucide-react';
import { InspectionRecord, TomatoQualityClass } from '../../types';

interface InspectionTableProps {
  inspections: InspectionRecord[];
  onClearHistory?: () => void;
}

export const InspectionTable: React.FC<InspectionTableProps> = ({
  inspections,
  onClearHistory
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [qualityFilter, setQualityFilter] = useState<'All' | TomatoQualityClass>('All');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const gradeColorMap: Record<TomatoQualityClass, { label: string; grade: string; dot: string }> = {
    Ripe: { label: 'Prime Ripe', grade: 'Grade A', dot: '#059669' },
    Unripe: { label: 'Unripe / Green', grade: 'Grade B', dot: '#0284c7' },
    Damaged: { label: 'Surface Defect', grade: 'Cull', dot: '#e11d48' },
    Old: { label: 'Senescent / Old', grade: 'Reject', dot: '#d97706' }
  };

  const filteredList = useMemo(() => {
    return inspections
      .filter((item) => {
        const matchesSearch =
          item.tomatoCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.predictedClass.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.sortingBin.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesQuality = qualityFilter === 'All' || item.predictedClass === qualityFilter;
        return matchesSearch && matchesQuality;
      })
      .sort((a, b) => {
        return sortOrder === 'desc'
          ? b.id.localeCompare(a.id)
          : a.id.localeCompare(b.id);
      });
  }, [inspections, searchTerm, qualityFilter, sortOrder]);

  const handleExportCsv = () => {
    const headers = ['Timestamp', 'Sample Code', 'Quality Class', 'Grade', 'Sorting Channel', 'Confidence', 'Status'];
    const rows = filteredList.map((item) => [
      item.timestamp,
      item.tomatoCode,
      item.predictedClass,
      gradeColorMap[item.predictedClass]?.grade || 'Standard',
      item.sortingBin,
      `${(item.confidence * 100).toFixed(1)}%`,
      item.status
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tomatosort_audit_log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Controls Bar */}
      <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Batch Quality Audit Log
            </span>
            <span className="text-xs font-mono text-slate-500">
              ({filteredList.length} records)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
            {onClearHistory && (
              <button
                onClick={onClearHistory}
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-rose-700 bg-white hover:bg-rose-50 rounded border border-rose-200 cursor-pointer"
                title="Reset batch log"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search sample code, class, or bin..."
              className="w-full text-xs pl-8 pr-3 py-1 border border-slate-200 rounded bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
            />
          </div>

          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded p-0.5 text-xs">
            {(['All', 'Ripe', 'Unripe', 'Damaged', 'Old'] as const).map((q) => (
              <button
                key={q}
                onClick={() => setQualityFilter(q)}
                className={`px-2 py-0.5 rounded text-xs font-medium cursor-pointer transition-colors ${
                  qualityFilter === q
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {q === 'All' ? 'All Classes' : q}
              </button>
            ))}
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1 px-2 py-1 text-xs text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50 cursor-pointer"
          >
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
            <span>{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
          </button>
        </div>
      </div>

      {/* Industrial Audit Log Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-2.5 px-4">Timestamp</th>
              <th className="py-2.5 px-4">Sample Code</th>
              <th className="py-2.5 px-4 font-sans font-bold">Classification</th>
              <th className="py-2.5 px-4 text-center">Channel</th>
              <th className="py-2.5 px-4 text-right">Confidence</th>
              <th className="py-2.5 px-4 text-right font-sans font-bold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-xs">
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 font-sans">
                  No records matching active filter query.
                </td>
              </tr>
            ) : (
              filteredList.map((row) => {
                const gradeInfo = gradeColorMap[row.predictedClass];
                const confPercent = (row.confidence * 100).toFixed(1);
                const isLow = row.status === 'Low Confidence';

                return (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">
                      {row.timestamp}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {row.tomatoCode}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap font-sans">
                      <div className="flex items-center gap-1.5 font-medium text-slate-900">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: gradeInfo?.dot }}
                        />
                        <span className="font-semibold">{gradeInfo?.label || row.predictedClass}</span>
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1 rounded border border-slate-200">
                          {gradeInfo?.grade}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-center whitespace-nowrap">
                      <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-xs font-bold text-slate-800">
                        {row.sortingBin}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold whitespace-nowrap text-slate-900">
                      {confPercent}%
                    </td>
                    <td className="py-2.5 px-4 text-right whitespace-nowrap font-sans">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Rerouted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Sorted
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
