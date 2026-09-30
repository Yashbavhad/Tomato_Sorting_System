import React, { useState } from 'react';
import { Camera, History, LayoutDashboard, Server, CheckCircle2, AlertCircle } from 'lucide-react';
import apiService from '../../services/api';

interface HeaderProps {
  activeTab: 'home' | 'detection' | 'history';
  setActiveTab: (tab: 'home' | 'detection' | 'history') => void;
  isBackendConnected: boolean;
  onRefreshBackend: () => void;
  onOpenTechnicalModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isBackendConnected,
  onRefreshBackend,
  onOpenTechnicalModal
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [apiUrl, setApiUrl] = useState(apiService.getBaseUrl());
  const [isTestingUrl, setIsTestingUrl] = useState(false);

  const handleSaveUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTestingUrl(true);
    apiService.setBaseUrl(apiUrl);
    await onRefreshBackend();
    setIsTestingUrl(false);
    setShowSettings(false);
  };

  const navItems = [
    { id: 'home' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'detection' as const, label: 'Check Tomato', icon: Camera },
    { id: 'history' as const, label: 'History', icon: History }
  ];

  return (
    <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-30">
      <div className="w-[94%] max-w-[1400px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3">
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 text-left cursor-pointer"
          >
            <div
              className="w-10 h-10 rounded-lg text-white flex items-center justify-center text-lg"
              style={{ background: '#087F5B' }}
            >
              🍅
            </div>
            <div>
              <div className="text-lg font-bold text-[#1F2937]">TomatoSort AI</div>
              <p className="text-xs text-gray-500">Smart Tomato Quality Checking</p>
            </div>
          </button>

          <nav className="flex items-center gap-1 flex-wrap">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 py-2 px-3 rounded-lg text-sm font-semibold cursor-pointer transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  style={isActive ? { background: '#087F5B' } : undefined}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 relative">
            <button
              onClick={() => {
                onRefreshBackend();
                setShowSettings((v) => !v);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer ${
                isBackendConnected
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              {isBackendConnected ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5" />
              )}
              <span>{isBackendConnected ? 'AI Ready' : 'AI Offline'}</span>
            </button>

            {showSettings && (
              <div className="absolute right-0 top-10 w-72 bg-white border border-[#E5E7EB] rounded-lg shadow-lg p-3 z-40">
                <form onSubmit={handleSaveUrl} className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                    <Server className="w-3.5 h-3.5" />
                    AI server address
                  </label>
                  <input
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    className="w-full border border-[#E5E7EB] rounded-md px-2 py-1.5 text-sm"
                    placeholder="http://127.0.0.1:8001"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isTestingUrl}
                      className="flex-1 text-white text-xs font-semibold py-1.5 rounded-md cursor-pointer"
                      style={{ background: '#087F5B' }}
                    >
                      {isTestingUrl ? 'Checking...' : 'Save & Check'}
                    </button>
                    <button
                      type="button"
                      onClick={onOpenTechnicalModal}
                      className="px-2 text-xs text-[#087F5B] font-medium cursor-pointer"
                    >
                      About
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
