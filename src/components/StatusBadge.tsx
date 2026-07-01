interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    // Amber - pending review
    '待审核': 'bg-accent-amber/25 text-accent-amberDark shadow-neumo-pressed-sm',
    // Pink - accepted/awaiting (enhanced presence)
    '已接受': 'bg-accent-pink/30 text-pink-700 shadow-neumo-pressed-sm',
    // Pink - in service (enhanced presence)
    '服务中': 'bg-accent-pink/35 text-pink-600 shadow-neumo-pressed-sm',
    // Barley white - completed
    '已完成': 'bg-accent-cyan/40 text-amber-800 shadow-neumo-pressed-sm',
    // Red - rejected
    '已拒绝': 'bg-red-100 text-red-500 shadow-neumo-pressed-sm',
    // Yellow - paused
    '服务暂停': 'bg-yellow-100 text-yellow-600 shadow-neumo-pressed-sm',
    // Pink - waiting for arrival (enhanced presence)
    '等待到店': 'bg-accent-pink/30 text-pink-700 shadow-neumo-pressed-sm',
    // Purple - store evaluation
    '到店评估': 'bg-purple-100 text-purple-600 shadow-neumo-pressed-sm'
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
