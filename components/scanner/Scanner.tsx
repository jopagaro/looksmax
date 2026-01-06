'use client';

import { useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import { useAppStore } from '@/lib/store';
import { analyzeFace } from '@/lib/calculations';
import { Scan } from 'lucide-react';

export default function Scanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const drawingUtilsRef = useRef<DrawingUtils | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const { isScanning, setScanning, setResults, setScanComplete } = useAppStore();

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
        setError('Failed to initialize MediaPipe');
        console.error(err);
      }
    }

    initializeMediaPipe();
  }, []);

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
          video: { width: 1280, height: 720 },
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

  useEffect(() => {
    if (!isScanning || !isInitialized || !videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const faceLandmarker = faceLandmarkerRef.current;
    const drawingUtils = drawingUtilsRef.current;

    if (!ctx || !faceLandmarker || !drawingUtils) return;

    let lastVideoTime = -1;
    let scanStartTime: number | null = null;
    let hasProcessedResults = false;
    const SCAN_DURATION = 5000;

    function processFrame() {
      if (!video || video.readyState !== video.HAVE_ENOUGH_DATA || !ctx || !faceLandmarker || !drawingUtils) {
        animationFrameRef.current = requestAnimationFrame(processFrame);
        return;
      }

      if (hasProcessedResults) {
        return;
      }

      const currentTime = performance.now();
      if (scanStartTime === null) {
        scanStartTime = currentTime;
      }

      const elapsed = currentTime - scanStartTime;
      const progress = Math.min(100, Math.floor((elapsed / SCAN_DURATION) * 100));
      setScanProgress(progress);

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const startTimeInMs = performance.now();
      
      if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;

        const results = faceLandmarker.detectForVideo(video, startTimeInMs);

        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
          const landmarks = results.faceLandmarks[0];
          drawingUtils.drawLandmarks(landmarks, {
            radius: 1,
            color: '#00E5FF',
          });
          drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, {
            color: '#00E5FF',
            lineWidth: 0.5,
          });

          if (elapsed >= SCAN_DURATION && !hasProcessedResults) {
            hasProcessedResults = true;
            console.log('Processing scan results...', {
              elapsed,
              landmarksCount: landmarks.length,
              videoWidth: video.videoWidth,
              videoHeight: video.videoHeight,
            });
            
            try {
              const analysis = analyzeFace(results);
              console.log('Analysis complete:', {
                metricsCount: Object.keys(analysis.metrics).length,
                baselineType: analysis.baseline.baselineType,
              });
              
              setResults({
                landmarks: analysis.landmarks,
                metrics: analysis.metrics,
                baseline: analysis.baseline,
                videoDimensions: {
                  width: video.videoWidth,
                  height: video.videoHeight,
                },
              });
              
              setTimeout(() => {
                setScanComplete(true);
                setScanning(false);
                setScanProgress(0);
              }, 100);
              
              ctx.restore();
              return;
            } catch (err: any) {
              console.error('Analysis error:', err);
              console.error('Error details:', {
                message: err?.message,
                stack: err?.stack,
                results: results?.faceLandmarks?.length,
                landmarksLength: landmarks?.length,
              });
              setError(`Failed to process scan: ${err?.message || 'Unknown error'}`);
              setScanning(false);
              setScanProgress(0);
              hasProcessedResults = false;
              ctx.restore();
              return;
            }
          }
        } else if (elapsed >= SCAN_DURATION && !hasProcessedResults) {
          hasProcessedResults = true;
          setError('No face detected during scan. Please try again.');
          setScanning(false);
          setScanProgress(0);
          ctx.restore();
          return;
        }
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
  }, [isScanning, isInitialized, setResults, setScanComplete, setScanning]);

  const handleStartScan = () => {
    if (!isInitialized) return;
    setScanning(true);
    setScanComplete(false);
    setScanProgress(0);
  };

  if (error) {
    return (
      <div className="glass rounded-lg p-8 text-center">
        <p className="text-accent text-glow">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div className="relative w-full h-full rounded-lg overflow-hidden glass">
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
        {!isScanning && isInitialized && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <button
              onClick={handleStartScan}
              className="glass-strong px-8 py-4 rounded-lg border-2 border-primary glow-primary hover:bg-primary/10 transition-all duration-300 flex items-center gap-3 text-xl font-semibold text-glow"
            >
              <Scan className="w-6 h-6" />
              INITIATE SCAN
            </button>
          </div>
        )}
        {isScanning && (
          <div className="absolute top-4 left-4 glass px-4 py-2 rounded border border-primary/50">
            <p className="text-sm text-primary text-glow animate-pulse-glow">
              {scanProgress < 100 ? `SCANNING... ${scanProgress}%` : 'PROCESSING DATA...'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

