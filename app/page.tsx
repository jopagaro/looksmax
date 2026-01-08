'use client';

import { useEffect } from 'react';
import Scanner from '@/components/scanner/Scanner';
import CompactFaceMesh from '@/components/visualizer/CompactFaceMesh';
import ResultsDashboard from '@/components/results/ResultsDashboard';
import AffiliateRecommendations from '@/components/affiliate/AffiliateRecommendations';
import BackgroundGrid from '@/components/ui/BackgroundGrid';
import DataNodes from '@/components/ui/DataNodes';
import { useAppStore } from '@/lib/store';
import { RotateCcw } from 'lucide-react';

export default function Home() {
  const { scanComplete, reset, landmarks, videoDimensions } = useAppStore();

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.add('dark');
    }
  }, []);

  return (
    <main className="min-h-screen bg-background text-primary relative overflow-x-hidden">
      <BackgroundGrid />
      <DataNodes />
      
      <div className="relative z-10">
        <div className="container mx-auto px-4 pt-6 pb-4">
          <header className="mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-glow mb-1 font-mono">
              BIOMETRIC FACIAL ANALYSIS
            </h1>
            <p className="text-primary/60 text-xs md:text-sm font-mono">
              Advanced 3D Landmark Detection & Aesthetic Optimization System
            </p>
          </header>
        </div>

        <div className="w-full relative">
          <div className="relative w-full" style={{ minHeight: '70vh' }}>
            <div className="glass-strong rounded-lg overflow-hidden border border-primary/30 mx-4">
              <div className="relative w-full" style={{ aspectRatio: '16/9', minHeight: '500px' }}>
                <Scanner />
                {scanComplete && landmarks && videoDimensions && landmarks.length > 0 && (
                  <div className="absolute bottom-4 right-4 w-48 h-48 z-30 pointer-events-none">
                    <CompactFaceMesh landmarks={landmarks} videoDimensions={videoDimensions} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {scanComplete && (
            <div className="container mx-auto px-4 py-6 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-glow font-mono">
                  ANALYSIS RESULTS
                </h2>
                <button
                  onClick={reset}
                  className="glass rounded-lg px-4 py-2 border border-primary/50 hover:bg-primary/10 transition-all duration-300 flex items-center gap-2 text-sm font-mono"
                >
                  <RotateCcw className="w-4 h-4" />
                  RESET SCAN
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <ResultsDashboard />
                </div>
                <div>
                  <AffiliateRecommendations />
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="mt-12 pt-8 pb-6 border-t border-primary/20">
          <div className="container mx-auto px-4">
            <p className="text-xs text-primary/40 text-center font-mono">
              Privacy-First Architecture • On-Device Processing • Real-Time Analysis
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}

