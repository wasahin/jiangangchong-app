import { ServiceStep, ServiceType } from '@/types/booking';

export const WEIGHT_RANGES = [
  { min: 0, max: 5, label: '5kg以下' },
  { min: 5, max: 10, label: '5–10kg' },
  { min: 10, max: 999, label: '10kg以上' }
];

export const GROOMING_STAGES: Record<ServiceType, ServiceStep[]> = {
  [ServiceType.PREMIUM_WASH]: [
    { id: 1, name: '全身吹毛检查', durationMinutes: 8 },
    { id: 2, name: '脚底剃毛', durationMinutes: 5 },
    { id: 3, name: '磨指甲', durationMinutes: 5 },
    { id: 4, name: '剃腹底毛&屁屁周边', durationMinutes: 2 },
    { id: 5, name: '清理耳朵&掏耳朵', durationMinutes: 10 },
    { id: 6, name: '刷牙', durationMinutes: 2 },
    { id: 7, name: '第一遍清洗', durationMinutes: 8 },
    { id: 8, name: '第二遍清洗', durationMinutes: 8 },
    { id: 9, name: '上护毛素', durationMinutes: 7 },
    { id: 10, name: '吹干毛发', durationMinutes: 20 }
  ],
  [ServiceType.STANDARD_WASH]: [
    { id: 1, name: '全身吹毛检查', durationMinutes: 8 },
    { id: 2, name: '脚底剃毛', durationMinutes: 5 },
    { id: 3, name: '磨指甲', durationMinutes: 5 },
    { id: 4, name: '剃腹底毛&屁屁周边', durationMinutes: 2 },
    { id: 5, name: '清理耳朵&掏耳朵', durationMinutes: 10 },
    { id: 6, name: '刷牙', durationMinutes: 2 },
    { id: 7, name: '第一遍清洗', durationMinutes: 8 },
    { id: 8, name: '第二遍清洗', durationMinutes: 8 },
    { id: 9, name: '上护毛素', durationMinutes: 7 },
    { id: 10, name: '吹干毛发', durationMinutes: 20 }
  ],
  [ServiceType.GROOMING]: [
    { id: 1, name: '全身吹毛检查', durationMinutes: 8 },
    { id: 2, name: '脚底剃毛', durationMinutes: 5 },
    { id: 3, name: '磨指甲', durationMinutes: 5 },
    { id: 4, name: '剃腹底毛&屁屁周边', durationMinutes: 2 },
    { id: 5, name: '清理耳朵&掏耳朵', durationMinutes: 10 },
    { id: 6, name: '刷牙', durationMinutes: 2 },
    { id: 7, name: '第一遍清洗', durationMinutes: 8 },
    { id: 8, name: '第二遍清洗', durationMinutes: 8 },
    { id: 9, name: '吹干毛发', durationMinutes: 20 },
    { id: 10, name: '剪毛', durationMinutes: 60 },
    { id: 11, name: '完成出品', durationMinutes: 0 }
  ],
  // 寄养唔系洗护流程，只有「寄养中」一个状态。
  // durationMinutes 用 1440（一晚）而唔係 0：进度计算会除以呢个分钟数，
  // 0 会令进度显示成 NaN%。进度条按 24 小时慢慢填满，当作「已经寄养咗几耐」。
  [ServiceType.BOARDING]: [
    { id: 1, name: '寄养中', durationMinutes: 1440 }
  ]
};

export const PHASES = [
  { id: 0, name: '等待审核' },
  { id: 1, name: '等待到店' },
  { id: 2, name: '到店评估' },
  { id: 3, name: '服务进行中' },
  { id: 4, name: '服务完成' }
];
