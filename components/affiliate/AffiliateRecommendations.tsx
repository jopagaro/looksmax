'use client';

import { useAppStore } from '@/lib/store';
import ProductCard from './ProductCard';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';

export default function AffiliateRecommendations() {
  const { metrics } = useAppStore();

  if (!metrics) {
    return null;
  }

  const recommendations: Array<{
    title: string;
    description: string;
    reason: string;
    affiliateLink: string;
  }> = [];

  if (metrics.jawlineDefinition < 70) {
    recommendations.push({
      title: 'Jawline Contouring Kit',
      description:
        'Advanced mandibular enhancement protocol with precision applicators and bio-active compounds.',
      reason: `Jawline Score: ${Math.round(metrics.jawlineDefinition)}/100`,
      affiliateLink: 'https://example.com/jawline-kit',
    });
  }

  if (metrics.skinSmoothness < 50) {
    recommendations.push({
      title: 'Cryo-Recovery Mask',
      description:
        'Sub-zero thermal therapy system for dermal optimization and puffiness reduction.',
      reason: `Skin Puffiness: ${Math.round(100 - metrics.skinSmoothness)}%`,
      affiliateLink: 'https://example.com/cryo-mask',
    });
  }

  if (metrics.canthalTilt < 60) {
    recommendations.push({
      title: 'Orbital Vector Corrector',
      description:
        'Specialized canthal tilt optimization system with micro-adjustment technology.',
      reason: `Canthal Tilt Score: ${Math.round(metrics.canthalTilt)}/100`,
      affiliateLink: 'https://example.com/orbital-corrector',
    });
  }

  if (metrics.fwhr < 65) {
    recommendations.push({
      title: 'Facial Proportion Enhancer',
      description:
        'Comprehensive fWHR optimization protocol with measurement-guided application.',
      reason: `fWHR Score: ${Math.round(metrics.fwhr)}/100`,
      affiliateLink: 'https://example.com/fwhr-enhancer',
    });
  }

  if (recommendations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass rounded-lg p-8 text-center border border-primary/30"
      >
        <Package className="w-12 h-12 mx-auto mb-4 text-primary/50" />
        <p className="text-primary/70">No optimization protocols required.</p>
        <p className="text-sm text-primary/50 mt-2">Metrics within optimal range.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 text-xl font-bold text-glow mb-4">
        <Package className="w-6 h-6" />
        OPTIMIZATION PROTOCOLS
      </div>
      <div className="grid grid-cols-1 gap-4">
        {recommendations.map((rec, index) => (
          <ProductCard
            key={rec.title}
            title={rec.title}
            description={rec.description}
            reason={rec.reason}
            affiliateLink={rec.affiliateLink}
            delay={index * 150}
          />
        ))}
      </div>
    </motion.div>
  );
}

