'use client';

import { useState } from 'react';
import {
  NEUMORPHIC_CONFIG,
  BARLEY_WHITE_PALETTE,
  NeumorphicCard,
  NeumorphicButton,
  NeumorphicInput,
  NeumorphicToggle,
  NeumorphicSlider,
  NeumorphicProgressRing,
  NeumorphicIconTile,
  BackgroundThemeToggle,
} from '@/components/neuromorphic';
import { useBackgroundTheme, LIGHT_SHADOWS, RICH_SHADOWS } from '@/hooks/useBackgroundTheme';

/**
 * Inline icon components — outlined, 2px stroke, matching the
 * reference image's iconographic language.
 */
const Icon = {
  Wifi: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  ),
  Bluetooth: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5" />
    </svg>
  ),
  Mail: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  User: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Lock: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Home: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  ),
  Heart: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  Bell: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  Chevron: ({ dir = 'down' }: { dir?: 'down' | 'up' | 'left' | 'right' }) => {
    const map = { down: '6 9 12 15 18 9', up: '18 15 12 9 6 15', left: '15 18 9 12 15 6', right: '9 18 15 12 9 6' };
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points={map[dir]} />
      </svg>
    );
  },
  Expand: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  ),
  Collapse: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 14 10 14 10 20" />
      <polyline points="20 10 14 10 14 4" />
      <line x1="14" y1="10" x2="21" y2="3" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  ),
  Fullscreen: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3h6v2H5v4H3V3z" />
      <path d="M21 3v6h-2V5h-4V3h6z" />
      <path d="M21 21h-6v-2h4v-4h2v6z" />
      <path d="M3 21v-6h2v4h4v2H3z" />
    </svg>
  ),
  Cloud: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    </svg>
  ),
};

