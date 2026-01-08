'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Zap } from 'lucide-react';

interface ProductCardProps {
  title: string;
  description: string;
  reason: string;
  affiliateLink: string;
  delay?: number;
}

export default function ProductCard({
  title,
  description,
  reason,
  affiliateLink,
  delay = 0,
}: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: delay / 1000 }}
      className="glass-strong rounded-lg p-6 border-2 border-accent/50 glow-accent hover:border-accent transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-accent text-glow mb-2 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            {title}
          </h3>
          <p className="text-sm text-primary/70 mb-3">{description}</p>
          <div className="glass rounded px-3 py-1 inline-block border border-primary/30">
            <span className="text-xs text-primary/60 font-mono">{reason}</span>
          </div>
        </div>
      </div>
      <a
        href={affiliateLink}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full glass rounded-lg px-6 py-3 border-2 border-accent hover:bg-accent/10 transition-all duration-300 flex items-center justify-center gap-2 font-semibold text-accent text-glow"
      >
        EXECUTE PROTOCOL
        <ExternalLink className="w-4 h-4" />
      </a>
    </motion.div>
  );
}


