'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { FaceLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import { useAppStore } from '@/lib/store';
import {
  analyzeFrame,
  medianMetrics,
  calculateBaseline,
  computePose,
  sampleTeethColor,
  sampleSkinQuality,
  FacialMetrics,
  SkinSample,
} from '@/lib/calculations';
import { Camera, Loader2, Upload, ScanLine, RefreshCw, Sparkles, Smile } from 'lucide-react';

type Mode = 'camera' | 'upload';
type CameraState = 'pending' | 'active' | 'denied' | 'unavailable';
type CapturePhase = 'idle' | 'neutral' | 'smile';

const DEMO_METRICS: FacialMetrics = {
  canthalTilt: 72,
  fwhr: 85,
  midfaceRatio: 61,
  jawlineDefinition: 78,
  symmetry: 90,
  gonialAngle: 74,
  eyeSpacing: 88,
  lowerThird: 69,
  mouthNose: 81,
  teethWhiteness: 58,
  skinEvenness: 76,
  skinRedness: 62,
  darkCircles: 55,
  actualMeasurements: {
    canthalTiltDegrees: 4.2,
    fwhrValue: 0.91,
    midfaceRatioValue: 2.35,
    jawlineAngle: 0.76,
    symmetryScore: 0.95,
    gonialAngleDegrees: 112.4,
    eyeSpacingValue: 0.448,
    lowerThirdValue: 1.78,
    mouthNoseValue: 1.62,
    teethYellowness: 32,
    chromaSpread: 16,
    rednessDelta: 19,
    underEyeRatio: 0.84,
  },
};

// Median-combine skin samples from multiple frames into final metrics.
function applySkinSamples(metrics: FacialMetrics, samples: SkinSample[]) {
  if (samples.length === 0) return;
  const mid = (vals: number[]) => {
    const s = [...vals].sort((a, b) => a - b);
    return s[Math.floor(s.length / 2)];
  };
  metrics.skinEvenness = mid(samples.map((s) => s.evenness.score));
  metrics.skinRedness = mid(samples.map((s) => s.redness.score));
  metrics.darkCircles = mid(samples.map((s) => s.darkCircles.score));
  metrics.actualMeasurements.chromaSpread = mid(samples.map((s) => s.evenness.chromaSpread));
  metrics.actualMeasurements.rednessDelta = mid(samples.map((s) => s.redness.delta));
  metrics.actualMeasurements.underEyeRatio = mid(samples.map((s) => s.darkCircles.ratio));
}

