'use client';

import { useState, useEffect, useRef } from 'react';
import { NeumorphicCard } from '@/components/NeumorphicCard';
import { Button } from '@/components/Button';
import { Navigation } from '@/components/Navigation';
import { BrandHeader } from '@/components/BrandHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { HouseIcon } from '@/components/HouseIcon';
import { BrandPaw, WarningGlyph } from '@/components/BookingUI';
import { MagazineNav } from '@/components/MagazineNav';
import { useBookings } from '@/hooks/useBookings';
import { ServiceType, BookingStatus } from '@/types/booking';
import { WEIGHT_RANGES } from '@/lib/constants';

type PriceRow = {
  label: string;
  sub?: string;
  values: string[];
  accent?: boolean;
};

type ServiceMenu = {
  id: string;
  title: string;
  subtitle: string;
  labelHeader: string;
  columns: string[];
  rows: PriceRow[];
  notes: string[];
  action: 'book' | 'consult';
};

/** 房态资料：由 /api/rooms 提供，公开接口、唔含任何客人资料 */
type RoomInfo = {
  name: string;
  type: string;
  capacity: string;
  price: string;
  occupied: boolean;
};

/** 房态灯：'free' 空房可订 · 'busy' 已占用 · 'unknown' 暂时查唔到 */
type RoomState = 'free' | 'busy' | 'unknown';

/**
 * 寄养房型：价目表同房态板共用一份资料，唔会两边走样。
 *  - 小房 × 3：小型一只，¥80/天
 *  - 大房 × 2：小型三只／大型一只，¥120/天
 */
const BOARDING_ROOMS = [
  { label: '小房', capacity: '小型一只', price: '¥80/天', count: 3 },
  { label: '大房', capacity: '小型三只／大型一只', price: '¥120/天', count: 2 },
];

/** 5 间房嘅名册：小房1-3、大房1-2 */
const ROOM_CATALOGUE = BOARDING_ROOMS.flatMap((group) =>
  Array.from({ length: group.count }, (_, i) => ({
    name: `${group.label}${i + 1}`,
    type: group.label,
    capacity: group.capacity,
    price: group.price,
  }))
);

/** 房态板分组：小房 3 间、大房 2 间 */
const ROOM_GROUPS = BOARDING_ROOMS.map((group) => ({
  ...group,
  rooms: ROOM_CATALOGUE.filter((room) => room.type === group.label),
}));

/** 把接口返回嘅占用情况套到房名册上面；live = null 就当暂时查唔到 */
function mergeRooms(live: RoomInfo[] | null): RoomInfo[] {
  return ROOM_CATALOGUE.map((room) => ({
    ...room,
    occupied: live?.find((r) => r.name === room.name)?.occupied ?? false,
  }));
}

