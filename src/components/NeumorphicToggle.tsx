import React from 'react';
import { NEUMORPHIC_CONFIG } from './neumorphic-config';

interface NeumorphicToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
  /** Color of the active fill */
  accentColor?: 'amber' | 'cyan';
}

/**
 * NeumorphicToggle — track is pressed-in, thumb is raised.
 * ON state fills the leading half with amber.
 */
export function NeumorphicToggle({
  checked,
  onChange,
  label,
  className = '',
  accentColor = 'amber',
}: NeumorphicToggleProps) {
  const fillGradient = accentColor === 'cyan'
    ? `linear-gradient(135deg, ${NEUMORPHIC_CONFIG.accentCyan} 0%, #D4E89C 100%)`
    : `linear-gradient(135deg, ${NEUMORPHIC_CONFIG.accent} 0%, ${NEUMORPHIC_CONFIG.accentDark} 100%)`;
  return (
    <label className={`inline-flex items-center gap-3 cursor-pointer ${className}`}>
      <div
        onClick={() => onChange(!checked)}
        className="relative w-16 h-8 rounded-full"
        style={{
          background: NEUMORPHIC_CONFIG.surface,
          boxShadow: NEUMORPHIC_CONFIG.pressed.sm,
        }}
      >
        {/* Accent fill — only the left side, sliding under the thumb */}
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-300"
          style={{
            width: checked ? '100%' : '0%',
            background: fillGradient,
            boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.15)',
          }}
        />
        {/* Thumb */}
        <div
          className="absolute top-1 h-6 w-6 rounded-full transition-all duration-300"
          style={{
            left: checked ? 'calc(100% - 28px)' : '4px',
            background: NEUMORPHIC_CONFIG.surface,
            boxShadow: NEUMORPHIC_CONFIG.raised.sm,
          }}
        />
      </div>
      {label && (
        <span
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: NEUMORPHIC_CONFIG.text }}
        >
          {label}
        </span>
      )}
    </label>
  );
}
