
import { useState, useEffect } from 'react';
import { NeumorphicCard } from '@/components/NeumorphicCard';
import { Button } from '@/components/Button';
import { Navigation } from '@/components/Navigation';
import { BrandHeader } from '@/components/BrandHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { MagazineNav } from '@/components/MagazineNav';
import { BrandIcon, BrandPaw } from '@/components/BookingUI';
import { useBookings } from '@/hooks/useBookings';
import { Booking, BookingStatus, ServiceType } from '@/types/booking';
import { loginStaff } from '@/lib/booking-api';
import { statusShareText } from '@/lib/eta';

const STAFF_SESSION_KEY = 'jingangchong_staff_session';

/** 5 间房嘅名册（同 src/server/legacy/rooms.ts 一致） */
const ROOM_NAMES = ['小房1', '小房2', '小房3', '大房1', '大房2'];

/** 预约备注里嘅房号行：【房号：小房2｜退房：2026-12-05】 */
const ROOM_LINE = /【房号：([^｜】\n]+)(?:[｜|]退房：(\d{4}-\d{2}-\d{2}))?】/;

type RoomInfo = { name: string; type: string; capacity: string; price: string; occupied: boolean };

/**
 * 寄养房号安排 —— 店员可以直接改房号同退房日期。
 * 写入走 POST /api/public/rooms（服务端把房号补落预约备注），所以顾客睇到嘅
 * 房态板会即刻跟住变；顾客自己喺公开表单拣嘅房号，店员亦可以改。
 */

/** 复制「<宠物名>的洗护进度：<当前域名>/status?booking=<id>」，员工直接贴落微信。 */
function CopyStatusLinkButton({ booking, wide = false }: { booking: Booking; wide?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    const text = statusShareText(window.location.origin, booking.petName, booking.id);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      window.prompt('复制以下内容发给主人：', text);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button variant="secondary" size="small" className={wide ? 'w-full' : 'flex-1'} onClick={copy}>
      {copied ? '✓ 已复制' : '复制状态链接'}
    </Button>
  );
}

