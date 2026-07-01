import { useState, useEffect, useCallback } from 'react';
import { Booking, BookingStatus, ServiceType } from '@/types/booking';
import { 
  getBookings, 
  createBooking, 
  updateBooking, 
  calculateProgress, 
  getCurrentStepName, 
  calculateETA,
  getStepsWithStatus,
  getBookingCounts,
  startStepRotationTimer,
  generateOwnerLink,
  shareToWeChat
} from '@/lib/storage';
import { GROOMING_STAGES } from '@/lib/constants';
import { sendWeChatNotification, sendStatusUpdate } from '@/lib/feishu';

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ pending: 0, accepted: 0, inService: 0 });

  // Start timer when hook mounts
  useEffect(() => {
    startStepRotationTimer();
    
    // Listen for booking updates
    const handleUpdate = () => {
      setBookings(getBookings());
      setCounts(getBookingCounts());
    };
    
    window.addEventListener('bookingsUpdated', handleUpdate);
    
    // Initial load
    const data = getBookings();
    setBookings(data);
    setCounts(getBookingCounts());
    setLoading(false);
    
    return () => {
      window.removeEventListener('bookingsUpdated', handleUpdate);
    };
  }, []);

  const handleCreateBooking = useCallback(async (data: {
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
  }) => {
    const booking = createBooking(data);
    setBookings(prev => [...prev, booking]);
    setCounts(getBookingCounts());
    return booking;
  }, []);

  const handleUpdateBooking = useCallback(async (id: string, updates: Partial<Booking>) => {
    const updated = updateBooking(id, updates);
    if (updated) {
      setBookings(prev => prev.map(b => b.id === id ? updated! : b));
      setCounts(getBookingCounts());
    }
    return updated;
  }, []);

  const handleAcceptBooking = useCallback(async (id: string) => {
    const updated = await handleUpdateBooking(id, {
      status: BookingStatus.ACCEPTED,
      currentPhase: '等待到店'
    });
    
    // Send WeChat notification (simulated)
    if (updated) {
      await sendWeChatNotification(id, updated.phone || '');
      await handleUpdateBooking(id, { wechatNoticeSent: true });
    }
  }, [handleUpdateBooking]);

  const handlePushToServiceBoard = useCallback(async (id: string) => {
    await handleUpdateBooking(id, {
      displayInServiceList: true,
      currentPhase: '等待开始服务'
    });
  }, [handleUpdateBooking]);

  const handleStartService = useCallback(async (id: string) => {
    await handleUpdateBooking(id, {
      status: BookingStatus.IN_SERVICE,
      currentPhase: '服务进行中',
      currentStep: 1,
      serviceStartedAt: new Date().toISOString(),
      isPaused: false
    });
  }, [handleUpdateBooking]);

  const handlePauseService = useCallback(async (id: string) => {
    const booking = bookings.find(b => b.id === id);
    if (booking) {
      await handleUpdateBooking(id, {
        isPaused: !booking.isPaused,
        currentPhase: !booking.isPaused ? '服务暂停' : '服务进行中'
      });
    }
  }, [bookings, handleUpdateBooking]);

  const handleFinishService = useCallback(async (id: string) => {
    const booking = bookings.find(b => b.id === id);
    if (booking) {
      const steps = GROOMING_STAGES[booking.serviceType];
      await handleUpdateBooking(id, {
        status: BookingStatus.COMPLETED,
        currentPhase: '服务完成',
        currentStep: steps.length
      });
      
      // Send completion notification
      await sendStatusUpdate(id, '服务已完成，欢迎来接您的宠物！', booking.phone || '');
    }
  }, [bookings, handleUpdateBooking]);

  const handleSendOwnerLink = useCallback(async (id: string) => {
    const link = generateOwnerLink(id);
    const success = await shareToWeChat(link);
    if (success) {
      alert('链接已复制到剪贴板，请粘贴到微信发送给宠主！');
    }
    return link;
  }, []);

  const pendingBookings = bookings.filter(b => b.status === BookingStatus.PENDING);
  const acceptedBookings = bookings.filter(b => b.status === BookingStatus.ACCEPTED);
  const activeBookings = bookings.filter(b => b.displayInServiceList && b.status !== BookingStatus.COMPLETED);
  const completedBookings = bookings.filter(b => b.status === BookingStatus.COMPLETED);

  return {
    bookings,
    pendingBookings,
    acceptedBookings,
    activeBookings,
    completedBookings,
    counts,
    loading,
    createBooking: handleCreateBooking,
    updateBooking: handleUpdateBooking,
    acceptBooking: handleAcceptBooking,
    pushToServiceBoard: handlePushToServiceBoard,
    startService: handleStartService,
    pauseService: handlePauseService,
    finishService: handleFinishService,
    sendOwnerLink: handleSendOwnerLink,
    calculateProgress,
    getCurrentStepName,
    calculateETA,
    getStepsWithStatus,
    getBookingCounts,
    refreshCounts: () => setCounts(getBookingCounts())
  };
}

export function useBooking(id: string) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStepName, setCurrentStepName] = useState('');
  const [eta, setEta] = useState(0);
  const [steps, setSteps] = useState<Array<{name: string; duration: number; status: 'done' | 'active' | 'pending'}>>([]);
  const [loading, setLoading] = useState(true);

  const fetchBooking = async () => {
    try {
      const res = await fetch(`/api/bookings?id=${encodeURIComponent(id)}`);
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (error) {
      console.error('Failed to fetch booking:', error);
    }
    return null;
  };

  useEffect(() => {
    const loadBooking = async () => {
      setLoading(true);
      let data = getBookingById(id);
      
      if (!data) {
        data = await fetchBooking();
      }
      
      if (data) {
        setBooking(data);
        setProgress(calculateProgress(data));
        setCurrentStepName(getCurrentStepName(data));
        setEta(calculateETA(data));
        setSteps(getStepsWithStatus(data));
      }
      setLoading(false);
    };

    if (id) {
      loadBooking();
    }
  }, [id]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await fetchBooking();
      if (data) {
        setBooking(data);
        setProgress(calculateProgress(data));
        setCurrentStepName(getCurrentStepName(data));
        setEta(calculateETA(data));
        setSteps(getStepsWithStatus(data));
      }
    }, 15000);

    const handleUpdate = () => {
      const data = getBookingById(id);
      if (data) {
        setBooking(data);
        setProgress(calculateProgress(data));
        setCurrentStepName(getCurrentStepName(data));
        setEta(calculateETA(data));
        setSteps(getStepsWithStatus(data));
      }
    };
    
    window.addEventListener('bookingsUpdated', handleUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener('bookingsUpdated', handleUpdate);
    };
  }, [id]);

  return {
    booking,
    progress,
    currentStepName,
    eta,
    steps,
    loading
  };
}

function getBookingById(id: string): Booking | undefined {
  return getBookings().find(b => b.id === id);
}
