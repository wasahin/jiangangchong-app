import { Booking, BookingStatus, ServiceType, WeightRange } from '@/types/booking';
import { WEIGHT_RANGES, GROOMING_STAGES } from './constants';

const STORAGE_KEY = 'jingangchong_h5_v2';

let cachedBookings: Booking[] = [];
let timerInterval: NodeJS.Timeout | null = null;
let lastTickTime = Date.now();
let tickCount = 0;
let lastLogTime = Date.now();

// Timer interval in seconds
const TIMER_CHECK_INTERVAL = 1;

export function loadBookings(): Booking[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      cachedBookings = JSON.parse(data);
    }
  } catch {
    cachedBookings = [];
  }
  return cachedBookings;
}

export function saveBookings(bookings: Booking[]): void {
  if (typeof window === 'undefined') return;
  cachedBookings = bookings;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

export function getBookings(): Booking[] {
  if (cachedBookings.length === 0) {
    loadBookings();
  }
  return cachedBookings;
}

export function getBookingById(id: string): Booking | undefined {
  return getBookings().find(b => b.id === id);
}

// Start the timer for auto-rotating steps
export function startStepRotationTimer(): void {
  if (timerInterval) return;
  
  timerInterval = setInterval(() => {
    const now = Date.now();
    const tickDuration = now - lastTickTime;
    const timeSinceLastLog = now - lastLogTime;
    lastTickTime = now;
    tickCount++;

    const bookings = getBookings();
    let hasChanges = false;
    let processedCount = 0;
    let updatedCount = 0;
    
    bookings.forEach(booking => {
      if (
        booking.status === BookingStatus.IN_SERVICE && 
        booking.serviceStartedAt && 
        !booking.isPaused
      ) {
        processedCount++;
        const updatedBooking = calculateCurrentStep(booking);
        if (updatedBooking.currentStep !== booking.currentStep || 
            updatedBooking.currentPhase !== booking.currentPhase) {
          Object.assign(booking, updatedBooking);
          hasChanges = true;
          updatedCount++;
          console.log(`[DOG_ANIMATION] Step updated for ${booking.petName}: step ${booking.currentStep}, phase ${booking.currentPhase}`);
        }
        
        const progress = calculateProgress(booking);
        console.log(`[DOG_ANIMATION] ${booking.petName} progress: ${progress}%, step ${booking.currentStep}`);
      }
    });
    
    if (hasChanges) {
      saveBookings(bookings);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('bookingsUpdated'));
      }
    }

    if (timeSinceLastLog >= 5000) {
      const avgTickDuration = (timeSinceLastLog / tickCount).toFixed(2);
      const fps = (tickCount / (timeSinceLastLog / 1000)).toFixed(2);
      console.log(`[DOG_ANIMATION_STATS] Avg tick: ${avgTickDuration}ms, FPS: ${fps}, Processed: ${processedCount}, Updated: ${updatedCount}`);
      tickCount = 0;
      lastLogTime = now;
    }
  }, TIMER_CHECK_INTERVAL * 1000);
}

