/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ============================================
        // SYSTEM COLORS (iOS-inspired)
        // ============================================
        system: {
          blue: '#007AFF',
          green: '#34C759',
          red: '#FF3B30',
          orange: '#FF9500',
          yellow: '#FFCC00',
          gray: '#8E8E93',
          gray2: '#AEAEB2',
          gray3: '#C7C7CC',
          gray4: '#D1D1D6',
          gray5: '#E5E5EA',
          gray6: '#F2F2F7',
        },

        // ============================================
        // BRAND COLORS (BrandPrimary)
        // ============================================
        brand: {
          primary: '#FF9500',
          secondary: '#FF6B00',
          tertiary: 'rgba(255, 149, 0, 0.12)',
        },

        // ============================================
        // NEUMORPHIC BARLEY WHITE THEME (YellowWhite Testpage)
        // Two variants: Light (浅色) and Rich (深色)
        // ============================================
        
        // --- Light Theme: 浅粉色大麦白背景 ---
        // Background: Soft barley white ~#FFF4CC
        // Card surface: Lighter barley white ~#FFF9E6
        // Light shadow: White ~rgba(255,255,255,0.9)
        // Dark shadow: Yellow-beige-tinged ~rgba(240,220,180,0.35)
        neumo: {
          // Barley white background colors
          light: '#FFF4CC',
          surface: '#FFF9E6',
          alt: '#FAF0C4',
          
          // Accent colors
          amber: '#FFA500',
          amberDark: '#E89000',
          amberLight: '#FFB733',
          cyan: '#FFF4CC',
          pink: '#FF9A9E',
          pinkLight: '#FFB8BA',
          pinkDark: '#FF7A7E',
          
          // Text colors
          text: '#5C5C5C',
          textMuted: '#9A9A9A',
          textOnAccent: '#FFFFFF',
          
          // Border color
          border: 'rgba(240, 220, 180, 0.2)',
          
          // Shadows
          lightShadow: 'rgba(255, 255, 255, 0.9)',
          darkShadow: 'rgba(240, 220, 180, 0.35)',
          
          // Yellow card background
          yellow: {
            light: 'rgba(255,253,240,0.95)',
            DEFAULT: 'rgba(255,248,225,0.85)',
          },
        },

        // --- Rich Theme: 深色大麦白/金色阴影变体 ---
        // 使用更深的阴影色值，适合深色背景
        'neumo-rich': {
          background: '#EFE0B0',
          surface: '#F5E8C0',
          
          // 深色阴影（用于rich主题）
          darkShadow: 'rgba(220, 200, 160, 0.55)',
          lightShadow: 'rgba(255, 255, 255, 0.85)',
          
          // 强调色保持一致
          amber: '#FFA500',
          pink: '#FF9A9E',
        },

        // ============================================
        // ACCENT COLORS (单独提取方便复用)
        // ============================================
        accent: {
          amber: '#FFA500',
          amberDark: '#E89000',
          amberLight: '#FFB733',
          cyan: '#FFF4CC',
          pink: '#FF9A9E',
          pinkLight: '#FFB8BA',
          pinkDark: '#FF7A7E',
          amberAccent: '#FFC966',
        },
      },

      backdropBlur: {
        xs: '2px',
      },

      // ============================================
      // NEUMORPHIC SHADOW UTILITIES
      // 三种主题：Barley White (neumo)、Neutral White (neumo-light)、Rich (neumo-rich)
      // ============================================
      boxShadow: {
        // ------------------------------------------------
        // BARLEY WHITE THEME (neumo-*)
        // 用于浅粉色大麦白背景的组件
        // 阴影色：rgba(240,220,180,0.xx) + rgba(255,255,255,0.9)
        // ------------------------------------------------
        
        // Raised (凸起/浮出) - 模拟从表面凸出
        'neumo-raised-sm': '4px 4px 8px rgba(240,220,180,0.3), -4px -4px 8px rgba(255,255,255,0.9)',
        'neumo-raised-md': '8px 8px 16px rgba(240,220,180,0.35), -8px -8px 16px rgba(255,255,255,0.9)',
        'neumo-raised-lg': '12px 12px 24px rgba(240,220,180,0.4), -12px -12px 24px rgba(255,255,255,0.9)',
        
        // Pressed (按压/凹陷) - 模拟按入表面
        'neumo-pressed-sm': 'inset 3px 3px 6px rgba(240,220,180,0.35), inset -3px -3px 6px rgba(255,255,255,0.85)',
        'neumo-pressed-md': 'inset 5px 5px 10px rgba(240,220,180,0.4), inset -5px -5px 10px rgba(255,255,255,0.9)',
        'neumo-pressed-lg': 'inset 7px 7px 14px rgba(240,220,180,0.45), inset -7px -7px 14px rgba(255,255,255,0.9)',

        // ------------------------------------------------
        // RICH THEME (neumo-rich-*)
        // 用于深色大麦白背景的组件
        // 阴影色：rgba(220,200,160,0.xx) + rgba(255,255,255,0.85)
        // ------------------------------------------------
        
        // Rich Raised
        'neumo-rich-raised-sm': '4px 4px 8px rgba(220,200,160,0.45), -4px -4px 8px rgba(255,255,255,0.85)',
        'neumo-rich-raised-md': '8px 8px 16px rgba(220,200,160,0.5), -8px -8px 16px rgba(255,255,255,0.85)',
        'neumo-rich-raised-lg': '12px 12px 24px rgba(220,200,160,0.55), -12px -12px 24px rgba(255,255,255,0.85)',
        
        // Rich Pressed
        'neumo-rich-pressed-sm': 'inset 3px 3px 6px rgba(220,200,160,0.5), inset -3px -3px 6px rgba(255,255,255,0.8)',
        'neumo-rich-pressed-md': 'inset 5px 5px 10px rgba(220,200,160,0.55), inset -5px -5px 10px rgba(255,255,255,0.85)',
        'neumo-rich-pressed-lg': 'inset 7px 7px 14px rgba(220,200,160,0.6), inset -7px -7px 14px rgba(255,255,255,0.85)',

        // ------------------------------------------------
        // NEUTRAL WHITE THEME (neumo-light-*)
        // 用于浅灰/白色背景的组件（如进度条、Logo底座）
        // 阴影色：rgba(0,0,0,0.xx) + rgba(255,255,255,0.95)
        // ------------------------------------------------
        
        // Light Raised
        'neumo-light-raised-sm': '4px 4px 8px rgba(0,0,0,0.1), -2px -2px 5px rgba(255,255,255,0.95), inset 1px 1px 2px rgba(255,255,255,0.98)',
        'neumo-light-raised-md': '5px 5px 10px rgba(0,0,0,0.15), -3px -3px 8px rgba(255,255,255,0.9), inset 1px 1px 3px rgba(255,255,255,0.7)',
        'neumo-light-raised-lg': '6px 6px 16px rgba(0,0,0,0.12), -4px -4px 12px rgba(255,255,255,0.9), inset 1px 1px 3px rgba(255,255,255,0.7)',
        
        // Light Pressed
        'neumo-light-pressed-sm': 'inset 2px 2px 4px rgba(0,0,0,0.08), inset -1px -1px 3px rgba(255,255,255,0.9)',
        'neumo-light-pressed-md': 'inset 3px 3px 6px rgba(0,0,0,0.1), inset -2px -2px 4px rgba(255,255,255,0.95)',
        'neumo-light-pressed-lg': 'inset 4px 4px 8px rgba(0,0,0,0.12), inset -3px -3px 6px rgba(255,255,255,0.9)',
      },

      borderRadius: {
        'neumo-card': '18px',
        'neumo-button': '12px',
        'neumo-pill': '999px',
      },
    },
  },
  plugins: [],
}
