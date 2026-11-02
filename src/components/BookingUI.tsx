import React from 'react';

/**
 * Brand v3 · Booking UI Components
 * =================================
 * Six tokens straight from the V3 VI manual (page 10):
 *   avatar-card 120x120 · slot-card 280x96 · time-bar 360x48
 *   member-badge 160x56 · progress-ring 100x100 · task-capsule 220x56
 *
 * Flat system: white surface on cream canvas, hairline borders,
 * 藏蓝 carries structure, 金刚金 carries warmth, 暖陶橙 is the accent.
 */

/* ------------------------------------------------------------------ */
/* 金刚爪超级符号 — Golden Paw Super-Symbol                            */
/* ------------------------------------------------------------------ */

export const PAW_SIZES = [128, 64, 48, 32, 24, 16] as const;
export const PAW_ROTATIONS = [0, 15, -15, 30, 45] as const;

export function GoldenPaw({
  size = 32,
  rotation = 0,
  color = 'var(--brand-gold)',
  className = '',
  title,
}: {
  size?: number;
  rotation?: number;
  color?: string;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      className={`paw-symbol ${className}`}
      style={{
        transform: `rotate(${rotation}deg)`,
        color,
        display: 'inline-block',
      }}
    >
      <g fill="currentColor">
        {/* main pad */}
        <path d="M50 52c-13 0-24 9-24 20 0 9 7 14 15 14 4 0 6-2 9-2s5 2 9 2c8 0 15-5 15-14 0-11-11-20-24-20z" />
        {/* toes */}
        <ellipse cx="20" cy="42" rx="9" ry="11" transform="rotate(-18 20 42)" />
        <ellipse cx="40" cy="26" rx="9" ry="11.5" />
        <ellipse cx="60" cy="26" rx="9" ry="11.5" />
        <ellipse cx="80" cy="42" rx="9" ry="11" transform="rotate(18 80 42)" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* 功能性提示符号 — Functional glyphs                                   */
/* ------------------------------------------------------------------ */

/**
 * WarningGlyph — flat triangle-and-exclamation mark.
 * Replaces the v2 emoji (⚠️ / 📌) so notice chips carry brand colour
 * instead of a system-coloured emoji glyph.
 */
export function WarningGlyph({
  size = 14,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      style={{ flexShrink: 0 }}
    >
      <path d="M12 3.6L22 20.4H2L12 3.6z" />
      <path d="M12 10v4.3" />
      <circle cx="12" cy="17.1" r="0.95" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* 品牌线性图标 — Brand line icons (navy ring + gold line)             */
/* ------------------------------------------------------------------ */

export type BrandIconName =
  | 'pet' | 'star' | 'heart' | 'medal' | 'calendar'
  | 'grooming' | 'store' | 'shop';

const ICON_PATHS: Record<BrandIconName, React.ReactNode> = {
  pet: (
    <>
      <ellipse cx="32" cy="34" rx="4.5" ry="6" />
      <ellipse cx="44" cy="29" rx="4.5" ry="6" />
      <ellipse cx="56" cy="29" rx="4.5" ry="6" />
      <ellipse cx="68" cy="34" rx="4.5" ry="6" />
      <path d="M50 40c-7 0-12 5-12 11 0 5 4 7 8 7 2 0 3-1 4-1s2 1 4 1c4 0 8-2 8-7 0-6-5-11-12-11z" />
    </>
  ),
  star: <path d="M50 24l7.5 16 17.5 2.2-12.8 12 3.3 17.3L50 63l-15.5 8.5 3.3-17.3-12.8-12L42.5 40z" />,
  heart: <path d="M50 76S24 60 24 43c0-8 6-13 13-13 5 0 10 3 13 8 3-5 8-8 13-8 7 0 13 5 13 13 0 17-26 33-26 33z" />,
  medal: (
    <>
      <circle cx="50" cy="44" r="16" />
      <path d="M38 58l-8 22 20-9 20 9-8-22" />
      <path d="M50 38l2.6 5.6 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6-4.4-4.2 6-.8z" />
    </>
  ),
  calendar: (
    <>
      <rect x="24" y="30" width="52" height="46" rx="5" />
      <path d="M24 42h52M36 24v12M64 24v12" />
    </>
  ),
  grooming: (
    <>
      <circle cx="36" cy="36" r="9" />
      <circle cx="64" cy="36" r="9" />
      <path d="M36 45v22M64 45v22" />
    </>
  ),
  store: (
    <>
      <path d="M22 42l6-18h44l6 18" />
      <path d="M26 42v32h48V42" />
      <path d="M42 74V54h16v20" />
    </>
  ),
  shop: (
    <>
      <path d="M26 38h48l-4 34H30z" />
      <path d="M38 38V30a12 12 0 0124 0v8" />
    </>
  ),
};

export function BrandIcon({
  name,
  size = 56,
  className = '',
}: {
  name: BrandIconName;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`icon-ring ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        width={size * 0.58}
        height={size * 0.58}
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {ICON_PATHS[name]}
      </svg>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* 标签 — Tags                                                         */
/* ------------------------------------------------------------------ */

export type BrandTagName = '会员专享' | '小游戏' | '活动' | '限定活动';

const TAG_STYLE: Record<BrandTagName, { bg: string; fg: string }> = {
  '会员专享': { bg: '#1B3A5C', fg: '#FAF6EE' },
  '小游戏':   { bg: '#E2BC6E', fg: '#1B3A5C' },
  '活动':     { bg: '#1B3A5C', fg: '#FAF6EE' },
  '限定活动': { bg: '#C97B5A', fg: '#FAF6EE' },
};

export function BrandTag({ label, className = '' }: { label: BrandTagName; className?: string }) {
  const s = TAG_STYLE[label];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${className}`}
      style={{ background: s.bg, color: s.fg }}
    >
      <GoldenPaw size={14} color={s.fg} />
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* 1. Avatar Card — 头像卡片 120x120                                   */
/* ------------------------------------------------------------------ */

export function AvatarCard({
  src,
  alt,
  name,
  meta,
  size = 120,
}: {
  src?: string;
  alt?: string;
  name: string;
  meta?: string;
  size?: number;
}) {
  return (
    <div
      className="bg-brand-v3-surface rounded-xl p-3 flex flex-col items-center text-center"
      style={{ width: size, border: '1px solid #E6DCCB' }}
    >
      <div
        className="rounded-full overflow-hidden bg-brand-v3-cream flex items-center justify-center"
        style={{ width: size - 48, height: size - 48 }}
      >
        {src ? (
          <img src={src} alt={alt ?? name} className="w-full h-full object-cover" />
        ) : (
          <GoldenPaw size={40} />
        )}
      </div>
      <p className="mt-2 text-sm font-semibold text-brand-v3-navy truncate w-full">{name}</p>
      {meta && <p className="text-[11px] text-brand-v3-navy/55 truncate w-full">{meta}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Booking Slot Card — 预约项目卡片 280x96                          */
/* ------------------------------------------------------------------ */

export function SlotCard({
  title,
  subtitle,
  duration,
  price,
  icon,
  selected = false,
  onClick,
}: {
  title: string;
  subtitle?: string;
  duration?: string;
  price?: string;
  icon?: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-brand-v3-surface rounded-xl p-4 flex items-center gap-3 text-left w-full"
      style={{
        minHeight: 96,
        border: selected ? '1.5px solid #E2BC6E' : '1px solid #E6DCCB',
      }}
    >
      {icon ?? <BrandIcon name="grooming" size={44} />}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-brand-v3-navy truncate">{title}</p>
        {subtitle && <p className="text-xs text-brand-v3-navy/55 truncate mt-0.5">{subtitle}</p>}
        {duration && (
          <p className="text-[11px] text-brand-v3-navy/45 mt-1 flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-brand-v3-gold" />
            {duration}
          </p>
        )}
      </div>
      {price && (
        <span className="text-base font-bold text-brand-v3-navy shrink-0">{price}</span>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Appointment Time Bar — 时间选择条 360x48                         */
/* ------------------------------------------------------------------ */

export function TimeBar({
  slots,
  value,
  onChange,
}: {
  slots: string[];
  value?: string;
  onChange?: (slot: string) => void;
}) {
  return (
    <div
      className="bg-brand-v3-surface rounded-full p-1 flex items-center gap-1 overflow-x-auto"
      style={{ minHeight: 48, border: '1px solid #E6DCCB' }}
    >
      {slots.map((s) => {
        const on = s === value;
        return (
          <button
            key={s}
            onClick={() => onChange?.(s)}
            className="shrink-0 rounded-full px-5 text-sm font-semibold transition-colors"
            style={{
              height: 40,
              background: on ? '#1B3A5C' : 'transparent',
              color: on ? '#FAF6EE' : '#1B3A5C',
            }}
          >
            {s}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Member Badge — 会员徽章 160x56                                   */
/* ------------------------------------------------------------------ */

export function MemberBadge({
  tier,
  perk,
  tierUp = false,
}: {
  tier: string;
  perk?: string;
  tierUp?: boolean;
}) {
  return (
    <div
      className="rounded-full flex items-center gap-2.5 px-4"
      style={{
        minHeight: 56,
        minWidth: 160,
        background: tierUp ? '#C97B5A' : '#F5E9CE',
        border: tierUp ? 'none' : '1px solid rgba(226,188,110,0.5)',
      }}
    >
      <span
        className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: tierUp ? '#FAF6EE' : '#1B3A5C' }}
      >
        <GoldenPaw size={18} color={tierUp ? '#C97B5A' : '#E2BC6E'} />
      </span>
      <div className="min-w-0">
        <p
          className="text-sm font-bold leading-tight truncate"
          style={{ color: tierUp ? '#FAF6EE' : '#1B3A5C' }}
        >
          {tier}
        </p>
        {perk && (
          <p
            className="text-[11px] leading-tight truncate"
            style={{ color: tierUp ? 'rgba(250,246,238,0.82)' : 'rgba(27,58,92,0.6)' }}
          >
            {perk}
          </p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Progress Ring — 进度环 100x100                                   */
/* ------------------------------------------------------------------ */

export function ProgressRing({
  value,
  size = 100,
  label,
}: {
  value: number;
  size?: number;
  label?: string;
}) {
  const pct = Math.max(0, Math.min(1, value));
  const stroke = 9;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F0E8D6" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#E2BC6E"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="relative text-center">
        <div className="text-xl font-bold text-brand-v3-navy leading-none">{label ?? `${Math.round(pct * 100)}%`}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 6. Task Capsule — 任务胶囊 220x56                                   */
/* ------------------------------------------------------------------ */

export function TaskCapsule({
  title,
  meta,
  done = false,
  onClick,
}: {
  title: string;
  meta?: string;
  done?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-brand-v3-surface rounded-full flex items-center gap-3 px-4 text-left"
      style={{ minHeight: 56, minWidth: 220, border: '1px solid #E6DCCB' }}
    >
      <span
        className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
        style={{ background: done ? '#22C55E' : '#F5E9CE' }}
      >
        {done ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FAF6EE" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        ) : (
          <GoldenPaw size={15} color="#E2BC6E" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className="text-sm font-semibold leading-tight truncate"
          style={{ color: done ? 'rgba(27,58,92,0.45)' : '#1B3A5C' }}
        >
          {title}
        </p>
        {meta && (
          <p className="text-[11px] leading-tight truncate" style={{ color: 'rgba(27,58,92,0.5)' }}>
            {meta}
          </p>
        )}
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* 边角装饰 — Corner treatment                                         */
/* ------------------------------------------------------------------ */

export function CornerFrame({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`corner-frame relative ${className}`}>
      {children}
      <GoldenPaw size={14} rotation={-15} className="absolute top-2 left-2" />
      <GoldenPaw size={14} rotation={30} className="absolute bottom-2 right-2" />
    </div>
  );
}
