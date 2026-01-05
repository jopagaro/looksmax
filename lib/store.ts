import { create } from 'zustand';
import { FaceLandmarkerResult } from '@mediapipe/tasks-vision';
import { FacialMetrics, DemographicData } from './calculations';

interface AppState {
  isScanning: boolean;
  scanComplete: boolean;
  landmarks: any[] | null;
  metrics: FacialMetrics | null;
  demographic: DemographicData | null;
  setScanning: (scanning: boolean) => void;
  setScanComplete: (complete: boolean) => void;
  setResults: (result: {
    landmarks: any[];
    metrics: FacialMetrics;
    demographic: DemographicData;
  }) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isScanning: false,
  scanComplete: false,
  landmarks: null,
  metrics: null,
  demographic: null,
  setScanning: (scanning) => set({ isScanning: scanning }),
  setScanComplete: (complete) => set({ scanComplete: complete }),
  setResults: (result) =>
    set({
      landmarks: result.landmarks,
      metrics: result.metrics,
      demographic: result.demographic,
      scanComplete: true,
    }),
  reset: () =>
    set({
      isScanning: false,
      scanComplete: false,
      landmarks: null,
      metrics: null,
      demographic: null,
    }),
}));

