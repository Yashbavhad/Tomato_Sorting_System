import React from 'react';
import { Camera, RefreshCw, AlertTriangle, AlertCircle } from 'lucide-react';
import { CLASS_CONFIG, CLASS_ORDER, CONFIDENCE_THRESHOLD } from '../../config/api';
import { PredictionResponse, TomatoQualityClass } from '../../types';

interface DetectionResultCardProps {
  result: PredictionResponse | null;
  isProcessing: boolean;
  errorMessage?: string | null;
  onClear: () => void;
  onCheckAnother?: () => void;
}

export const DetectionResultCard: React.FC<DetectionResultCardProps> = ({
  result,
  isProcessing,
  errorMessage,
  onClear,
  onCheckAnother
}) => {
  if (isProcessing) {
    return (
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 flex flex-col items-center justify-center min-h-[360px] text-center">
        <div className="w-11 h-11 rounded-lg bg-[#087F5B] text-white flex items-center justify-center mb-3">
          <RefreshCw className="w-5 h-5 animate-spin" />
        </div>
        <h4 className="text-sm font-bold text-[#1F2937]">Analyzing tomato...</h4>
        <p className="text-xs text-gray-500 max-w-xs mt-1">
          Sending image to verified FastAPI model service
        </p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-6 flex flex-col items-center justify-center min-h-[360px] text-center">
        <div className="w-12 h-12 rounded-lg bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-red-800">AI service unavailable</h4>
        <p className="text-xs text-red-700 max-w-sm mt-2 whitespace-pre-wrap">{errorMessage}</p>
        <button
          onClick={onClear}
          className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg border border-[#E5E7EB] bg-white cursor-pointer hover:bg-gray-50"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 flex flex-col items-center justify-center min-h-[360px] text-center">
        <div className="w-12 h-12 rounded-lg bg-gray-100 border border-[#E5E7EB] text-gray-400 flex items-center justify-center mb-3">
          <Camera className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-[#1F2937]">No prediction yet</h4>
        <p className="text-xs text-gray-500 max-w-xs mt-1">
          Capture or upload a tomato image to get a real model prediction.
        </p>
      </div>
    );
  }

  const isLowConfidence = result.confidence < CONFIDENCE_THRESHOLD;
  const confidencePercent = (result.confidence * 100).toFixed(2);
  const cfg = CLASS_CONFIG[result.class];

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 sm:p-5 flex flex-col justify-between min-h-[360px]">
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-[#E5E7EB]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
              Prediction
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-0.5">
              <span>{result.timestamp || 'Just now'}</span>
              {typeof result.latency_ms === 'number' && (
                <>
                  <span>·</span>
                  <span>{result.latency_ms}ms</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClear}
            className="text-xs text-gray-500 hover:text-gray-900 px-2 py-0.5 rounded hover:bg-gray-100 font-medium cursor-pointer"
          >
            Reset
          </button>
        </div>

        {isLowConfidence && (
          <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              Prediction Confidence {confidencePercent}% is below the {CONFIDENCE_THRESHOLD * 100}%
              review threshold. Class below is still the model output.
            </p>
          </div>
        )}

        <div
          className="mt-3.5 p-3.5 rounded-lg border flex items-center justify-between"
          style={{ background: cfg.bgLight, borderColor: cfg.border }}
        >
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-600 block">Prediction</span>
            <span className="text-xl font-bold tracking-tight text-[#1F2937] block mt-0.5">
              {cfg.emoji} {result.class}
            </span>
            <span className="text-xs text-gray-600 block">Index {result.index}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-gray-600 block">
              Prediction Confidence
            </span>
            <span className="text-xl font-bold text-[#1F2937] block mt-0.5">
              {confidencePercent}%
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded border bg-white/70" style={{ borderColor: cfg.border }}>
              {result.sorting_bin}
            </span>
          </div>
        </div>

        <div className="pt-3 space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-gray-500 block">
            Class probabilities
          </span>
          <div className="space-y-1">
            {CLASS_ORDER.map((cls: TomatoQualityClass) => {
              const prob = result.probabilities[cls];
              const pct = (prob * 100).toFixed(2);
              const isTop = cls === result.class;
              const itemCfg = CLASS_CONFIG[cls];

              return (
                <div key={cls} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 w-28">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: itemCfg.color }}
                    />
                    <span className={isTop ? 'font-bold text-[#1F2937]' : 'text-gray-600'}>
                      {cls}
                    </span>
                  </div>
                  <div className="flex-1 mx-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, Number(pct))}%`,
                        backgroundColor: itemCfg.color
                      }}
                    />
                  </div>
                  <span className="w-14 text-right font-medium text-gray-700 text-[11px]">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#E5E7EB]">
        <button
          onClick={onCheckAnother || onClear}
          className="w-full py-2.5 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 cursor-pointer"
          style={{ background: '#087F5B' }}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Check another tomato</span>
        </button>
      </div>
    </div>
  );
};
