'use client';

import { useAppStore } from '@/lib/store';
import ProductCard from './ProductCard';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';

interface Product {
  title: string;
  description: string;
  reason: string;
  affiliateLink: string;
  priority: number;
}

export default function AffiliateRecommendations() {
  const { metrics } = useAppStore();

  if (!metrics) {
    return null;
  }

  const products: Product[] = [];

  // Jawline Enhancement - Low jawline definition
  if (metrics.jawlineDefinition < 70) {
    products.push({
      title: 'Jawzrsize Athletic Jaw Exerciser',
      description:
        'Facial fitness ball designed to strengthen and tone jaw muscles. Resistance training for a more defined mandibular angle and stronger masseter muscles.',
      reason: `Jawline Score: ${Math.round(metrics.jawlineDefinition)}/100 - Needs Definition`,
      affiliateLink: 'https://amzn.to/jawzrsize',
      priority: 1,
    });
  }

  if (metrics.jawlineDefinition < 80) {
    products.push({
      title: 'Gua Sha Facial Sculpting Tool',
      description:
        'Jade stone facial massage tool for lymphatic drainage, reduced puffiness, and enhanced facial contours. Improves jawline definition through daily use.',
      reason: `Jawline Score: ${Math.round(metrics.jawlineDefinition)}/100`,
      affiliateLink: 'https://amzn.to/guasha-tool',
      priority: 3,
    });
  }

  // Skin Quality — universal recommendation
  products.push({
    title: 'Tretinoin Alternative Retinol Serum',
    description:
      'Advanced retinoid complex for skin texture refinement, collagen production, and pore minimization. Clinical-grade formula for visible results.',
    reason: 'Skin Quality Enhancement',
    affiliateLink: 'https://amzn.to/retinol-serum',
    priority: 2,
  });

  // Eye Area - Canthal tilt issues
  if (metrics.canthalTilt < 70) {
    products.push({
      title: 'Eye Lifting Serum with Peptides',
      description:
        'Specialized peptide complex targeting orbital area. Argireline and Matrixyl blend for eye contour enhancement and upper eyelid support.',
      reason: `Canthal Tilt Score: ${Math.round(metrics.canthalTilt)}/100 - Needs Support`,
      affiliateLink: 'https://amzn.to/eye-peptide-serum',
      priority: 2,
    });

    products.push({
      title: 'Under Eye Ice Roller',
      description:
        'Cryo-therapy tool for reducing puffiness and dark circles. Daily use improves eye area aesthetics and reduces fluid retention around orbital region.',
      reason: `Eye Area Score: ${Math.round(metrics.canthalTilt)}/100`,
      affiliateLink: 'https://amzn.to/ice-roller',
      priority: 5,
    });
  }

  // Facial Proportions - FWHR
  if (metrics.fwhr < 70) {
    products.push({
      title: 'Mewing Tongue Position Trainer',
      description:
        'Oral posture correction device to promote proper tongue positioning. Supports maxillary forward growth and improved facial proportions over time.',
      reason: `fWHR Score: ${Math.round(metrics.fwhr)}/100 - Proportion Enhancement`,
      affiliateLink: 'https://amzn.to/mewing-trainer',
      priority: 3,
    });
  }

  // Midface Enhancement
  if (metrics.midfaceRatio < 70) {
    products.push({
      title: 'Hyaluronic Acid Face Serum',
      description:
        'Deep hydration serum for midface volume and plumpness. Multi-molecular weight HA for surface and deep layer skin enhancement.',
      reason: `Midface Ratio: ${Math.round(metrics.midfaceRatio)}/100`,
      affiliateLink: 'https://amzn.to/hyaluronic-serum',
      priority: 4,
    });
  }

  // Universal Recommendations - Always beneficial
  products.push({
    title: 'Teeth Whitening Strips (Professional)',
    description:
      'Dentist-grade whitening strips with enamel-safe formula. Removes years of stains for a brighter smile - essential for facial aesthetics and first impressions.',
    reason: 'Universal Enhancement - Proven 2+ Shade Improvement',
    affiliateLink: 'https://amzn.to/crest-whitening',
    priority: 1,
  });

  products.push({
    title: 'Vitamin C + E Antioxidant Serum',
    description:
      'Potent antioxidant formula for skin brightening, collagen protection, and environmental damage prevention. Essential for long-term facial aesthetics.',
    reason: 'Preventative Care - Universal Skin Protection',
    affiliateLink: 'https://amzn.to/vitamin-c-serum',
    priority: 3,
  });

  products.push({
    title: 'Derma Roller Microneedling Kit',
    description:
      '0.5mm microneedle roller for collagen induction therapy. Enhances product absorption and promotes skin regeneration for overall facial improvement.',
    reason: 'Advanced Protocol - Collagen Stimulation',
    affiliateLink: 'https://amzn.to/dermaroller',
    priority: 4,
  });

  // For users with great scores
  if (metrics.jawlineDefinition >= 80 && metrics.canthalTilt >= 80) {
    products.push({
      title: 'Premium Sunscreen SPF 50+',
      description:
        'Advanced UV protection with anti-aging benefits. Preserves your optimal facial aesthetics and prevents photoaging. Essential maintenance protocol.',
      reason: 'Maintenance Mode - Preserve Excellence',
      affiliateLink: 'https://amzn.to/premium-sunscreen',
      priority: 1,
    });
  }

  // Sort by priority, then limit recommendations
  const recommendations = products
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 6);

  if (recommendations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass rounded-lg p-8 text-center border border-primary/30"
      >
        <Package className="w-12 h-12 mx-auto mb-4 text-primary/50" />
        <p className="text-primary/70">Exceptional facial metrics detected.</p>
        <p className="text-sm text-primary/50 mt-2">Focus on maintenance and protection.</p>
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
        LOOKSMAXXING PROTOCOLS
      </div>
      <p className="text-sm text-primary/60 mb-4 font-mono">
        Personalized product recommendations based on your biometric analysis
      </p>
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
      <div className="glass rounded-lg p-4 border border-primary/20 mt-6">
        <p className="text-xs text-primary/50 text-center">
          * Affiliate links support this free analysis tool. We earn commission on qualifying purchases.
        </p>
      </div>
    </motion.div>
  );
}


