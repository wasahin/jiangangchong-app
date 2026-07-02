'use client';

import { useState } from 'react';
import { NeumorphicCard } from '@/components/NeumorphicCard';
import { Button } from '@/components/Button';
import { Navigation } from '@/components/Navigation';
import { BrandHeader } from '@/components/BrandHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { useBookings } from '@/hooks/useBookings';
import { BookingStatus } from '@/types/booking';

const STAFF_PASSWORD = process.env.NEXT_PUBLIC_STAFF_PASSWORD || 'jingangchong';

function StaffLogin({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (password === STAFF_PASSWORD) {
      localStorage.setItem('jingangchong_staff_auth', 'true');
      onSuccess();
    } else {
      setError('密码错误，请重试');
      setPassword('');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-neumo-light flex items-center justify-center p-4">
      <div className="max-w-sm w-full">
        <NeumorphicCard>
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-accent-amber/20 flex items-center justify-center shadow-neumo-pressed-md">
              <span className="text-4xl">🔐</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">员工登录</h3>
            <p className="text-sm text-gray-500 mb-6">请输入密码访问员工后台</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="w-full px-4 py-3 bg-neumo-light border border-white/50 rounded-neumo-button shadow-neumo-pressed-sm focus:outline-none focus:ring-2 focus:ring-accent-amber transition-all text-gray-900"
                autoFocus
              />
              
              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}
              
              <Button 
                variant="primary" 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? '验证中...' : '登录'}
              </Button>
            </form>
            
            <p className="text-xs text-gray-400 mt-6">
              如有问题请联系管理员
            </p>
          </div>
        </NeumorphicCard>
      </div>
    </div>
  );
}

