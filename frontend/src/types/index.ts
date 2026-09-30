export type TomatoQualityClass = 'Ripe' | 'Unripe' | 'Damaged' | 'Old';

export type SortingBinId = 'Bin 1' | 'Bin 2' | 'Bin 3' | 'Bin 4';

export interface ClassProbability {
  className: TomatoQualityClass;
  probability: number; // 0 to 1
  percentage: number;  // 0 to 100
}

export interface PredictionResponse {
  class: TomatoQualityClass;
  index: number;
  confidence: number; // 0 to 1 — raw API value, do not round before storage
  probabilities: Record<TomatoQualityClass, number>;
  sorting_bin: SortingBinId;
  recommended_action?: string;
  inspection_id?: string;
  timestamp?: string;
  source?: 'real-ai';
  latency_ms?: number;
}

export interface InspectionRecord {
  id: string;
  tomatoCode: string;
  timestamp: string;
  predictedClass: TomatoQualityClass;
  confidence: number;
  sortingBin: SortingBinId;
  status: 'Sorted' | 'Flagged' | 'Low Confidence' | 'Rerouted';
  imageUrl?: string;
  probabilities?: Record<TomatoQualityClass, number>;
}

export interface QualityStatistics {
  total: number;
  ripe: number;
  unripe: number;
  damaged: number;
  old: number;
  averageConfidence: number;
  todayCount: number;
  growthRate: number;
}

export interface ModelMetadata {
  name: string;
  architecture: string;
  testAccuracy: number;
  classes: TomatoQualityClass[];
  status: 'Model Ready' | 'Connecting' | 'Offline';
  inputResolution: string;
  framework: string;
  modelFile: string;
}
