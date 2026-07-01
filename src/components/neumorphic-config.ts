/**
 * Neumorphic Design System Tokens
 * 
 * Barley White reference background analysis:
 * - Background: Soft barley white ~#FFF4CC
 * - Card surface: Lighter barley white ~#FFF9E6 (slightly lighter than background)
 * - Card border: Subtle yellow-beige outline ~rgba(240,220,180,0.2)
 * - Light shadow: White ~rgba(255,255,255,0.9)
 * - Dark shadow: Yellow-beige-tinged ~rgba(240,220,180,0.35)
 * - Accent colors: Pink (#FF9A9E), Amber (#FFA500), Barley White (#FFF4CC)
 */

export const NEUMORPHIC_CONFIG = {
  // Barley white canvas — the surface everything sits on
  surface: '#FFF4CC',
  surfaceAlt: '#FFF9E6',

  // Subtle yellow-beige border color for cards
  border: 'rgba(240, 220, 180, 0.2)',

  // Paired shadows that create the 3D extrusion illusion
  lightShadow: 'rgba(255, 255, 255, 0.9)',
  darkShadow: 'rgba(240, 220, 180, 0.35)',

  // Multi-color accents from the barley white design
  accent: '#FFA500', // Amber - primary action
  accentDark: '#E89000',
  accentLight: '#FFB733',
  accentCyan: '#FFF4CC', // Barley white - tertiary
  accentPink: '#FF9A9E', // Pink - secondary accent emphasis
  accentPinkLight: '#FFB8BA',
  accentPinkDark: '#FF7A7E',
  accentAmber: '#FFC966',

  // Typography
  text: '#5C5C5C',
  textMuted: '#9A9A9A',
  textOnAccent: '#FFFFFF',

  // Sizing
  radiusCard: 18,
  radiusButton: 12,
  radiusPill: 999,

  // Shadow recipes — yellow-beige-tinged shadows for barley white theme
  raised: {
    sm: '4px 4px 8px rgba(240,220,180,0.3), -4px -4px 8px rgba(255,255,255,0.9)',
    md: '8px 8px 16px rgba(240,220,180,0.35), -8px -8px 16px rgba(255,255,255,0.9)',
    lg: '12px 12px 24px rgba(240,220,180,0.4), -12px -12px 24px rgba(255,255,255,0.9)',
  },
  pressed: {
    sm: 'inset 3px 3px 6px rgba(240,220,180,0.35), inset -3px -3px 6px rgba(255,255,255,0.85)',
    md: 'inset 5px 5px 10px rgba(240,220,180,0.4), inset -5px -5px 10px rgba(255,255,255,0.9)',
    lg: 'inset 7px 7px 14px rgba(240,220,180,0.45), inset -7px -7px 14px rgba(255,255,255,0.9)',
  },
};

export type NeumorphicSize = 'sm' | 'md' | 'lg';

// Barley White design color palette (for reference)
export const BARLEY_WHITE_PALETTE = {
  background: '#FFF4CC',
  cardSurface: '#FFF9E6',
  cardBorder: 'rgba(240,220,180,0.2)',
  lightShadow: 'rgba(255, 255, 255, 0.9)',
  darkShadow: 'rgba(240, 220, 180, 0.35)',
  accentPink: '#FF9A9E',
  accentAmber: '#FFA500',
  accentBarleyWhite: '#FFF4CC',
};
