import { GROOMING_STAGES } from './constants';
import { BookingStatus, ServiceType } from '@/types/booking';

/** 门店联系方式（来自店主上载嘅海报）。wechat 留空 = 唔显示。 */
export const STORE_INFO = {
  name: '金刚宠',
  phone: '189 3874 0443',
  address: '中山市西区街道蓝波路9号 ART印象岐江2号楼8-9卡',
  wechat: '',
};

export interface Eta {
  started: boolean;
  remainingMinutes: number;
  totalMinutes: number;
}

/**
 * 推算仲有几耐搞掂。优先用飞书存咗嘅 progress（0-100），
 * 冇先用 currentStep 加埋剩低步骤嘅 durationMinutes。寄养唔计。
 */
export function estimateRemaining(b: {
  serviceType: string;
  currentStep?: number;
  progress?: number | null;
  status?: string;
}): Eta | null {
  if (b.serviceType === ServiceType.BOARDING) return null;
  const steps = GROOMING_STAGES[b.serviceType as ServiceType];
  if (!steps) return null;
  const total = steps.reduce((s, x) => s + x.durationMinutes, 0);
  if (b.status === BookingStatus.COMPLETED) return { started: true, remainingMinutes: 0, totalMinutes: total };
  if (b.status === BookingStatus.CANCELLED) return null;
  const p = typeof b.progress === 'number' && Number.isFinite(b.progress) ? b.progress : null;
  if (p !== null && p > 0) {
    const pct = Math.min(100, p);
    return { started: true, remainingMinutes: Math.round(total * (1 - pct / 100)), totalMinutes: total };
  }
  const step = b.currentStep ?? 0;
  if (step >= 1) {
    const rest = steps.slice(step - 1).reduce((s, x) => s + x.durationMinutes, 0);
    return { started: true, remainingMinutes: rest, totalMinutes: total };
  }
  return { started: false, remainingMinutes: total, totalMinutes: total };
}

/** 状态链接 + 话术，员工直接贴落微信。 */
export function statusShareText(origin: string, petName: string, id: string): string {
  return `${petName}的洗护进度：${origin}/status?booking=${encodeURIComponent(id)}`;
}
