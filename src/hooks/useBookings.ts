import { useState, useEffect, useCallback } from 'react';
import { Booking, BookingStatus, ServiceType } from '@/types/booking';
import {
  getBookings,
  persistBooking,
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
import {
  submitBooking,
  fetchStaffBookings,
  updateBookingRemote,
  SubmitBookingPayload,
} from '@/lib/booking-api';

export function useBookings(staffToken?: string | null) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
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

  // 员工端：带 token 时从服务端拉取（跨浏览器/跨设备）
  const loadStaffBookings = useCallback(async (token: string) => {
    try {
      setServerError(null);
      const serverBookings = await fetchStaffBookings(token);
      setBookings(serverBookings);
      setCounts({
        pending: serverBookings.filter(b => b.status === BookingStatus.PENDING).length,
        accepted: serverBookings.filter(b => b.status === BookingStatus.ACCEPTED).length,
        inService: serverBookings.filter(
          b => b.status === BookingStatus.IN_SERVICE || b.displayInServiceList
        ).length,
      });
    } catch (error: any) {
      setServerError(error?.message || '读取预约失败');
    }
  }, []);

  useEffect(() => {
    if (!staffToken) return;
    setLoading(true);
    loadStaffBookings(staffToken).finally(() => setLoading(false));
  }, [staffToken, loadStaffBookings]);

  /**
   * 顾客提交：先由服务端写入飞书并校验，确认成功后才落地本机并回传。
   * 失败会抛错 —— 调用方必须显示错误提示，不得静默当作成功。
   */
  const handleCreateBooking = useCallback(async (data: SubmitBookingPayload) => {
    const booking = await submitBooking(data);
    persistBooking(booking);
    setBookings(prev => [...prev.filter(b => b.id !== booking.id), booking]);
    setCounts(getBookingCounts());
    return booking;
  }, []);

  const handleUpdateBooking = useCallback(async (id: string, updates: Partial<Booking>) => {
    if (staffToken) {
      // 员工端：更新服务端同一笔记录
      const updated = await updateBookingRemote(staffToken, id, updates);
      // displayInServiceList / isPaused / serviceStartedAt 没有对应的飞书字段，
      // 保留客户端的值，避免服务板与服务暂停状态被服务端响应覆盖。
      const merged: Booking = {
        ...updated,
        displayInServiceList: updates.displayInServiceList ?? updated.displayInServiceList,
        isPaused: updates.isPaused ?? updated.isPaused,
        serviceStartedAt: updates.serviceStartedAt ?? updated.serviceStartedAt,
        currentPhase: updates.currentPhase ?? updated.currentPhase,
      };
      persistBooking(merged);
      setBookings(prev => {
        const next = prev.map(b => b.id === id ? merged : b);
        setCounts({
          pending: next.filter(b => b.status === BookingStatus.PENDING).length,
          accepted: next.filter(b => b.status === BookingStatus.ACCEPTED).length,
          inService: next.filter(
            b => b.status === BookingStatus.IN_SERVICE || b.displayInServiceList
          ).length,
        });
        return next;
      });
      return merged;
    }

    const updated = updateBooking(id, updates);
    if (updated) {
      setBookings(prev => prev.map(b => b.id === id ? updated! : b));
      setCounts(getBookingCounts());
    }
    return updated;
  }, [staffToken]);

  const handleAcceptBooking = useCallback(async (id: string) => {
    const updated = await handleUpdateBooking(id, {
      status: BookingStatus.ACCEPTED,
      currentPhase: '等待到店'
    });

    // Send WeChat notification (simulated)
    if (updated) {
      await sendWeChatNotification(id, updated.phone || '');
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
    serverError,
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
    getAllBookings: () => bookings,
    refreshCounts: () => setCounts(getBookingCounts()),
    reloadFromServer: staffToken ? () => loadStaffBookings(staffToken) : undefined
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
      const res = await fetch(`/api/public/bookings?id=${encodeURIComponent(id)}`);
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
