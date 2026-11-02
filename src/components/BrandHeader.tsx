interface BrandHeaderProps {
  className?: string;
}

/**
 * BrandHeader — the official 金刚宠 logo.
 *
 * Source artwork: public/logo-jingangchong.png, derived from
 * `D:\金刚宠\pet business logo\金刚宠 final\金刚宠 final jpg.jpg`.
 *
 * This is the shop's fixed brand asset. Never substitute a drawn stand-in,
 * a different paw, or any other mark — if the artwork changes, replace the
 * source file and re-derive the PNG rather than redrawing the logo.
 */
export function BrandHeader({ className = '' }: BrandHeaderProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src="/logo-jingangchong.png"
        alt="金刚宠"
        className="h-[72px] w-auto select-none"
        draggable={false}
      />
    </div>
  );
}
