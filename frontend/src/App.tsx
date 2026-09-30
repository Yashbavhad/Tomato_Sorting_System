import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/common/Header';
import { DashboardPage } from './pages/DashboardPage';
import { LiveDetectionPage } from './pages/LiveDetectionPage';
import { HistoryPage } from './pages/HistoryPage';
import { FastApiGuideModal } from './components/detection/FastApiGuideModal';
import { INITIAL_INSPECTIONS, INITIAL_STATISTICS, STORAGE_KEYS } from './data/demoData';
import { InspectionRecord, PredictionResponse, QualityStatistics } from './types';
import apiService from './services/api';

function loadStats(): QualityStatistics {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.stats);
    if (raw) return { ...INITIAL_STATISTICS, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return { ...INITIAL_STATISTICS };
}

function loadHistory(): InspectionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.history);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return [...INITIAL_INSPECTIONS];
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'detection' | 'history'>('home');
  const [stats, setStats] = useState<QualityStatistics>(loadStats);
  const [inspections, setInspections] = useState<InspectionRecord[]>(loadHistory);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [showTechnicalModal, setShowTechnicalModal] = useState<boolean>(false);

  const checkBackend = useCallback(async () => {
    const isOnline = await apiService.checkBackendHealth();
    setIsBackendConnected(isOnline);
  }, []);

  useEffect(() => {
    checkBackend();
    const interval = setInterval(checkBackend, 15000);
    return () => clearInterval(interval);
  }, [checkBackend]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(inspections));
  }, [inspections]);

  const handleNewInspection = (newRecord: InspectionRecord, result: PredictionResponse) => {
    setInspections((prev) => [newRecord, ...prev]);

    setStats((prev) => {
      const isRipe = result.class === 'Ripe';
      const isUnripe = result.class === 'Unripe';
      const isDamaged = result.class === 'Damaged';
      const isOld = result.class === 'Old';

      return {
        ...prev,
        total: prev.total + 1,
        todayCount: prev.todayCount + 1,
        ripe: prev.ripe + (isRipe ? 1 : 0),
        unripe: prev.unripe + (isUnripe ? 1 : 0),
        damaged: prev.damaged + (isDamaged ? 1 : 0),
        old: prev.old + (isOld ? 1 : 0)
      };
    });
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear all inspection history?')) {
      setInspections([]);
      setStats({ ...INITIAL_STATISTICS });
      localStorage.removeItem(STORAGE_KEYS.stats);
      localStorage.removeItem(STORAGE_KEYS.history);
    }
  };

  return (
    <div className="min-h-screen text-[#1F2937] flex flex-col font-sans" style={{ background: '#F7F9F8' }}>
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isBackendConnected={isBackendConnected}
        onRefreshBackend={checkBackend}
        onOpenTechnicalModal={() => setShowTechnicalModal(true)}
      />

      <main className="flex-1 w-[94%] max-w-[1400px] mx-auto py-5">
        {activeTab === 'home' && (
          <DashboardPage
            stats={stats}
            inspections={inspections}
            isBackendConnected={isBackendConnected}
            onNavigateToDetection={() => setActiveTab('detection')}
            onOpenTechnicalModal={() => setShowTechnicalModal(true)}
          />
        )}

        {activeTab === 'detection' && (
          <LiveDetectionPage
            onNewInspection={handleNewInspection}
            isBackendConnected={isBackendConnected}
            onNavigateHome={() => setActiveTab('home')}
            onOpenTechnicalModal={() => setShowTechnicalModal(true)}
          />
        )}

        {activeTab === 'history' && (
          <HistoryPage
            inspections={inspections}
            stats={stats}
            onClearHistory={handleClearHistory}
            onNavigateHome={() => setActiveTab('home')}
          />
        )}
      </main>

      <footer className="bg-white border-t border-[#E5E7EB] py-3 text-xs text-gray-500">
        <div className="w-[94%] max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-semibold text-[#1F2937]">TomatoSort AI</span>
            <span className="mx-2">·</span>
            <span>Smart Tomato Quality Checking</span>
          </div>
          <button
            onClick={() => setShowTechnicalModal(true)}
            className="text-[#087F5B] hover:underline font-medium cursor-pointer"
          >
            About / Technical details
          </button>
        </div>
      </footer>

      <FastApiGuideModal
        isOpen={showTechnicalModal}
        onClose={() => setShowTechnicalModal(false)}
        isBackendConnected={isBackendConnected}
      />
    </div>
  );
}
