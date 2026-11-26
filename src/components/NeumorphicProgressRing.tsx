import React from 'react';
import { NEUMORPHIC_CONFIG } from './neumorphic-config';

interface NeumorphicProgressRingProps {
  /** Value between 0 and 1 */
  value: number;
  size?: number; // px diameter
  label?: string;
  className?: string;
  /** Color of the progress arc */
  accentColor?: 'amber' | 'cyan';
}

/**
 * NeumorphicProgressRing — a soft extruded disc with an amber
 * arc tracing progress, and a small icon / number in the center.
 * Matches the 25% ring in the reference image.
 */
export function NeumorphicProgressRing({
  value,
  size = 140,
  label,
  className = '',
  accentColor = 'amber',
}: NeumorphicProgressRingProps) {
  const percent = Math.max(0, Math.min(1, value));
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent);

  const accent = accentColor === 'cyan' 
    ? NEUMORPHIC_CONFIG.accentCyan 
    : NEUMORPHIC_CONFIG.accent;

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background: NEUMORPHIC_CONFIG.surface,
        boxShadow: NEUMORPHIC_CONFIG.raised.lg,
      }}
    >
      <svg
        width={size}
        height={size}
        className="absolute inset-0 -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Faint inset track ring (optional — uses stroke as a groove) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={NEUMORPHIC_CONFIG.surfaceAlt}
          strokeWidth={stroke}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={accent}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 400ms ease-out' }}
        />
      </svg>
      <div className="relative z-10 flex flex-col items-center">
        <span
          className="text-2xl font-semibold"
          style={{ color: NEUMORPHIC_CONFIG.text }}
        >
          {Math.round(percent * 100)}%
        </span>
        {label && (
          <span
            className="text-[10px] tracking-widest uppercase mt-1"
            style={{ color: NEUMORPHIC_CONFIG.textMuted }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
