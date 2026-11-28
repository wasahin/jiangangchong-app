
import { useState, useEffect, Suspense } from 'react';

import { NeumorphicCard } from '@/components/NeumorphicCard';
import { StatusBadge } from '@/components/StatusBadge';
import { Navigation } from '@/components/Navigation';
import { BrandPaw } from '@/components/BookingUI';
import { BookingStatus, ServiceType } from '@/types/booking';
import { GROOMING_STAGES, WEIGHT_RANGES } from '@/lib/constants';
import { estimateRemaining, STORE_INFO } from '@/lib/eta';

function parseText(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value.map(item => item.text || '').join('');
  }
  return String(value);
}

function calculateProgress(booking: any): number {
  if (!booking) return 0;
  if (booking.status === BookingStatus.COMPLETED) return 100;
  // 优先用飞书已存嘅进度
  if (typeof booking.progress === 'number' && Number.isFinite(booking.progress) && booking.progress > 0) {
    return Math.round(Math.min(100, booking.progress));
  }
  const serviceType = parseText(booking.serviceType) || 'standard';
  const steps = GROOMING_STAGES[serviceType as ServiceType];
  if (!steps || booking.currentStep === 0) return 0;
  if (booking.status === BookingStatus.COMPLETED) return 100;
  const currentIndex = booking.currentStep - 1;
  if (currentIndex < 0 || currentIndex >= steps.length) return 0;
  return Math.round((currentIndex / steps.length) * 100);
}

function getCurrentStepName(booking: any): string {
  if (!booking) return '等待开始';
  const serviceType = parseText(booking.serviceType) || 'standard';
  const steps = GROOMING_STAGES[serviceType as ServiceType];
  if (!steps || booking.currentStep === 0) return '等待开始';
  const currentIndex = booking.currentStep - 1;
  if (currentIndex < 0) return '等待开始';
  if (currentIndex >= steps.length) return '服务完成';
  return steps[currentIndex].name;
}



