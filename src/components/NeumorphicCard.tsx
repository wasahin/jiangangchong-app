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
 * NeumorphicCard — Brand v3 FLAT surface.
 *
 * v3 drops the extruded-shadow language entirely: a card is a white
 * plane on the cream canvas, separated by a single hairline.
 * The component name is kept so existing call sites keep working.
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
        bg-brand-v3-surface
        rounded-[${NEUMORPHIC_CONFIG.radiusCard}px]
        ${padding}
        ${onClick ? 'cursor-pointer transition-colors duration-200 hover:border-brand-v3-gold/60' : ''}
        ${className}
      `}
      style={{
        background: customBackground ?? undefined,
        boxShadow: shadow,
      }}
    >
      {children}
    </div>
  );
}
