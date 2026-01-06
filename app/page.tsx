'use client';

import { useEffect } from 'react';
import Scanner from '@/components/scanner/Scanner';
import Visualizer from '@/components/visualizer/Visualizer';
import ResultsDashboard from '@/components/results/ResultsDashboard';
import AffiliateRecommendations from '@/components/affiliate/AffiliateRecommendations';
import BackgroundGrid from '@/components/ui/BackgroundGrid';
import DataNodes from '@/components/ui/DataNodes';
import { useAppStore } from '@/lib/store';
import { RotateCcw } from 'lucide-react';

export default function Home() {
  const { scanComplete, reset } = useAppStore();

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.add('dark');
    }
  }, []);

  return (
    <main className="min-h-screen bg-background text-primary relative overflow-hidden">
      <BackgroundGrid />
      <DataNodes />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-glow mb-2 font-mono">
            BIOMETRIC FACIAL ANALYSIS
          </h1>
          <p className="text-primary/60 text-sm font-mono">
            Advanced 3D Landmark Detection & Aesthetic Optimization System
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="lg:col-span-1">
            <div className="glass-strong rounded-lg p-4 mb-4 border border-primary/30">
              <h2 className="text-lg font-semibold text-glow mb-2 font-mono">
                LIVE SCAN MODULE
              </h2>
              <Scanner />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="glass-strong rounded-lg p-4 border border-primary/30">
              <h2 className="text-lg font-semibold text-glow mb-2 font-mono">
                3D HOLOGRAPHIC VISUALIZATION
              </h2>
              <div className="h-[400px]">
                <Visualizer />
              </div>
            </div>
          </div>
        </div>

        {scanComplete && (
          <div className="space-y-6">
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

        <footer className="mt-12 pt-8 border-t border-primary/20">
          <p className="text-xs text-primary/40 text-center font-mono">
            Privacy-First Architecture • On-Device Processing • Real-Time Analysis
          </p>
        </footer>
      </div>
    </main>
  );
}

