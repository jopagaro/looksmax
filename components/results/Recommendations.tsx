'use client';

import { FacialMetrics } from '@/lib/calculations';
import { motion } from 'framer-motion';
import { ExternalLink, Sparkles } from 'lucide-react';

interface Product {
  name: string;
  description: string;
  price: string;
  link: string;
  reason: string;
}

interface RecommendationsProps {
  metrics: FacialMetrics;
}

export default function Recommendations({ metrics }: RecommendationsProps) {
  const products: Product[] = [];

  // Jawline products
  if (metrics.jawlineDefinition < 75) {
    products.push({
      name: 'Jawzrsize Jaw Exerciser',
      description: 'Strengthen jaw muscles for better definition',
      price: '$29.99',
      link: 'https://amzn.to/jawzrsize',
      reason: `Jawline score: ${Math.round(metrics.jawlineDefinition)}/100`,
    });
    products.push({
      name: 'Jade Gua Sha Tool',
      description: 'Facial massage for lymphatic drainage and contouring',
      price: '$14.99',
      link: 'https://amzn.to/guasha',
      reason: 'Enhance facial structure',
    });
  }

  // Skin — always beneficial
  products.push({
    name: 'Retinol Serum',
    description: 'Clinical-grade skin refinement and texture improvement',
    price: '$24.99',
    link: 'https://amzn.to/retinol',
    reason: 'Skin quality boost',
  });

  // Eye area
  if (metrics.canthalTilt < 70) {
    products.push({
      name: 'Caffeine Eye Serum',
      description: 'Reduce puffiness and dark circles',
      price: '$15.99',
      link: 'https://amzn.to/eye-serum',
      reason: `Eye area score: ${Math.round(metrics.canthalTilt)}/100`,
    });
  }

  // Universal products
  products.push({
    name: 'Professional Teeth Whitening Strips',
    description: 'Dentist-level whitening for a brighter smile',
    price: '$39.99',
    link: 'https://amzn.to/whitening',
    reason: 'Universal enhancement',
  });

  products.push({
    name: 'Vitamin C Serum',
    description: 'Brightening and anti-aging protection',
    price: '$19.99',
    link: 'https://amzn.to/vitamin-c',
    reason: 'Preventative care',
  });

  // Limit to top 4 recommendations
  const topProducts = products.slice(0, 4);

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-5">
        <Sparkles className="w-5 h-5 text-pop" strokeWidth={2.5} />
        <h3 className="font-display text-2xl uppercase">
          The <span className="text-pop">Gear</span>
        </h3>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {topProducts.map((product, index) => (
          <motion.div
            key={product.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="border-[3px] border-ink bg-white shadow-brutal-sm p-5 flex flex-col"
          >
            <h4 className="font-display text-sm uppercase mb-1.5">{product.name}</h4>
            <p className="text-sm font-medium text-ink-soft mb-3">{product.description}</p>
            <span className="chip-brutal !shadow-none self-start !bg-pop !text-white !border-ink mb-4">
              {product.reason}
            </span>

            <div className="flex items-center justify-between mt-auto pt-4 border-t-2 border-ink/15">
              <span className="font-display text-lg">{product.price}</span>
              <a
                href={product.link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-brutal bg-ink text-cream text-xs px-4 py-2.5"
              >
                Get It
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-[11px] font-bold uppercase tracking-wide text-ink-mute text-center mt-6">
        * We earn a commission on qualifying purchases — costs you nothing extra
      </p>
    </div>
  );
}
