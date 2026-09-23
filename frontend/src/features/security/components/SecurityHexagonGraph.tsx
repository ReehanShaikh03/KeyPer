import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface HexagonMetric {
  key: string;
  label: string;
  score: number; // 0 - 100
  targetScore: number; // 0 - 100
  explanation?: string;
}

interface SecurityHexagonGraphProps {
  metrics?: HexagonMetric[];
}

export const SecurityHexagonGraph: React.FC<SecurityHexagonGraphProps> = ({ metrics }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const defaultMetrics: HexagonMetric[] = [
    { key: 'breach', label: 'BREACH FREE', score: 92, targetScore: 100, explanation: '% of passwords not found in known leak databases' },
    { key: 'strength', label: 'STRONG PASS', score: 86, targetScore: 90, explanation: '% of passwords with 12+ chars & complex symbols' },
    { key: 'uniqueness', label: 'UNIQUE PASS', score: 90, targetScore: 95, explanation: '% of credentials used only on a single website' },
    { key: 'encryption', label: 'ENCRYPTION', score: 100, targetScore: 100, explanation: 'AES-256-GCM Zero-Knowledge Vault Encryption' },
    { key: 'entropy', label: 'ENTROPY', score: 78, targetScore: 85, explanation: 'Average bits of randomness per password string' },
    { key: 'freshness', label: 'FRESHNESS', score: 84, targetScore: 90, explanation: 'Credentials updated within recommended security window' },
  ];

  const activeMetrics = metrics && metrics.length === 6 ? metrics : defaultMetrics;

  const width = 360;
  const height = 280;
  const cx = width / 2;
  const cy = height / 2 + 5;
  const radius = 90;

  // Calculate 6 vertices of hexagon at given radius
  const getHexagonPoints = (r: number) => {
    return Array.from({ length: 6 }).map((_, i) => {
      const angle = (Math.PI / 3) * i - Math.PI / 2; // Start from top
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      return { x, y, angle };
    });
  };

  const gridRings = [0.2, 0.4, 0.6, 0.8, 1.0].map((scale) => {
    const pts = getHexagonPoints(radius * scale);
    return pts.map((p) => `${p.x},${p.y}`).join(' ');
  });

  const outerPoints = getHexagonPoints(radius);

  // Polygon for current vault scores
  const scorePolyPoints = activeMetrics.map((m, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const r = (m.score / 100) * radius;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  // Polygon for benchmark target scores
  const targetPolyPoints = activeMetrics.map((m, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const r = (m.targetScore / 100) * radius;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full flex flex-col items-center justify-between h-full select-none relative">
      {/* Legend */}
      <div className="flex items-center gap-6 mb-1">
        <div className="flex items-center gap-2 bg-[#14171F] border border-slate-800 px-3 py-1 rounded-full text-xs font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-xs shadow-indigo-500/50 inline-block" />
          <span className="text-slate-200">Current Vault</span>
        </div>
        <span className="text-xs text-slate-600 font-mono">VS</span>
        <div className="flex items-center gap-2 bg-[#14171F] border border-slate-800 px-3 py-1 rounded-full text-xs font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400/50 inline-block" />
          <span className="text-slate-200">Target Standard</span>
        </div>
      </div>

      {/* Hexagonal Radar Graph */}
      <div className="relative w-full max-w-[360px] h-[280px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="blueRadarFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#4338CA" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="greenRadarFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.1" />
            </linearGradient>
            <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid Rings */}
          {gridRings.map((ptsStr, idx) => (
            <polygon
              key={idx}
              points={ptsStr}
              fill={idx === 4 ? '#12151E' : 'none'}
              stroke="#2A2F3D"
              strokeWidth={idx === 4 ? '1.5' : '1'}
              strokeDasharray={idx === 4 ? 'none' : '2 2'}
              opacity="0.8"
            />
          ))}

          {/* Radial Axis Lines */}
          {outerPoints.map((pt, idx) => (
            <line
              key={idx}
              x1={cx}
              y1={cy}
              x2={pt.x}
              y2={pt.y}
              stroke="#2A2F3D"
              strokeWidth="1"
            />
          ))}

          {/* Target Standard Polygon */}
          <motion.polygon
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            points={targetPolyPoints}
            fill="url(#greenRadarFill)"
            stroke="#10B981"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Current Vault Polygon */}
          <motion.polygon
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
            points={scorePolyPoints}
            fill="url(#blueRadarFill)"
            stroke="#6366F1"
            strokeWidth="2.5"
            strokeLinejoin="round"
            filter="url(#radarGlow)"
          />

          {/* Vertex Labels & Hover Touch Targets */}
          {outerPoints.map((pt, idx) => {
            const m = activeMetrics[idx];
            const labelDist = radius + 30;
            const lx = cx + labelDist * Math.cos(pt.angle);
            const ly = cy + labelDist * Math.sin(pt.angle);

            let textAnchor: 'start' | 'end' | 'middle' = 'middle';
            if (lx > cx + 15) textAnchor = 'start';
            else if (lx < cx - 15) textAnchor = 'end';

            const isHovered = hoveredIdx === idx;

            return (
              <g
                key={idx}
                transform={`translate(${lx}, ${ly})`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <text
                  x="0"
                  y="0"
                  textAnchor={textAnchor}
                  className={`font-bold font-mono text-[12px] transition-colors ${
                    isHovered ? 'fill-white' : 'fill-indigo-400'
                  }`}
                >
                  {m.score}{' '}
                  <tspan className="fill-slate-500 font-normal">/</tspan>{' '}
                  <tspan className="fill-emerald-400">{m.targetScore}</tspan>
                </text>
                <text
                  x="0"
                  y="13"
                  textAnchor={textAnchor}
                  className={`font-semibold font-sans text-[9px] tracking-wider transition-colors ${
                    isHovered ? 'fill-emerald-300' : 'fill-slate-400'
                  }`}
                >
                  {m.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Explanatory Tooltip when hovering radar vertices */}
      <AnimatePresence>
        {hoveredIdx !== null && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute bottom-1 bg-[#161B26] border border-indigo-500/40 px-3 py-1.5 rounded-lg text-center shadow-lg pointer-events-none max-w-[280px]"
          >
            <div className="text-xs font-bold text-indigo-300">
              {activeMetrics[hoveredIdx].label}
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              {activeMetrics[hoveredIdx].explanation || `${activeMetrics[hoveredIdx].score}% vs ${activeMetrics[hoveredIdx].targetScore}% target`}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
