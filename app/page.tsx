'use client';

import { useState } from 'react';
import Scanner from '@/components/scanner/Scanner';
import Results from '@/components/results/Results';
import { useAppStore } from '@/lib/store';

export default function Home() {
  const { scanComplete, reset } = useAppStore();

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Facial Analysis</h1>
              <p className="text-xs text-gray-500">AI-Powered Aesthetic Assessment</p>
            </div>
            {scanComplete && (
              <button
                onClick={reset}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                New Scan
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!scanComplete ? (
          <div className="space-y-6">
            {/* Introduction */}
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Discover Your Facial Harmony
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Get instant analysis of your facial proportions and receive personalized
                recommendations to enhance your natural features.
              </p>
            </div>

            {/* Scanner */}
            <Scanner />
          </div>
        ) : (
          <Results />
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm text-gray-500">
            All processing happens locally in your browser. No data is stored or transmitted.
          </p>
        </div>
      </footer>
    </main>
  );
}
