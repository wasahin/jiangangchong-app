import { NEUMORPHIC_CONFIG } from './neumorphic-config';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'pink' | 'cyan' | 'pressed';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({ 
  variant = 'primary', 
  size = 'medium', 
  children, 
  onClick,
  disabled = false,
  className = '',
  type = 'button',
}: ButtonProps) {
  
  const baseStyles = 'relative font-semibold transition-all inline-flex items-center justify-center';
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary': // Amber - main action
        return `
          bg-gradient-to-br from-accent-amber via-accent-amberDark to-accent-amber
          text-white
          shadow-neumo-raised-sm
          hover:shadow-neumo-raised-md
          hover:-translate-y-[1px]
          hover:brightness-105
          active:translate-y-[0.5px]
          active:brightness-95
        `;
      case 'secondary': // Default neumorphic surface
        return `
          bg-neumo-light
          text-gray-700
          shadow-neumo-raised-sm
          hover:shadow-neumo-raised-md
          hover:-translate-y-[1px]
          active:shadow-neumo-pressed-sm
          active:translate-y-[0.5px]
        `;
      case 'pink': // Pink - secondary accent emphasis
        return `
          bg-gradient-to-br from-accent-pink via-[#FF8A8E] to-accent-pink
          text-white
          shadow-neumo-raised-sm
          hover:shadow-neumo-raised-md
          hover:-translate-y-[1px]
          hover:brightness-105
          active:translate-y-[0.5px]
          active:brightness-95
        `;
      case 'cyan': // Barley White - tertiary neutral accent
        return `
          bg-gradient-to-br from-accent-cyan via-[#FFF9E6] to-accent-cyan
          text-amber-900
          shadow-neumo-raised-sm
          hover:shadow-neumo-raised-md
          hover:-translate-y-[1px]
          hover:brightness-105
          active:translate-y-[0.5px]
          active:brightness-95
        `;
      case 'pressed': // Pressed state
        return `
          bg-neumo-light
          text-gray-500
          shadow-neumo-pressed-sm
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
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={{
        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
}