export function stopStepRotationTimer(): void {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// Calculate current step based on elapsed time
function calculateCurrentStep(booking: Booking): Partial<Booking> {
  const steps = GROOMING_STAGES[booking.serviceType];
  if (!steps || !booking.serviceStartedAt) {
    return { currentStep: 0, currentPhase: '等待开始' };
  }
  
  const startTime = new Date(booking.serviceStartedAt).getTime();
  const now = Date.now();
  const elapsedMs = now - startTime;
  const elapsedMinutes = elapsedMs / 60000;
  
  let accumulatedMinutes = 0;
  let currentStepIndex = 0;
  
  for (let i = 0; i < steps.length; i++) {
    const stepDuration = steps[i].durationMinutes;
    if (elapsedMinutes < accumulatedMinutes + stepDuration) {
      currentStepIndex = i + 1;
      break;
    }
    accumulatedMinutes += stepDuration;
    
    // If we've completed all steps
    if (i === steps.length - 1) {
      return {
        currentStep: steps.length,
        currentPhase: '服务完成'
      };
    }
  }
  
  // Determine phase based on step
  let phase = '服务进行中';
  if (currentStepIndex <= 6) {
    phase = '前半程 - 准备阶段';
  } else if (currentStepIndex <= steps.length) {
    phase = '后半程 - 清洗护理';
  }
  
  return {
    currentStep: currentStepIndex,
    currentPhase: phase
  };
}

// Generate owner status link
export function generateOwnerLink(bookingId: string): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/status?booking=${encodeURIComponent(bookingId)}`;
}

// Share link to WeChat (copy to clipboard)
export function shareToWeChat(link: string): Promise<boolean> {
  if (typeof navigator === 'undefined') return Promise.resolve(false);
  
  return navigator.clipboard.writeText(link)
    .then(() => true)
    .catch(() => false);
}

export function createBooking(data: {
  ownerName: string;
  phone: string;
  petName: string;
  serviceType: ServiceType;
  weightRange: string;
  bookingDate: string;
  bookingTime: string;
  vaccineDate: string;
  outsideGroomed: string;
  emotionStable: string;
  notes?: string;
}): Booking {
  const bookingId = `BK${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  
  const weightRangeObj: WeightRange = WEIGHT_RANGES.find(w => w.label === data.weightRange) || WEIGHT_RANGES[0];
  
  const booking: Booking = {
    id: bookingId,
    ownerName: data.ownerName,
    phone: data.phone,
    petName: data.petName,
    serviceType: data.serviceType,
    weightRange: weightRangeObj,
    bookingDateTime: `${data.bookingDate} ${data.bookingTime}`,
    vaccineDate: data.vaccineDate,
    outsideGroomed: data.outsideGroomed === 'Yes',
    emotionStable: data.emotionStable === 'Yes',
    notes: data.notes,
    status: BookingStatus.PENDING,
    currentPhase: '等待审核',
    currentStep: 0,
    wechatNoticeSent: false,
    displayInServiceList: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const bookings = getBookings();
  bookings.push(booking);
  saveBookings(bookings);
  
  return booking;
}

export function updateBooking(id: string, updates: Partial<Booking>): Booking | undefined {
  const bookings = getBookings();
  const index = bookings.findIndex(b => b.id === id);
  
  if (index === -1) return undefined;
  
  bookings[index] = {
    ...bookings[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  saveBookings(bookings);
  return bookings[index];
}

export function calculateProgress(booking: Booking): number {
  const steps = GROOMING_STAGES[booking.serviceType];
  if (!steps || booking.currentStep === 0) return 0;
  
  // If service is completed
  if (booking.status === BookingStatus.COMPLETED) return 100;
  
  // Calculate based on current step and elapsed time
  const currentIndex = booking.currentStep - 1;
  if (currentIndex < 0 || currentIndex >= steps.length) return 0;
  
  // Base progress from completed steps
  const completedStepsProgress = (currentIndex / steps.length) * 100;
  
  // If service hasn't started, return 0
  if (!booking.serviceStartedAt) return completedStepsProgress;
  
  // Calculate time-based progress within current step
  const startTime = new Date(booking.serviceStartedAt).getTime();
  const now = Date.now();
  const elapsedMs = now - startTime;
  const elapsedMinutes = elapsedMs / 60000;
  
  // Calculate total time for completed steps
  let completedTime = 0;
  for (let i = 0; i < currentIndex; i++) {
    completedTime += steps[i].durationMinutes;
  }
  
  // Time within current step
  const timeInCurrentStep = elapsedMinutes - completedTime;
  const currentStepDuration = steps[currentIndex].durationMinutes;
  
  // Progress within current step
  const currentStepProgress = Math.min(1, Math.max(0, timeInCurrentStep / currentStepDuration));
  
  // Total progress
  const stepWeight = 100 / steps.length;
  const progress = completedStepsProgress + (currentStepProgress * stepWeight);
  
  return Math.round(Math.min(99, progress)); // Cap at 99% until actually completed
}

export function getCurrentStepName(booking: Booking): string {
  const steps = GROOMING_STAGES[booking.serviceType];
  if (!steps || booking.currentStep === 0) return '等待开始';
  
  const currentIndex = booking.currentStep - 1;
  if (currentIndex < 0) return '等待开始';
  if (currentIndex >= steps.length) return '服务完成';
  
  return steps[currentIndex].name;
}

export function getCurrentStepDuration(booking: Booking): number {
  const steps = GROOMING_STAGES[booking.serviceType];
  if (!steps || booking.currentStep === 0) return 0;
  
  const currentIndex = booking.currentStep - 1;
  if (currentIndex < 0 || currentIndex >= steps.length) return 0;
  
  return steps[currentIndex].durationMinutes;
}

export function calculateETA(booking: Booking): number {
  const steps = GROOMING_STAGES[booking.serviceType];
  if (!steps || !booking.serviceStartedAt) return 0;
  
  if (booking.status === BookingStatus.COMPLETED) return 0;
  
  const startTime = new Date(booking.serviceStartedAt).getTime();
  const now = Date.now();
  const elapsedMs = now - startTime;
  const elapsedMinutes = elapsedMs / 60000;
  
  const currentIndex = booking.currentStep - 1;
  if (currentIndex < 0) {
    // Service not started, return total duration
    return steps.reduce((sum, step) => sum + step.durationMinutes, 0);
  }
  
  // Calculate time for completed steps
  let completedTime = 0;
  for (let i = 0; i < currentIndex; i++) {
    completedTime += steps[i].durationMinutes;
  }
  
  // Time within current step
  const timeInCurrentStep = elapsedMinutes - completedTime;
  const currentStepDuration = steps[currentIndex].durationMinutes;
  
  // Remaining time in current step
  const remainingInCurrentStep = Math.max(0, currentStepDuration - timeInCurrentStep);
  
  // Time for remaining steps
  const remainingStepsTime = steps.slice(currentIndex + 1).reduce((sum, step) => sum + step.durationMinutes, 0);
  
  return Math.round(remainingInCurrentStep + remainingStepsTime);
}

// Get all steps with their status
export function getStepsWithStatus(booking: Booking): Array<{
  name: string;
  duration: number;
  status: 'done' | 'active' | 'pending';
}> {
  const steps = GROOMING_STAGES[booking.serviceType];
  if (!steps) return [];
  
  const currentIndex = booking.currentStep - 1;
  
  return steps.map((step, index) => {
    let status: 'done' | 'active' | 'pending' = 'pending';
    if (index < currentIndex) {
      status = 'done';
    } else if (index === currentIndex) {
      status = 'active';
    }
    return {
      name: step.name,
      duration: step.durationMinutes,
      status
    };
  });
}

// Get counts for dashboard
export function getBookingCounts(): {
  pending: number;
  accepted: number;
  inService: number;
} {
  const bookings = getBookings();
  return {
    pending: bookings.filter(b => b.status === BookingStatus.PENDING).length,
    accepted: bookings.filter(b => b.status === BookingStatus.ACCEPTED).length,
    inService: bookings.filter(b => b.displayInServiceList && b.status !== BookingStatus.COMPLETED).length
  };
}
