import { describe, it, expect } from 'vitest';
import { estimateRemaining, statusShareText } from '@/lib/eta';

describe('estimateRemaining', () => {
  it('uses stored Feishu progress first', () => {
    // 标准洗 共 75 分钟；40% → 剩 45
    const e = estimateRemaining({ serviceType: '标准洗', currentStep: 1, progress: 40, status: '服务中' });
    expect(e).toEqual({ started: true, remainingMinutes: 45, totalMinutes: 75 });
  });
  it('falls back to remaining step durations', () => {
    // 第 10 步「吹干毛发」20 分钟
    expect(estimateRemaining({ serviceType: '标准洗', currentStep: 10, status: '服务中' })?.remainingMinutes).toBe(20);
  });
  it('is zero when completed and skips boarding', () => {
    expect(estimateRemaining({ serviceType: '美容', status: '已完成' })?.remainingMinutes).toBe(0);
    expect(estimateRemaining({ serviceType: '寄养', currentStep: 1 })).toBeNull();
  });
});

describe('statusShareText', () => {
  it('builds the link from the given origin', () => {
    expect(statusShareText('https://x.dev', '小花', 'BK1')).toBe('小花的洗护进度：https://x.dev/status?booking=BK1');
  });
});
