'use client';

import { useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import { useAppStore } from '@/lib/store';
import { aggregateLandmarks } from '@/lib/aggregateLandmarks';
import { calculateTrueMetrics } from '@/lib/fuseMultiAngleData';
import { Scan } from 'lucide-react';

type CaptureStep = 'idle' | 'front' | 'rightProfile' | 'leftProfile' | 'processing';

export default function Scanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captureStep, setCaptureStep] = useState<CaptureStep>('idle');
  const [countdown, setCountdown] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const drawingUtilsRef = useRef<DrawingUtils | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const collectedLandmarksRef = useRef<{ landmarks: any[]; timestamp: number }[]>([]);
  const sessionDataRef = useRef<{
    front: { landmarks: any[]; videoDimensions: { width: number; height: number } } | null;
    rightProfile: { landmarks: any[]; videoDimensions: { width: number; height: number } } | null;
    leftProfile: { landmarks: any[]; videoDimensions: { width: number; height: number } } | null;
  }>({
    front: null,
    rightProfile: null,
    leftProfile: null,
  });

  const stepStateRef = useRef<{
    countdownStartTime: number | null;
    captureStartTime: number | null;
    hasCaptured: boolean;
    waitingForFace: boolean;
  }>({
    countdownStartTime: null,
    captureStartTime: null,
    hasCaptured: false,
    waitingForFace: true,
  });

  const { isScanning, setScanning, setResults, setScanComplete, setSessionData } = useAppStore();

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
    if (!isInitialized || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const faceLandmarker = faceLandmarkerRef.current;
    const drawingUtils = drawingUtilsRef.current;

    if (!ctx || !faceLandmarker || !drawingUtils) return;

    const COUNTDOWN_DURATION = 3000;
    const CAPTURE_DURATION = 2000;
    let lastSampleTime = 0;

    function processFrame() {
      if (!video || video.readyState !== video.HAVE_ENOUGH_DATA || !ctx || !faceLandmarker || !drawingUtils) {
        animationFrameRef.current = requestAnimationFrame(processFrame);
        return;
      }

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const currentTime = performance.now();
      const startTimeInMs = performance.now();

      if (video.currentTime !== undefined) {
        const results = faceLandmarker.detectForVideo(video, startTimeInMs);
        const hasFace = results.faceLandmarks && results.faceLandmarks.length > 0;

        if (hasFace) {
          const landmarks = results.faceLandmarks![0];
          
          drawingUtils.drawLandmarks(landmarks, {
            radius: 1,
            color: '#00E5FF',
          });
          drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, {
            color: '#00E5FF',
            lineWidth: 0.5,
          });

          if (captureStep !== 'idle' && captureStep !== 'processing') {
            const state = stepStateRef.current;

            if (state.waitingForFace) {
              state.waitingForFace = false;
              state.countdownStartTime = currentTime;
              setIsCapturing(true);
            }

            if (state.countdownStartTime !== null && !state.hasCaptured) {
              const countdownElapsed = currentTime - state.countdownStartTime;
              const remainingCountdown = Math.max(0, COUNTDOWN_DURATION - countdownElapsed);
              const countdownSeconds = Math.ceil(remainingCountdown / 1000);
              setCountdown(countdownSeconds);

              if (remainingCountdown <= 0) {
                if (state.captureStartTime === null) {
                  state.captureStartTime = currentTime;
                  setCountdown(0);
                  collectedLandmarksRef.current = [];
                  lastSampleTime = currentTime;
                }

                const captureElapsed = currentTime - state.captureStartTime!;

                if (captureElapsed < CAPTURE_DURATION) {
                  if (currentTime - lastSampleTime >= 100) {
                    collectedLandmarksRef.current.push({
                      landmarks: landmarks.map((l: any) => ({ x: l.x, y: l.y, z: l.z || 0 })),
                      timestamp: currentTime,
                    });
                    lastSampleTime = currentTime;
                  }
                } else if (!state.hasCaptured) {
                  state.hasCaptured = true;
                  
                  if (collectedLandmarksRef.current.length > 0) {
                    const aggregatedLandmarks = aggregateLandmarks(
                      collectedLandmarksRef.current.map(s => s.landmarks)
                    );
                    
                    const videoDimensions = {
                      width: video.videoWidth,
                      height: video.videoHeight,
                    };

                    const landmarkData = {
                      landmarks: aggregatedLandmarks.map(l => ({
                        x: l.x,
                        y: l.y,
                        z: l.z || 0,
                        visibility: 1.0,
                      })),
                      videoDimensions,
                    };

                    if (captureStep === 'front') {
                      sessionDataRef.current.front = landmarkData;
                      setCaptureStep('rightProfile');
                      resetStepState();
                    } else if (captureStep === 'rightProfile') {
                      sessionDataRef.current.rightProfile = landmarkData;
                      setCaptureStep('leftProfile');
                      resetStepState();
                    } else if (captureStep === 'leftProfile') {
                      sessionDataRef.current.leftProfile = landmarkData;
                      setCaptureStep('processing');
                      setIsCapturing(false);
                      
                      setTimeout(() => {
                        try {
                          const sessionData = {
                            front: sessionDataRef.current.front!,
                            rightProfile: sessionDataRef.current.rightProfile!,
                            leftProfile: sessionDataRef.current.leftProfile!,
                          };

                          setSessionData(sessionData);
                          
                          const { fusedLandmarks, metrics, baseline, pixelToMm } = calculateTrueMetrics(sessionData);
                          
                          setResults({
                            landmarks: fusedLandmarks,
                            metrics: metrics as any,
                            baseline,
                            videoDimensions: sessionData.front.videoDimensions,
                          });
                          
                          setTimeout(() => {
                            setScanComplete(true);
                            setScanning(false);
                            setCaptureStep('idle');
                            setCountdown(0);
                            setIsCapturing(false);
                            collectedLandmarksRef.current = [];
                            sessionDataRef.current = {
                              front: null,
                              rightProfile: null,
                              leftProfile: null,
                            };
                            resetStepState();
                          }, 100);
                        } catch (err: any) {
                          console.error('Processing error:', err);
                          setError(`Failed to process scan: ${err?.message || 'Unknown error'}`);
                          setScanning(false);
                          setCaptureStep('idle');
                          setCountdown(0);
                          setIsCapturing(false);
                          resetStepState();
                        }
                      }, 100);
                    }
                  } else {
                    resetStepState();
                    setError('No landmarks collected. Please try again.');
                    setTimeout(() => setError(null), 2000);
                  }
                }
              }
            }
          }
        } else if (captureStep !== 'idle' && captureStep !== 'processing') {
          const state = stepStateRef.current;
          if (!state.waitingForFace && state.countdownStartTime !== null) {
            state.waitingForFace = true;
            state.countdownStartTime = null;
            state.captureStartTime = null;
            setIsCapturing(false);
          }
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
  }, [captureStep, isInitialized, setResults, setScanComplete, setScanning, setSessionData]);

  const resetStepState = () => {
    stepStateRef.current = {
      countdownStartTime: null,
      captureStartTime: null,
      hasCaptured: false,
      waitingForFace: true,
    };
    setIsCapturing(false);
    setCountdown(0);
    collectedLandmarksRef.current = [];
  };

  const handleStartScan = () => {
    if (!isInitialized) return;
    setScanning(true);
    setScanComplete(false);
    setCaptureStep('front');
    setCountdown(0);
    setIsCapturing(false);
    setError(null);
    collectedLandmarksRef.current = [];
    sessionDataRef.current = {
      front: null,
      rightProfile: null,
      leftProfile: null,
    };
    resetStepState();
  };

  const getStepInstructions = () => {
    switch (captureStep) {
      case 'front':
        return 'Face front';
      case 'rightProfile':
        return 'Turn 90° right';
      case 'leftProfile':
        return 'Turn 90° left';
      case 'processing':
        return 'Processing...';
      default:
        return '';
    }
  };

  if (error) {
    return (
      <div className="glass rounded-lg p-8 text-center">
        <p className="text-accent text-glow">{error}</p>
        <button
          onClick={() => {
            setError(null);
            setCaptureStep('idle');
          }}
          className="mt-4 glass-strong px-4 py-2 rounded border border-primary/50 hover:bg-primary/10"
        >
          Try Again
        </button>
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
          style={{ minHeight: '500px' }}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
        
        {!isScanning && isInitialized && (
          <div className="absolute top-4 right-4 z-30">
            <button
              onClick={handleStartScan}
              className="glass-strong px-4 py-3 rounded-lg border-2 border-primary glow-primary hover:bg-primary/10 transition-all duration-300 flex items-center gap-2 text-sm font-semibold text-glow"
            >
              <Scan className="w-4 h-4" />
              START
            </button>
          </div>
        )}

        {isScanning && captureStep !== 'idle' && captureStep !== 'processing' && (
          <div className="absolute top-4 right-4 z-30 pointer-events-none">
            <div className="glass px-3 py-2 rounded border border-primary/50 backdrop-blur-md">
              <p className="text-xs text-primary text-glow font-mono">
                {getStepInstructions()}
              </p>
            </div>
          </div>
        )}

        {isScanning && isCapturing && captureStep !== 'processing' && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <div className="text-center">
              {countdown > 0 ? (
                <div className="text-7xl font-bold text-primary text-glow font-mono drop-shadow-2xl">
                  {countdown}
                </div>
              ) : (
                <div className="text-2xl font-semibold text-primary text-glow font-mono drop-shadow-lg">
                  CAPTURING
                </div>
              )}
            </div>
          </div>
        )}

        {captureStep === 'processing' && (
          <div className="absolute top-4 right-4 z-30 pointer-events-none">
            <div className="glass px-3 py-2 rounded border border-primary/50 backdrop-blur-md">
              <p className="text-xs text-primary text-glow animate-pulse-glow font-mono">
                PROCESSING DATA...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
