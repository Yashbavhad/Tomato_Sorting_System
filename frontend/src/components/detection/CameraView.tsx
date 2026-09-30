import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, AlertCircle, RefreshCw } from 'lucide-react';

interface CameraViewProps {
  onCaptureImage: (blob: Blob, previewUrl: string) => void;
  isProcessing: boolean;
  autoStart?: boolean;
}

export const CameraView: React.FC<CameraViewProps> = ({
  onCaptureImage,
  isProcessing,
  autoStart = true
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<'idle' | 'starting' | 'active' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [capturedThumbnail, setCapturedThumbnail] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    setCameraState('starting');
    setErrorMessage('');

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera is not supported in this browser.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment'
        },
        audio: false
      });

      setStream(mediaStream);
      setCameraState('active');

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch(() => undefined);
      }
    } catch (err: unknown) {
      console.error('Camera access error:', err);
      setCameraState('error');
      const name = err && typeof err === 'object' && 'name' in err ? String((err as { name: string }).name) : '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setErrorMessage('Camera permission is required to check a tomato.');
      } else {
        setErrorMessage('Camera permission is required to check a tomato.');
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraState('idle');
  }, [stream]);

  useEffect(() => {
    if (autoStart) {
      startCamera();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (cameraState === 'active' && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => undefined);
    }
  }, [cameraState, stream]);

  const captureFrame = () => {
    if (cameraState !== 'active' || !videoRef.current || isProcessing) return;

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const previewUrl = canvas.toDataURL('image/jpeg', 0.9);
          setCapturedThumbnail(previewUrl);
          onCaptureImage(blob, previewUrl);
        }
      },
      'image/jpeg',
      0.9
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isProcessing) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setCapturedThumbnail(url);
      onCaptureImage(file, url);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 sm:p-5 flex flex-col">
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] mb-3">
        <div>
          <h3 className="text-sm font-bold text-[#1F2937]">Camera Preview</h3>
          <p className="text-xs text-gray-500 mt-0.5">Hold the tomato steady in the frame</p>
        </div>
        <div className="flex items-center gap-2">
          {cameraState === 'active' && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
              LIVE
            </span>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-50 rounded border border-[#E5E7EB] cursor-pointer disabled:opacity-50"
          >
            Upload photo
          </button>
        </div>
      </div>

      <div className="relative aspect-[4/3] w-full bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
        <video
          ref={videoRef}
          className={`w-full h-full object-cover ${
            cameraState === 'active' ? 'opacity-100' : 'opacity-0 absolute'
          }`}
          autoPlay
          playsInline
          muted
        />

        {cameraState === 'idle' && (
          <div className="text-center p-6 space-y-3">
            <Camera className="w-10 h-10 text-gray-400 mx-auto" />
            <p className="text-sm text-gray-300">Camera is off</p>
            <button
              onClick={startCamera}
              className="px-4 py-2 text-sm font-semibold text-white rounded-lg cursor-pointer"
              style={{ background: '#087F5B' }}
            >
              Open Camera
            </button>
          </div>
        )}

        {cameraState === 'starting' && (
          <div className="text-center p-6 text-gray-200">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
            <p className="text-sm">Starting camera...</p>
          </div>
        )}

        {cameraState === 'error' && (
          <div className="text-center p-6 max-w-sm">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-white font-medium">{errorMessage}</p>
            <button
              onClick={startCamera}
              className="mt-3 px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 text-white rounded border border-white/20 cursor-pointer"
            >
              Try again
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {cameraState === 'active' ? (
            <>
              <button
                onClick={captureFrame}
                disabled={isProcessing}
                className="px-6 py-3 text-white text-sm font-bold rounded-lg cursor-pointer disabled:opacity-60 tracking-wide"
                style={{ background: '#087F5B' }}
              >
                {isProcessing ? 'Checking tomato...' : 'CHECK TOMATO'}
              </button>
              <button
                onClick={stopCamera}
                className="px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg border border-[#E5E7EB] cursor-pointer"
              >
                Stop camera
              </button>
            </>
          ) : (
            <button
              onClick={startCamera}
              className="px-5 py-2.5 text-white text-sm font-bold rounded-lg cursor-pointer"
              style={{ background: '#087F5B' }}
            >
              Open Camera
            </button>
          )}
        </div>

        {capturedThumbnail && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Last capture:</span>
            <img
              src={capturedThumbnail}
              alt="Captured tomato"
              className="w-10 h-10 rounded border border-[#E5E7EB] object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
};
