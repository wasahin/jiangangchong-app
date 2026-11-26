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
 * NeumorphicInput — Brand v3 FLAT text field.
 *
 * v3: a white field with a hairline border. Focus is expressed with a
 * brand-colour ring, not an inset shadow.
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
        bg-brand-v3-surface
        rounded-[${NEUMORPHIC_CONFIG.radiusButton}px]
        transition-colors duration-200
        ${className}
      `}
      style={{
        border: isFocused ? `2px solid ${accent}` : '1px solid #E6DCCB',
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
          color: NEUMORPHIC_CONFIG.text,
        }}
      />
    </div>
  );
}
