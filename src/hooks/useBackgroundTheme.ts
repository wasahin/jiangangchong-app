import { useState, useCallback } from 'react';

export type BackgroundTheme = 'light' | 'rich';

export interface BackgroundThemeConfig {
  surface: string;
  surfaceAlt: string;
  border: string;
  lightShadow: string;
  darkShadow: string;
}

export interface UseBackgroundThemeReturn {
  theme: BackgroundTheme;
  toggleTheme: () => void;
  setTheme: (theme: BackgroundTheme) => void;
  config: BackgroundThemeConfig;
}

/**
 * Light barley white theme — soft creamy yellow-beige, airy feel
 */
const LIGHT_THEME: BackgroundThemeConfig = {
  surface: '#FFF4CC',
  surfaceAlt: '#FFF9E6',
  border: 'rgba(240, 220, 180, 0.2)',
  lightShadow: 'rgba(255, 255, 255, 0.9)',
  darkShadow: 'rgba(240, 220, 180, 0.35)',
};

/**
 * Rich barley white theme — vibrant yellow-beige, bold feel
 */
const RICH_THEME: BackgroundThemeConfig = {
  surface: '#EFE0B0',
  surfaceAlt: '#FAF0C4',
  border: 'rgba(220, 200, 160, 0.35)',
  lightShadow: 'rgba(255, 255, 255, 0.85)',
  darkShadow: 'rgba(220, 200, 160, 0.5)',
};

/**
 * Shadow recipes for light theme
 */
export const LIGHT_SHADOWS = {
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

/**
 * Shadow recipes for rich theme
 */
export const RICH_SHADOWS = {
  raised: {
    sm: '4px 4px 8px rgba(220,200,160,0.45), -4px -4px 8px rgba(255,255,255,0.85)',
    md: '8px 8px 16px rgba(220,200,160,0.5), -8px -8px 16px rgba(255,255,255,0.85)',
    lg: '12px 12px 24px rgba(220,200,160,0.55), -12px -12px 24px rgba(255,255,255,0.85)',
  },
  pressed: {
    sm: 'inset 3px 3px 6px rgba(220,200,160,0.5), inset -3px -3px 6px rgba(255,255,255,0.8)',
    md: 'inset 5px 5px 10px rgba(220,200,160,0.55), inset -5px -5px 10px rgba(255,255,255,0.85)',
    lg: 'inset 7px 7px 14px rgba(220,200,160,0.6), inset -7px -7px 14px rgba(255,255,255,0.85)',
  },
};

/**
 * Custom hook for managing background theme (light ↔ rich barley white).
 * 
 * @param defaultTheme - Initial theme ('light' | 'rich'), defaults to 'light'
 * @returns Object with theme state and control functions
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { theme, toggleTheme, config } = useBackgroundTheme();
 *   
 *   return (
 *     <div style={{ background: config.surface }}>
 *       <button onClick={toggleTheme}>
 *         Current: {theme === 'light' ? 'Light' : 'Rich'}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useBackgroundTheme(
  defaultTheme: BackgroundTheme = 'light'
): UseBackgroundThemeReturn {
  const [theme, setTheme] = useState<BackgroundTheme>(defaultTheme);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'rich' : 'light'));
  }, []);

  const config = theme === 'light' ? LIGHT_THEME : RICH_THEME;

  return {
    theme,
    toggleTheme,
    setTheme,
    config,
  };
}
