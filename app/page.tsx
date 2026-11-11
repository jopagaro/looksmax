'use client';

import Scanner from '@/components/scanner/Scanner';
import Results from '@/components/results/Results';
import Survey from '@/components/survey/Survey';
import Plan from '@/components/plan/Plan';
import { useAppStore } from '@/lib/store';

export default function Home() {
  const { stage, reset } = useAppStore();

  return (
    <main className="min-h-screen bg-cream">
      {/* Header */}
      <header className="border-b-[3px] border-ink bg-cream sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="font-display text-xl tracking-tight">
              LOOKS<span className="text-pop">MAX</span>★
            </h1>
            <div className="flex items-center gap-3">
              {stage !== 'scan' && (
                <button
                  onClick={reset}
                  className="btn-brutal bg-white text-ink text-xs px-4 py-2"
                >
                  New Scan
                </button>
              )}
              <button
                className="btn-brutal bg-ink text-cream text-xs px-4 py-2"
                title="Coming soon"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {stage === 'scan' && (
          <div className="space-y-10">
            {/* Introduction */}
            <div className="max-w-2xl">
              <h2 className="font-display text-5xl sm:text-7xl uppercase leading-[0.95] tracking-tight mb-6">
                Your face.
                <br />
                <span className="text-outline">Rated.</span>{' '}
                <span className="text-pop">Fixed.</span>
              </h2>
              <p className="text-lg font-medium leading-relaxed max-w-xl">
                478-point scan. Brutally honest scores. Then a{' '}
                <b className="bg-ink text-cream px-1.5 py-0.5">68-question</b> deep-dive
                finds exactly what&apos;s dragging you down — and how to fix it.
              </p>
            </div>

            {/* Scanner */}
            <Scanner />
          </div>
        )}
        {stage === 'results' && <Results />}
        {stage === 'survey' && <Survey />}
        {stage === 'plan' && <Plan />}
      </div>

      {/* Footer */}
      <footer className="border-t-[3px] border-ink mt-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-[11px] font-bold uppercase tracking-wider text-center">
            LOOKSMAX ★ All processing local — nothing uploaded, ever ★ Not medical advice
          </p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-center text-ink-mute mt-2">
            © {new Date().getFullYear()} Convivium LLC™ — All rights reserved
          </p>
        </div>
      </footer>
    </main>
  );
}