export default function YellowWhitePage() {
  // Background theme hook for light/rich pink toggle
  const { theme, config } = useBackgroundTheme('light');
  const shadows = theme === 'light' ? LIGHT_SHADOWS : RICH_SHADOWS;

  // Interactive state
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [remember, setRemember] = useState(false);
  const [sliderValue, setSliderValue] = useState(0.55);
  const [emptySlider, setEmptySlider] = useState(0.3);
  const [toggle1, setToggle1] = useState(true);
  const [toggle2, setToggle2] = useState(false);
  const [progress, setProgress] = useState(0.25);
  const [activeMenu, setActiveMenu] = useState('HOME');

  const menu = ['HOME', 'CHAT', 'FAVS', 'SETTINGS', 'SPECIAL'];

  return (
    <div
      className="min-h-screen p-6 md:p-10 transition-all duration-500"
      style={{ background: config.surface }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Page header */}
      <div className="mb-10 flex flex-col items-center gap-4">
        {/* Background Theme Toggle */}
        <BackgroundThemeToggle size="md" />
        
        <div className="flex justify-center items-center gap-1 mb-2">
          <span className="text-5xl md:text-6xl font-bold" style={{ color: NEUMORPHIC_CONFIG.accentCyan }}>S</span>
          <span className="text-5xl md:text-6xl font-bold" style={{ color: NEUMORPHIC_CONFIG.accentAmber }}>e</span>
          <span className="text-5xl md:text-6xl font-bold" style={{ color: NEUMORPHIC_CONFIG.accentAmber }}>a</span>
          <span className="text-5xl md:text-6xl font-bold" style={{ color: NEUMORPHIC_CONFIG.accentCyan }}>r</span>
          <span className="text-5xl md:text-6xl font-bold" style={{ color: NEUMORPHIC_CONFIG.accentCyan }}>c</span>
          <span className="text-5xl md:text-6xl font-bold" style={{ color: NEUMORPHIC_CONFIG.accentPink }}>h</span>
          <span className="text-5xl md:text-6xl font-bold" style={{ color: NEUMORPHIC_CONFIG.accentPink }}>.</span>
        </div>
        <p
          className="text-sm tracking-widest uppercase"
          style={{ color: NEUMORPHIC_CONFIG.textMuted }}
        >
          Soft tactile surfaces · paired shadows · multi-color accents
        </p>
        <p
          className="text-xs tracking-wider"
          style={{ color: theme === 'light' ? '#9A9A9A' : '#AAAAAA' }}
        >
          {theme === 'light' ? 'Light Pink' : 'Rich Pink'} Background
        </p>
      </div>

        {/* === Row 1: Menu card + Login card + Icon tiles === */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
          {/* Left: collapsible menu card */}
          <div className="md:col-span-3">
            <NeumorphicCard padding="p-3">
              <div className="flex flex-col gap-2">
                {menu.map((item) => {
                  const isActive = activeMenu === item;
                  return (
                    <button
                      key={item}
                      onClick={() => setActiveMenu(item)}
                      className="flex items-center justify-between px-4 py-3 text-xs font-semibold tracking-widest uppercase transition-all"
                      style={{
                        borderRadius: '12px',
                        background: isActive ? NEUMORPHIC_CONFIG.surface : 'transparent',
                        color: isActive ? NEUMORPHIC_CONFIG.accent : NEUMORPHIC_CONFIG.textMuted,
                        boxShadow: isActive ? NEUMORPHIC_CONFIG.pressed.sm : 'none',
                      }}
                    >
                      <span>{item}</span>
                      {isActive && <Icon.Chevron dir="up" />}
                    </button>
                  );
                })}
              </div>
            </NeumorphicCard>
          </div>

          {/* Middle: login card */}
          <div className="md:col-span-5">
            <NeumorphicCard padding="p-6">
              <h2
                className="text-sm font-semibold tracking-widest uppercase mb-5"
                style={{ color: NEUMORPHIC_CONFIG.textMuted }}
              >
                Login
              </h2>

              <div className="flex flex-col gap-4">
                <NeumorphicInput
                  value={loginUser}
                  onChange={setLoginUser}
                  placeholder="LOGIN"
                  icon={<Icon.User />}
                />
                <NeumorphicInput
                  type="password"
                  value={loginPass}
                  onChange={setLoginPass}
                  placeholder="PASSWORD"
                  icon={<Icon.Lock />}
                />

                <div className="flex items-center justify-end gap-2 mt-1">
                  <span
                    className="text-[10px] tracking-widest uppercase"
                    style={{ color: NEUMORPHIC_CONFIG.textMuted }}
                  >
                    Remember
                  </span>
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: remember ? NEUMORPHIC_CONFIG.accent : 'transparent' }}
                  />
                </div>

                <div className="flex gap-3 mt-2">
                  <NeumorphicButton variant="accent" size="sm" className="flex-1">Login</NeumorphicButton>
                  <NeumorphicButton size="sm" className="flex-1">Cancel</NeumorphicButton>
                </div>
              </div>
            </NeumorphicCard>
          </div>

          {/* Right: icon tiles + pill buttons */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <div className="flex gap-4">
              <NeumorphicIconTile>
                <span style={{ color: NEUMORPHIC_CONFIG.accent }}><Icon.Wifi /></span>
              </NeumorphicIconTile>
              <NeumorphicIconTile variant="accent">
                <span style={{ color: NEUMORPHIC_CONFIG.textOnAccent }}><Icon.Bluetooth /></span>
              </NeumorphicIconTile>
              <NeumorphicIconTile>
                <span style={{ color: NEUMORPHIC_CONFIG.accentPink }}><Icon.Mail /></span>
              </NeumorphicIconTile>
            </div>

            <div className="flex gap-3">
              <NeumorphicButton variant="cyan" shape="pill" className="flex-1">
                Yes
              </NeumorphicButton>
              <NeumorphicIconTile shape="circle" variant="cyan" size="md">
                <span style={{ color: NEUMORPHIC_CONFIG.textOnAccent }}>
                  <Icon.Chevron dir="right" />
                </span>
              </NeumorphicIconTile>
            </div>

            <div className="flex gap-3">
              <NeumorphicButton variant="pressed" shape="pill" className="flex-1">
                No
              </NeumorphicButton>
              <NeumorphicIconTile shape="circle" variant="pressed" size="md" />
            </div>
          </div>
        </div>

        {/* === Row 2: Search + Forgot password + small icon tiles === */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
          <div className="md:col-span-3 flex flex-col gap-4">
            <NeumorphicInput
              value=""
              onChange={() => {}}
              placeholder="SEARCH"
              icon={<Icon.Search />}
            />
            <div className="flex gap-3">
              <NeumorphicIconTile size="sm">
                <span style={{ color: NEUMORPHIC_CONFIG.textMuted }}><Icon.Home /></span>
              </NeumorphicIconTile>
              <NeumorphicIconTile size="sm">
                <span style={{ color: NEUMORPHIC_CONFIG.textMuted }}><Icon.Heart /></span>
              </NeumorphicIconTile>
              <NeumorphicIconTile size="sm" variant="accent">
                <span style={{ color: NEUMORPHIC_CONFIG.textOnAccent }}>•</span>
              </NeumorphicIconTile>
            </div>
            <NeumorphicButton size="sm" className="w-full">
              <span className="flex items-center gap-2">
                <Icon.Lock />
                Forgot Pass
              </span>
            </NeumorphicButton>
          </div>

          {/* Center: progress ring + adjust slider */}
          <div className="md:col-span-4 flex flex-col items-center gap-6">
            <NeumorphicProgressRing
              value={progress}
              size={160}
              label="Progress"
            />
            <div className="w-full px-2">
              <NeumorphicSlider value={progress} onChange={setProgress} />
              <p
                className="text-[10px] text-center mt-3 tracking-widest uppercase"
                style={{ color: NEUMORPHIC_CONFIG.textMuted }}
              >
                Adjust the ring
              </p>
            </div>
          </div>

          {/* Right: sliders + toggles + window controls */}
          <div className="md:col-span-5 flex flex-col gap-5">
            <NeumorphicSlider value={sliderValue} onChange={setSliderValue} />
            <NeumorphicSlider value={emptySlider} onChange={setEmptySlider} showFill={false} />

            <div className="flex items-center justify-between gap-4 mt-2">
              <NeumorphicToggle checked={toggle1} onChange={setToggle1} label={toggle1 ? 'On' : ''} />
              <NeumorphicToggle checked={toggle2} onChange={setToggle2} label={toggle2 ? '' : 'Off'} />
              <div className="flex gap-2">
                <NeumorphicIconTile size="sm">
                  <span style={{ color: NEUMORPHIC_CONFIG.accentCyan }}><Icon.Expand /></span>
                </NeumorphicIconTile>
                <NeumorphicIconTile size="sm">
                  <span style={{ color: NEUMORPHIC_CONFIG.accentCyan }}><Icon.Collapse /></span>
                </NeumorphicIconTile>
                <NeumorphicIconTile size="sm" variant="pressed">
                  <span style={{ color: NEUMORPHIC_CONFIG.textMuted }}><Icon.Fullscreen /></span>
                </NeumorphicIconTile>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <NeumorphicToggle checked={remember} onChange={setRemember} label="Remember" />
              <span
                className="text-[10px] tracking-widest uppercase"
                style={{ color: NEUMORPHIC_CONFIG.textMuted }}
              >
                Try all controls
              </span>
            </div>
          </div>
        </div>

        {/* === Row 3: comparison footer — pressed vs raised, sizing === */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <NeumorphicCard size="sm" padding="p-5">
            <h3
              className="text-xs font-semibold tracking-widest uppercase mb-3"
              style={{ color: NEUMORPHIC_CONFIG.textMuted }}
            >
              Raised (default)
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ color: NEUMORPHIC_CONFIG.text }}
            >
              Extruded from the surface. Use for primary content, headers, and idle controls.
            </p>
          </NeumorphicCard>

          <NeumorphicCard variant="pressed" size="sm" padding="p-5">
            <h3
              className="text-xs font-semibold tracking-widest uppercase mb-3"
              style={{ color: NEUMORPHIC_CONFIG.accent }}
            >
              Pressed (inset)
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ color: NEUMORPHIC_CONFIG.text }}
            >
              Carved into the surface. Use for inputs, tracks, and selected/active states.
            </p>
          </NeumorphicCard>

          <NeumorphicCard variant="raised" size="lg" padding="p-5">
            <h3
              className="text-xs font-semibold tracking-widest uppercase mb-3"
              style={{ color: NEUMORPHIC_CONFIG.textMuted }}
            >
              Large raised
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ color: NEUMORPHIC_CONFIG.text }}
            >
              Bigger shadow depth for hero sections or feature blocks.
            </p>
          </NeumorphicCard>
        </div>

        {/* Footer note */}
        <p
          className="text-center text-[10px] tracking-widest uppercase mt-12"
          style={{ color: NEUMORPHIC_CONFIG.textMuted }}
        >
          yellowwhite · neumorphic design system · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
