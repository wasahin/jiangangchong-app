import React from 'react';
import { NEUMORPHIC_CONFIG, NeumorphicSize } from './neumorphic-config';

interface NeumorphicIconTileProps {
  children?: React.ReactNode;
  variant?: 'default' | 'accent' | 'cyan' | 'pressed';
  size?: NeumorphicSize;
  className?: string;
  shape?: 'square' | 'circle';
  onClick?: () => void;
}

/**
 * NeumorphicIconTile — small raised (or pressed) square that
 * hosts an icon. Matches the wifi/bluetooth/mail tiles in the
 * reference image.
 */
export function NeumorphicIconTile({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  shape = 'square',
  onClick,
}: NeumorphicIconTileProps) {
  const isAccent = variant === 'accent';
  const isCyan = variant === 'cyan';
  const isPressed = variant === 'pressed';

  const shadow = isPressed
    ? NEUMORPHIC_CONFIG.pressed[size]
    : NEUMORPHIC_CONFIG.raised[size];

  const sizePx = size === 'sm' ? 56 : size === 'md' ? 72 : 96;

  const background = isAccent
    ? `linear-gradient(135deg, ${NEUMORPHIC_CONFIG.accent} 0%, ${NEUMORPHIC_CONFIG.accentDark} 100%)`
    : isCyan
      ? `linear-gradient(135deg, ${NEUMORPHIC_CONFIG.accentCyan} 0%, #D4E89C 100%)`
      : NEUMORPHIC_CONFIG.surface;

  const color = isAccent ? NEUMORPHIC_CONFIG.textOnAccent : isCyan ? '#4A5D23' : NEUMORPHIC_CONFIG.text;

  return (
    <div
      onClick={onClick}
      className={`
        relative inline-flex items-center justify-center
        ${onClick ? 'cursor-pointer transition-shadow duration-200' : ''}
        ${className}
      `}
      style={{
        width: sizePx,
        height: sizePx,
        background,
        color,
        boxShadow: shadow,
        borderRadius: shape === 'circle' ? '50%' : `${NEUMORPHIC_CONFIG.radiusButton}px`,
      }}
    >
      {children}
    </div>
  );
}
