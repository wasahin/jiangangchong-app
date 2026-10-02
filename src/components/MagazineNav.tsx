'use client';

import React from 'react';

export interface MagazineNavItem {
  /** Display label — usually Chinese with optional separator like " · MENU" */
  label: string;
  /** Optional English caption rendered after the label, in mono uppercase */
  caption?: string;
  /** Anchor href — if omitted, item is rendered as a non-link tag */
  href?: string;
  /** Called on click — useful for in-page section anchors */
  onClick?: (e: React.MouseEvent) => void;
  /** Marks this item as the current page/section */
  active?: boolean;
  /** Opens in new tab (for external tools like pet-health-card.html) */
  external?: boolean;
}

export interface MagazineNavProps {
  items: MagazineNavItem[];
  /** Layout direction. Default horizontal, fits in headers. */
  orientation?: 'horizontal' | 'vertical';
  /** Color tone — light (default for white/cream bg) or dark (for glassy dark headers) */
  tone?: 'light' | 'dark';
  /** Extra classes for the wrapping nav */
  className?: string;
}

/**
 * MagazineNav — horizontal/vertical selection list in editorial TOC style.
 * Pattern: short horizontal line + uppercase tracked label. Active item gets
 * a longer line in brand gold. Hover grows the line subtly.
 *
 * Inspired by brand_book_v3 Issue 03 sidebar TOC.
 */
export function MagazineNav({
  items,
  orientation = 'horizontal',
  tone = 'light',
  className = '',
}: MagazineNavProps) {
  const isHorizontal = orientation === 'horizontal';

  const containerClass = isHorizontal
    ? `flex items-center gap-x-5 gap-y-2 flex-wrap ${className}`
    : `flex flex-col gap-3 ${className}`;

  const itemClass = isHorizontal
    ? 'flex items-center gap-2'
    : 'flex items-center gap-3';

  // Tone-aware colors
  const inactiveText = tone === 'dark'
    ? 'text-white/70 hover:text-white'
    : 'text-gray-500 hover:text-brand-v2-gold';

  const activeText = tone === 'dark'
    ? 'text-white'
    : 'text-brand-v2-gold';

  return (
    <nav
      aria-label="Section navigation"
      className={containerClass}
    >
      {items.map((item, idx) => {
        const isActive = item.active ?? false;
        const textColor = isActive ? activeText : inactiveText;
        const interactiveProps: Record<string, unknown> = {};

        if (item.href) {
          interactiveProps.href = item.href;
          if (item.external) {
            interactiveProps.target = '_blank';
            interactiveProps.rel = 'noopener noreferrer';
          }
        }

        if (item.onClick) {
          interactiveProps.onClick = item.onClick;
        }

        const lineColor = isActive
          ? 'bg-brand-v2-gold'
          : tone === 'dark'
            ? 'bg-white/70 group-hover:bg-white'
            : 'bg-gray-400 group-hover:bg-brand-v2-gold';

        const Tag = (item.href ? 'a' : 'button') as 'a';

        return (
          <Tag
            key={`${item.label}-${idx}`}
            {...interactiveProps}
            className={`group ${itemClass} text-[11px] font-medium uppercase tracking-[0.18em] transition-colors duration-200 ${textColor} ${item.href || item.onClick ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <span
              className={`h-px transition-all duration-300 ${lineColor} ${
                isActive ? 'w-7' : 'w-4 group-hover:w-7'
              }`}
              aria-hidden="true"
            />
            <span className="font-serif-sc whitespace-nowrap text-[10px] lg:text-[11px]">{item.label}</span>
            {item.caption && (
              <span
                className={`font-mono text-[9px] lg:text-[10px] tracking-[0.22em] hidden lg:inline ${isActive ? 'text-brand-v2-gold' : 'text-gray-400'}`}
              >
                · {item.caption}
              </span>
            )}
          </Tag>
        );
      })}
    </nav>
  );
}

export default MagazineNav;