/** 房态灯：绿色空房、红色占用、灰色查唔到 */
function RoomLight({ state }: { state: RoomState }) {
  const color =
    state === 'busy' ? 'bg-brand-v3-error' : state === 'free' ? 'bg-brand-v3-success' : 'bg-gray-300';
  return <span aria-hidden="true" className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${color}`} />;
}

/** 一间房嘅状态卡 */
function RoomTile({ room, state }: { room: Omit<RoomInfo, 'occupied'>; state: RoomState }) {
  // 用词跟门店口径：空房可订 / 寄养中（唔讲「已占用」，顾客睇唔出係咩服务）
  const label = state === 'busy' ? '寄养中' : state === 'free' ? '空房可订' : '状态未知';
  const color =
    state === 'busy' ? 'text-brand-v3-error' : state === 'free' ? 'text-brand-v3-success' : 'text-gray-400';
  return (
    <div
      data-room={room.name}
      data-room-state={state}
      className={`rounded-neumo-button px-2.5 py-2.5 shadow-neumo-pressed-sm ${
        state === 'busy' ? 'bg-brand-v3-error/5' : 'bg-brand-v3-surface'
      }`}
    >
      <div className="flex items-center gap-1.5">
        <RoomLight state={state} />
        <span className="text-[15px] font-semibold text-brand-v3-ink">{room.name}</span>
      </div>
      <p className={`mt-1 text-[12px] leading-none ${color}`}>{label}</p>
    </div>
  );
}

/**
 * 房态板：5 间房，绿色空房可订、红色已经有人住。
 * 放喺寄养价目表下面 —— 客人睇到价，就即刻睇到仲有边间房得。
 */
function RoomBoard({
  rooms,
  unknown,
  failed,
  date,
  onDateChange,
}: {
  rooms: RoomInfo[];
  unknown: boolean;
  failed: boolean;
  date: string;
  onDateChange: (value: string) => void;
}) {
  return (
    <div className="mt-6 border-t border-dashed border-brand-v3-gold/25 pt-4" data-room-board="true">
      <div className="flex items-center justify-between gap-3">
        <h4 className="font-display-italic text-xl text-brand-v3-ink">房态</h4>
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          aria-label="查看房态嘅日期"
          className="rounded-neumo-button bg-brand-v3-cream border border-white/50 px-2.5 py-1.5 text-[13px] text-gray-900 shadow-neumo-pressed-sm focus:outline-none focus:ring-2 focus:ring-brand-v3-gold"
        />
      </div>
      <p className="mt-1.5 text-[12px] text-gray-500">
        <span className="inline-block h-2 w-2 rounded-full bg-brand-v3-success align-middle" /> 空房可订
        <span className="mx-1.5">·</span>
        <span className="inline-block h-2 w-2 rounded-full bg-brand-v3-error align-middle" /> 寄养中
      </p>

      {failed && (
        <p className="mt-2 rounded-neumo-button bg-brand-v3-warning/10 px-3 py-2 text-[12px] text-brand-v3-warning shadow-neumo-pressed-sm">
          暂时读唔到实时房态，请以门店确认为准
        </p>
      )}

      {ROOM_GROUPS.map((group) => (
        <div key={group.label} className="mt-4">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-[13px] font-semibold text-gray-700">
              {group.label} · {group.capacity}
            </p>
            <p className="shrink-0 text-[13px] font-semibold text-brand-v3-navy">{group.price}</p>
          </div>
          <div
            className="mt-2 grid gap-2"
            style={{ gridTemplateColumns: `repeat(${group.count}, minmax(0, 1fr))` }}
          >
            {group.rooms.map((room) => {
              const live = rooms.find((r) => r.name === room.name);
              const state: RoomState = unknown ? 'unknown' : live?.occupied ? 'busy' : 'free';
              return <RoomTile key={room.name} room={room} state={state} />;
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 价目数据来源：用户上传的价目原图（05/06/07/08/09.png），不是任何一方估算的数字。
 *  - 狗狗洗护：05.png（5 KG以下 ¥80 / ¥98 … 35–40 KG ¥220 / ¥238，长毛／卷毛加收¥10/只）
 *  - 猫咪洗护：07.png（2 KG以下 ¥68 / ¥88 … 10 KG以上 另行报价，长毛加收¥10/只）
 *  - 美容造型：06.png（2 KG以下 ¥120 / ¥180 … 10 KG以上 ¥240 / ¥300，特别造型另行报价）
 *  - 寄养住宿：新店 5 间房（小房 × 3 ¥80/天，大房 × 2 ¥120/天，同房加宠 +¥40/只）
 *  - 单选项目：08.png（2026-11-27 用户决定：唔再分去洗护／造型分页，独立一个「单选项目」分页）
 */
const SERVICE_MENUS: ServiceMenu[] = [
  {
    id: 'wash',
    title: '狗狗洗护',
    subtitle: 'DOG BATH & CARE',
    labelHeader: '体重 / 项目',
    columns: ['标准洗', '精致洗'],
    rows: [
      { label: '5 KG以下', values: ['¥80', '¥98'] },
      { label: '5–10 KG', values: ['¥100', '¥118'] },
      { label: '10–15 KG', values: ['¥120', '¥138'] },
      { label: '15–20 KG', values: ['¥140', '¥158'] },
      { label: '20–25 KG', values: ['¥160', '¥178'] },
      { label: '25–30 KG', values: ['¥180', '¥198'] },
      { label: '30–35 KG', values: ['¥200', '¥218'] },
      { label: '35–40 KG', values: ['¥220', '¥238'] },
      { label: '长毛／卷毛', values: ['加收¥10/只', '加收¥10/只'], accent: true },
    ],
    notes: [
      '80斤以上犬只面议，阿拉斯加、萨摩、巨贵、哈士奇等中大型犬另行报价',
      '老年猫犬、术后猫犬及需特殊护理的猫犬，请另行咨询报价',
      '春节假期期间价格另有调整',
    ],
    action: 'book',
  },
  {
    id: 'cat',
    title: '猫咪洗护',
    subtitle: 'CAT BATH & CARE',
    labelHeader: '体重 / 项目',
    columns: ['标准洗', '精致洗'],
    rows: [
      { label: '2 KG以下', values: ['¥68', '¥88'] },
      { label: '2–4 KG', values: ['¥88', '¥128'] },
      { label: '4–7 KG', values: ['¥108', '¥148'] },
      { label: '7–10 KG', values: ['¥128', '¥168'] },
      { label: '10 KG以上', values: ['另行报价', '另行报价'], accent: true },
      { label: '长毛', values: ['加收¥10/只', '加收¥10/只'], accent: true },
    ],
    notes: [
      '老年猫犬、术后猫犬及需特殊护理的猫犬，请另行咨询报价',
      '春节假期期间价格另有调整',
    ],
    action: 'consult',
  },
  {
    id: 'grooming',
    title: '美容造型',
    subtitle: 'GROOMING & STYLING',
    labelHeader: '体重 / 项目',
    columns: ['标准', '精致'],
    rows: [
      { label: '2 KG以下', values: ['¥120', '¥180'] },
      { label: '2–4 KG', values: ['¥150', '¥210'] },
      { label: '4–7 KG', values: ['¥180', '¥240'] },
      { label: '7–10 KG', values: ['¥210', '¥270'] },
      { label: '10 KG以上', values: ['¥240', '¥300'] },
      { label: '特别造型', values: ['另行报价', '另行报价'], accent: true },
    ],
    notes: [
      '80斤以上犬只面议，阿拉斯加、萨摩、巨贵、哈士奇等中大型犬另行报价',
      '老年猫犬、术后猫犬及需特殊护理的猫犬，请另行咨询报价',
      '春节假期期间价格另有调整',
    ],
    action: 'book',
  },
  {
    id: 'boarding',
    title: '寄养住宿',
    subtitle: 'PET BOARDING',
    labelHeader: '房型 / 加项',
    columns: ['价格'],
    rows: [
      ...BOARDING_ROOMS.map((group) => ({
        label: group.label,
        sub: group.capacity,
        values: [group.price],
      })),
      { label: '同一房间增加宠物数量', values: ['加¥40/只'], accent: true },
    ],
    notes: ['春节假期期间价格另有调整'],
    action: 'consult',
  },
  {
    // 2026-11-27 用户决定：单选项目唔再分去洗护／造型分页，独立一个分页（放喺最后）
    id: 'extras',
    title: '单选项目',
    subtitle: 'ADD-ONS',
    labelHeader: '项目 / 价格',
    columns: ['价格'],
    rows: [
      { label: '剪指甲', values: ['¥20'] },
      { label: '刷牙', values: ['¥20'] },
      { label: '剃脚底毛', values: ['¥20'] },
      { label: '贵宾脚', values: ['¥20'] },
      { label: '药浴', values: ['¥20'] },
      { label: '局部去油', values: ['¥50'] },
      { label: '全身美白（30斤内）', values: ['¥50'] },
      { label: 'SPA淋巴排毒', values: ['¥50'] },
      { label: '开结', values: ['¥100/小时'] },
      { label: '深层去毛', values: ['¥20–100'] },
    ],
    notes: ['单选项目系加项，要配合洗护或者造型一齐做'],
    action: 'consult',
  },
];

/** 宣傳卡：圖片由用戶上載原圖自行裁切（裁走左側品牌欄），存於 public/homepage-promo/ */
/**
 * 標題刻意寫短（4 字），副句承載細節：
 * 手機窄屏上面，長標題會斷成兩行，藍色文案區即刻膨脹到成張卡一半高，
 * 令下面真正嘅內容（價目表）被推走。短標題 + 單行副句 = 高度固定。
 */
const PROMOS = [
  {
    id: 'membership',
    tag: 'MEMBERSHIP',
    title: '洗护会员',
    hint: '无需充值 · 累计到店越洗越省',
    image: '/homepage-promo/membership.webp',
    menu: 0,
  },
  {
    id: 'care',
    tag: 'GROOMING',
    title: '专业洗护',
    hint: '按状态护理 · 造型不套模板',
    image: '/homepage-promo/care.webp',
    menu: 2,
  },
  {
    id: 'boarding',
    tag: 'BOARDING',
    title: '寄养住宿',
    hint: '小房大房 · 实时房态可查',
    image: '/homepage-promo/boarding.webp',
    menu: 3,
  },
];

export default function CustomerPage() {
  const {
    activeBookings,
    createBooking,
    calculateProgress,
    getCurrentStepName,
    calculateETA,
    counts,
    refreshCounts,
    getAllBookings
  } = useBookings();

  const [lastBookingId, setLastBookingId] = useState<string>('');
  const lastBooking = activeBookings.find(b => b.id === lastBookingId);
  const [activeSection, setActiveSection] = useState<string>('section-status');

  // Track which section is in view; updates MagazineNav active state
  useEffect(() => {
    const ids = ['section-status', 'section-active', 'booking-form'];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);
  
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
  
  const [menu, setMenu] = useState(0);
  const [promoIndex, setPromoIndex] = useState(0);
  const promoStripRef = useRef<HTMLDivElement | null>(null);
  const promoIndexRef = useRef(0);
  const lastManualScrollAt = useRef(0);
  const autoScrollingRef = useRef(false);
  const current = SERVICE_MENUS[menu];

  // ── 房态（5 间房）──
  // 房态由 /api/rooms 提供：公开接口，只讲边间房被占，唔讲客人资料。
  // 初始值唔可以用 new Date()：静态导出嘅 HTML 係 build 时生成嘅，
  // 用 build 当日做初始值，customer 隔日开页面就会 hydration mismatch。
  const [boardDate, setBoardDate] = useState('');
  const [boardLive, setBoardLive] = useState<RoomInfo[] | null>(null);
  const [boardLoaded, setBoardLoaded] = useState(false);
  const [formLive, setFormLive] = useState<RoomInfo[] | null>(null);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');

  // 本地日期（唔用 toISOString，避免 UTC 跨日问题）
  const todayLocal = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // 挂载之后先填今日（client only，唔会同 build 时嘅 HTML 打架）
  useEffect(() => {
    if (!boardDate) setBoardDate(todayLocal());
  }, [boardDate]);

  const fetchRooms = async (date: string): Promise<RoomInfo[] | null> => {
    if (!date) return null;
    try {
      const res = await fetch(`/api/rooms?date=${encodeURIComponent(date)}`);
      if (!res.ok) return null;
      const data = await res.json();
      if (!Array.isArray(data?.rooms)) return null;
      return data.rooms;
    } catch {
      return null;
    }
  };

  // 房态板：睇住嗰一日嘅占用
  useEffect(() => {
    if (!boardDate) return;
    let cancelled = false;
    fetchRooms(boardDate).then((live) => {
      if (cancelled) return;
      setBoardLive(live);
      setBoardLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [boardDate]);

  // 预约表：只有拣咗寄养先需要睇当日仲有边间房
  useEffect(() => {
    if (formData.serviceType !== ServiceType.BOARDING || !formData.bookingDate) {
      setFormLive(null);
      return;
    }
    let cancelled = false;
    fetchRooms(formData.bookingDate).then((live) => {
      if (cancelled) return;
      setFormLive(live);
    });
    return () => {
      cancelled = true;
    };
  }, [formData.serviceType, formData.bookingDate]);

  // 表单拣咗寄养日期 → 上面房态板跟住睇同一日
  useEffect(() => {
    if (formData.serviceType === ServiceType.BOARDING && formData.bookingDate) {
      setBoardDate(formData.bookingDate);
    }
  }, [formData.serviceType, formData.bookingDate]);

  // 预约表可拣嘅房间：占用了嘅会 disabled
  const formRoomOptions = mergeRooms(formLive);
  const formRoomUnknown = formLive === null;

  // 自动揀一间空房（客人可以自己改）
  useEffect(() => {
    if (formData.serviceType !== ServiceType.BOARDING) return;
    const current = formRoomOptions.find((r) => r.name === selectedRoom);
    if (current && !current.occupied) return;
    const free = formRoomOptions.find((r) => !r.occupied);
    if (free) setSelectedRoom(free.name);
  }, [formLive, formData.serviceType, selectedRoom]);

  // 退房日期最少要喺入住日期嘅第二日
  const minCheckOutDate = (() => {
    const base = formData.bookingDate || todayLocal();
    const m = base.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return '';
    const t = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + 1);
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  })();

  const promoStep = (el: HTMLElement) => {
    const first = el.firstElementChild as HTMLElement | null;
    return first ? first.offsetWidth + 12 : el.clientWidth; // gap-3
  };

  // 宣傳卡：手指掃動時更新頁數點；自動輪播嘅 scroll 唔會當成手動
  const handlePromoScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    const first = el.firstElementChild as HTMLElement | null;
    if (!first) return;
    const index = Math.round(el.scrollLeft / promoStep(el));
    const next = Math.max(0, Math.min(PROMOS.length - 1, index));
    setPromoIndex(next);
    promoIndexRef.current = next;
    if (!autoScrollingRef.current) lastManualScrollAt.current = Date.now();
  };

  const scrollToPromo = (index: number) => {
    const el = promoStripRef.current;
    if (!el) return;
    autoScrollingRef.current = true;
    el.scrollTo({ left: index * promoStep(el), behavior: 'smooth' });
    window.setTimeout(() => { autoScrollingRef.current = false; }, 800);
  };

  // 自動輪播：每 4.5 秒換一張；用戶自己掃過之後停 9 秒先再自動播
  useEffect(() => {
    const timer = window.setInterval(() => {
      const el = promoStripRef.current;
      if (!el || document.hidden) return;
      if (Date.now() - lastManualScrollAt.current < 9000) return;
      const next = (promoIndexRef.current + 1) % PROMOS.length;
      autoScrollingRef.current = true;
      el.scrollTo({ left: next * promoStep(el), behavior: 'smooth' });
      window.setTimeout(() => { autoScrollingRef.current = false; }, 800);
    }, 4500);
    return () => window.clearInterval(timer);
  }, []);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshCounts();
    }, 30000);
    return () => clearInterval(interval);
  }, [refreshCounts]);

  const allBookings = getAllBookings ? getAllBookings() : activeBookings;

  /**
   * 寄养唔喺「门店实况」出现：寄养冇洗护／造型嘅步骤进度，
   * 放喺 Live 板只会见到一个永远 0% 嘅进度条。寄养嘅状态由房态板讲
   * （空房可订 / 寄养中），顾客睇房就得。
   */
  const liveBookings = activeBookings.filter((b) => b.serviceType !== ServiceType.BOARDING);
  const liveCounts = {
    pending: allBookings.filter(
      (b) => b.status === BookingStatus.PENDING && b.serviceType !== ServiceType.BOARDING
    ).length,
    accepted: allBookings.filter(
      (b) => b.status === BookingStatus.ACCEPTED && b.serviceType !== ServiceType.BOARDING
    ).length,
    inService: allBookings.filter(
      (b) =>
        b.displayInServiceList &&
        b.status !== BookingStatus.COMPLETED &&
        b.serviceType !== ServiceType.BOARDING
    ).length,
  };
  
  const getBookedTimeSlots = (date: string) => {
    const slots = new Set<string>();
    allBookings.forEach(booking => {
      if (booking.bookingDateTime && booking.bookingDateTime.startsWith(date)) {
        const time = booking.bookingDateTime.split(' ')[1];
        if (time) {
          slots.add(time);
        }
      }
    });
    return slots;
  };

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

  const bookedSlots = formData.bookingDate ? getBookedTimeSlots(formData.bookingDate) : new Set<string>();

  /**
   * 寄养嘅房号 + 退房日期（写喺备注）。
   * 飞书表冇新字段（bookings.js 冻结，加唔到），备注係唯一自由文字通道；
   * 房态就由呢行推算，所以顾客一落单，房间即刻变「寄养中」。
   */
  const roomNoteForBooking =
    formData.serviceType === ServiceType.BOARDING && selectedRoom
      ? `【房号：${selectedRoom}｜退房：${checkOutDate}】`
      : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 同一个浏览器可以提交多张预约（不同宠物 / 不同日期时段都可以）。
    // 这里只保留提交期间的防连按，不再限制「每日一次」。
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // 由服务端写入飞书并校验后才算成功；失败会抛错。
      // 寄养嘅房号随预约一齐写入备注（顾客嘅备注明唔会受影响）。
      const booking = await createBooking({
        ...formData,
        notes: roomNoteForBooking
          ? `${roomNoteForBooking}\n${formData.notes}`.trim()
          : formData.notes,
      });
      if (booking) {
        setLastBookingId(booking.id);
        setSubmitted(true);
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      setSubmitError(error?.message || '预约提交失败，请稍后再试');
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
    setSubmitError(null);
    setSelectedRoom('');
    setCheckOutDate('');
  };

  const handleScrollToForm = () => {
    document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const selectService = (serviceType: ServiceType) => {
    setFormData(previous => ({ ...previous, serviceType }));
    handleScrollToForm();
  };

  /**
   * 貓／寄養：唔再整「複製微信號」，直接跳去預約表單嘅日期欄，
   * 俾客人自己揀日期、睇仲有邊啲時段夾到（時段已佔用嘅會喺下拉度消失）。
   * 順手幫客人喺備註填返服務類型，俾店員一眼睇到係貓洗護定寄養。
   */
  const goToAvailableSlots = (serviceType: ServiceType | null, note: string) => {
    setFormData(previous => ({
      ...previous,
      serviceType: serviceType ?? previous.serviceType,
      notes: note || previous.notes,
    }));
    const dateInput = document.querySelector('#booking-form input[type="date"]');
    if (dateInput) {
      dateInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      handleScrollToForm();
    }
  };

  const handleScrollToSection = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const details = document.querySelector<HTMLDetailsElement>('details#section-active');
    if (id === 'section-active' && details) details.open = true;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (submitted && lastBooking) {
    const statusLink = `${window.location.origin}/status?booking=${lastBooking.id}`;
    return (
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <BrandHeader />
        
        <NeumorphicCard>
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-brand-v3-success/20 flex items-center justify-center shadow-neumo-pressed-md">
              <svg className="w-10 h-10 text-brand-v3-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">预约已提交</h3>
            <p className="text-gray-500 mb-4">请等待门店审核确认</p>
            <p className="text-sm text-gray-400 mb-6">
              门店确认后会通过微信通知您
            </p>
            <div className="bg-brand-v3-warning/10 rounded-neumo-button p-4 text-sm text-brand-v3-warning shadow-neumo-pressed-sm mb-4">
              <p className="flex items-start gap-2">
                <WarningGlyph size={16} className="mt-0.5" />
                <span>注意：最终服务适宜性由美容师现场评估后确定</span>
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-xs text-gray-500 mb-2">您的专属状态链接</p>
              <p className="font-mono text-xs text-brand-v3-gold break-all mb-3">{statusLink}</p>
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
    <div className="max-w-lg lg:max-w-5xl mx-auto px-4 lg:px-16 pr-14 lg:pr-32 py-6 space-y-6 relative">
      {/* Magazine-style section TOC — fixed side rail, always visible */}
      <div className="fixed right-2 lg:right-6 top-1/2 -translate-y-1/2 z-30">
        <MagazineNav
          orientation="vertical"
          tone="light"
          hideLineOnMobile
          className="gap-2 lg:gap-3"
          items={[
            {
              label: '价目',
              caption: 'STATUS',
              onClick: handleScrollToSection('section-status'),
              active: activeSection === 'section-status',
            },
            {
              label: '实况',
              caption: 'ACTIVE',
              onClick: handleScrollToSection('section-active'),
              active: activeSection === 'section-active',
            },
            {
              label: '预约',
              caption: 'BOOK',
              onClick: handleScrollToForm,
              active: activeSection === 'booking-form',
            },
          ]}
        />
      </div>

      {/* ── 門頭 + 宣傳卡（橫向自動輪播 + 頁數點） ── */}
      <section id="section-top" className="scroll-mt-20">
        <div className="mb-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <img
              src="/logo-jingangchong-mark.png"
              alt=""
              className="h-16 sm:h-20 w-auto shrink-0 select-none"
              draggable={false}
            />
            <div className="min-w-0">
              <h1 className="font-display-italic text-[40px] sm:text-5xl leading-none text-brand-v3-ink">金刚宠</h1>
              <p className="font-mono text-[11px] sm:text-xs tracking-widest text-gray-400 mt-2">MODERN PET CARE SOLUTIONS</p>
            </div>
          </div>
          {/* 標語獨立一行：跟爪印並排嗰陣淨返 228px，會令最後個「气」跌落去第二行 */}
          <p className="font-display-italic text-[18px] sm:text-xl leading-snug text-brand-v3-terracotta mt-3">
            人和毛孩子，都在这儿松口气
          </p>
        </div>

        <div
          ref={promoStripRef}
          onScroll={handlePromoScroll}
          aria-label="门店精选，左右滑动"
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {PROMOS.map((promo, i) => (
            <button
              key={promo.id}
              type="button"
              onClick={() => {
                setMenu(promo.menu);
                document.getElementById('section-status')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="min-w-[92%] sm:min-w-[45%] snap-start overflow-hidden rounded-2xl bg-brand-v3-navy text-left text-white shadow-neumo-raised-md"
            >
              <img
                src={promo.image}
                alt={`${promo.title} · ${promo.hint}`}
                width={960}
                height={720}
                loading={i === 0 ? 'eager' : 'lazy'}
                className="aspect-[4/3] w-full object-cover object-top"
              />
              {/* 文案區：標題 + 英文 tag 同一行，副句第二行；全部 nowrap/truncate，唔會斷行 */}
              <div className="px-4 pt-2.5 pb-3">
                <div className="flex items-baseline gap-3">
                  <span className="min-w-0 flex-1 font-display-italic text-[22px] sm:text-[24px] leading-tight truncate">
                    {promo.title}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] tracking-widest text-brand-v3-gold">{promo.tag}</span>
                </div>
                <p className="mt-1 text-[12px] sm:text-[13px] leading-snug text-white/70 truncate">{promo.hint}</p>
              </div>
            </button>
          ))}
        </div>

        {/* 頁數點：跟自動輪播／手指掃動同步，右下角 */}
        <div className="mt-2 flex items-center justify-end gap-1 pr-1" role="group" aria-label="切换推荐">
          {PROMOS.map((promo, i) => (
            <button
              key={promo.id}
              type="button"
              aria-label={`第${i + 1}张推荐`}
              aria-current={promoIndex === i}
              onClick={() => scrollToPromo(i)}
              className="flex h-10 w-10 items-center justify-center"
            >
              <span
                className={`block h-1.5 rounded-full transition-all duration-300 ${
                  promoIndex === i ? 'w-6 bg-brand-v3-terracotta' : 'w-1.5 bg-brand-v3-navy/25'
                }`}
              />
            </button>
          ))}
        </div>
      </section>

      {/* ── 服務捷徑 + 價目表 ── */}
      <section id="section-status" className="scroll-mt-20">
        <h2 className="font-display-italic text-[32px] sm:text-4xl leading-tight">服务与价目</h2>
        <p className="font-mono text-xs sm:text-sm tracking-widest mb-4">SERVICES &amp; PRICES</p>

        {/* 5 个分页：4 个服务 + 1 个「单选项目」（手机上面单选项目独占一行） */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {SERVICE_MENUS.map((item, i) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={menu === i}
              onClick={() => setMenu(i)}
              className={`min-h-12 rounded-xl px-2 py-2 text-[15px] font-semibold transition-colors ${
                item.id === 'extras' ? 'col-span-2 sm:col-span-1' : ''
              } ${menu === i ? 'bg-brand-v3-navy text-white shadow-neumo-pressed-sm' : 'bg-brand-v3-surface text-brand-v3-navy shadow-neumo-raised-sm'}`}
            >
              {item.title}
            </button>
          ))}
        </div>

        <NeumorphicCard className="mt-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-display-italic text-[28px] sm:text-3xl leading-tight text-brand-v3-ink">{current.title}</h3>
            <span className="font-mono text-[10px] tracking-widest text-brand-v3-terracotta">{current.subtitle}</span>
          </div>

          {/* 用 grid 唔用 table：手機上面欄位唔會俾價錢欄壓到逐隻字斷行 */}
          <div className="mt-4">
            <div
              className="grid gap-x-3 pb-2 border-b border-brand-v3-gold/30 items-baseline"
              style={{ gridTemplateColumns: `minmax(0,1fr) repeat(${current.columns.length}, auto)` }}
            >
              <span className="text-[13px] sm:text-xs font-semibold text-gray-500 whitespace-nowrap">{current.labelHeader}</span>
              {current.columns.map((col) => (
                <span key={col} className="text-[13px] sm:text-xs font-semibold text-gray-500 text-right whitespace-nowrap">
                  {col}
                </span>
              ))}
            </div>

            {current.rows.map((row) => (
              <div
                key={row.label}
                className="grid gap-x-3 py-2.5 border-b border-brand-v3-gold/15 items-baseline"
                style={{ gridTemplateColumns: `minmax(0,1fr) repeat(${current.columns.length}, auto)` }}
              >
                <span className="text-[16px] sm:text-[17px] leading-snug text-brand-v3-ink">
                  {row.label}
                  {row.sub && <span className="block text-[13px] text-gray-500">{row.sub}</span>}
                </span>
                {row.values.map((value, i) => (
                  <span
                    key={i}
                    className={`text-[16px] sm:text-[17px] font-semibold text-right whitespace-nowrap ${
                      row.accent ? 'text-brand-v3-terracotta' : 'text-brand-v3-navy'
                    }`}
                  >
                    {value}
                  </span>
                ))}
              </div>
            ))}
          </div>

          {current.id === 'boarding' && (
            <RoomBoard
              rooms={mergeRooms(boardLive)}
              unknown={boardLive === null}
              failed={boardLoaded && boardLive === null}
              date={boardDate}
              onDateChange={setBoardDate}
            />
          )}

          <ul className="mt-4 space-y-1.5 text-[13px] sm:text-sm leading-relaxed text-gray-500">
            {current.notes.map((note) => (
              <li key={note}>· {note}</li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap gap-2">
            {current.id === 'wash' && (
              <>
                <Button variant="pink" onClick={() => selectService(ServiceType.STANDARD_WASH)}>预约此服务 · 标准洗</Button>
                <Button variant="pink" onClick={() => selectService(ServiceType.PREMIUM_WASH)}>预约此服务 · 精致洗</Button>
              </>
            )}
            {current.id === 'grooming' && (
              <Button variant="pink" onClick={() => selectService(ServiceType.GROOMING)}>预约此服务 · 美容</Button>
            )}
            {(current.id === 'cat' || current.id === 'boarding') && (
              current.id === 'cat' ? (
                <Button onClick={() => goToAvailableSlots(ServiceType.PREMIUM_WASH, '猫咪洗护')}>查看可约档期</Button>
              ) : (
                <Button onClick={() => goToAvailableSlots(ServiceType.BOARDING, '')}>查看可约档期</Button>
              )
            )}
            {current.id === 'extras' && (
              <Button onClick={() => goToAvailableSlots(null, '')}>去预约洗护 / 造型</Button>
            )}
          </div>
        </NeumorphicCard>
      </section>

      {/* Public Status Dashboard - Current Services */}
      <details id="section-active" className="scroll-mt-20">
        <summary className="cursor-pointer font-display-italic text-xl py-3">门店实况 · 查看详情</summary>
      {/* Live Store Status Board — Brand v2 functional colors */}
      <div className="grid grid-cols-3 gap-3 scroll-mt-20">
        <div className="bg-brand-v3-surface rounded-neumo-card p-4 text-center shadow-neumo-raised-md">
          <p className="text-[28px] font-bold text-brand-v3-warning">{liveCounts.pending}</p>
          <p className="text-xs text-gray-400 mt-1">待审核</p>
        </div>
        <div className="bg-brand-v3-surface rounded-neumo-card p-4 text-center shadow-neumo-raised-md">
          <p className="text-[28px] font-bold text-brand-v3-success">{liveCounts.accepted}</p>
          <p className="text-xs text-gray-400 mt-1">已确认</p>
        </div>
        <div className="bg-brand-v3-surface rounded-neumo-card p-4 text-center shadow-neumo-raised-md">
          <p className="text-[28px] font-bold text-brand-v3-info">{liveCounts.inService}</p>
          <p className="text-xs text-gray-400 mt-1">服务中</p>
        </div>
      </div>
      

      <NeumorphicCard padding="p-0" className="overflow-hidden">
        {/* Magazine-style gradient cover — same palette as health card head */}
        <div
          className="relative px-5 sm:px-6 pt-5 pb-6 sm:pt-7 sm:pb-9"
          style={{
            background: '#1B3A5C',
          }}
        >
          <div className="flex items-start justify-between">
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/85">
              此刻 · Now
            </span>
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/85 flex items-center gap-1.5">
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute inset-0 rounded-full bg-white/70 animate-ping" />
                <span className="relative w-1.5 h-1.5 rounded-full bg-white" />
              </span>
              Streaming
            </span>
          </div>

          <div className="mt-4 sm:mt-6 flex items-end justify-between gap-4">
            <h1 className="font-display-italic text-white text-4xl sm:text-5xl leading-none drop-shadow-sm">
              Live
            </h1>
            <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/80 pb-1 text-right">
              {(() => {
                const d = new Date();
                const hh = d.getHours().toString().padStart(2, '0');
                const mm = d.getMinutes().toString().padStart(2, '0');
                return `${hh}:${mm} — now`;
              })()}
            </p>
          </div>
        </div>

        {/* Content area — section title + service list */}
        <div className="px-5 sm:px-6 pt-5 pb-5 sm:pb-6">
          <div className="flex items-start justify-between mb-4 gap-4">
            <div>
              <h2 className="font-display-italic text-2xl text-gray-900">当前服务中</h2>
              <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-brand-v3-gold mt-1">
                Live Services
              </p>
            </div>
          </div>

          {liveBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-brand-v3-cream flex items-center justify-center">
                <BrandPaw size={40} />
              </div>
              <p className="text-sm">暂无正在进行的服务</p>
            </div>
          ) : (
          <div className="space-y-4">
            {liveBookings.map(booking => {
              const progress = calculateProgress(booking);
              const stepName = getCurrentStepName(booking);
              const eta = calculateETA(booking);
              
              return (
                <div key={booking.id} className="bg-brand-v3-cream rounded-neumo-button p-4 shadow-neumo-pressed-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{booking.petName}</p>
                      <p className="text-xs text-gray-400">{booking.serviceType}</p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-3 h-3 rounded-full bg-brand-v3-info animate-pulse"></span>
                      <span className="text-sm font-medium text-brand-v3-info">当前步骤</span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{stepName}</span>
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
                          background: 'var(--brand-gold)',
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
                  
                  <div className="flex items-center justify-between">
                    {booking.serviceType === ServiceType.BOARDING ? (
                      <div className="text-xs">
                        <span className="text-gray-400">寄养时间按门店安排</span>
                      </div>
                    ) : (
                      <div className="text-xs">
                        <span className="text-gray-400">预计剩余 </span>
                        <span className="font-semibold text-brand-v3-gold">{eta}分钟</span>
                      </div>
                    )}
                    <div className={`px-2.5 py-1 rounded-neumo-pill text-xs font-medium ${
                      booking.wechatNoticeSent
                        ? 'bg-brand-v3-success/20 text-brand-v3-success shadow-neumo-pressed-sm'
                        : 'bg-brand-v3-cream text-gray-400 shadow-neumo-pressed-sm'
                    }`}>
                      {booking.wechatNoticeSent ? '通知已发送' : '等待通知'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>
      </NeumorphicCard>
      </details>
      
      {/* Booking Form — header merged from former Shop Info Card */}
      <div id="booking-form" className="scroll-mt-20">
        <NeumorphicCard
          customShadow="0 0 0 1px #E6DCCB"
          
        >
          <div className="flex items-start gap-4 mb-4">
            <img
              src="/logo-jingangchong.png"
              alt="金刚宠"
              className="h-[52px] w-auto flex-shrink-0 select-none"
              draggable={false}
            />
            <div className="flex-1">
              <h3 className="font-display-italic text-2xl text-gray-900">金刚宠宠物美容</h3>
              <p className="text-sm text-gray-500 mt-0.5">专业宠物美容护理服务</p>
              <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-brand-v3-gold mt-1">
                Premier Pet Grooming Studio
              </p>
            </div>
          </div>

          <div className="bg-brand-v3-warning/10 rounded-neumo-button p-3 mb-4 shadow-neumo-pressed-sm">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-v3-warning/25 text-brand-v3-warning rounded-neumo-pill text-xs font-medium">
              <WarningGlyph size={12} />
              预约需门店审核
            </span>
            <p className="text-xs text-brand-v3-warning/90 mt-2">
              提交预约后需要门店审核确认，最终服务时间以门店确认为准。
            </p>
          </div>

          <div className="border-t border-dashed border-brand-v3-gold/25 mb-4" />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">主人姓名 *</label>
              <input
                type="text"
                required
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full px-4 py-3 bg-brand-v3-cream border border-white/50 rounded-neumo-button shadow-neumo-pressed-sm focus:outline-none focus:ring-2 focus:ring-brand-v3-gold transition-all text-gray-900"
                placeholder="请输入您的姓名"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">联系电话</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-brand-v3-cream border border-white/50 rounded-neumo-button shadow-neumo-pressed-sm focus:outline-none focus:ring-2 focus:ring-brand-v3-gold transition-all text-gray-900"
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
                className="w-full px-4 py-3 bg-brand-v3-cream border border-white/50 rounded-neumo-button shadow-neumo-pressed-sm focus:outline-none focus:ring-2 focus:ring-brand-v3-gold transition-all text-gray-900"
                placeholder="请输入宠物名字"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">服务类型 *</label>
              <select
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value as ServiceType })}
                className="w-full px-4 py-3 bg-brand-v3-cream border border-white/50 rounded-neumo-button shadow-neumo-pressed-sm focus:outline-none focus:ring-2 focus:ring-brand-v3-gold transition-all text-gray-900"
              >
                <option value={ServiceType.PREMIUM_WASH}>精致洗</option>
                <option value={ServiceType.STANDARD_WASH}>标准洗</option>
                <option value={ServiceType.GROOMING}>美容</option>
                <option value={ServiceType.BOARDING}>寄养</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">体重范围 *</label>
              <select
                value={formData.weightRange}
                onChange={(e) => setFormData({ ...formData, weightRange: e.target.value })}
                className="w-full px-4 py-3 bg-brand-v3-cream border border-white/50 rounded-neumo-button shadow-neumo-pressed-sm focus:outline-none focus:ring-2 focus:ring-brand-v3-gold transition-all text-gray-900"
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
                  className="w-full px-4 py-3 bg-brand-v3-cream border border-white/50 rounded-neumo-button shadow-neumo-pressed-sm focus:outline-none focus:ring-2 focus:ring-brand-v3-gold transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">预约时间 *</label>
                <select
                  required
                  value={formData.bookingTime}
                  onChange={(e) => setFormData({ ...formData, bookingTime: e.target.value })}
                  className="w-full px-4 py-3 bg-brand-v3-cream border border-white/50 rounded-neumo-button shadow-neumo-pressed-sm focus:outline-none focus:ring-2 focus:ring-brand-v3-gold transition-all text-gray-900"
                >
                  <option value="">选择时间</option>
                  {generateTimeOptions().map(time => {
                    const isBooked = bookedSlots.has(time);
                    return (
                      <option 
                        key={time} 
                        value={time}
                        disabled={isBooked}
                        className={isBooked ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : ''}
                      >
                        {time} {isBooked && '(已预约)'}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            
            {/* ROOM-FIELDS-BEGIN 2026-11-27 用户确认新增：寄养拣房 + 退房日期 */}
            {formData.serviceType === ServiceType.BOARDING && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">选择房间 *</label>
                  <select
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="w-full px-4 py-3 bg-brand-v3-cream border border-white/50 rounded-neumo-button shadow-neumo-pressed-sm focus:outline-none focus:ring-2 focus:ring-brand-v3-gold transition-all text-gray-900"
                  >
                    <option value="">请选择房间</option>
                    {formRoomOptions.map((room) => (
                      <option key={room.name} value={room.name} disabled={room.occupied}>
                        {room.name} · {room.price} · {room.occupied ? '寄养中' : formRoomUnknown ? '状态未知' : '空房可订'}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1.5 text-[12px] text-gray-500">
                    按 {formData.bookingDate || '所选日期'} 的房态显示，已经被占用的房间拣唔到。
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">退房日期 *</label>
                  <input
                    type="date"
                    required
                    min={minCheckOutDate}
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full px-4 py-3 bg-brand-v3-cream border border-white/50 rounded-neumo-button shadow-neumo-pressed-sm focus:outline-none focus:ring-2 focus:ring-brand-v3-gold transition-all text-gray-900"
                  />
                  <p className="mt-1.5 text-[12px] text-gray-500">
                    退房当日房间会自动放空，之后就可以再订。
                  </p>
                </div>
              </>
            )}
            {/* ROOM-FIELDS-END */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">疫苗日期</label>
              <input
                type="date"
                value={formData.vaccineDate}
                onChange={(e) => setFormData({ ...formData, vaccineDate: e.target.value })}
                className="w-full px-4 py-3 bg-brand-v3-cream border border-white/50 rounded-neumo-button shadow-neumo-pressed-sm focus:outline-none focus:ring-2 focus:ring-brand-v3-gold transition-all"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">曾在其他店美容</label>
                <select
                  value={formData.outsideGroomed}
                  onChange={(e) => setFormData({ ...formData, outsideGroomed: e.target.value })}
                  className="w-full px-4 py-3 bg-brand-v3-cream border border-white/50 rounded-neumo-button shadow-neumo-pressed-sm focus:outline-none focus:ring-2 focus:ring-brand-v3-gold transition-all text-gray-900"
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
                  className="w-full px-4 py-3 bg-brand-v3-cream border border-white/50 rounded-neumo-button shadow-neumo-pressed-sm focus:outline-none focus:ring-2 focus:ring-brand-v3-gold transition-all text-gray-900"
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
                className="w-full px-4 py-3 bg-brand-v3-cream border border-white/50 rounded-neumo-button shadow-neumo-pressed-sm focus:outline-none focus:ring-2 focus:ring-brand-v3-gold transition-all resize-none text-gray-900"
                rows={3}
                placeholder="如有特殊需求请备注"
              />
            </div>
            
            <div className="bg-brand-v3-warning/10 rounded-neumo-button p-3 text-sm text-brand-v3-warning shadow-neumo-pressed-sm">
              <p className="flex items-start gap-2">
                <WarningGlyph size={16} className="mt-0.5" />
                <span>提交预约后需要门店审核确认，最终服务时间以门店确认为准。最终服务适宜性由美容师现场评估后确定。</span>
              </p>
            </div>
            
            {submitError && (
              <div
                role="alert"
                className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <p className="font-medium">预约未提交</p>
                <p className="mt-1 text-red-600">{submitError}</p>
                <p className="mt-1 text-xs text-red-500">
                  预约需要写入门店系统才算成功，请稍后再试或直接致电门店。
                </p>
              </div>
            )}

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
      
      <footer className="text-center py-6">
        <a 
          href="/staff" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-gray-400 text-xs hover:text-gray-600 transition-colors"
        >
          内部入口
        </a>
      </footer>
      
      <Navigation currentPage="home" />
    </div>
  );
}
