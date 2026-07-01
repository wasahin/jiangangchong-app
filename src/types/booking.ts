export enum BookingStatus {
  PENDING = '待审核',
  ACCEPTED = '已接受',
  IN_SERVICE = '服务中',
  COMPLETED = '已完成',
  CANCELLED = '已取消'
}

export enum ServiceType {
  PREMIUM_WASH = '精致洗',
  STANDARD_WASH = '标准洗',
  GROOMING = '美容'
}

export interface WeightRange {
  min: number;
  max: number;
  label: string;
}

export interface ServiceStep {
  id: number;
  name: string;
  durationMinutes: number;
}

export interface ServicePhase {
  id: number;
  name: string;
  steps: ServiceStep[];
  estimatedMinutes: number;
}

export interface Booking {
  id: string;
  ownerName: string;
  phone?: string;
  petName: string;
  serviceType: ServiceType;
  weightRange: WeightRange;
  bookingDateTime: string;
  vaccineDate?: string;
  outsideGroomed: boolean;
  emotionStable: boolean;
  notes?: string;
  status: BookingStatus;
  currentPhase: string;
  currentStep: number;
  serviceStartedAt?: string;
  isPaused?: boolean;
  wechatNoticeSent: boolean;
  displayInServiceList: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingRequest {
  ownerName: string;
  phone?: string;
  petName: string;
  serviceType: ServiceType;
  weightRange: string;
  bookingDate: string;
  bookingTime: string;
  vaccineDate?: string;
  outsideGroomed: string;
  emotionStable: string;
  notes?: string;
}
