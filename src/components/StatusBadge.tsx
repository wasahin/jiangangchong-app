interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  // Brand v2 (2026-09-15) functional color mapping.
  // Functional colors live here so semantic meaning = brand color.
  //   warning (orange) → pending / caution
  //   success (green)  → confirmed / done
  //   info    (blue)   → active / waiting / evaluation
  //   error   (red)    → rejected / failed
  const styles: Record<string, string> = {
    '待审核':   'bg-brand-v2-warning/20 text-brand-v2-warning shadow-neumo-pressed-sm',
    '已接受':   'bg-brand-v2-success/20 text-brand-v2-success shadow-neumo-pressed-sm',
    '服务中':   'bg-brand-v2-info/20 text-brand-v2-info shadow-neumo-pressed-sm',
    '已完成':   'bg-brand-v2-success/15 text-brand-v2-success/80 shadow-neumo-pressed-sm',
    '已拒绝':   'bg-brand-v2-error/15 text-brand-v2-error shadow-neumo-pressed-sm',
    '服务暂停': 'bg-brand-v2-warning/15 text-brand-v2-warning/80 shadow-neumo-pressed-sm',
    '等待到店': 'bg-brand-v2-info/15 text-brand-v2-info shadow-neumo-pressed-sm',
    '到店评估': 'bg-brand-v2-info/15 text-brand-v2-info shadow-neumo-pressed-sm'
  };

  return (
    <span className={`
      inline-flex items-center px-3 py-1 rounded-neumo-pill text-xs font-semibold
      ${styles[status] || 'bg-neumo-light text-gray-500 shadow-neumo-pressed-sm'}
    `}>
      {status}
    </span>
  );
}
