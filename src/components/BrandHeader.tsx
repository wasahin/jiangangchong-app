interface BrandHeaderProps {
  className?: string;
}

export function BrandHeader({ className = '' }: BrandHeaderProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className="relative w-16 h-16 flex-shrink-0 rounded-full overflow-hidden"
        style={{
          // Brand v2: gold-toned shadow (Sparkle Gold #D4A24C, lighter gold #E8C572)
          boxShadow: '6px 6px 12px rgba(212,162,76,0.35), -3px -3px 8px rgba(232,197,114,0.7), inset 1px 1px 3px rgba(255,255,255,0.5)'
        }}
      >
        <img 
          src="/amberlogo.png" 
          alt="金刚宠 Logo" 
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
