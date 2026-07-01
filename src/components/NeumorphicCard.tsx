import React from 'react';
import { NEUMORPHIC_CONFIG, NeumorphicSize } from './neumorphic-config';

interface NeumorphicCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'raised' | 'pressed' | 'flat';
  size?: NeumorphicSize;
  padding?: string;
  onClick?: () => void;
  /** Override the default shadow with a custom shadow string */
  customShadow?: string;
  /** Override the default background color */
  customBackground?: string;
}

/**
 * NeumorphicCard — a soft surface that appears to be either
 * extruded from the canvas (raised) or pressed into it (pressed).
 * The whole card shares the canvas background; only paired shadows
 * give it form.
 */
export function NeumorphicCard({
  children,
  className = '',
  variant = 'raised',
  size = 'md',
  padding = 'p-5',
  onClick,
  customShadow,
  customBackground,
}: NeumorphicCardProps) {
  const shadow = customShadow ?? (
    variant === 'pressed'
      ? NEUMORPHIC_CONFIG.pressed[size]
      : variant === 'raised'
        ? NEUMORPHIC_CONFIG.raised[size]
        : 'none'
  );

  return (
    <div
      onClick={onClick}
      className={`
        relative
        rounded-[${NEUMORPHIC_CONFIG.radiusCard}px]
        ${padding}
        ${onClick ? 'cursor-pointer transition-shadow duration-200' : ''}
        ${className}
      `}
      style={{
        background: customBackground ?? NEUMORPHIC_CONFIG.surface,
        boxShadow: shadow,
      }}
    >
      {children}
    </div>
  );
}
