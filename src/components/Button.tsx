import { NEUMORPHIC_CONFIG } from './neumorphic-config';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'pink' | 'cyan' | 'pressed' | 'navy';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Button — Brand v3 FLAT.
 *
 * v3 removes the glossy gradient language: every variant is a solid fill
 * with a hairline edge. No extruded shadows, no glow.
 *  - primary:  金刚金 fill, 奶油白 type
 *  - navy:     藏蓝 fill, 奶油白 type
 *  - pink:     暖陶橙 fill (v3's warm accent)
 *  - secondary: white surface + hairline
 */
export function Button({
  variant = 'primary',
  size = 'medium',
  children,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
}: ButtonProps) {

  const baseStyles = 'relative font-semibold transition-colors inline-flex items-center justify-center';

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary': // 金刚金 — main action
        return `
          bg-brand-v3-gold
          text-brand-v3-navy
          hover:bg-brand-v3-gold/90
          active:opacity-90
        `;
      case 'navy': // 藏蓝 — premium secondary action
        return `
          bg-brand-v3-navy
          text-brand-v3-cream
          hover:bg-brand-v3-navy/90
          active:opacity-90
        `;
      case 'pink': // 暖陶橙 — was pink in v2, now the warm accent
        return `
          bg-brand-v3-terracotta
          text-brand-v3-cream
          hover:bg-brand-v3-terracotta/90
          active:opacity-90
        `;
      case 'cyan': // 藏蓝 — tertiary neutral
        return `
          bg-brand-v3-navy
          text-brand-v3-cream
          hover:bg-brand-v3-navy/90
          active:opacity-90
        `;
      case 'secondary': // flat white surface + hairline
        return `
          bg-brand-v3-surface
          text-brand-v3-navy
          hover:border-brand-v3-gold/60
          active:opacity-90
        `;
      case 'pressed': // flat muted surface
        return `
          bg-brand-v3-cream
          text-brand-v3-navy/60
        `;
      default:
        return '';
    }
  };

  const sizeStyles = {
    small: 'px-4 py-2 text-sm rounded-neumo-button min-h-[40px]',
    medium: 'px-6 py-3 text-base rounded-neumo-button min-h-[48px]',
    large: 'px-8 py-4 text-lg rounded-neumo-card min-h-[56px]'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${getVariantStyles()}
        ${variant === 'secondary' ? 'border border-brand-v3-gold/25' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={{
        backgroundColor: variant === 'secondary' ? NEUMORPHIC_CONFIG.surface : undefined,
      }}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
}
