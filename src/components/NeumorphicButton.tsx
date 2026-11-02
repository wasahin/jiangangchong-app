import React from 'react';
import { NEUMORPHIC_CONFIG, NeumorphicSize } from './neumorphic-config';

interface NeumorphicButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'accent' | 'pink' | 'cyan' | 'pressed';
  size?: NeumorphicSize;
  shape?: 'rounded' | 'pill';
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * NeumorphicButton — Brand v3 FLAT button.
 *
 * v3 removes gradients-as-decoration: every variant is a solid fill.
 *  - default: white surface + hairline
 *  - accent:  金刚金 fill (primary action)
 *  - pink:    暖陶橙 fill (v3's warm accent, was pink in v2)
 *  - cyan:    藏蓝 fill (secondary action)
 *  - pressed: flat surface, muted type
 */
export function NeumorphicButton({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  shape = 'rounded',
  onClick,
  disabled = false,
  type = 'button',
}: NeumorphicButtonProps) {
  const isAccent = variant === 'accent';
  const isPink = variant === 'pink';
  const isCyan = variant === 'cyan';
  const isPressed = variant === 'pressed';

  const background = isAccent
    ? NEUMORPHIC_CONFIG.accent
    : isPink
      ? NEUMORPHIC_CONFIG.accentPink
      : isCyan
        ? NEUMORPHIC_CONFIG.accentCyan
        : NEUMORPHIC_CONFIG.surface;

  const color = isAccent
    ? NEUMORPHIC_CONFIG.textOnAccent
    : isPink
      ? '#FAF6EE'
      : isCyan
        ? NEUMORPHIC_CONFIG.textOnAccent
        : isPressed
          ? NEUMORPHIC_CONFIG.textMuted
          : NEUMORPHIC_CONFIG.text;

  const radius = shape === 'pill' ? NEUMORPHIC_CONFIG.radiusPill : NEUMORPHIC_CONFIG.radiusButton;

  const sizeClasses = {
    sm: 'h-9 px-4 text-xs',
    md: 'h-11 px-5 text-sm',
    lg: 'h-14 px-7 text-base',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center
        font-semibold tracking-wider uppercase
        transition-colors duration-200
        ${sizeClasses[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:opacity-90'}
        ${className}
      `}
      style={{
        background,
        color,
        boxShadow: 'none',
        border: isAccent || isPink || isCyan
          ? 'none'
          : '1px solid #E6DCCB',
        borderRadius: `${radius}px`,
      }}
    >
      {children}
    </button>
  );
}
