'use client';

import { cn } from '@/lib/utils';
import type { DiagnoseResult } from '@/types';

interface ScoreRadarProps {
  scores: DiagnoseResult['scores'];
  className?: string;
}

const dimensions = [
  { key: 'clarity' as const, label: '清晰度', angle: 0 },
  { key: 'completeness' as const, label: '完整性', angle: 90 },
  { key: 'effectiveness' as const, label: '有效性', angle: 180 },
  { key: 'structure' as const, label: '结构性', angle: 270 },
];

export function ScoreRadar({ scores, className }: ScoreRadarProps) {
  const size = 200;
  const center = size / 2;
  const maxRadius = 80;

  // Calculate polygon points
  const points = dimensions.map(({ key, angle }) => {
    const score = scores[key].score;
    const radius = (score / 10) * maxRadius;
    const radian = (angle - 90) * (Math.PI / 180);
    return {
      x: center + radius * Math.cos(radian),
      y: center + radius * Math.sin(radian),
    };
  });

  const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circles */}
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <circle
            key={scale}
            cx={center}
            cy={center}
            r={maxRadius * scale}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.1}
          />
        ))}
        
        {/* Axis lines */}
        {dimensions.map(({ angle }) => {
          const radian = (angle - 90) * (Math.PI / 180);
          const x2 = center + maxRadius * Math.cos(radian);
          const y2 = center + maxRadius * Math.sin(radian);
          return (
            <line
              key={angle}
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeOpacity={0.1}
            />
          );
        })}
        
        {/* Score polygon */}
        <polygon
          points={polygonPoints}
          fill="hsl(var(--primary))"
          fillOpacity={0.2}
          stroke="hsl(var(--primary))"
          strokeWidth={2}
        />
        
        {/* Score points */}
        {points.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={4}
            fill="hsl(var(--primary))"
          />
        ))}
        
        {/* Labels */}
        {dimensions.map(({ key, label, angle }) => {
          const radian = (angle - 90) * (Math.PI / 180);
          const labelRadius = maxRadius + 20;
          const x = center + labelRadius * Math.cos(radian);
          const y = center + labelRadius * Math.sin(radian);
          return (
            <text
              key={key}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-muted-foreground text-xs"
            >
              {label}
            </text>
          );
        })}
      </svg>
      
      {/* Score list */}
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        {dimensions.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{scores[key].score}/10</span>
          </div>
        ))}
      </div>
    </div>
  );
}
