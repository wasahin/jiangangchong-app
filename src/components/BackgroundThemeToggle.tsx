import React from 'react';
import { useBackgroundTheme, BackgroundTheme, LIGHT_SHADOWS, RICH_SHADOWS } from '@/hooks/useBackgroundTheme';

/**
 * Props for the BackgroundThemeToggle widget
 */
export interface BackgroundThemeToggleProps {
  /** Callback fired when theme changes */
  onThemeChange?: (theme: BackgroundTheme) => void;
  /** Show theme labels (Light / Rich) */
  showLabels?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Custom class name */
  className?: string;
}

/**
 * Neumorphic Background Theme Toggle Widget
 * 
 * A toggle switch that allows switching between light pink and rich pink backgrounds.
 * Uses neumorphic styling to match the design system.
 * 
 * @example
 * ```tsx
 * // Standalone usage
 * <BackgroundThemeToggle />
 * 
 * // With theme change callback
 * <BackgroundThemeToggle onThemeChange={(theme) => console.log(theme)} />
 * 
 * // Inside a component with shared theme
 * function App() {
 *   const { theme, toggleTheme, config } = useBackgroundTheme();
 *   
 *   return (
 *     <div style={{ background: config.surface }}>
 *       <BackgroundThemeToggle 
 *         onThemeChange={(t) => setTheme(t)}
 *       />
 *       <MyContent />
 *     </div>
 *   );
 * }
 * ```
 */
export function BackgroundThemeToggle({
  onThemeChange,
  showLabels = true,
  size = 'md',
  className = '',
}: BackgroundThemeToggleProps) {
  const { theme, toggleTheme, config } = useBackgroundTheme();

  const handleToggle = () => {
    toggleTheme();
    onThemeChange?.(theme === 'light' ? 'rich' : 'light');
  };

  const sizeConfig = {
    sm: { button: 'h-8 w-16', label: 'text-[10px]', dot: 'w-7 h-7' },
    md: { button: 'h-10 w-20', label: 'text-xs', dot: 'w-9 h-9' },
    lg: { button: 'h-12 w-24', label: 'text-sm', dot: 'w-11 h-11' },
  }[size];

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Toggle Switch */}
      <button
        onClick={handleToggle}
        className={`
          relative ${sizeConfig.button}
          rounded-full
          transition-all duration-300
          cursor-pointer
        `}
        style={{
          background: config.surface,
          boxShadow: theme === 'light' 
            ? LIGHT_SHADOWS.pressed.sm 
            : RICH_SHADOWS.pressed.sm,
        }}
        aria-label={`Current theme: ${theme}. Click to switch.`}
      >
        {/* Slide indicator */}
        <div
          className={`
            absolute top-1 ${sizeConfig.dot}
            rounded-full
            transition-all duration-300
            flex items-center justify-center
          `}
          style={{
            left: theme === 'light' ? '4px' : 'calc(100% - 4px - 2.25rem)',
            background: config.surface,
            boxShadow: theme === 'light'
              ? LIGHT_SHADOWS.raised.sm
              : RICH_SHADOWS.raised.sm,
          }}
        >
          {/* Color dot preview */}
          <div
            className="w-4 h-4 rounded-full transition-colors duration-300"
            style={{
              background: theme === 'light' 
                ? 'linear-gradient(135deg, #FFE8EC 0%, #FFF3F5 100%)' 
                : 'linear-gradient(135deg, #FFD4DA 0%, #FFE4E6 100%)',
            }}
          />
        </div>
      </button>

      {/* Labels */}
      {showLabels && (
        <div className="flex flex-col gap-0.5">
          <span
            className={`${sizeConfig.label} font-semibold tracking-wider transition-colors duration-200`}
            style={{
              color: theme === 'light' ? config.surface : '#9A9A9A',
            }}
          >
            LIGHT
          </span>
          <span
            className={`${sizeConfig.label} font-semibold tracking-wider transition-colors duration-200`}
            style={{
              color: theme === 'rich' ? config.surface : '#9A9A9A',
            }}
          >
            RICH
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Background Theme Provider Wrapper
 * 
 * Wraps children with a themed background and provides the toggle widget.
 * 
 * @example
 * ```tsx
 * <BackgroundThemeProvider>
 *   <YourApp />
 * </BackgroundThemeProvider>
 * ```
 */
export interface BackgroundThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: BackgroundTheme;
  className?: string;
}

export function BackgroundThemeProvider({
  children,
  defaultTheme = 'light',
  className = '',
}: BackgroundThemeProviderProps) {
  const { theme, toggleTheme, config } = useBackgroundTheme(defaultTheme);

  return (
    <div
      className={className}
      style={{
        background: config.surface,
        transition: 'background 400ms ease-in-out',
      }}
    >
      {children}
    </div>
  );
}
