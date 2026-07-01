interface ProgressBarProps {
  percent: number;
  currentStep: string;
  etaMinutes: number;
}

export function ProgressBar({ percent, currentStep, etaMinutes }: ProgressBarProps) {
  return (
    <div className="bg-neumo-surface rounded-neumo-card p-6 shadow-neumo-raised-lg">
      <div className="flex justify-between items-start mb-5">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">洗护进度</p>
          <p className="text-5xl font-bold text-gray-900 tracking-tighter leading-none">
            {Math.round(percent)}%
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">预计完成</p>
          <p className="text-xl font-semibold text-accent-amber">
            {etaMinutes > 0 ? `${etaMinutes}分钟` : '即将完成'}
          </p>
        </div>
      </div>
      
      <div className="relative h-3 bg-neumo-light rounded-full overflow-hidden mb-5 shadow-neumo-pressed-sm">
        <div 
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out
            bg-gradient-to-r from-accent-amber to-accent-amberLight
            shadow-[0_0_12px_rgba(255,165,0,0.4)]"
          style={{ width: `${percent}%` }}
        />
      </div>
      
      <div className="flex items-center gap-4">
        <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-accent-amber to-accent-amberDark shadow-neumo-raised-sm" />
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">当前步骤</p>
          <p className="text-lg font-semibold text-gray-900">{currentStep}</p>
        </div>
      </div>
    </div>
  );
}
