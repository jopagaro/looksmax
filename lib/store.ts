import { create } from 'zustand';
import { FacialMetrics, BaselineData } from './calculations';
import { SurveyResult } from './survey';

interface VideoDimensions {
  width: number;
  height: number;
}

export type Stage = 'scan' | 'results' | 'survey' | 'plan';

interface AppState {
  stage: Stage;
  isScanning: boolean;
  scanComplete: boolean;
  landmarks: any[] | null;
  metrics: FacialMetrics | null;
  baseline: BaselineData | null;
  videoDimensions: VideoDimensions | null;

  // Survey
  surveyAnswers: Record<string, number>; // questionId -> selected option index
  surveyResult: SurveyResult | null;

  setStage: (stage: Stage) => void;
  setScanning: (scanning: boolean) => void;
  setScanComplete: (complete: boolean) => void;
  setResults: (result: {
    landmarks: any[];
    metrics: FacialMetrics;
    baseline: BaselineData;
    videoDimensions: VideoDimensions;
  }) => void;
  answerQuestion: (questionId: string, optionIndex: number) => void;
  finishSurvey: (result: SurveyResult) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  stage: 'scan',
  isScanning: false,
  scanComplete: false,
  landmarks: null,
  metrics: null,
  baseline: null,
  videoDimensions: null,
  surveyAnswers: {},
  surveyResult: null,

  setStage: (stage) => set({ stage }),
  setScanning: (scanning) => set({ isScanning: scanning }),
  setScanComplete: (complete) => set({ scanComplete: complete }),
  setResults: (result) =>
    set({
      landmarks: result.landmarks,
      metrics: result.metrics,
      baseline: result.baseline,
      videoDimensions: result.videoDimensions,
      scanComplete: true,
      stage: 'results',
    }),
  answerQuestion: (questionId, optionIndex) =>
    set((s) => ({ surveyAnswers: { ...s.surveyAnswers, [questionId]: optionIndex } })),
  finishSurvey: (result) => set({ surveyResult: result, stage: 'plan' }),
  reset: () =>
    set({
      stage: 'scan',
      isScanning: false,
      scanComplete: false,
      landmarks: null,
      metrics: null,
      baseline: null,
      videoDimensions: null,
      surveyAnswers: {},
      surveyResult: null,
    }),
}));
