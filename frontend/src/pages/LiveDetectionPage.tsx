import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { CameraView } from '../components/detection/CameraView';
import { DetectionResultCard } from '../components/detection/DetectionResultCard';
import { InspectionRecord, PredictionResponse } from '../types';
import apiService, { ApiError } from '../services/api';
import { CLASS_CONFIG } from '../config/api';

interface LiveDetectionPageProps {
  onNewInspection: (record: InspectionRecord, result: PredictionResponse) => void;
  isBackendConnected: boolean;
  onNavigateHome: () => void;
  onOpenTechnicalModal: () => void;
}

export const LiveDetectionPage: React.FC<LiveDetectionPageProps> = ({
  onNewInspection,
  isBackendConnected,
  onNavigateHome,
  onOpenTechnicalModal
}) => {
  const [currentResult, setCurrentResult] = useState<PredictionResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCaptureImage = async (blob: Blob, previewUrl: string) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setCurrentResult(null);

    try {
      const result = await apiService.predictTomato(blob);
      setCurrentResult(result);

      const newRecord: InspectionRecord = {
        id: `insp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        tomatoCode: `Tomato #${Date.now().toString().slice(-6)}`,
        timestamp: new Date().toISOString(),
        predictedClass: result.class,
        confidence: result.confidence,
        sortingBin: result.sorting_bin,
        status: result.confidence < 0.7 ? 'Low Confidence' : 'Sorted',
        imageUrl: previewUrl,
        probabilities: result.probabilities
      };

      onNewInspection(newRecord, result);
    } catch (err) {
      console.error('Prediction error:', err);
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else if (!isBackendConnected) {
        setErrorMessage(
          'AI service unavailable.\nPlease make sure the FastAPI model service is running on port 8001.'
        );
      } else {
        setErrorMessage('Unable to inspect this image. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setCurrentResult(null);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] bg-white cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </button>
          <div>
            <h2 className="text-lg font-bold text-[#1F2937]">Check Your Tomato</h2>
            <p className="text-xs text-gray-500">
              {isBackendConnected ? 'AI Ready' : 'AI Offline — start the Python server'}
            </p>
          </div>
        </div>
        <button
          onClick={onOpenTechnicalModal}
          className="text-xs text-[#087F5B] hover:underline cursor-pointer"
        >
          About
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7">
          <CameraView onCaptureImage={handleCaptureImage} isProcessing={isProcessing} autoStart />
        </div>
        <div className="lg:col-span-5">
          <DetectionResultCard
            result={currentResult}
            isProcessing={isProcessing}
            errorMessage={errorMessage}
            onClear={handleClear}
            onCheckAnother={handleClear}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 text-sm text-gray-600">
        <strong className="text-[#1F2937]">Sorting Destination</strong>
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(CLASS_CONFIG) as Array<keyof typeof CLASS_CONFIG>).map((key) => (
            <div key={key} className="px-3 py-2 rounded-lg border border-[#E5E7EB]" style={{ background: CLASS_CONFIG[key].bgLight }}>
              {key} → {CLASS_CONFIG[key].bin}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
