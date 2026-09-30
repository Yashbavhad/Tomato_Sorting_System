import { API_BASE_URL, CLASS_CONFIG, CLASS_ORDER } from '../config/api';
import { PredictionResponse, TomatoQualityClass } from '../types';

export class ApiError extends Error {
  constructor(
    message: string,
    public kind: 'offline' | 'predict' | 'invalid' | 'unknown' = 'unknown'
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ModelInfoResponse {
  model: string;
  input_size: number[];
  classes: string[];
  preprocessing: {
    resize: number[];
    color: string;
    external_scaling: boolean;
  };
  model_file?: string | null;
  model_loaded?: boolean;
}

interface FastApiPredictionBody {
  success?: boolean;
  error?: string;
  detail?: string;
  prediction?: {
    class: string;
    index: number;
    confidence: number;
    probabilities: Record<string, number>;
  };
  // Legacy Desktop :8000 shape (rejected for truth; kept only for clearer errors)
  predicted_class?: string;
  class?: string;
  confidence?: number;
  probabilities?: Record<string, number>;
}

class ApiService {
  private baseUrl: string = API_BASE_URL;
  private backendAvailable: boolean = false;
  private isCheckingBackend: boolean = false;
  private modelInfoCache: ModelInfoResponse | null = null;

  constructor() {
    this.checkBackendHealth();
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setBaseUrl(url: string): void {
    this.baseUrl = url.replace(/\/$/, '');
    if (typeof window !== 'undefined') {
      localStorage.setItem('tomato_api_url', this.baseUrl);
    }
    this.modelInfoCache = null;
    this.checkBackendHealth();
  }

  public isBackendOnline(): boolean {
    return this.backendAvailable;
  }

  public async checkBackendHealth(): Promise<boolean> {
    if (this.isCheckingBackend) return this.backendAvailable;
    this.isCheckingBackend = true;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${this.baseUrl}/api/health`, {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        this.backendAvailable = data?.status === 'ok' && Boolean(data?.model_loaded);
      } else {
        this.backendAvailable = false;
      }
    } catch {
      this.backendAvailable = false;
    } finally {
      this.isCheckingBackend = false;
    }
    return this.backendAvailable;
  }

  public async getModelInfo(force = false): Promise<ModelInfoResponse> {
    if (!force && this.modelInfoCache) {
      return this.modelInfoCache;
    }

    const online = await this.checkBackendHealth();
    if (!online) {
      throw new ApiError(
        'AI service unavailable. Please make sure the FastAPI model service is running on port 8001.',
        'offline'
      );
    }

    const res = await fetch(`${this.baseUrl}/api/model-info`);
    if (!res.ok) {
      throw new ApiError('Unable to load model information from FastAPI.', 'unknown');
    }
    const data = (await res.json()) as ModelInfoResponse;
    this.modelInfoCache = data;
    return data;
  }

  /**
   * Single prediction path: FormData → POST /api/predict → verified FastAPI JSON.
   * Does not invent class/confidence/probabilities.
   */
  public async predictTomato(imageBlob: Blob): Promise<PredictionResponse> {
    const startTime = performance.now();
    const online = await this.checkBackendHealth();

    if (!online) {
      throw new ApiError(
        'AI service unavailable. Please make sure the FastAPI model service is running on port 8001.',
        'offline'
      );
    }

    try {
      const formData = new FormData();
      formData.append('image', imageBlob, 'tomato_capture.jpg');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${this.baseUrl}/api/predict`, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      let data: FastApiPredictionBody;
      try {
        data = await response.json();
      } catch {
        throw new ApiError('Invalid response from AI service.', 'predict');
      }

      if (!response.ok || data.success === false) {
        if (response.status === 503) {
          this.backendAvailable = false;
          throw new ApiError(
            data.error ||
              'AI service unavailable. Please make sure the FastAPI model service is running on port 8001.',
            'offline'
          );
        }
        throw new ApiError(
          data.error || data.detail || 'Unable to inspect this image. Please try again.',
          response.status === 400 ? 'invalid' : 'predict'
        );
      }

      // Verified Phase 3 shape: { success, prediction: { class, index, confidence, probabilities } }
      const nested = data.prediction;
      if (!nested) {
        throw new ApiError(
          'Unexpected API response. Connect to the verified FastAPI service on port 8001.',
          'predict'
        );
      }

      const predictedClass = nested.class as TomatoQualityClass;
      if (!predictedClass || !CLASS_CONFIG[predictedClass]) {
        throw new ApiError(
          `Unknown class from model: ${String(nested.class)}`,
          'predict'
        );
      }

      const confidence = Number(nested.confidence);
      if (!Number.isFinite(confidence)) {
        throw new ApiError('Invalid confidence value from AI service.', 'predict');
      }

      const probabilities = {} as Record<TomatoQualityClass, number>;
      for (const name of CLASS_ORDER) {
        const value = Number(nested.probabilities?.[name]);
        if (!Number.isFinite(value)) {
          throw new ApiError(
            `Missing probability for class ${name} in AI response.`,
            'predict'
          );
        }
        probabilities[name] = value;
      }

      return {
        class: predictedClass,
        index: Number(nested.index),
        confidence,
        probabilities,
        sorting_bin: CLASS_CONFIG[predictedClass].bin,
        recommended_action: CLASS_CONFIG[predictedClass].action,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        }),
        source: 'real-ai',
        latency_ms: Math.round(performance.now() - startTime)
      };
    } catch (err) {
      if (err instanceof ApiError) throw err;
      this.backendAvailable = false;
      throw new ApiError(
        'AI service unavailable. Please make sure the FastAPI model service is running on port 8001.',
        'offline'
      );
    }
  }
}

export const apiService = new ApiService();
export default apiService;
