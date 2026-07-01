import React from 'react';
import { NEUMORPHIC_CONFIG } from './neumorphic-config';

interface NeumorphicInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  type?: string;
  accentColor?: 'amber' | 'cyan';
}

/**
 * NeumorphicInput — an inset (pressed-in) text field.
 * The field is part of the same canvas, visually carved into the surface.
 */
export function NeumorphicInput({
  value,
  onChange,
  placeholder = '',
  icon,
  className = '',
  type = 'text',
  accentColor = 'amber',
}: NeumorphicInputProps) {
  const [isFocused, setIsFocused] = React.useState(false);

  const accent = accentColor === 'cyan' 
    ? NEUMORPHIC_CONFIG.accentCyan 
    : NEUMORPHIC_CONFIG.accent;
  return (
    <div
      className={`
        flex items-center gap-3
        h-12 px-4
        rounded-[${NEUMORPHIC_CONFIG.radiusButton}px]
        transition-all duration-200
        ${className}
      `}
      style={{
        background: NEUMORPHIC_CONFIG.surface,
        boxShadow: isFocused 
          ? `inset 3px 3px 6px rgba(240,180,190,0.35), inset -3px -3px 6px rgba(255,255,255,0.85), 0 0 0 2px ${accent}40`
          : NEUMORPHIC_CONFIG.pressed.md,
      }}
    >
      {icon && (
        <span 
          className="shrink-0 transition-colors duration-200" 
          style={{ color: isFocused ? accent : NEUMORPHIC_CONFIG.textMuted }}
        >
          {icon}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-sm tracking-wide transition-colors duration-200"
        style={{
          color: isFocused ? accent : NEUMORPHIC_CONFIG.text,
        }}
      />
    </div>
  );
}
