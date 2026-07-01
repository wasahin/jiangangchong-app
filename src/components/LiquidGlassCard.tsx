import { NEUMORPHIC_CONFIG } from './neumorphic-config';

interface NeumorphicCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'inset';
}

// Neumorphic Card - main card component for the neumorphic pink theme
export function NeumorphicCard({ 
  children, 
  className = '',
  variant = 'default',
}: NeumorphicCardProps) {
  const shadow = variant === 'inset' 
    ? 'shadow-neumo-pressed-lg' 
    : 'shadow-neumo-raised-lg';

  return (
    <div 
      className={`
        rounded-neumo-card
        bg-neumo-surface
        p-6
        ${shadow}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// Backwards compatibility alias
export const LiquidGlassCard = NeumorphicCard;

// Export GLASS_CONFIG for backwards compatibility
export const GLASS_CONFIG = {
  blur: { light: 12, medium: 24, heavy: 36 },
  saturation: 180,
  borderRadius: 24,
};