function StatusPageContent() {
  const [bookingId, setBookingId] = useState<string | null | undefined>(undefined);
  useEffect(() => { setBookingId(new URLSearchParams(window.location.search).get('booking')); }, []);

  
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (bookingId === undefined) return;
    if (!bookingId) {
      setError('缺少预约编号参数');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/public/bookings?id=${encodeURIComponent(bookingId)}`);
        if (res.ok) {
          const data = await res.json();
          setBooking(data);
          setError('');
        } else {
          setError('未找到该预约');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('获取预约信息失败');
      }
      setLoading(false);
    };

    fetchData();

    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [bookingId]);


  if (loading) {
    return (
      <div className="min-h-screen bg-brand-v3-cream p-4">
        <div className="max-w-lg mx-auto pt-20">
          <NeumorphicCard>
            <div className="text-center py-8">
              <span className="mb-4 block flex justify-center">
                <BrandPaw size={48} />
              </span>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">加载中...</h2>
              <p className="text-sm text-gray-500">正在获取预约信息...</p>
            </div>
          </NeumorphicCard>
        </div>
        <Navigation currentPage="home" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-brand-v3-cream p-4">
        <div className="max-w-lg mx-auto pt-20">
          <NeumorphicCard>
            <div className="text-center py-8">
              <span className="mb-4 block flex justify-center">
                <BrandPaw size={48} />
              </span>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{error || '未找到该预约'}</h2>
              <p className="text-sm text-gray-500">请使用有效的预约链接</p>
            </div>
          </NeumorphicCard>
        </div>
        <Navigation currentPage="home" />
      </div>
    );
  }

  const statusLabel = {
    [BookingStatus.PENDING]: '等待审核',
    [BookingStatus.ACCEPTED]: '已接受',
    [BookingStatus.IN_SERVICE]: '服务中',
    [BookingStatus.COMPLETED]: '已完成',
    [BookingStatus.CANCELLED]: '已取消'
  }[booking.status as BookingStatus] || booking.status;

  const progress = calculateProgress(booking);
  const currentStepName = getCurrentStepName(booking);
  const eta = estimateRemaining({
    serviceType: parseText(booking.serviceType),
    currentStep: booking.currentStep,
    progress: booking.progress,
    status: booking.status,
  });
  const etaText = (() => {
    if (!eta) return '';
    if (booking.status === BookingStatus.COMPLETED) return '已经搞掂，可以来接毛孩啦';
    if (!eta.started) return `开始后约需 ${eta.totalMinutes} 分钟`;
    const done = new Date(Date.now() + eta.remainingMinutes * 60000);
    const hhmm = `${String(done.getHours()).padStart(2, '0')}:${String(done.getMinutes()).padStart(2, '0')}`;
    return `预计 ${hhmm} 完成（约仲有 ${eta.remainingMinutes} 分钟）`;
  })();

  return (
    <div className="min-h-screen bg-brand-v3-cream p-4 pb-24">
      <div className="max-w-lg mx-auto space-y-4">
        
        <div className="text-center py-4">
          <h1 className="text-xl font-bold text-gray-900">{parseText(booking.petName)}的洗护进度</h1>
          <p className="text-xs text-gray-500 mt-1">实时追踪洗护进度</p>
        </div>

        <NeumorphicCard
          customShadow="0 0 0 1px #E6DCCB"
          customBackground="#FAF6EE"
        >
          <div className="flex items-center justify-between mb-4">
            <StatusBadge status={booking.status} />
            <span className="text-xs text-gray-400 font-mono">{booking.id.slice(0, 12)}...</span>
          </div>
          
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">{parseText(booking.petName)}</h2>
            <p className="text-sm text-gray-500 mt-1">{parseText(booking.serviceType)}</p>
          </div>

          {etaText && (
            <div className="mb-4 rounded-xl bg-white px-4 py-3 text-center border border-[#E6DCCB]">
              <p className="text-xs text-gray-400">预计完成时间</p>
              <p className="text-base font-semibold text-brand-v3-navy mt-0.5">{etaText}</p>
            </div>
          )}

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">当前进度</span>
              <span className="font-bold text-brand-v3-gold">{progress}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-neumo-pressed-sm">
              <div 
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: `${progress}%`,
                  background: '#E2BC6E',
                  boxShadow: 'none'
                }}
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-brand-v3-info animate-pulse"></span>
              <span className="text-sm font-medium text-brand-v3-info">当前步骤</span>
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{currentStepName}</span>
              <span className="text-[28px] font-bold text-gray-900">{progress}%</span>
            </div>
            
            <div 
              className="relative h-10 rounded-full overflow-hidden"
              style={{ 
                background: '#F0E8D6',
                boxShadow: 'none', border: '1px solid #E6DCCB'
              }}
            >
              <div 
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                style={{ 
                  width: `${progress}%`,
                  background: '#E2BC6E',
                  boxShadow: 'none'
                }}
              />
              
              <div 
                className="absolute top-1/2 w-10 h-10 rounded-full z-5 overflow-hidden"
                style={{ 
                  left: `${Math.max(5, Math.min(progress, 95))}%`,
                  transform: 'translate(-50%, -50%)',
                  background: '#FFFFFF',
                  boxShadow: 'none', border: '1px solid #E6DCCB'
                }}
              >
                <img
                  src="/runningdog.gif"
                  alt="Running dog"
                  className="w-full h-full object-contain p-0.5 animate-run"
                />
              </div>
              
              <div 
                className="absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full z-5 overflow-hidden mr-1"
                style={{ 
                  background: '#FFFFFF',
                  boxShadow: 'none', border: '1px solid #E6DCCB'
                }}
              >
                <img
                  src="/house.png"
                  alt="Home"
                  className="w-full h-full object-contain p-0.5"
                />
              </div>
            </div>
          </div>
        </NeumorphicCard>

        <NeumorphicCard>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">预约信息</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400">主人姓名</p>
              <p className="text-sm font-medium text-gray-900">{parseText(booking.ownerName)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400">服务类型</p>
              <p className="text-sm font-medium text-gray-900">{parseText(booking.serviceType)}</p>
            </div>
          </div>
        </NeumorphicCard>

        <NeumorphicCard>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">有问题？联系门店</h3>
          <div className="space-y-2 text-sm">
            <a href={`tel:${STORE_INFO.phone.replace(/\s/g, '')}`} className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
              <span className="text-gray-400 text-xs">电话</span>
              <span className="font-medium text-brand-v3-navy">{STORE_INFO.phone}</span>
            </a>
            {STORE_INFO.wechat && (
              <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
                <span className="text-gray-400 text-xs">微信</span>
                <span className="font-medium text-gray-900">{STORE_INFO.wechat}</span>
              </div>
            )}
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-gray-400 text-xs">地址</p>
              <p className="font-medium text-gray-900 mt-0.5">{STORE_INFO.address}</p>
            </div>
          </div>
        </NeumorphicCard>

        <p className="text-xs text-gray-400 text-center px-4">
          此页面每 15 秒自动更新，可随时打开查看最新状态
        </p>
      </div>
      
      <Navigation currentPage="home" />
    </div>
  );
}

export default function StatusPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-v3-cream flex items-center justify-center"><p className="text-gray-500">加载中...</p></div>}>
      <StatusPageContent />
    </Suspense>
  );
}
