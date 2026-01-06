import { create } from 'zustand';
import { FaceLandmarkerResult } from '@mediapipe/tasks-vision';
import { FacialMetrics, BaselineData } from './calculations';

interface VideoDimensions {
  width: number;
  height: number;
}

interface AppState {
  isScanning: boolean;
  scanComplete: boolean;
  landmarks: any[] | null;
  metrics: FacialMetrics | null;
  baseline: BaselineData | null;
  videoDimensions: VideoDimensions | null;
  setScanning: (scanning: boolean) => void;
  setScanComplete: (complete: boolean) => void;
  setResults: (result: {
    landmarks: any[];
    metrics: FacialMetrics;
    baseline: BaselineData;
    videoDimensions: VideoDimensions;
  }) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isScanning: false,
  scanComplete: false,
  landmarks: null,
  metrics: null,
  baseline: null,
  videoDimensions: null,
  setScanning: (scanning) => set({ isScanning: scanning }),
  setScanComplete: (complete) => set({ scanComplete: complete }),
  setResults: (result) =>
    set({
      landmarks: result.landmarks,
      metrics: result.metrics,
      baseline: result.baseline,
      videoDimensions: result.videoDimensions,
      scanComplete: true,
    }),
  reset: () =>
    set({
      isScanning: false,
      scanComplete: false,
      landmarks: null,
      metrics: null,
      baseline: null,
      videoDimensions: null,
    }),
}));
