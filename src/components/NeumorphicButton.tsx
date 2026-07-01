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
 * NeumorphicButton — three states from the reference image:
 *  - default: raised neutral surface
 *  - accent:  raised surface with amber fill (e.g. "YES")
 *  - pink:    raised surface with pink fill (secondary accent)
 *  - pressed: pressed-in surface (e.g. inactive "NO")
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

  const shadow = isPressed
    ? NEUMORPHIC_CONFIG.pressed[size]
    : NEUMORPHIC_CONFIG.raised[size];

  const background = isAccent
    ? `linear-gradient(135deg, ${NEUMORPHIC_CONFIG.accent} 0%, ${NEUMORPHIC_CONFIG.accentDark} 100%)`
    : isPink
      ? `linear-gradient(135deg, ${NEUMORPHIC_CONFIG.accentPink} 0%, #FF8A8E 100%)`
      : isCyan
        ? `linear-gradient(135deg, ${NEUMORPHIC_CONFIG.accentCyan} 0%, #FFF9E6 100%)`
        : NEUMORPHIC_CONFIG.surface;

  const color = isAccent ? NEUMORPHIC_CONFIG.textOnAccent : isPink ? '#FFFFFF' : isCyan ? '#8B7355' : NEUMORPHIC_CONFIG.text;

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
        transition-all duration-200
        ${sizeClasses[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:translate-y-[1px]'}
        ${className}
      `}
      style={{
        background,
        color,
        boxShadow: disabled ? 'none' : shadow,
        borderRadius: `${radius}px`,
        // Subtle inner highlight for accent to feel glossy
        ...(isAccent && {
          backgroundImage: `linear-gradient(135deg, ${NEUMORPHIC_CONFIG.accentLight} 0%, ${NEUMORPHIC_CONFIG.accent} 50%, ${NEUMORPHIC_CONFIG.accentDark} 100%)`,
        }),
        // Pink gradient with lighter top
        ...(isPink && {
          backgroundImage: `linear-gradient(135deg, #FFB8BA 0%, ${NEUMORPHIC_CONFIG.accentPink} 50%, #FF8A8E 100%)`,
        }),
        // Barley white with subtle warm gradient
        ...(isCyan && {
          backgroundImage: `linear-gradient(135deg, #FFFDF5 0%, ${NEUMORPHIC_CONFIG.accentCyan} 50%, #FFF9E6 100%)`,
        }),
      }}
    >
      {children}
    </button>
  );
}
