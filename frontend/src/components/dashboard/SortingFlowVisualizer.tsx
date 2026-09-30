import React from 'react';
import { Camera, Cpu, Sparkles, GitFork, ArrowRight, Layers } from 'lucide-react';

export const SortingFlowVisualizer: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border border-stone-200 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
        <div>
          <h3 className="text-sm font-bold text-stone-900">
            Physical Sorting Architecture
          </h3>
          <p className="text-xs text-stone-500">
            End-to-end automated pipeline from real-time optical capture to robotic bin divert
          </p>
        </div>
        <span className="text-[11px] text-stone-500 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded">
          Simulation View
        </span>
      </div>

      {/* Pipeline Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 relative">
        {/* Step 1: Camera */}
        <div className="p-3.5 rounded-lg border border-stone-200 bg-stone-50/60 flex flex-col items-center text-center">
          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2">
            <Camera className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-stone-900">1. Camera Frame</span>
          <span className="text-[11px] text-stone-500 mt-0.5">
            Laptop / Webcam RGB Capture (224x224)
          </span>
        </div>

        {/* Step 2: AI Detection */}
        <div className="p-3.5 rounded-lg border border-stone-200 bg-stone-50/60 flex flex-col items-center text-center">
          <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center mb-2">
            <Cpu className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-stone-900">2. AI Inference</span>
          <span className="text-[11px] text-stone-500 mt-0.5">
            EfficientNetB0 feature extraction
          </span>
        </div>

        {/* Step 3: Classification */}
        <div className="p-3.5 rounded-lg border border-stone-200 bg-stone-50/60 flex flex-col items-center text-center">
          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center mb-2">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-stone-900">3. Classification</span>
          <span className="text-[11px] text-stone-500 mt-0.5">
            4-class probability distribution
          </span>
        </div>

        {/* Step 4: Decision */}
        <div className="p-3.5 rounded-lg border border-stone-200 bg-stone-50/60 flex flex-col items-center text-center">
          <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mb-2">
            <GitFork className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-stone-900">4. Sorting Decision</span>
          <span className="text-[11px] text-stone-500 mt-0.5">
            Confidence threshold check (&ge; 70%)
          </span>
        </div>

        {/* Step 5: Bins */}
        <div className="p-3.5 rounded-lg border border-stone-200 bg-stone-50/60 flex flex-col items-center text-center">
          <div className="w-9 h-9 rounded-full bg-stone-200 text-stone-800 flex items-center justify-center mb-2">
            <Layers className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-stone-900">5. Actuator Divert</span>
          <span className="text-[11px] text-stone-500 mt-0.5">
            Pneumatic flipper to Bins 1 - 4
          </span>
        </div>
      </div>

      {/* Bin Routing Mapping */}
      <div className="mt-4 pt-3 border-t border-stone-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="flex items-center gap-1.5 p-2 bg-emerald-50/70 border border-emerald-200 rounded">
          <span>🍅</span>
          <span className="font-semibold text-emerald-900">Ripe</span>
          <ArrowRight className="w-3 h-3 text-emerald-700 ml-auto" />
          <span className="font-mono font-bold text-emerald-950">Bin 1</span>
        </div>
        <div className="flex items-center gap-1.5 p-2 bg-sky-50/70 border border-sky-200 rounded">
          <span>🟢</span>
          <span className="font-semibold text-sky-900">Unripe</span>
          <ArrowRight className="w-3 h-3 text-sky-700 ml-auto" />
          <span className="font-mono font-bold text-sky-950">Bin 2</span>
        </div>
        <div className="flex items-center gap-1.5 p-2 bg-rose-50/70 border border-rose-200 rounded">
          <span>⚠️</span>
          <span className="font-semibold text-rose-900">Damaged</span>
          <ArrowRight className="w-3 h-3 text-rose-700 ml-auto" />
          <span className="font-mono font-bold text-rose-950">Bin 3</span>
        </div>
        <div className="flex items-center gap-1.5 p-2 bg-amber-50/70 border border-amber-200 rounded">
          <span>🟤</span>
          <span className="font-semibold text-amber-900">Old</span>
          <ArrowRight className="w-3 h-3 text-amber-700 ml-auto" />
          <span className="font-mono font-bold text-amber-950">Bin 4</span>
        </div>
      </div>
    </div>
  );
};
