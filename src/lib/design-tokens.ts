/**
 * 金刚宠 Design Tokens — Brand v3 · 暖陶橙 (2026-11-02)
 * ===============================================
 * 5 primary colours + 4 functional colours.
 * Flat design system: NO neumorphic shadows, NO glow, NO gradients-as-decoration.
 *
 * Goal: 专业 · 可信赖 · 有温度 for 90后/00后 中山中产.
 *
 * Usage in components:
 *   import { brand } from '@/lib/design-tokens';
 *   <div style={{ background: brand.cream }}> ... </div>
 *
 * For Tailwind, use the `brand-v3-*` classes generated in tailwind.config.ts:
 *   <button className="bg-brand-v3-gold text-brand-v3-navy">Confirm</button>
 *
 * Hex values are authoritative. Do not inline hex codes elsewhere.
 */

export const brand = {
  /** 奶油白 · Cream — 松弛的容器 (背景色 / light-mode canvas) */
  cream:      '#FAF6EE',
  /** 卡片面 · Surface — 白底卡面，浮在奶油白之上 */
  surface:    '#FFFFFF',
  /** 藏蓝 · Deep Navy — 专业与信任 (主色, ~72%) */
  navy:       '#1B3A5C',
  /** 金刚金 · King Kong Gold — 克制的精致 (辅助色, ~20%) */
  gold:       '#E2BC6E',
  /** 近黑 · Near Black — 仪式与重心 */
  ink:        '#1A1714',
  /** 暖陶橙 · Warm Terracotta — 温暖·亲切·陪伴 (点缀色, 常规 ≤8%, 会员升级/限定活动 10–12%) */
  terracotta: '#C97B5A',

  /** Functional · 成功 (成功 / 完成 / 正常) */
  success:    '#22C55E',
  /** Functional · 警告 (提醒 / 待处理) */
  warning:    '#F59E0B',
  /** Functional · 错误 (错误 / 失败) */
  error:      '#EF4444',
  /** Functional · 链接 (链接 / 交互 / 重点) */
  info:       '#2563EB',
} as const;

/**
 * Mode mapping — light / dark use the SAME brand identity,
 * only the canvas flips. Functional colours stay identical
 * so status recognition never changes.
 */
export const brandMode = {
  light: {
    canvas: brand.cream,   // #FAF6EE
    surface: brand.surface,
    text: brand.navy,
    textMuted: '#6B6157',
    border: '#E6DCCB',
  },
  dark: {
    canvas: brand.navy,    // #1B3A5C
    surface: '#24476D',    // one step above canvas
    text: brand.cream,
    textMuted: '#B6C4D4',
    border: 'rgba(226,188,110,0.28)',
  },
} as const;

/** Tailwind class name map — mirrors `tailwind.config.ts` extend.colors.brandV3 */
export const brandClass = {
  cream:      'bg-brand-v3-cream text-brand-v3-cream border-brand-v3-cream',
  surface:    'bg-brand-v3-surface text-brand-v3-surface border-brand-v3-surface',
  navy:       'bg-brand-v3-navy text-brand-v3-navy border-brand-v3-navy',
  gold:       'bg-brand-v3-gold text-brand-v3-gold border-brand-v3-gold',
  ink:        'bg-brand-v3-ink text-brand-v3-ink border-brand-v3-ink',
  terracotta: 'bg-brand-v3-terracotta text-brand-v3-terracotta border-brand-v3-terracotta',
  success:    'bg-brand-v3-success text-brand-v3-success border-brand-v3-success',
  warning:    'bg-brand-v3-warning text-brand-v3-warning border-brand-v3-warning',
  error:      'bg-brand-v3-error text-brand-v3-error border-brand-v3-error',
  info:       'bg-brand-v3-info text-brand-v3-info border-brand-v3-info',
} as const;

/** Convenience: CSS variables for inline styles */
export const brandCssVar = {
  cream:      'var(--brand-cream)',
  surface:    'var(--brand-surface)',
  navy:       'var(--brand-navy)',
  gold:       'var(--brand-gold)',
  ink:        'var(--brand-ink)',
  terracotta: 'var(--brand-terracotta)',
  success:    'var(--brand-success)',
  warning:    'var(--brand-warning)',
  error:      'var(--brand-error)',
  info:       'var(--brand-info)',
} as const;

/**
 * Colour ratio guard — the V3 system has a strict distribution.
 * navy ~72% · gold ~20% · terracotta ~8% · cream canvas.
 * terracotta may go to 10–12% only for 会员升级 / 限定活动 surfaces.
 */
export const brandRatio = {
  navy: 0.72,
  gold: 0.20,
  terracotta: 0.08,
  terracottaPromo: 0.12,
} as const;

export type BrandToken = keyof typeof brand;
export default brand;
