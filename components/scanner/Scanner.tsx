'use client';

import { useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import { useAppStore } from '@/lib/store';
import { analyzeFrame, averageMetrics, calculateBaseline } from '@/lib/calculations';
import { Camera, Loader2 } from 'lucide-react';

export default function Scanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const drawingUtilsRef = useRef<DrawingUtils | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const { isScanning, setScanning, setResults, setScanComplete } = useAppStore();

  // Initialize MediaPipe
  useEffect(() => {
    async function initializeMediaPipe() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/wasm'
        );

        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: 'GPU',
          },
          outputFaceBlendshapes: false,
          runningMode: 'VIDEO',
          numFaces: 1,
        });

        faceLandmarkerRef.current = faceLandmarker;
        setIsInitialized(true);
      } catch (err) {
        setError('Failed to initialize face detection');
        console.error(err);
      }
    }

    initializeMediaPipe();
  }, []);

  // Start camera
  useEffect(() => {
    if (!isInitialized || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    drawingUtilsRef.current = new DrawingUtils(ctx);

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, facingMode: 'user' },
        });
        video.srcObject = stream;
        video.addEventListener('loadeddata', () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        });
      } catch (err) {
        setError('Camera access denied');
        console.error(err);
      }
    }

    startCamera();

    return () => {
      if (video.srcObject) {
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isInitialized]);

  // Draw landmarks continuously
  useEffect(() => {
    if (!isInitialized || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const faceLandmarker = faceLandmarkerRef.current;
    const drawingUtils = drawingUtilsRef.current;

    if (!ctx || !faceLandmarker || !drawingUtils) return;

    function processFrame() {
      if (!video || video.readyState !== video.HAVE_ENOUGH_DATA || !ctx || !faceLandmarker || !drawingUtils) {
        animationFrameRef.current = requestAnimationFrame(processFrame);
        return;
      }

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const startTimeInMs = performance.now();
      const results = faceLandmarker.detectForVideo(video, startTimeInMs);
      const hasFace = results.faceLandmarks && results.faceLandmarks.length > 0;

      if (hasFace) {
        const landmarks = results.faceLandmarks![0];

        // Draw subtle landmarks
        drawingUtils.drawLandmarks(landmarks, {
          radius: 0.5,
          color: '#0ea5e9',
          fillColor: '#0ea5e9',
        });
        drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, {
          color: '#0ea5e9',
          lineWidth: 0.3,
        });
      }

      ctx.restore();
      animationFrameRef.current = requestAnimationFrame(processFrame);
    }

    processFrame();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isInitialized]);

  // Handle scan
  const handleStartScan = async () => {
    if (!isInitialized || !videoRef.current || !faceLandmarkerRef.current) return;

    setScanning(true);
    setScanComplete(false);
    setError(null);

    // Countdown: 3, 2, 1
    for (let i = 3; i > 0; i--) {
      setCountdown(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setCountdown(0);
    setIsProcessing(true);
    setCaptureProgress(0);

    try {
      const video = videoRef.current;
      const faceLandmarker = faceLandmarkerRef.current;

      // Collect ~40 frames over 1.5 seconds and average metrics
      // This eliminates single-frame noise completely
      const TOTAL_FRAMES = 40;
      const FRAME_INTERVAL_MS = 40; // ~25fps sampling
      const collectedFrames: ReturnType<typeof analyzeFrame>[] = [];
      let lastLandmarks: any[] = [];

      for (let i = 0; i < TOTAL_FRAMES; i++) {
        await new Promise(resolve => setTimeout(resolve, FRAME_INTERVAL_MS));

        if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) continue;

        const results = faceLandmarker.detectForVideo(video, performance.now());
        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
          const landmarks = results.faceLandmarks[0];
          collectedFrames.push(analyzeFrame(landmarks));
          lastLandmarks = landmarks;
        }

        setCaptureProgress(Math.round(((i + 1) / TOTAL_FRAMES) * 100));
      }

      if (collectedFrames.length < 5) {
        throw new Error('Could not get a clear reading. Make sure your face is well-lit and fully visible.');
      }

      // Average all frames — stable, consistent result
      const avgMetrics = averageMetrics(collectedFrames);
      const baseline = calculateBaseline(lastLandmarks);

      setResults({
        landmarks: lastLandmarks,
        metrics: avgMetrics,
        baseline,
        videoDimensions: { width: video.videoWidth, height: video.videoHeight },
      });

      setScanComplete(true);
      setScanning(false);
      setIsProcessing(false);
      setCaptureProgress(0);
    } catch (err: any) {
      console.error('Scan error:', err);
      setError(err?.message || 'Scan failed. Please try again.');
      setScanning(false);
      setIsProcessing(false);
      setCaptureProgress(0);
      setTimeout(() => setError(null), 4000);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
        {/* Video Container */}
        <div className="relative aspect-video bg-gray-900">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          />

          {/* Loading State */}
          {!isInitialized && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90">
              <div className="text-center text-white">
                <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin" />
                <p className="text-sm">Initializing camera...</p>
              </div>
            </div>
          )}

          {/* Face Guide */}
          {!isScanning && isInitialized && !error && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-72 h-96 border-2 border-primary-400/40 rounded-full relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                  Position your face here
                </div>
              </div>
            </div>
          )}

          {/* Countdown */}
          {countdown > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="text-9xl font-bold text-white animate-pulse">
                {countdown}
              </div>
            </div>
          )}

          {/* Processing */}
          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="text-center text-white w-64">
                <Loader2 className="w-10 h-10 mx-auto mb-4 animate-spin" />
                <p className="text-base font-medium mb-3">Reading your face...</p>
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-100"
                    style={{ width: `${captureProgress}%` }}
                  />
                </div>
                <p className="text-xs text-white/60 mt-2">{captureProgress}% complete</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
              <div className="bg-white rounded-lg p-6 max-w-md text-center">
                <p className="text-red-600 font-medium mb-4">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Scan Button */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handleStartScan}
            disabled={!isInitialized || isScanning}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Camera className="w-5 h-5" />
            {isScanning ? 'Scanning...' : 'Start Analysis'}
          </button>
          <p className="text-center text-xs text-gray-500 mt-3">
            Make sure your face is well-lit and fully visible
          </p>
        </div>
      </div>
    </div>
  );
}
