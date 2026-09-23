import React, { useState } from 'react';
import type { SecurityScoreTrendPoint } from '../types/security.types';
import { ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SecurityTrendChartProps {
  trend?: SecurityScoreTrendPoint[];
  currentScore?: number;
}

export const SecurityTrendChart: React.FC<SecurityTrendChartProps> = ({
  trend = [],
  currentScore = 85,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const defaultPoints: SecurityScoreTrendPoint[] = [
    { label: 'May', score: 62 },
    { label: 'Jun', score: 70 },
    { label: 'Jul', score: 75 },
    { label: 'Aug', score: 81 },
    { label: 'Sep (Today)', score: currentScore },
  ];

  const points = trend && trend.length >= 2 ? trend : defaultPoints;

  const svgWidth = 480;
  const svgHeight = 160;
  const paddingX = 25;
  const paddingTop = 25;
  const paddingBottom = 25;
  const chartHeight = svgHeight - paddingTop - paddingBottom;
  const chartWidth = svgWidth - paddingX * 2;

  // Compute (X, Y) SVG coordinates for each real trend point
  const coords = points.map((pt, i) => {
    const x = paddingX + (i / (points.length - 1)) * chartWidth;
    // Score mapped from 0-100 to SVG height
    const normalizedScore = Math.max(0, Math.min(100, pt.score));
    const y = paddingTop + (1 - normalizedScore / 100) * chartHeight;
    return { x, y, pt, i };
  });

  // Smooth SVG curve generator
  const createSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? i : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const curvePath = createSmoothPath(coords);
  const areaPath = `${curvePath} L ${coords[coords.length - 1].x} ${svgHeight} L ${coords[0].x} ${svgHeight} Z`;

  // Active point for orb (defaults to latest score or hovered point)
  const activeIndex = hoverIndex !== null ? hoverIndex : coords.length - 1;
  const activeCoord = coords[activeIndex] || coords[coords.length - 1];

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const scaledX = (mouseX / rect.width) * svgWidth;

    // Find closest index
    let closestIdx = 0;
    let minDistance = Infinity;

    coords.forEach((c, idx) => {
      const dist = Math.abs(c.x - scaledX);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = idx;
      }
    });

    setHoverIndex(closestIdx);
  };

  return (
    <div className="w-full flex flex-col h-full select-none justify-between">
      {/* Headline Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span>Security Score Optimization</span>
          <ArrowUpRight className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-3 mt-1">
          <span className="text-5xl font-extrabold text-white tracking-tight font-sans">
            {activeCoord.pt.score}%
          </span>
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full flex items-center gap-1">
            <span>{activeCoord.pt.label} score</span>
          </span>
        </div>
      </div>

      {/* Dynamic Cursor-Interactive SVG Chart */}
      <div className="relative w-full h-[160px] bg-[#0A0C10] rounded-2xl border border-slate-800/80 p-1 overflow-hidden shadow-inner mt-4">
        <div className="absolute inset-0 bg-radial from-emerald-500/10 via-transparent to-transparent pointer-events-none opacity-60" />

        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full overflow-visible cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="orbGlowFilter" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <linearGradient id="neonArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34D399" stopOpacity="0.25" />
              <stop offset="60%" stopColor="#059669" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#0F1115" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="neonLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#6EE7B7" />
            </linearGradient>

            <radialGradient id="orbGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#A7F3D0" />
              <stop offset="100%" stopColor="#059669" />
            </radialGradient>
          </defs>

          {/* Area Fill */}
          <path d={areaPath} fill="url(#neonArea)" />

          {/* Glowing Curved Neon Line */}
          <path
            d={curvePath}
            fill="none"
            stroke="url(#neonLine)"
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#neonGlow)"
          />

          {/* Grid vertical tick lines */}
          {coords.map((c) => (
            <g key={c.i}>
              <line
                x1={c.x}
                y1={paddingTop}
                x2={c.x}
                y2={svgHeight - 15}
                stroke="#1E293B"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity={c.i === activeIndex ? 0.9 : 0.3}
              />
              <text
                x={c.x}
                y={svgHeight - 4}
                textAnchor="middle"
                fill={c.i === activeIndex ? '#34D399' : '#64748B'}
                fontSize="10"
                fontFamily="monospace"
                fontWeight={c.i === activeIndex ? 'bold' : 'normal'}
              >
                {c.pt.label}
              </text>
            </g>
          ))}

          {/* Interactive Cursor Vertical Guideline */}
          {hoverIndex !== null && (
            <line
              x1={activeCoord.x}
              y1={0}
              x2={activeCoord.x}
              y2={svgHeight}
              stroke="#10B981"
              strokeWidth="1.5"
              strokeDasharray="2 2"
              opacity="0.75"
            />
          )}

          {/* Dynamic 3D Orb Node reacting to cursor movement */}
          <circle
            cx={activeCoord.x}
            cy={activeCoord.y}
            r="8"
            fill="url(#orbGrad)"
            filter="url(#orbGlowFilter)"
            className="transition-all duration-150 ease-out"
          />
          <circle
            cx={activeCoord.x}
            cy={activeCoord.y}
            r="15"
            fill="none"
            stroke="#34D399"
            strokeWidth="1.5"
            opacity="0.5"
            className="animate-ping"
          />
        </svg>

        {/* Floating Tooltip Box on Cursor Hover */}
        <AnimatePresence>
          {hoverIndex !== null && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute top-2 right-3 bg-[#161B26]/90 backdrop-blur-md border border-emerald-500/40 px-3 py-1.5 rounded-lg shadow-xl pointer-events-none"
            >
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                {activeCoord.pt.label}
              </div>
              <div className="text-sm font-bold text-emerald-400">
                Score: {activeCoord.pt.score}%
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Subtitle Footer */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span>Continuous Zero-Knowledge Cryptographic Telemetry</span>
        <span className="font-mono text-emerald-400 font-semibold text-[11px]">
          Hover timeline to inspect
        </span>
      </div>
    </div>
  );
};
