import React, { useEffect, useState } from 'react';
import { Cpu, ShieldCheck } from 'lucide-react';
import { MODEL_INFO } from '../../config/api';
import apiService, { ModelInfoResponse } from '../../services/api';

interface ModelStatusCardProps {
  isBackendConnected: boolean;
}

export const ModelStatusCard: React.FC<ModelStatusCardProps> = ({ isBackendConnected }) => {
  const [info, setInfo] = useState<ModelInfoResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!isBackendConnected) {
      setInfo(null);
      setLoadError(null);
      return;
    }

    apiService
      .getModelInfo(true)
      .then((data) => {
        if (!cancelled) {
          setInfo(data);
          setLoadError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setInfo(null);
          setLoadError(err instanceof Error ? err.message : 'Unable to load model info');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isBackendConnected]);

  const modelName = info?.model ?? MODEL_INFO.architecture;
  const inputSize = info?.input_size?.join(' × ') ?? MODEL_INFO.inputShape;
  const classCount = info?.classes?.length ?? MODEL_INFO.classesCount;
  const externalScaling =
    info == null
      ? '—'
      : info.preprocessing.external_scaling
        ? 'Applied'
        : 'None';

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1F2937]">AI Model Status</h3>
            <p className="text-xs text-gray-500">Verified EfficientNetB0 service</p>
          </div>
        </div>

        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-semibold ${
            isBackendConnected
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isBackendConnected ? 'bg-green-600 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span>{isBackendConnected ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-gray-50 rounded-lg border border-[#E5E7EB]">
          <span className="text-gray-500 font-medium block">Model</span>
          <span className="text-sm font-bold text-[#1F2937] font-mono mt-0.5 block">{modelName}</span>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg border border-[#E5E7EB]">
          <span className="text-gray-500 font-medium block">Input</span>
          <span className="text-sm font-bold text-[#1F2937] font-mono mt-0.5 block">{inputSize}</span>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg border border-[#E5E7EB]">
          <span className="text-gray-500 font-medium block">Classes</span>
          <span className="text-sm font-bold text-[#1F2937] font-mono mt-0.5 block">{classCount}</span>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg border border-[#E5E7EB]">
          <span className="text-gray-500 font-medium block">External normalization</span>
          <span className="text-sm font-bold text-[#1F2937] font-mono mt-0.5 block">
            {externalScaling}
          </span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-gray-50 rounded-lg border border-[#E5E7EB]">
          <span className="text-gray-500 font-medium block">Model Test Accuracy</span>
          <span className="text-sm font-bold text-emerald-700 font-mono mt-0.5 block">
            {MODEL_INFO.testAccuracy}%
          </span>
          <span className="text-[11px] text-gray-500">Held-out evaluation (not live confidence)</span>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg border border-[#E5E7EB]">
          <span className="text-gray-500 font-medium block">Inference Mode</span>
          <span className="text-sm font-bold text-[#1F2937] font-mono mt-0.5 block">
            {isBackendConnected ? 'FastAPI :8001' : 'Unavailable'}
          </span>
          <span className="text-[11px] text-gray-500">
            {isBackendConnected ? 'Real Keras model only' : 'No mock fallback'}
          </span>
        </div>
      </div>

      {info?.classes && (
        <div className="mt-4 pt-3 border-t border-[#E5E7EB]">
          <span className="text-xs font-semibold text-gray-700 block mb-2">Classes:</span>
          <div className="flex flex-wrap gap-2 text-xs">
            {info.classes.map((cls) => (
              <div
                key={cls}
                className="px-2.5 py-1 bg-gray-50 border border-[#E5E7EB] rounded-lg text-[#1F2937] font-medium"
              >
                {cls}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 p-2.5 bg-gray-50 rounded-lg border border-[#E5E7EB] text-[11px] text-gray-500 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-gray-700 font-medium">Validation Note:</strong>{' '}
          {loadError || MODEL_INFO.note}
        </p>
      </div>
    </div>
  );
};
