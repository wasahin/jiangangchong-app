'use client';

import { useState, useEffect } from 'react';

export function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('jingangchong-theme');
    if (saved === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('jingangchong-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('jingangchong-theme', 'light');
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="fixed top-4 right-4 z-50 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer"
      style={{
        background: isDark
          ? 'linear-gradient(145deg, #3D3D40, #2C2C2E)'
          : 'linear-gradient(145deg, rgba(255,253,240,0.95), rgba(255,248,225,0.85))',
        boxShadow: isDark
          ? '4px 4px 8px rgba(0,0,0,0.5), -2px -2px 6px rgba(255,255,255,0.05), inset 1px 1px 2px rgba(255,255,255,0.1)'
          : '4px 4px 8px rgba(240,220,180,0.3), -4px -4px 8px rgba(255,255,255,0.9), inset 1px 1px 2px rgba(255,255,255,0.5)',
      }}
    >
      {isDark ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E89000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
