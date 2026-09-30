import { InspectionRecord, QualityStatistics } from '../types';

export const INITIAL_STATISTICS: QualityStatistics = {
  total: 0,
  ripe: 0,
  unripe: 0,
  damaged: 0,
  old: 0,
  averageConfidence: 0,
  todayCount: 0,
  growthRate: 0
};

export const INITIAL_INSPECTIONS: InspectionRecord[] = [];

export const STORAGE_KEYS = {
  stats: 'tomatosort_stats',
  history: 'tomatosort_history'
};

/** Kept for unused legacy chart components so TypeScript still compiles. */
export const SAMPLE_PRESETS: Array<{
  id: string;
  name: string;
  category: string;
  simulatedClass: 'Ripe' | 'Unripe' | 'Damaged' | 'Old';
  imageSvgDataUri: string;
}> = [];

export type SamplePreset = (typeof SAMPLE_PRESETS)[number];

export const DAILY_INSPECTIONS: Array<{ day: string; count: number }> = [];
export const HOURLY_INSPECTIONS_TODAY: Array<{ hour: string; time: string; count: number }> = [];
export const CONFIDENCE_BUCKETS: Array<{
  label: string;
  range: string;
  count: number;
  percentage: number;
}> = [];
