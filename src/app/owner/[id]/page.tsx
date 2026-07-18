'use client';

import { NeumorphicCard } from '@/components/LiquidGlassCard';
import { Button } from '@/components/Button';
import { StatusBadge } from '@/components/StatusBadge';
import { BrandHeader } from '@/components/BrandHeader';
import { useBooking } from '@/hooks/useBookings';
import { BookingStatus } from '@/types/booking';
import { useParams } from 'next/navigation';

export default function OwnerPage() {
  const params = useParams<{ id: string }>();
  const { booking, progress, currentStepName, eta, steps } = useBooking(params.id);

  if (!booking) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <BrandHeader />
        <NeumorphicCard className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neumo-light flex items-center justify-center shadow-neumo-pressed-md">
            <span className="text-3xl">🔍</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">预约不存在</h3>
          <p className="text-gray-400 text-sm">请检查链接是否正确</p>
        </NeumorphicCard>
      </div>
    );
  }

  const getStatusDescription = () => {
    switch (booking.status) {
      case BookingStatus.PENDING:
        return '预约已提交，等待门店审核确认';
      case BookingStatus.ACCEPTED:
        return '预约已确认，请按时带宠物到店';
      case BookingStatus.IN_SERVICE:
        return booking.isPaused 
          ? '服务已暂停，请耐心等待' 
          : '服务进行中，美容师正在精心护理中';
      case BookingStatus.COMPLETED:
        return '服务已完成，欢迎来接您的宠物回家';
      default:
        return booking.currentPhase;
    }
  };

  const flowSteps = [
    { id: 1, name: '预约提交', status: 'completed' as const },
    { id: 2, name: '门店审核', status: booking.status === BookingStatus.PENDING ? 'pending' as const : 'completed' as const },
    { id: 3, name: '到店评估', status: booking.displayInServiceList ? 'completed' as const : 'pending' as const },
    { id: 4, name: '服务开始', status: booking.status === BookingStatus.IN_SERVICE ? 'active' as const : booking.status === BookingStatus.COMPLETED ? 'completed' as const : 'pending' as const }
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <BrandHeader />
        <StatusBadge status={booking.status} />
      </div>
      
      <NeumorphicCard>
        <div className="text-center py-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{booking.petName}</h1>
          <p className="text-gray-500">{booking.serviceType} · {booking.weightRange.label}</p>
        </div>
      </NeumorphicCard>
      
      <div className="bg-accent-amber/10 rounded-neumo-button p-4 text-center shadow-neumo-pressed-sm">
        <p className="text-accent-amberDark font-medium">{getStatusDescription()}</p>
      </div>
      
      {booking.status === BookingStatus.IN_SERVICE && (
        <NeumorphicCard>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-700">{currentStepName}</span>
              <span className="text-2xl font-bold text-accent-amber">{progress}%</span>
            </div>
            <div className="h-3 bg-neumo-light rounded-full overflow-hidden shadow-neumo-pressed-sm">
              <div 
                className="h-full bg-gradient-to-r from-accent-amber to-accent-amberLight rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-gray-400">预计剩余 </span>
              <span className="font-semibold text-accent-amber">{eta}分钟</span>
            </div>
            {booking.isPaused && (
              <span className="px-2 py-1 bg-accent-amber/20 text-accent-amberDark rounded-neumo-pill text-xs">
                服务暂停中
              </span>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-neumo-alt">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-accent-pink"></span>
                <span className="text-xs text-gray-400">已完成</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-accent-amber animate-pulse"></span>
                <span className="text-xs text-gray-400">进行中</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-neumo-alt"></span>
                <span className="text-xs text-gray-400">待处理</span>
              </div>
            </div>
          </div>
        </NeumorphicCard>
      )}
      
      <NeumorphicCard>
        <h2 className="text-sm font-semibold text-gray-500 mb-4">服务流程</h2>
        <div className="space-y-0">
          {flowSteps.map((step, index) => (
            <div key={step.id} className="flex items-start gap-4 relative">
              <div className="relative z-10">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${step.status === 'completed' ? 'bg-accent-pink text-white shadow-neumo-raised-sm' : ''}
                  ${step.status === 'active' ? 'bg-accent-amber text-white ring-4 ring-accent-amber/20' : ''}
                  ${step.status === 'pending' ? 'bg-neumo-light text-gray-400 shadow-neumo-pressed-sm' : ''}
                `}>
                  {step.status === 'completed' ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : step.id}
                </div>
              </div>
              
              {index < flowSteps.length - 1 && (
                <div className={`
                  absolute top-8 left-4 w-0.5 h-6
                  ${step.status === 'completed' ? 'bg-accent-pink' : 'bg-neumo-alt'}
                `} />
              )}
              
              <div className="flex-1 pb-6">
                <p className={`
                  font-semibold ${step.status === 'pending' ? 'text-gray-400' : 'text-gray-900'}
                `}>
                  {step.name}
                </p>
                <p className={`
                  text-xs mt-1
                  ${step.status === 'completed' ? 'text-accent-pink' : step.status === 'active' ? 'text-accent-amber' : 'text-gray-300'}
                `}>
                  {step.status === 'completed' && '已完成'}
                  {step.status === 'active' && '进行中'}
                  {step.status === 'pending' && '等待中'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </NeumorphicCard>
      
      <NeumorphicCard>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-neumo-light rounded-neumo-button p-3 shadow-neumo-pressed-sm">
            <p className="text-gray-400">预约时间</p>
            <p className="font-semibold text-gray-900">{booking.bookingDateTime}</p>
          </div>
          <div className="bg-neumo-light rounded-neumo-button p-3 shadow-neumo-pressed-sm">
            <p className="text-gray-400">服务类型</p>
            <p className="font-semibold text-gray-900">{booking.serviceType}</p>
          </div>
          <div className="bg-neumo-light rounded-neumo-button p-3 shadow-neumo-pressed-sm">
            <p className="text-gray-400">体重范围</p>
            <p className="font-semibold text-gray-900">{booking.weightRange.label}</p>
          </div>
          <div className="bg-neumo-light rounded-neumo-button p-3 shadow-neumo-pressed-sm">
            <p className="text-gray-400">疫苗日期</p>
            <p className="font-semibold text-gray-900">{booking.vaccineDate}</p>
          </div>
        </div>
      </NeumorphicCard>
      
      <div className="flex gap-3">
        <Button variant="primary" className="flex-1">
          联系门店
        </Button>
        <Button variant="secondary" className="flex-1">
          查看示例
        </Button>
      </div>
      
      <p className="text-xs text-gray-400 text-center px-4">
        📌 最终服务是否适合您的宠物，需美容师到店评估后确定
      </p>
    </div>
  );
}