export default function Scanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const uploadCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<Mode>('camera');
  const [isInitialized, setIsInitialized] = useState(false);
  const [initFailed, setInitFailed] = useState(false);
  const [cameraState, setCameraState] = useState<CameraState>('pending');
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [capturePhase, setCapturePhase] = useState<CapturePhase>('idle');
  const [holdStillHint, setHoldStillHint] = useState(false);
  const [uploadPreview, setUploadPreview] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const teethCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const getTeethCanvas = () => {
    if (!teethCanvasRef.current) teethCanvasRef.current = document.createElement('canvas');
    return teethCanvasRef.current;
  };

  const { isScanning, setScanning, setResults, setScanComplete } = useAppStore();

  // Demo mode flag (?demo=1) — dev/testing only
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('demo=1')) {
      setIsDemo(true);
    }
  }, []);

  // ── Initialize MediaPipe ──────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function initializeMediaPipe() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/wasm'
        );
        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU',
          },
          outputFaceBlendshapes: false,
          runningMode: 'VIDEO',
          numFaces: 1,
        });
        if (cancelled) return;
        faceLandmarkerRef.current = faceLandmarker;
        setIsInitialized(true);
      } catch (err) {
        console.error(err);
        if (!cancelled) setInitFailed(true);
      }
    }
    initializeMediaPipe();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Start camera (camera mode only) ───────────────────────────────────────
  useEffect(() => {
    if (!isInitialized || mode !== 'camera' || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

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
        setCameraState('active');
      } catch (err) {
        console.error(err);
        setCameraState('denied');
      }
    }

    startCamera();

    return () => {
      if (video.srcObject) {
        (video.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
        video.srcObject = null;
      }
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isInitialized, mode]);

  // ── Live landmark overlay ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isInitialized || mode !== 'camera' || cameraState !== 'active') return;
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const faceLandmarker = faceLandmarkerRef.current;
    if (!ctx || !faceLandmarker) return;

    const drawingUtils = new DrawingUtils(ctx);
    let lastVideoTime = -1;

    function processFrame() {
      if (!video || video.readyState !== video.HAVE_ENOUGH_DATA || !ctx || !faceLandmarker) {
        animationFrameRef.current = requestAnimationFrame(processFrame);
        return;
      }

      if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const results = faceLandmarker.detectForVideo(video, performance.now());
        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
          const landmarks = results.faceLandmarks[0];
          drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, {
            color: 'rgba(255, 77, 0, 0.3)',
            lineWidth: 0.4,
          });
          drawingUtils.drawLandmarks(landmarks, {
            radius: 0.6,
            color: 'rgba(255, 77, 0, 0.8)',
            fillColor: 'rgba(255, 77, 0, 0.8)',
          });
        }
      }
      animationFrameRef.current = requestAnimationFrame(processFrame);
    }

    processFrame();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isInitialized, mode, cameraState]);

  // ── Live scan ─────────────────────────────────────────────────────────────
  const handleStartScan = async () => {
    if (!isInitialized || !videoRef.current || !faceLandmarkerRef.current) return;

    setScanning(true);
    setScanComplete(false);
    setError(null);

    for (let i = 3; i > 0; i--) {
      setCountdown(i);
      await new Promise((r) => setTimeout(r, 1000));
    }
    setCountdown(0);
    setIsProcessing(true);
    setCaptureProgress(0);

    try {
      const video = videoRef.current;
      const faceLandmarker = faceLandmarkerRef.current;
      const aspect = video.videoWidth / video.videoHeight || 16 / 9;

      // ── Phase 1: NEUTRAL — pose-gated capture ──────────────────────────────
      // Only frames with a frontal, level head are scored; the median of
      // accepted frames is the result. This is what makes repeat scans stable.
      const TARGET_FRAMES = 36;
      const MAX_ATTEMPTS = 150; // ~6s worst case
      const FRAME_INTERVAL_MS = 40;
      const collected: ReturnType<typeof analyzeFrame>[] = [];
      const skinSamples: SkinSample[] = [];
      let lastLandmarks: any[] = [];
      let recentRejects = 0;

      setCapturePhase('neutral');

      for (let i = 0; i < MAX_ATTEMPTS && collected.length < TARGET_FRAMES; i++) {
        await new Promise((r) => setTimeout(r, FRAME_INTERVAL_MS));
        if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) continue;

        const results = faceLandmarker.detectForVideo(video, performance.now());
        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
          const landmarks = results.faceLandmarks[0];
          const pose = computePose(landmarks, aspect);
          if (pose.frontal) {
            collected.push(analyzeFrame(landmarks, aspect));
            lastLandmarks = landmarks;
            recentRejects = Math.max(0, recentRejects - 1);
            // Sample skin pixels on every 4th good frame (it reads the canvas,
            // so keep it off the hot path of every frame)
            if (collected.length % 4 === 1) {
              const skin = sampleSkinQuality(
                video,
                landmarks,
                video.videoWidth,
                video.videoHeight,
                getTeethCanvas()
              );
              if (skin) skinSamples.push(skin);
            }
          } else {
            recentRejects++;
          }
        } else {
          recentRejects++;
        }
        setHoldStillHint(recentRejects >= 6);
        // Neutral phase fills 0→70% of the progress bar
        setCaptureProgress(Math.round((collected.length / TARGET_FRAMES) * 70));
      }
      setHoldStillHint(false);

      if (collected.length < 8) {
        throw new Error(
          'Could not get a stable frontal reading. Face the camera straight on, good lighting, hold still.'
        );
      }

      // ── Phase 2: SMILE — teeth color sampling ──────────────────────────────
      setCapturePhase('smile');
      const teethSamples: { score: number; yellowIndex: number }[] = [];
      const SMILE_ATTEMPTS = 75; // ~3s
      const smileStart = collected.length;

      for (let i = 0; i < SMILE_ATTEMPTS; i++) {
        await new Promise((r) => setTimeout(r, FRAME_INTERVAL_MS));
        if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) continue;

        const results = faceLandmarker.detectForVideo(video, performance.now());
        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
          const sample = sampleTeethColor(
            video,
            results.faceLandmarks[0],
            video.videoWidth,
            video.videoHeight,
            getTeethCanvas()
          );
          if (sample) teethSamples.push(sample);
        }
        setCaptureProgress(70 + Math.round(((i + 1) / SMILE_ATTEMPTS) * 30));
        // Got plenty of good samples — no need to hold the smile longer
        if (teethSamples.length >= 15) break;
      }
      void smileStart;

      const metrics = medianMetrics(collected);
      applySkinSamples(metrics, skinSamples);
      if (teethSamples.length >= 3) {
        const mid = Math.floor(teethSamples.length / 2);
        const byScore = [...teethSamples].sort((a, b) => a.score - b.score);
        metrics.teethWhiteness = byScore[mid].score;
        metrics.actualMeasurements.teethYellowness = byScore[mid].yellowIndex;
      }

      setResults({
        landmarks: lastLandmarks,
        metrics,
        baseline: calculateBaseline(lastLandmarks),
        videoDimensions: { width: video.videoWidth, height: video.videoHeight },
      });
      setScanComplete(true);
    } catch (err: any) {
      console.error('Scan error:', err);
      setError(err?.message || 'Scan failed. Please try again.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setScanning(false);
      setIsProcessing(false);
      setCaptureProgress(0);
      setCapturePhase('idle');
      setHoldStillHint(false);
    }
  };

  // ── Photo upload scan ─────────────────────────────────────────────────────
  const handleFileSelected = useCallback(
    async (file: File) => {
      const faceLandmarker = faceLandmarkerRef.current;
      if (!faceLandmarker) return;

      setError(null);
      setIsProcessing(true);
      setScanning(true);

      try {
        const url = URL.createObjectURL(file);
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Could not read that image file.'));
          img.src = url;
        });

        // Draw preview
        const canvas = uploadCanvasRef.current;
        if (canvas) {
          const maxW = 1280;
          const scale = Math.min(1, maxW / img.naturalWidth);
          canvas.width = img.naturalWidth * scale;
          canvas.height = img.naturalHeight * scale;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          }
          setUploadPreview(true);
        }

        // Detect in IMAGE mode
        await faceLandmarker.setOptions({ runningMode: 'IMAGE' });
        const results = faceLandmarker.detect(img);
        await faceLandmarker.setOptions({ runningMode: 'VIDEO' });
        URL.revokeObjectURL(url);

        if (!results.faceLandmarks || results.faceLandmarks.length === 0) {
          throw new Error('No face detected in that photo. Use a clear, front-facing, well-lit photo.');
        }

        const landmarks = results.faceLandmarks[0];
        const aspect = img.naturalWidth / img.naturalHeight;

        // Draw landmarks over the preview
        const ctx = uploadCanvasRef.current?.getContext('2d');
        if (ctx && uploadCanvasRef.current) {
          const du = new DrawingUtils(ctx);
          du.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, {
            color: 'rgba(255, 77, 0, 0.35)',
            lineWidth: 0.5,
          });
        }

        // Brief pause so the user sees the detection overlay
        await new Promise((r) => setTimeout(r, 900));

        // Skin quality from the photo's pixels
        const metrics = analyzeFrame(landmarks, aspect);
        const skin = sampleSkinQuality(
          img,
          landmarks,
          img.naturalWidth,
          img.naturalHeight,
          getTeethCanvas()
        );
        if (skin) applySkinSamples(metrics, [skin]);

        // Teeth color — works when the photo is a smile showing teeth
        const teeth = sampleTeethColor(
          img,
          landmarks,
          img.naturalWidth,
          img.naturalHeight,
          getTeethCanvas()
        );
        if (teeth) {
          metrics.teethWhiteness = teeth.score;
          metrics.actualMeasurements.teethYellowness = teeth.yellowIndex;
        }

        setResults({
          landmarks,
          metrics,
          baseline: calculateBaseline(landmarks),
          videoDimensions: { width: img.naturalWidth, height: img.naturalHeight },
        });
        setScanComplete(true);
      } catch (err: any) {
        console.error('Upload scan error:', err);
        setError(err?.message || 'Could not analyze that photo.');
        setUploadPreview(false);
      } finally {
        setScanning(false);
        setIsProcessing(false);
      }
    },
    [setResults, setScanComplete, setScanning]
  );

  // ── Demo scan (dev only, ?demo=1) ─────────────────────────────────────────
  const handleDemoScan = () => {
    setResults({
      landmarks: [],
      metrics: DEMO_METRICS,
      baseline: calculateBaseline([]),
      videoDimensions: { width: 1280, height: 720 },
    });
    setScanComplete(true);
  };

  const switchMode = (m: Mode) => {
    if (isScanning) return;
    setMode(m);
    setError(null);
    setUploadPreview(false);
  };

  const showCameraFallback = mode === 'camera' && (cameraState === 'denied' || initFailed);

  return (
    <div className="w-full max-w-3xl">
      <div className="card-brutal overflow-hidden">
        {/* Panel head with mode tabs */}
        <div className="flex items-stretch justify-between border-b-[3px] border-ink bg-white">
          <div className="flex items-center gap-2 px-4 font-display text-xs uppercase tracking-wide">
            <span className="text-pop">●</span> Live Scanner
          </div>
          <div className="flex">
            <button
              onClick={() => switchMode('camera')}
              className={`flex items-center gap-2 px-5 py-3 border-l-[3px] border-ink font-display text-xs uppercase transition-colors ${
                mode === 'camera' ? 'bg-ink text-cream' : 'bg-white text-ink hover:bg-cream'
              }`}
            >
              <Camera className="w-4 h-4" />
              Camera
            </button>
            <button
              onClick={() => switchMode('upload')}
              className={`flex items-center gap-2 px-5 py-3 border-l-[3px] border-ink font-display text-xs uppercase transition-colors ${
                mode === 'upload' ? 'bg-ink text-cream' : 'bg-white text-ink hover:bg-cream'
              }`}
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
          </div>
        </div>

        {/* Viewport */}
        <div className="relative aspect-video bg-ink">
          {mode === 'camera' ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none -scale-x-100"
              />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <canvas
                ref={uploadCanvasRef}
                className={`max-w-full max-h-full ${uploadPreview ? '' : 'hidden'}`}
              />
              {!uploadPreview && !isProcessing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="group flex flex-col items-center gap-4 px-12 py-10 border-[3px] border-dashed border-cream/50 hover:border-pop transition-colors"
                >
                  <Upload className="w-8 h-8 text-pop" />
                  <div className="text-center">
                    <p className="font-display text-cream uppercase text-sm mb-1">Drop in a selfie</p>
                    <p className="text-xs text-cream/60 font-medium">
                      Front-facing, well-lit, no tilt — smile with teeth for a teeth score
                    </p>
                  </div>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileSelected(f);
                  e.target.value = '';
                }}
              />
            </div>
          )}

          {/* Scan line while processing */}
          {isProcessing && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute left-0 right-0 h-[3px] bg-pop animate-scan-line" />
            </div>
          )}

          {/* Loading MediaPipe */}
          {!isInitialized && !initFailed && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink">
              <div className="text-center">
                <Loader2 className="w-7 h-7 mx-auto mb-3 animate-spin text-pop" />
                <p className="font-display text-xs uppercase tracking-widest text-cream">
                  Loading analysis engine…
                </p>
              </div>
            </div>
          )}

          {/* Camera denied / init failed → inline fallback */}
          {showCameraFallback && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink">
              <div className="text-center max-w-sm px-6">
                <Camera className="w-8 h-8 mx-auto mb-4 text-cream/50" />
                <p className="font-display text-cream uppercase text-sm mb-2">
                  {initFailed ? 'Engine failed to load' : 'Camera unavailable'}
                </p>
                <p className="text-sm text-cream/60 font-medium mb-6">
                  {initFailed
                    ? 'Check your connection and refresh the page.'
                    : 'Allow camera access in your browser, or analyze a photo instead.'}
                </p>
                {!initFailed && (
                  <button
                    onClick={() => switchMode('upload')}
                    className="btn-brutal bg-pop text-white text-sm px-6 py-3"
                  >
                    <Upload className="w-4 h-4" />
                    Upload a pic instead
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Face guide */}
          {mode === 'camera' && cameraState === 'active' && !isScanning && !error && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-56 h-72 sm:w-64 sm:h-80 border-[3px] border-dashed border-pop rounded-[50%]" />
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-pop text-white font-display text-[11px] uppercase tracking-wider px-4 py-1.5">
                Put your face here
              </div>
            </div>
          )}

          {/* Countdown */}
          {countdown > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink/70">
              <div className="font-display text-9xl text-cream tabular-nums">{countdown}</div>
            </div>
          )}

          {/* SMILE prompt — teeth phase */}
          {capturePhase === 'smile' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-pop text-white border-[3px] border-ink shadow-brutal px-8 py-5 text-center animate-slide-up">
                <Smile className="w-8 h-8 mx-auto mb-2" strokeWidth={2.5} />
                <p className="font-display text-2xl uppercase leading-none">Now smile</p>
                <p className="text-xs font-bold uppercase tracking-widest mt-1.5">
                  Show teeth — checking the whites
                </p>
              </div>
            </div>
          )}

          {/* Hold-still hint — frames being rejected for head pose */}
          {capturePhase === 'neutral' && holdStillHint && (
            <div className="absolute top-5 left-1/2 -translate-x-1/2 pointer-events-none">
              <div className="bg-ink text-cream border-[3px] border-pop font-display text-xs uppercase tracking-widest px-4 py-2">
                ⚠ Face straight · hold still
              </div>
            </div>
          )}

          {/* Processing HUD */}
          {isProcessing && (
            <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-ink via-ink/80 to-transparent">
              <div className="max-w-xs mx-auto text-center">
                <p className="font-display text-[11px] uppercase tracking-widest text-pop mb-2">
                  {mode === 'camera'
                    ? capturePhase === 'smile'
                      ? `Teeth check · ${captureProgress}%`
                      : `Measuring · ${captureProgress}%`
                    : 'Analyzing photo…'}
                </p>
                {mode === 'camera' && (
                  <div className="h-3 border-2 border-cream bg-ink">
                    <div
                      className="h-full bg-pop transition-all duration-100"
                      style={{ width: `${captureProgress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error toast */}
          {error && (
            <div className="absolute inset-x-0 top-0 p-4 flex justify-center">
              <div className="border-[3px] border-ink bg-pop text-white font-bold text-sm px-4 py-2.5 shadow-brutal-sm max-w-md text-center">
                {error}
              </div>
            </div>
          )}
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-4 p-4 border-t-[3px] border-ink bg-cream">
          {mode === 'camera' ? (
            <button
              onClick={handleStartScan}
              disabled={!isInitialized || isScanning || cameraState !== 'active'}
              className="btn-brutal bg-pop text-white text-base px-8 py-4"
            >
              <ScanLine className="w-5 h-5" />
              {isScanning ? 'Scanning…' : 'Scan Me'}
            </button>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={!isInitialized || isScanning}
              className="btn-brutal bg-pop text-white text-base px-8 py-4"
            >
              {isScanning ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : uploadPreview ? (
                <RefreshCw className="w-5 h-5" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
              {isScanning ? 'Analyzing…' : uploadPreview ? 'Try Another' : 'Choose Pic'}
            </button>
          )}

          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-mute">
            {mode === 'camera'
              ? 'Good lighting · face straight · smile when asked'
              : 'Analyzed on-device. Nothing uploaded. Ever.'}
          </p>

          {isDemo && (
            <button
              onClick={handleDemoScan}
              className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-pop hover:underline"
            >
              <Sparkles className="w-3 h-3" />
              demo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
