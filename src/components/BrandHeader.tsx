interface BrandHeaderProps {
  className?: string;
}

/**
 * BrandHeader — Brand v3.
 *
 * Uses the v3 navy dog-head mark. The old amber gradient paw
 * (amberlogo.png) is deprecated: v3 is flat, so the mark sits on
 * the cream canvas with a hairline edge and no drop shadow.
 */
export function BrandHeader({ className = '' }: BrandHeaderProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className="relative w-14 h-14 flex-shrink-0 rounded-full overflow-hidden bg-brand-v3-cream"
        style={{ border: '1px solid #E6DCCB' }}
      >
        <img
          src="/logo-v3.svg"
          alt="金刚宠 Logo"
          className="w-full h-full object-contain p-[6px]"
        />
      </div>
    </div>
  );
}