export default function StaffPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('jingangchong_staff_auth') === 'true';
  });
  
  const { 
    pendingBookings, 
    acceptedBookings,
    activeBookings,
    acceptBooking, 
    pushToServiceBoard, 
    startService, 
    pauseService, 
    finishService,
    sendOwnerLink,
    calculateProgress,
    getCurrentStepName,
    calculateETA,
    getStepsWithStatus
  } = useBookings();

  if (!isAuthenticated) {
    return <StaffLogin onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="sticky top-0 z-50 bg-neumo-light/90 backdrop-blur-xl border-b border-white/40 mb-6">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <BrandHeader />
            <div className="flex items-center gap-4">
              <a 
                href="/" 
                className="text-sm font-semibold text-gray-600 hover:text-accent-amber transition-colors"
              >
                返回客户看板
              </a>
              <span className="text-sm font-semibold text-accent-amber tracking-wide">员工后台</span>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Pending & Accepted */}
          <div className="space-y-6">
            {/* Pending Review Section */}
            <NeumorphicCard>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">待审核预约</h2>
                <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
                  {pendingBookings.length}
                </span>
              </div>
              
              {pendingBookings.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-3xl">📋</span>
                  </div>
                  <p className="text-sm">暂无待审核预约</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingBookings.map(booking => (
                    <div key={booking.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-bold text-gray-900 text-lg">{booking.petName}</p>
                          <p className="text-xs text-gray-400">{booking.serviceType} · {booking.weightRange.label}</p>
                        </div>
                        <StatusBadge status={booking.status} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                        <div className="bg-gray-50 rounded-lg p-2">
                          <p className="text-gray-400">主人</p>
                          <p className="font-medium text-gray-900">{booking.ownerName}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2">
                          <p className="text-gray-400">电话</p>
                          <p className="font-medium text-gray-900">{booking.phone}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2">
                          <p className="text-gray-400">疫苗日期</p>
                          <p className="font-medium text-gray-900">{booking.vaccineDate}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2">
                          <p className="text-gray-400">预约时间</p>
                          <p className="font-medium text-gray-900">{booking.bookingDateTime}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mb-3 text-xs">
                        <span className={`px-2 py-1 rounded-full ${
                          booking.outsideGroomed 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'bg-gray-50 text-gray-400'
                        }`}>
                          {booking.outsideGroomed ? '有外店美容经验' : '首次美容'}
                        </span>
                        <span className={`px-2 py-1 rounded-full ${
                          booking.emotionStable 
                            ? 'bg-green-50 text-green-600' 
                            : 'bg-amber-50 text-amber-600'
                        }`}>
                          {booking.emotionStable ? '情绪稳定' : '需注意'}
                        </span>
                      </div>
                      
                      {booking.notes && (
                        <div className="bg-blue-50 rounded-lg p-3 mb-3 text-xs">
                          <p className="text-blue-400 font-medium">备注</p>
                          <p className="text-blue-700">{booking.notes}</p>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="cyan" 
                          size="small" 
                          className="flex-1"
                          onClick={() => acceptBooking(booking.id)}
                        >
                          接受预约
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </NeumorphicCard>
            
            {/* Accepted - Ready to Push Section */}
            {acceptedBookings.length > 0 && (
              <NeumorphicCard>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">已接受预约</h2>
                  <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                    {acceptedBookings.length}
                  </span>
                </div>
                
                <div className="space-y-4">
                  {acceptedBookings.map(booking => (
                    <div key={booking.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-bold text-gray-900 text-lg">{booking.petName}</p>
                          <p className="text-xs text-gray-400">{booking.serviceType} · {booking.weightRange.label}</p>
                        </div>
                        <StatusBadge status={booking.status} />
                      </div>
                      
                      <div className="bg-amber-50 rounded-lg p-3 mb-3 text-sm text-amber-700">
                        <p>等待宠物到店，推送到服务看板后开始服务</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="small" 
                          className="flex-1"
                          onClick={() => pushToServiceBoard(booking.id)}
                        >
                          推送到服务看板
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </NeumorphicCard>
            )}
          </div>
          
          {/* Right Column - Current Services */}
          <div className="space-y-6">
            <NeumorphicCard>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">当前服务</h2>
                <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  公开显示
                </span>
              </div>
              
              {activeBookings.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
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
                    const steps = getStepsWithStatus(booking);
                    const isInService = booking.status === BookingStatus.IN_SERVICE;
                    
                    return (
                      <div key={booking.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-white/50">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="font-bold text-gray-900 text-lg">{booking.petName}</p>
                            <p className="text-xs text-gray-400">{booking.serviceType}</p>
                          </div>
                          <StatusBadge status={booking.currentPhase} />
                        </div>
                        
                        {/* Progress Section */}
                        <div className="mb-5">
                          <div className="flex justify-between items-end mb-3">
                            <span className="text-sm font-medium text-gray-700">{stepName}</span>
                            <span className="text-[32px] font-bold text-gray-900">{progress}%</span>
                          </div>
                          <div className="h-[12px] bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500"
                              style={{ 
                                width: `${progress}%`,
                                background: 'linear-gradient(90deg, rgba(90,200,250,0.95), rgba(76,217,100,0.95))',
                                boxShadow: '0 0 20px rgba(90,200,250,0.6)'
                              }}
                            />
                          </div>
                        </div>
                        
                        {/* Current Step Display */}
                        {stepName && (
                          <div className="mb-5 bg-sky-50 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-3 h-3 rounded-full bg-sky-400 animate-pulse"></span>
                              <span className="text-sm font-medium text-sky-700">当前步骤</span>
                            </div>
                            <p className="text-base font-semibold text-gray-900">{stepName}</p>
                            <div className="flex items-center gap-3 mt-3">
                              <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                <span className="text-xs text-gray-400">已完成</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
                                <span className="text-xs text-gray-400">进行中</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                                <span className="text-xs text-gray-400">待处理</span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Info Grid */}
                        <div className="grid grid-cols-3 gap-2 mb-5 text-xs">
                          <div className="bg-gray-50 rounded-lg p-2 text-center">
                            <p className="text-gray-400">预计剩余</p>
                            <p className="font-semibold text-[#FF9500]">{eta}分钟</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2 text-center">
                            <p className="text-gray-400">微信通知</p>
                            <p className={`font-semibold ${booking.wechatNoticeSent ? 'text-green-500' : 'text-gray-400'}`}>
                              {booking.wechatNoticeSent ? '已发送' : '未发送'}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2 text-center">
                            <p className="text-gray-400">状态</p>
                            <p className="font-semibold text-gray-700">
                              {booking.isPaused ? '已暂停' : isInService ? '服务中' : '待开始'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Action Buttons - Start / Pause / Finish */}
                        <div className="flex gap-2">
                          {!isInService && !booking.isPaused && (
                            <Button 
                              size="medium" 
                              className="flex-1"
                              onClick={() => startService(booking.id)}
                            >
                              开始服务
                            </Button>
                          )}
                          
                          {isInService && (
                            <>
                              <Button 
                                variant={booking.isPaused ? 'cyan' : 'secondary'} 
                                size="medium"
                                className="flex-1"
                                onClick={() => pauseService(booking.id)}
                              >
                                {booking.isPaused ? '继续' : '暂停'}
                              </Button>
                              <Button 
                                variant="primary" 
                                size="medium"
                                className="flex-1"
                                onClick={() => finishService(booking.id)}
                              >
                                完成
                              </Button>
                            </>
                          )}
                        </div>
                        
                        {/* Send Owner Link Button */}
                        <div className="mt-2">
                          <Button 
                            variant="secondary" 
                            size="small"
                            className="w-full"
                            onClick={() => sendOwnerLink(booking.id)}
                          >
                            发送状态链接给主人
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </NeumorphicCard>
          </div>
        </div>
      
      <Navigation currentPage="staff" />
    </div>
  );
}