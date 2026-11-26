import React from 'react';
import { NEUMORPHIC_CONFIG } from './neumorphic-config';

interface NeumorphicSliderProps {
  value: number; // 0..1
  onChange: (value: number) => void;
  className?: string;
  showFill?: boolean;
  /** Color of the fill indicator */
  accentColor?: 'amber' | 'cyan';
}

/**
 * NeumorphicSlider — track is pressed-in, thumb is raised.
 * An optional amber fill shows progress to the thumb.
 */
export function NeumorphicSlider({
  value,
  onChange,
  className = '',
  showFill = true,
  accentColor = 'amber',
}: NeumorphicSliderProps) {
  const percent = Math.max(0, Math.min(1, value));

  const fillGradient = accentColor === 'cyan'
    ? `linear-gradient(90deg, ${NEUMORPHIC_CONFIG.accentCyan} 0%, #D4E89C 100%)`
    : `linear-gradient(90deg, ${NEUMORPHIC_CONFIG.accent} 0%, ${NEUMORPHIC_CONFIG.accentLight} 100%)`;

  const handlePointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    onChange(Math.max(0, Math.min(1, x / rect.width)));
  };

  return (
    <div
      onPointerDown={handlePointer}
      onPointerMove={(e) => e.buttons === 1 && handlePointer(e)}
      className={`relative w-full h-3 rounded-full cursor-pointer ${className}`}
      style={{
        background: NEUMORPHIC_CONFIG.surface,
        boxShadow: NEUMORPHIC_CONFIG.pressed.sm,
      }}
    >
      {/* Filled portion */}
      {showFill && (
        <div
          className="absolute top-0 left-0 h-full rounded-full"
          style={{
            width: `${percent * 100}%`,
            background: fillGradient,
            boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.15)',
          }}
        />
      )}
      {/* Thumb */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-7 h-7 rounded-full transition-[left] duration-100"
        style={{
          left: `calc(${percent * 100}% - 14px)`,
          background: NEUMORPHIC_CONFIG.surface,
          boxShadow: NEUMORPHIC_CONFIG.raised.sm,
        }}
      />
    </div>
  );
}
