import { TomatoQualityClass, SortingBinId } from '../types';

const ENV_API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '');

const DEPRECATED_DEFAULTS = new Set([
  'http://localhost:8000',
  'http://127.0.0.1:8000',
]);

function resolveApiBaseUrl(): string {
  const fallback = ENV_API_URL || 'http://127.0.0.1:8001';

  if (typeof window === 'undefined') {
    return fallback;
  }

  const stored = window.localStorage?.getItem('tomato_api_url')?.replace(/\/$/, '');
  if (stored && !DEPRECATED_DEFAULTS.has(stored)) {
    return stored;
  }

  // Migrate stale :8000 bookmarks to the verified Phase 3 service
  if (stored && DEPRECATED_DEFAULTS.has(stored)) {
    window.localStorage.setItem('tomato_api_url', fallback);
  }

  return fallback;
}

export const API_BASE_URL = resolveApiBaseUrl();

export const CONFIDENCE_THRESHOLD = 0.70;

/** Verified training/inference class order */
export const CLASS_ORDER: TomatoQualityClass[] = ['Damaged', 'Old', 'Ripe', 'Unripe'];

export const CLASS_CONFIG: Record<
  TomatoQualityClass,
  {
    name: TomatoQualityClass;
    emoji: string;
    bin: SortingBinId;
    binNumber: number;
    color: string;
    bgLight: string;
    border: string;
    action: string;
    description: string;
  }
> = {
  Damaged: {
    name: 'Damaged',
    emoji: '⚠️',
    bin: 'Bin 3',
    binNumber: 3,
    color: '#E03131',
    bgLight: '#FFF5F5',
    border: '#FFC9C9',
    action: 'Damaged → Bin 3',
    description: 'Has cracks or defects.'
  },
  Old: {
    name: 'Old',
    emoji: '🟤',
    bin: 'Bin 4',
    binNumber: 4,
    color: '#E8590C',
    bgLight: '#FFF4E6',
    border: '#FFD8A8',
    action: 'Old → Bin 4',
    description: 'Overripe or soft.'
  },
  Ripe: {
    name: 'Ripe',
    emoji: '🍅',
    bin: 'Bin 1',
    binNumber: 1,
    color: '#087F5B',
    bgLight: '#E6F6F0',
    border: '#B7E4D4',
    action: 'Ripe → Bin 1',
    description: 'Ready for market.'
  },
  Unripe: {
    name: 'Unripe',
    emoji: '🟢',
    bin: 'Bin 2',
    binNumber: 2,
    color: '#0C8599',
    bgLight: '#E3FAFC',
    border: '#99E9F2',
    action: 'Unripe → Bin 2',
    description: 'Needs more ripening.'
  }
};

/** Historical evaluation metrics — not live prediction confidence */
export const MODEL_INFO = {
  name: 'Tomato Quality Model',
  architecture: 'EfficientNetB0',
  testAccuracy: 96.09,
  classesCount: 4,
  classes: CLASS_ORDER,
  status: 'Model Ready',
  inputShape: '224x224x3',
  modelWeightFile: 'best_tomato_finetuned.keras',
  note: '96.09% is Model Test Accuracy from held-out evaluation — not live prediction confidence.'
};

export default API_BASE_URL;
