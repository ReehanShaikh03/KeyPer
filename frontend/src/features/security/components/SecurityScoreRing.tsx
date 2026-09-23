import React from 'react';
import { motion } from 'framer-motion';

interface SecurityScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export const SecurityScoreRing: React.FC<SecurityScoreRingProps> = ({
  score,
  size = 180,
  strokeWidth = 14,
}) => {
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Determine color based on threshold (Red < 50, Amber 50-79, Green 80+)
  const getColor = (s: number) => {
    if (s < 50) return { stroke: '#F43F5E', bg: 'rgba(244, 63, 94, 0.1)', glow: 'rgba(244, 63, 94, 0.3)' };
    if (s < 80) return { stroke: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', glow: 'rgba(245, 158, 11, 0.3)' };
    return { stroke: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', glow: 'rgba(16, 185, 129, 0.3)' };
  };

  const { stroke, glow } = getColor(score);

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#262A36"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated score arc */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            filter: `drop-shadow(0px 0px 8px ${glow})`,
          }}
        />
      </svg>
      {/* Center score text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.span
          className="text-4xl font-extrabold tracking-tight"
          style={{ color: stroke }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {score}
        </motion.span>
        <span className="text-[11px] font-medium text-slate-400 mt-1 uppercase tracking-wider">
          Security score
        </span>
      </div>
    </div>
  );
};