function RoomAssign({
  booking,
  token,
  onSaved,
}: {
  booking: Booking;
  token: string;
  onSaved: () => void;
}) {
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [room, setRoom] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const checkIn = (booking.bookingDateTime || '').split(' ')[0] || '';

  // 由备注读出现有嘅房号同退房日期
  useEffect(() => {
    const m = (booking.notes || '').match(ROOM_LINE);
    setRoom(m ? m[1].trim() : '');
    setCheckOut(m && m[2] ? m[2] : '');
  }, [booking.notes]);

  // 拉当日房态，等店员睇到边间房仲有空
  useEffect(() => {
    if (!checkIn) return;
    let cancelled = false;
    fetch(`/api/public/rooms?date=${encodeURIComponent(checkIn)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled) setRooms(Array.isArray(d?.rooms) ? d.rooms : []);
      })
      .catch(() => {
        if (!cancelled) setRooms([]);
      });
    return () => {
      cancelled = true;
    };
  }, [checkIn]);

  const save = async (nextRoom: string, nextCheckOut: string) => {
    if (!nextRoom) return;
    setState('saving');
    try {
      const res = await fetch('/api/public/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          bookingId: booking.id,
          room: nextRoom,
          checkOutDate: nextCheckOut,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || '保存失败');
      }
      setState('saved');
      onSaved();
      window.setTimeout(() => setState('idle'), 2500);
    } catch (e: any) {
      console.error('房号保存失败:', e);
      setState('error');
    }
  };

  const statusText =
    state === 'saving' ? '保存中…' : state === 'saved' ? '已保存' : state === 'error' ? '保存失败' : '';

  return (
    <div className="bg-brand-v3-cream rounded-lg p-3 mb-3 text-xs">
      <div className="flex items-center justify-between mb-2">
        <p className="text-gray-500 font-medium">房间安排</p>
        <span
          className={`text-[11px] ${
            state === 'error'
              ? 'text-brand-v3-error'
              : state === 'saved'
                ? 'text-brand-v3-success'
                : 'text-gray-400'
          }`}
        >
          {statusText}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="block min-w-0">
          <span className="text-gray-400">房号</span>
          <select
            value={room}
            onChange={(e) => {
              setRoom(e.target.value);
              save(e.target.value, checkOut);
            }}
            className="mt-1 w-full px-2 py-1.5 bg-white rounded-lg border border-white/60 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-v3-gold"
          >
            <option value="">未安排</option>
            {ROOM_NAMES.map((name) => {
              const live = rooms.find((r) => r.name === name);
              return (
                <option key={name} value={name}>
                  {name} · {live ? (live.occupied ? '寄养中' : '空房可订') : '—'}
                </option>
              );
            })}
          </select>
        </label>
        <label className="block min-w-0">
          <span className="text-gray-400">退房日期</span>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => {
              setCheckOut(e.target.value);
              save(room, e.target.value);
            }}
            className="mt-1 w-full px-2 py-1.5 bg-white rounded-lg border border-white/60 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-v3-gold"
          />
        </label>
      </div>
      <p className="mt-2 text-[11px] text-gray-400">
        改咗即刻生效，顾客睇到嘅房态板会跟住变。
      </p>
    </div>
  );
}

function StaffLogin({ onSuccess }: { onSuccess: (token: string) => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 密码由服务端校验，通过后签发带 HMAC 签名的会话 token。
      // 前端的 localStorage 标记不再被当作后端授权依据。
      const session = await loginStaff(password);
      sessionStorage.setItem(STAFF_SESSION_KEY, session.token);
      onSuccess(session.token);
    } catch (err: any) {
      setError(err?.message || '登录失败，请重试');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-v3-cream flex items-center justify-center p-4">
      <div className="max-w-sm w-full">
        <NeumorphicCard>
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-brand-v3-gold/20 flex items-center justify-center">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none"
                   stroke="var(--brand-navy)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                   role="img" aria-label="员工登录">
                <rect x="4" y="10.5" width="16" height="10.5" rx="2.5" fill="var(--brand-gold)" fillOpacity="0.35" />
                <path d="M8 10.5V7.5a4 4 0 018 0v3" />
                <circle cx="12" cy="15.5" r="1.4" fill="var(--brand-navy)" stroke="none" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">员工登录</h3>
            <p className="text-sm text-gray-500 mb-6">请输入密码访问员工后台</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="w-full px-4 py-3 bg-brand-v3-cream border border-white/50 rounded-neumo-button shadow-neumo-pressed-sm focus:outline-none focus:ring-2 focus:ring-brand-v3-gold transition-all text-gray-900"
                autoFocus
              />
              
              {error && (
                <p className="text-brand-v3-error text-sm text-center">{error}</p>
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
  // 会话 token 由服务端签发并校验；本地只保存 token 本身，
  // 不再使用 localStorage 的「已登录」标记作为后端授权。
  const [staffToken, setStaffToken] = useState<string | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem(STAFF_SESSION_KEY);
    if (token) setStaffToken(token);
  }, []);

  const {
    pendingBookings,
    acceptedBookings,
    activeBookings,
    acceptBooking,
    pushToServiceBoard,
    startService,
    pauseService,
    finishService,
    calculateProgress,
    getCurrentStepName,
    calculateETA,
    getStepsWithStatus,
    serverError,
    reloadFromServer,
  } = useBookings(staffToken);

  const handleLogout = () => {
    sessionStorage.removeItem(STAFF_SESSION_KEY);
    setStaffToken(null);
  };

  if (!staffToken) {
    return <StaffLogin onSuccess={(token) => setStaffToken(token)} />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="sticky top-0 z-50 bg-brand-v3-cream/90 backdrop-blur-xl border-b border-white/40 mb-6">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-6 flex-wrap">
            <BrandHeader />
            <MagazineNav
              tone="light"
              items={[
                {
                  label: '健康追踪卡',
                  caption: 'HEALTH CARD',
                  href: '/pet-health-card.html',
                  external: true,
                },
                {
                  label: '返回客户看板',
                  caption: 'CUSTOMER BOARD',
                  href: '/',
                },
                {
                  label: '员工后台',
                  caption: 'STAFF',
                  active: true,
                },
              ]}
            />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="small" onClick={() => reloadFromServer?.()}>
            刷新
          </Button>
          <span className="text-xs text-gray-400">数据来自飞书多维表格，刷新可看到其他设备的最新预约</span>
        </div>
        <Button variant="secondary" size="small" onClick={handleLogout}>
          退出登录
        </Button>
      </div>
      {serverError && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <p className="font-medium">读取预约失败</p>
          <p className="mt-1 text-red-600">{serverError}</p>
        </div>
      )}
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
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-brand-v3-cream flex items-center justify-center">
                    <BrandIcon name="calendar" size={40} />
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

                      {booking.serviceType === ServiceType.BOARDING && (
                        <RoomAssign
                          booking={booking}
                          token={staffToken}
                          onSaved={() => reloadFromServer?.()}
                        />
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
                        <CopyStatusLinkButton booking={booking} />
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

                      {booking.serviceType === ServiceType.BOARDING && (
                        <RoomAssign
                          booking={booking}
                          token={staffToken}
                          onSaved={() => reloadFromServer?.()}
                        />
                      )}

                      <div className="flex gap-2">
                        <Button 
                          size="small" 
                          className="flex-1"
                          onClick={() => pushToServiceBoard(booking.id)}
                        >
                          推送到服务看板
                        </Button>
                        <CopyStatusLinkButton booking={booking} />
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
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-brand-v3-cream flex items-center justify-center">
                    <BrandPaw size={36} />
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
                        
                        {/* 寄养：冇洗护／造型嘅步骤进度，改显示房间安排 */}
                        {booking.serviceType === ServiceType.BOARDING ? (
                          <RoomAssign
                            booking={booking}
                            token={staffToken}
                            onSaved={() => reloadFromServer?.()}
                          />
                        ) : (
                          <>
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
                                    background: '#22C55E',
                                    boxShadow: 'none'
                                  }}
                                />
                              </div>
                            </div>

                            {/* Current Step Display */}
                            {stepName && (
                              <div className="mb-5 bg-brand-v3-info/10 rounded-xl p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="w-3 h-3 rounded-full bg-brand-v3-info animate-pulse"></span>
                                  <span className="text-sm font-medium text-brand-v3-info">当前步骤</span>
                                </div>
                                <p className="text-base font-semibold text-gray-900">{stepName}</p>
                                <div className="flex items-center gap-3 mt-3">
                                  <div className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    <span className="text-xs text-gray-400">已完成</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-brand-v3-info animate-pulse"></span>
                                    <span className="text-xs text-gray-400">进行中</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                                    <span className="text-xs text-gray-400">待处理</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {/* Info Grid */}
                        <div className="grid grid-cols-3 gap-2 mb-5 text-xs">
                          <div className="bg-brand-v3-cream rounded-lg p-2 text-center">
                            <p className="text-gray-500">{booking.serviceType === ServiceType.BOARDING ? '寄养时长' : '预计剩余'}</p>
                            <p className="font-semibold text-brand-v3-navy">
                              {booking.serviceType === ServiceType.BOARDING ? '按门店安排' : `${eta}分钟`}
                            </p>
                          </div>
                          <div className="bg-brand-v3-cream rounded-lg p-2 text-center">
                            <p className="text-gray-500">微信通知</p>
                            <p className={`font-semibold ${booking.wechatNoticeSent ? 'text-brand-v3-success' : 'text-gray-400'}`}>
                              {booking.wechatNoticeSent ? '已发送' : '未发送'}
                            </p>
                          </div>
                          <div className="bg-brand-v3-cream rounded-lg p-2 text-center">
                            <p className="text-gray-500">状态</p>
                            <p className="font-semibold text-brand-v3-navy">
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
                          <CopyStatusLinkButton booking={booking} wide />
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