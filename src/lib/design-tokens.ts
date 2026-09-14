/**
 * 金刚宠 · Design Tokens (Brand v2 — 2026-09-15)
 * ===============================================
 * 10-color system designed in conversation with the user (道高).
 * Goal: communicate 亲和 / 专业 / Effortless / Reliable / Clean & tidy
 * to the 90后/00后 中山中产 target customer.
 *
 * Usage in components:
 *   import { brand } from '@/lib/design-tokens';
 *   <div style={{ background: brand.bgPage }}> ... </div>
 *
 * For Tailwind, use the `brand-v2-*` classes generated in tailwind.config.ts:
 *   <button className="bg-brand-v2-gold text-brand-v2-navy">Confirm</button>
 *
 * Hex values are authoritative. Do not inline hex codes elsewhere.
 */

export const brand = {
  /** Primary brand color · Sparkle Gold (logo match) */
  gold:      '#D4A24C',
  /** Secondary · Deep Navy (trust, professional, reliable) */
  navy:      '#1B3A5C',
  /** Functional · Success (booking confirmed, tier-up) */
  success:   '#2E7D32',
  /** Functional · Warning (slot conflict, 50-day dormancy) */
  warning:   '#E67E22',
  /** Functional · Error (payment failed, validation) */
  error:     '#C62828',
  /** Functional · Info (verification sent, tips) */
  info:      '#0A66C2',
  /** Background · Page (dominant canvas) */
  bgPage:    '#FAF6EE',
  /** Background · Section alt (alternating sections) */
  bgSection: '#F0E8D6',
  /** Background · Hero / banner (top banners, tier-up ribbons) */
  bgHero:    '#F5E6C8',
} as const;

/** Tailwind class name map — mirrors `tailwind.config.ts` extend.colors.brandV2 */
export const brandClass = {
  gold:      'bg-brand-v2-gold text-brand-v2-gold border-brand-v2-gold',
  navy:      'bg-brand-v2-navy text-brand-v2-navy border-brand-v2-navy',
  success:   'bg-brand-v2-success text-brand-v2-success border-brand-v2-success',
  warning:   'bg-brand-v2-warning text-brand-v2-warning border-brand-v2-warning',
  error:     'bg-brand-v2-error text-brand-v2-error border-brand-v2-error',
  info:      'bg-brand-v2-info text-brand-v2-info border-brand-v2-info',
  bgPage:    'bg-brand-v2-bg-page',
  bgSection: 'bg-brand-v2-bg-section',
  bgHero:    'bg-brand-v2-bg-hero',
} as const;

/** Convenience: CSS variables for inline styles */
export const brandCssVar = {
  gold:      'var(--brand-gold)',
  navy:      'var(--brand-navy)',
  success:   'var(--brand-success)',
  warning:   'var(--brand-warning)',
  error:     'var(--brand-error)',
  info:      'var(--brand-info)',
  bgPage:    'var(--brand-bg-page)',
  bgSection: 'var(--brand-bg-section)',
  bgHero:    'var(--brand-bg-hero)',
} as const;

export type BrandToken = keyof typeof brand;
export default brand;