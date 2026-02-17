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
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">Recommended Products</h3>
      </div>
      <p className="text-sm text-gray-600 mb-6">
        Based on your analysis, here are personalized recommendations to enhance your features
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {topProducts.map((product, index) => (
          <motion.div
            key={product.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{product.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                <p className="text-xs text-primary-600 bg-primary-50 inline-block px-2 py-1 rounded">
                  {product.reason}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <span className="text-lg font-bold text-gray-900">{product.price}</span>
              <a
                href={product.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                View Product
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-xs text-gray-500 text-center mt-6">
        * We earn a commission on qualifying purchases at no extra cost to you
      </p>
    </div>
  );
}
