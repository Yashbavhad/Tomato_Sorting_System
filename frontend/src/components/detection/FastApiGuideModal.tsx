import React, { useState } from 'react';
import { Copy, Check, Cpu, Layers, Code, ShieldCheck, ArrowRight } from 'lucide-react';
import { MODEL_INFO } from '../../config/api';

interface TechnicalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  isBackendConnected?: boolean;
}

export const FastApiGuideModal: React.FC<TechnicalInfoModalProps> = ({
  isOpen,
  onClose,
  isBackendConnected = false
}) => {
  const [activeTab, setActiveTab] = useState<'model' | 'pipeline' | 'fastapi'>('model');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const pythonSnippet = `"""
Verified Tomato AI FastAPI service (Phase 3/4)
Use the backend in Downloads\\\\Tomato_Sorting_System\\\\backend
"""

# From that folder:
# C:\\\\Users\\\\Priyanka\\\\venv\\\\Scripts\\\\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8001

# Verified class order (do not reorder):
# 0 Damaged, 1 Old, 2 Ripe, 3 Unripe

# Verified response shape:
# {
#   "success": true,
#   "prediction": {
#     "class": "Damaged",
#     "index": 0,
#     "confidence": 0.999269,
#     "probabilities": { "Damaged": ..., "Old": ..., "Ripe": ..., "Unripe": ... }
#   }
# }

# Frontend env:
# VITE_API_URL=http://127.0.0.1:8001
`;

  const copyCode = () => {
    navigator.clipboard.writeText(pythonSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-[10px] border border-[#E5E7EB] shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F7F9F8]">
          <div>
            <h3 className="text-sm font-bold text-[#1F2937]">
              Admin & Technical Information
            </h3>
            <p className="text-xs text-[#6B7280]">
              Evaluation specifications for hackathon judges & engineers
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#6B7280] hover:text-[#1F2937] font-bold text-sm p-1 rounded hover:bg-stone-200"
          >
            âœ•
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-[#E5E7EB] px-4 bg-white text-xs font-semibold">
          <button
            onClick={() => setActiveTab('model')}
            className={`py-2.5 px-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'model'
                ? 'border-[#087F5B] text-[#087F5B]'
                : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
            }`}
          >
            AI Model & Accuracy
          </button>
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`py-2.5 px-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'pipeline'
                ? 'border-[#087F5B] text-[#087F5B]'
                : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
            }`}
          >
            Physical Sorting Architecture
          </button>
          <button
            onClick={() => setActiveTab('fastapi')}
            className={`py-2.5 px-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'fastapi'
                ? 'border-[#087F5B] text-[#087F5B]'
                : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
            }`}
          >
            FastAPI Backend Script
          </button>
        </div>

        {/* Body content */}
        <div className="p-4 overflow-y-auto space-y-3.5 text-xs text-[#1F2937]">
          {activeTab === 'model' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-[#F7F9F8] rounded-[6px] border border-[#E5E7EB]">
                  <span className="text-[#6B7280] block text-[11px]">Backbone Architecture</span>
                  <span className="font-bold text-[#1F2937] font-mono text-sm mt-0.5 block">
                    {MODEL_INFO.architecture}
                  </span>
                </div>
                <div className="p-3 bg-[#EAF7F1] rounded-[6px] border border-[#A7E3CA]">
                  <span className="text-[#087F5B] block text-[11px] font-medium">Test Set Accuracy</span>
                  <span className="font-bold text-[#087F5B] font-mono text-sm mt-0.5 block">
                    {MODEL_INFO.testAccuracy}%
                  </span>
                </div>
                <div className="p-3 bg-[#F7F9F8] rounded-[6px] border border-[#E5E7EB]">
                  <span className="text-[#6B7280] block text-[11px]">Target Quality Classes</span>
                  <span className="font-bold text-[#1F2937] font-mono text-sm mt-0.5 block">
                    4 Classes
                  </span>
                </div>
                <div className="p-3 bg-[#F7F9F8] rounded-[6px] border border-[#E5E7EB]">
                  <span className="text-[#6B7280] block text-[11px]">Input Resolution</span>
                  <span className="font-bold text-[#1F2937] font-mono text-sm mt-0.5 block">
                    224x224 RGB
                  </span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-[6px] border border-[#E5E7EB] space-y-1.5">
                <span className="font-bold text-[#1F2937] block">Classification Class Labels</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 bg-[#F7F9F8] rounded border border-[#E5E7EB]">
                    ðŸ… <strong>Ripe</strong> â†’ Bin 1
                  </div>
                  <div className="p-2 bg-[#F7F9F8] rounded border border-[#E5E7EB]">
                    ðŸŸ¢ <strong>Unripe</strong> â†’ Bin 2
                  </div>
                  <div className="p-2 bg-[#F7F9F8] rounded border border-[#E5E7EB]">
                    âš ï¸ <strong>Damaged</strong> â†’ Bin 3
                  </div>
                  <div className="p-2 bg-[#F7F9F8] rounded border border-[#E5E7EB]">
                    ðŸŸ¤ <strong>Old</strong> â†’ Bin 4
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#F7F9F8] rounded-[6px] border border-[#E5E7EB] text-[11px] text-[#6B7280]">
                <strong>Accuracy Note:</strong> 96.09% is the held-out validation test accuracy evaluated on the trained EfficientNetB0 model. Live inference certainty depends on ambient lighting, angle, and camera focus.
              </div>
            </div>
          )}

          {activeTab === 'pipeline' && (
            <div className="space-y-3">
              <span className="font-bold text-[#1F2937] block">
                Physical Sorting System Flow:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs">
                <div className="p-2.5 bg-[#F7F9F8] rounded border border-[#E5E7EB]">
                  <span className="font-bold block text-[#1F2937]">1. Camera</span>
                  <span className="text-[11px] text-[#6B7280]">Webcam frame</span>
                </div>
                <div className="p-2.5 bg-[#F7F9F8] rounded border border-[#E5E7EB]">
                  <span className="font-bold block text-[#1F2937]">2. AI Inference</span>
                  <span className="text-[11px] text-[#6B7280]">EfficientNetB0</span>
                </div>
                <div className="p-2.5 bg-[#F7F9F8] rounded border border-[#E5E7EB]">
                  <span className="font-bold block text-[#1F2937]">3. Classification</span>
                  <span className="text-[11px] text-[#6B7280]">4 quality states</span>
                </div>
                <div className="p-2.5 bg-[#F7F9F8] rounded border border-[#E5E7EB]">
                  <span className="font-bold block text-[#1F2937]">4. Decision</span>
                  <span className="text-[11px] text-[#6B7280]">&ge; 70% threshold</span>
                </div>
                <div className="p-2.5 bg-[#F7F9F8] rounded border border-[#E5E7EB]">
                  <span className="font-bold block text-[#1F2937]">5. Actuator</span>
                  <span className="text-[11px] text-[#6B7280]">Bins 1 - 4</span>
                </div>
              </div>

              <div className="p-3 bg-[#F7F9F8] rounded-[6px] border border-[#E5E7EB] text-[11px] text-[#6B7280]">
                <strong>Actuator Interface:</strong> In production deployments, the frontend/FastAPI sends the resulting <code className="font-mono bg-white px-1 py-0.5 rounded">sorting_bin</code> payload over Serial/GPIO relay to divert pneumatic flippers into the respective collector bin.
              </div>
            </div>
          )}

          {activeTab === 'fastapi' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#1F2937]">
                  FastAPI Server Script (<code className="font-mono">main.py</code>)
                </span>
                <button
                  onClick={copyCode}
                  className="flex items-center gap-1 text-[11px] text-[#087F5B] font-semibold hover:underline cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              <pre className="bg-stone-900 text-stone-200 font-mono text-[10px] p-3 rounded-[6px] overflow-x-auto max-h-52 leading-relaxed border border-stone-800">
                {pythonSnippet}
              </pre>

              <div className="p-2.5 bg-[#F7F9F8] rounded-[6px] border border-[#E5E7EB] text-[11px] text-[#6B7280]">
                <strong>Run Command:</strong> <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#E5E7EB] text-[#1F2937]">uvicorn app.main:app --host 127.0.0.1 --port 8001</code>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#F7F9F8] border-t border-[#E5E7EB] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-[#1F2937] hover:bg-black text-white rounded-[6px] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

