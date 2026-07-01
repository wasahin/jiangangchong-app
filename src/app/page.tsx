'use client';

import { useState, useEffect } from 'react';
import { NeumorphicCard } from '@/components/NeumorphicCard';
import { Button } from '@/components/Button';
import { Navigation } from '@/components/Navigation';
import { BrandHeader } from '@/components/BrandHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { HouseIcon } from '@/components/HouseIcon';
import { useBookings } from '@/hooks/useBookings';
import { ServiceType, BookingStatus } from '@/types/booking';
import { WEIGHT_RANGES } from '@/lib/constants';

export default function CustomerPage() {
  const { 
    activeBookings, 
    createBooking, 
    calculateProgress, 
    getCurrentStepName, 
    calculateETA,
    counts,
    refreshCounts
  } = useBookings();
  
  const [lastBookingId, setLastBookingId] = useState<string>('');
  const lastBooking = activeBookings.find(b => b.id === lastBookingId);
  
  const [formData, setFormData] = useState({
    ownerName: '',
    phone: '',
    petName: '',
    serviceType: ServiceType.PREMIUM_WASH,
    weightRange: WEIGHT_RANGES[0].label,
    bookingDate: '',
    bookingTime: '',
    vaccineDate: '',
    outsideGroomed: 'No',
    emotionStable: 'Yes',
    notes: ''
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshCounts();
    }, 30000);
    return () => clearInterval(interval);
  }, [refreshCounts]);

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 10; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(timeStr);
      }
    }
    return options;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const booking = await createBooking(formData);
      if (booking) {
        setLastBookingId(booking.id);
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      ownerName: '',
      phone: '',
      petName: '',
      serviceType: ServiceType.PREMIUM_WASH,
      weightRange: WEIGHT_RANGES[0].label,
      bookingDate: '',
      bookingTime: '',
      vaccineDate: '',
      outsideGroomed: 'No',
      emotionStable: 'Yes',
      notes: ''
    });
    setSubmitted(false);
    setLastBookingId('');
  };

  const handleScrollToForm = () => {
    document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCopyWeChat = () => {
    navigator.clipboard.writeText('jingangchong_pet');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (submitted && lastBooking) {
    const statusLink = `${window.location.origin}/status?booking=${lastBooking.id}`;
    return (
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <BrandHeader />
        
        <NeumorphicCard>
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-accent-amber/20 flex items-center justify-center shadow-neumo-pressed-md">
              <svg className="w-10 h-10 text-accent-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">预约已提交</h3>
            <p className="text-gray-500 mb-4">请等待门店审核确认</p>
            <p className="text-sm text-gray-400 mb-6">
              门店确认后会通过微信通知您
            </p>
            <div className="bg-accent-amber/10 rounded-neumo-button p-4 text-sm text-accent-amberDark shadow-neumo-pressed-sm mb-4">
              <p>📌 注意：最终服务适宜性由美容师现场评估后确定</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-xs text-gray-500 mb-2">您的专属状态链接</p>
              <p className="font-mono text-xs text-accent-amber break-all mb-3">{statusLink}</p>
              <Button 
                variant="primary" 
                size="small"
                onClick={() => {
                  navigator.clipboard.writeText(statusLink);
                  alert('状态链接已复制！');
                }}
                className="w-full"
              >
                复制状态链接
              </Button>
            </div>
          </div>
        </NeumorphicCard>
        
        <Button variant="secondary" onClick={handleReset} className="w-full">
          继续预约
        </Button>
        
        <Navigation currentPage="home" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <BrandHeader />
      
      {/* Live Store Status Board */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-neumo-surface rounded-neumo-card p-4 text-center shadow-neumo-raised-md">
          <p className="text-[28px] font-bold text-accent-amber">{counts.pending}</p>
          <p className="text-xs text-gray-400 mt-1">待审核</p>
        </div>
        <div className="bg-neumo-surface rounded-neumo-card p-4 text-center shadow-neumo-raised-md">
          <p className="text-[28px] font-bold text-lime-600">{counts.accepted}</p>
          <p className="text-xs text-gray-400 mt-1">已确认</p>
        </div>
        <div className="bg-neumo-surface rounded-neumo-card p-4 text-center shadow-neumo-raised-md">
          <p className="text-[28px] font-bold text-accent-pink">{counts.inService}</p>
          <p className="text-xs text-gray-400 mt-1">服务中</p>
        </div>
      </div>
      
      {/* Advertisement Banner */}
      <div className="space-y-3">
        <div className="relative rounded-2xl overflow-hidden shadow-neumo-raised-md">
          <img 
            src="/advert-1.jpg" 
            alt="美容造型价格表" 
            className="w-full h-auto object-cover"
          />
        </div>
        <div className="relative rounded-2xl overflow-hidden shadow-neumo-raised-md">
          <img 
            src="/advert-2.jpg" 
            alt="狗狗洗护价格表" 
            className="w-full h-auto object-cover"
          />
        </div>
      </div>
      
      {/* Shop Info Card */}
      <NeumorphicCard 
        customShadow="6px 6px 16px rgba(0,0,0,0.12), -4px -4px 12px rgba(255,255,255,0.9), inset 1px 1px 3px rgba(255,255,255,0.7)"
        customBackground="linear-gradient(145deg, rgba(255,253,240,0.95), rgba(255,248,225,0.85))"
      >
        <div className="flex items-start gap-4 mb-4">
          <div 
            className="relative w-14 h-14 flex-shrink-0 rounded-full overflow-hidden"
            style={{ 
            }}
          >
            <img 
              src="/amberlogo.png" 
              alt="金刚宠 Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">金刚宠宠物美容</h3>
            <p className="text-sm text-gray-500 mt-0.5">专业宠物美容护理服务</p>
          </div>
        </div>
        
        <div className="bg-accent-amber/10 rounded-neumo-button p-3 mb-4 shadow-neumo-pressed-sm">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent-amber/30 text-accent-amberDark rounded-neumo-pill text-xs font-medium">
            <span>⚠️</span>
            预约需门店审核
          </span>
          <p className="text-xs text-accent-amberDark mt-2">
            提交预约后需要门店审核确认，最终服务时间以门店确认为准。
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="secondary" size="medium" onClick={handleScrollToForm} className="flex-1">
            填写预约
          </Button>
          <Button variant="pink" size="medium" onClick={handleCopyWeChat} className="flex-1">
            {copied ? '已复制' : '联系微信'}
          </Button>
        </div>
      </NeumorphicCard>
      
      {/* Public Status Dashboard - Current Services */}
      <NeumorphicCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">当前服务中</h2>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <span className="w-1.5 h-1.5 bg-accent-pink rounded-full animate-pulse"></span>
            自动刷新
          </span>
        </div>
        
        {activeBookings.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-neumo-light flex items-center justify-center shadow-neumo-pressed-md">
              <span className="text-3xl">🐾</span>
            </div>
            <p className="text-sm">暂无正在进行的服务</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeBookings.map(booking => {
              const progress = calculateProgress(booking);
              const stepName = getCurrentStepName(booking);
              const eta = calculateETA(booking);
              
              return (
                <div key={booking.id} className="bg-neumo-light rounded-neumo-button p-4 shadow-neumo-pressed-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{booking.petName}</p>
                      <p className="text-xs text-gray-400">{booking.serviceType}</p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-3 h-3 rounded-full bg-sky-400 animate-pulse"></span>
                      <span className="text-sm font-medium text-sky-700">当前步骤</span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{stepName}</span>
                      <span className="text-[28px] font-bold text-gray-900">{progress}%</span>
                    </div>
                    
                    <div 
                      className="relative h-10 rounded-full overflow-hidden"
                      style={{ 
                        background: 'linear-gradient(145deg, rgba(250,250,250,0.95), rgba(235,235,235,0.8))',
                        boxShadow: '5px 5px 10px rgba(0,0,0,0.15), -3px -3px 8px rgba(255,255,255,0.9), inset 1px 1px 3px rgba(255,255,255,0.7)'
                      }}
                    >
                      <div 
                        className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${progress}%`,
                          background: 'linear-gradient(90deg, #FF9500, #FFB333)',
                          boxShadow: '0 0 25px rgba(255,165,0,0.7), 0 0 50px rgba(255,165,0,0.4), inset 0 2px 0 rgba(255,255,255,0.5)'
                        }}
                      />
                      
                      <div 
                        className="absolute top-1/2 w-10 h-10 rounded-full z-5 overflow-hidden"
                        style={{ 
                          left: `${Math.max(5, Math.min(progress, 95))}%`,
                          transform: 'translate(-50%, -50%)',
                          background: 'linear-gradient(145deg, rgba(255,255,255,0.98), rgba(240,240,240,0.8))',
                          boxShadow: '4px 4px 8px rgba(0,0,0,0.15), -2px -2px 5px rgba(255,255,255,0.95), inset 1px 1px 3px rgba(255,255,255,0.98)'
                        }}
                      >
                        <img
                          src="/runningdog.gif"
                          alt="Running dog"
                          className="w-full h-full object-contain p-0.5"
                        />
                      </div>
                      
                      <div 
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full z-5 overflow-hidden mr-1"
                        style={{ 
                          background: 'linear-gradient(145deg, rgba(255,255,255,0.98), rgba(240,240,240,0.8))',
                          boxShadow: '4px 4px 8px rgba(0,0,0,0.15), -2px -2px 5px rgba(255,255,255,0.95), inset 1px 1px 3px rgba(255,255,255,0.98)'
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
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs">
                      <span className="text-gray-400">预计剩余 </span>
                      <span className="font-semibold text-accent-amber">{eta}分钟</span>
                    </div>
                    <div className={`px-2.5 py-1 rounded-neumo-pill text-xs font-medium ${
                      booking.wechatNoticeSent 
                        ? 'bg-accent-pink/30 text-pink-700 shadow-neumo-pressed-sm' 
                        : 'bg-neumo-light text-gray-400 shadow-neumo-pressed-sm'
                    }`}>
                      {booking.wechatNoticeSent ? '通知已发送' : '等待通知'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </NeumorphicCard>
      
      {/* Booking Form */}
      <div id="booking-form">
        <NeumorphicCard>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">预约表单</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">主人姓名 *</label>
              <input
                type="text"
                required
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full px-4 py-3 bg-neumo-light border border-white/50 rounded-neumo-button shadow-neumo-pressed-sm focus:outline-none focus:ring-2 focus:ring-accent-amber transition-all text-gray-900"
                placeholder="请输入您的姓名"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">联系电话</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-neumo-light border border-white/50 rounded-neumo-button shadow-neumo-pressed-sm focus:outline-none focus:ring-2 focus:ring-accent-amber transition-all text-gray-900"
                placeholder="请输入手机号码"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">宠物名字 *</label>
              <input
                type="text"
                required
                value={formData.petName}
                onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
                className="w-full px-4 py-3 bg-neumo-light border border-white/50 rounded-neumo-button shadow-neumo-pressed-sm focus:outline-none focus:ring-2 focus:ring-accent-amber transition-all text-gray-900"
                placeholder="请输入宠物名字"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">服务类型 *</label>
              <select
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value as ServiceType })}
                className="w-full px-4 py-3 bg-neumo-light border border-white/50 rounded-neumo-button shadow-neumo-pressed-sm focus:outline-none focus:ring-2 focus:ring-accent-amber transition-all text-gray-900"
              >
                <option value={ServiceType.PREMIUM_WASH}>精致洗</option>
                <option value={ServiceType.STANDARD_WASH}>标准洗</option>
                <option value={ServiceType.GROOMING}>美容</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">体重范围 *</label>
              <select
                value={formData.weightRange}
                onChange={(e) => setFormData({ ...formData, weightRange: e.target.value })}
                className="w-full px-4 py-3 bg-neumo-light border border-white/50 rounded-neumo-button shadow-neumo-pressed-sm focus:outline-none focus:ring-2 focus:ring-accent-amber transition-all text-gray-900"
              >
                {WEIGHT_RANGES.map(range => (
                  <option key={range.label} value={range.label}>{range.label}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">预约日期 *</label>
                <input
                  type="date"
                  required
                  value={formData.bookingDate}
                  onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                  className="w-full px-4 py-3 bg-neumo-light border border-white/50 rounded-neumo-button shadow-neumo-pressed-sm focus:outline-none focus:ring-2 focus:ring-accent-amber transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">预约时间 *</label>
                <select
                  required
                  value={formData.bookingTime}
                  onChange={(e) => setFormData({ ...formData, bookingTime: e.target.value })}
                  className="w-full px-4 py-3 bg-neumo-light border border-white/50 rounded-neumo-button shadow-neumo-pressed-sm focus:outline-none focus:ring-2 focus:ring-accent-amber transition-all text-gray-900"
                >
                  <option value="">选择时间</option>
                  {generateTimeOptions().map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">疫苗日期</label>
              <input
                type="date"
                value={formData.vaccineDate}
                onChange={(e) => setFormData({ ...formData, vaccineDate: e.target.value })}
                className="w-full px-4 py-3 bg-neumo-light border border-white/50 rounded-neumo-button shadow-neumo-pressed-sm focus:outline-none focus:ring-2 focus:ring-accent-amber transition-all"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">曾在其他店美容</label>
                <select
                  value={formData.outsideGroomed}
                  onChange={(e) => setFormData({ ...formData, outsideGroomed: e.target.value })}
                  className="w-full px-4 py-3 bg-neumo-light border border-white/50 rounded-neumo-button shadow-neumo-pressed-sm focus:outline-none focus:ring-2 focus:ring-accent-amber transition-all text-gray-900"
                >
                  <option value="Yes">是</option>
                  <option value="No">否</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">情绪稳定</label>
                <select
                  value={formData.emotionStable}
                  onChange={(e) => setFormData({ ...formData, emotionStable: e.target.value })}
                  className="w-full px-4 py-3 bg-neumo-light border border-white/50 rounded-neumo-button shadow-neumo-pressed-sm focus:outline-none focus:ring-2 focus:ring-accent-amber transition-all text-gray-900"
                >
                  <option value="Yes">是</option>
                  <option value="No">否</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">备注</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 bg-neumo-light border border-white/50 rounded-neumo-button shadow-neumo-pressed-sm focus:outline-none focus:ring-2 focus:ring-accent-amber transition-all resize-none text-gray-900"
                rows={3}
                placeholder="如有特殊需求请备注"
              />
            </div>
            
            <div className="bg-accent-amber/10 rounded-neumo-button p-3 text-sm text-accent-amberDark shadow-neumo-pressed-sm">
              <p>⚠️ 提交预约后需要门店审核确认，最终服务时间以门店确认为准。最终服务适宜性由美容师现场评估后确定。</p>
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" type="button" onClick={handleReset} className="flex-1">
                重置
              </Button>
              <Button variant="primary" type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? '提交中...' : '提交预约'}
              </Button>
            </div>
          </form>
        </NeumorphicCard>
      </div>
      
      <Navigation currentPage="home" />
    </div>
  );
}
