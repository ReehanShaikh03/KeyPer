import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SecurityTrendChartProps {
  currentScore?: number;
  weakCount?: number;
  reusedCount?: number;
  breachedCount?: number;
}

export const SecurityTrendChart: React.FC<SecurityTrendChartProps> = ({
  currentScore = 60,
  weakCount = 0,
  reusedCount = 0,
  breachedCount = 0,
}) => {
  const [displayedScore, setDisplayedScore] = useState(0);

  useEffect(() => {
    let startTimestamp: number;
    const duration = 1500;
    
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayedScore(Math.floor(easeOutQuart * currentScore));
      
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    
    requestAnimationFrame(step);
  }, [currentScore]);

  // Gauge parameters for rounded blocks
  const NUM_SEGMENTS = 12;
  const cx = 180;
  const cy = 130;
  const r = 110;
  
  const blockWidth = 22;
  const blockHeight = 36;
  const rx = 6;
  
  const activeSegments = Math.round((currentScore / 100) * NUM_SEGMENTS);
  const hasRisks = weakCount > 0 || reusedCount > 0 || breachedCount > 0;

  return (
    <div className="w-full flex flex-col h-full select-none justify-between">
      {/* Header matching Hexagon graph style */}
      <div className="flex items-center mb-4">
        <h3 className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Vault Health Score</h3>
      </div>

      {/* Gauge Chart */}
      <div className="relative w-full flex justify-center mt-2">
        <svg viewBox="0 0 360 160" className="w-full max-w-[320px] drop-shadow-md overflow-visible">
          <defs>
            <linearGradient id="segmentActive" x1="0" y1="0" x2="360" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#A78BFA" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>

          <g>
            {Array.from({ length: NUM_SEGMENTS }).map((_, i) => {
              // Distribute 12 blocks from -82.5 degrees to +82.5 degrees
              // so they form a perfect arch ending just above the horizontal center
              const angle = -82.5 + i * 15;
              const isActive = i < activeSegments;
              
              return (
                <g key={i} transform={`rotate(${angle} ${cx} ${cy})`}>
                  <motion.rect
                    x={cx - blockWidth / 2}
                    y={cy - r - blockHeight / 2}
                    width={blockWidth}
                    height={blockHeight}
                    rx={rx}
                    fill={isActive ? 'url(#segmentActive)' : '#272B38'}
                    initial={{ opacity: 0, scale: 0.3 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: i * 0.04, type: 'spring', stiffness: 120, damping: 12 }}
                    style={{ originX: "50%", originY: "50%" }}
                  />
                </g>
              );
            })}
          </g>
        </svg>

        {/* Center Text */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center flex flex-col items-center">
          <div className="text-5xl font-extrabold text-white tracking-tight leading-none mb-1">
            {displayedScore}%
          </div>
          <div className="text-[10px] text-slate-400 font-medium whitespace-nowrap uppercase tracking-wider">
            Overall Security
          </div>
        </div>
      </div>

      {/* Details Section (Dynamic) */}
      <div className="mt-6 space-y-4">
        <div>
          <h4 className="text-xs font-semibold text-slate-200 mb-3">Detected Risks:</h4>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {!hasRisks && (
              <div className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                No vulnerabilities detected
              </div>
            )}
            {weakCount > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                {weakCount} Weak Password{weakCount > 1 ? 's' : ''}
              </div>
            )}
            {reusedCount > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                {reusedCount} Reused Password{reusedCount > 1 ? 's' : ''}
              </div>
            )}
            {breachedCount > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                {breachedCount} Breached Password{breachedCount > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
          <span>Analyzed locally from your encrypted vault data.</span>
        </div>
      </div>
    </div>
  );
};
