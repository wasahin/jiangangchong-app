/**
 * Neumorphic Design System Tokens — DEPRECATED as of Brand v3 (2026-11-02)
 *
 * Brand v3 replaces neumorphism with a FLAT system:
 *   white surface on cream canvas, hairline borders, no extruded shadows.
 * This file is kept as the shared surface/colour config so every
 * `Neumorphic*` component renders flat without touching call sites.
 *
 * Authoritative colour source: src/lib/design-tokens.ts
 * The values below mirror it — do not introduce new colours here.
 */

export const NEUMORPHIC_CONFIG = {
  // Card surface — white on the cream canvas (v3 flat)
  surface: '#FFFFFF',
  surfaceAlt: '#FAF6EE',

  // Hairline border instead of an extruded shadow
  border: '1px solid #E6DCCB',
  borderDark: '1px solid rgba(226,188,110,0.28)',

  // Flat means no cast shadow — kept for API compatibility
  lightShadow: 'none',
  darkShadow: 'none',

  // Accents — brand v3
  accent: '#E2BC6E',        // 金刚金 — primary action
  accentDark: '#C9A254',
  accentLight: '#F0D69A',
  accentCyan: '#1B3A5C',    // 藏蓝 — secondary action
  accentPink: '#C97B5A',    // 暖陶橙 — was pink in v2, now the warm accent
  accentPinkLight: '#DDA184',
  accentPinkDark: '#B26A4A',
  accentAmber: '#F59E0B',   // 警告橙

  // Typography
  text: '#1B3A5C',          // 藏蓝
  textMuted: '#6B6157',
  textOnAccent: '#FAF6EE',  // 奶油白

  // Sizing — v3 is tighter than the old 18/12/999
  radiusCard: 12,
  radiusButton: 10,
  radiusPill: 999,

  // Flat elevation: no shadow, just a hairline edge
  raised: {
    sm: '0 0 0 1px #E6DCCB',
    md: '0 0 0 1px #E6DCCB',
    lg: '0 0 0 1px #E6DCCB',
  },
  pressed: {
    sm: 'inset 0 0 0 1px #E6DCCB',
    md: 'inset 0 0 0 1px #E6DCCB',
    lg: 'inset 0 0 0 1px #E6DCCB',
  },
};

export type NeumorphicSize = 'sm' | 'md' | 'lg';

/** Brand v3 colour reference for reference/tools that still look this up */
export const BARLEY_WHITE_PALETTE = {
  background: '#FAF6EE',
  cardSurface: '#FFFFFF',
  cardBorder: '#E6DCCB',
  lightShadow: 'none',
  darkShadow: 'none',
  accentPink: '#C97B5A',
  accentAmber: '#F59E0B',
  accentBarleyWhite: '#FAF6EE',
};
