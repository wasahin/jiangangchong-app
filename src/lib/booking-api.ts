import { Booking, ServiceType } from '@/types/booking';

/**
 * 预约 API 客户端（飞书多维表格为唯一数据源）
 *
 * - 顾客端提交：POST /api/public/bookings —— 服务端写入飞书并校验后才返回 201；
 *   写入失败会返回 5xx，调用方必须显示错误提示，不得当作成功。
 * - 员工端读取：GET /api/public/bookings?scope=staff —— 需要 Bearer token。
 * - 员工端更新：PUT /api/public/bookings —— 需要 Bearer token，更新同一笔记录。
 */

export class BookingApiError extends Error {
  status: number;
  code?: string;
  detail?: string;

  constructor(message: string, status: number, code?: string, detail?: string) {
    super(message);
    this.name = 'BookingApiError';
    this.status = status;
    this.code = code;
    this.detail = detail;
  }
}

async function readError(res: Response, fallback: string): Promise<BookingApiError> {
  let payload: any = null;
  try {
    payload = await res.json();
  } catch {
    // ignore
  }
  return new BookingApiError(
    payload?.error || fallback,
    res.status,
    payload?.code,
    payload?.detail,
  );
}

export interface SubmitBookingPayload {
  ownerName: string;
  phone?: string;
  petName: string;
  serviceType: ServiceType;
  weightRange: string;
  bookingDate: string;
  bookingTime: string;
  vaccineDate: string;
  outsideGroomed: string;
  emotionStable: string;
  notes?: string;
}

/** 顾客提交预约。只有服务端确认写入飞书后才算成功。 */
export async function submitBooking(payload: SubmitBookingPayload): Promise<Booking> {
  let res: Response;
  try {
    res = await fetch('/api/public/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new BookingApiError('网络异常，预约未提交，请稍后再试', 0, 'NETWORK_ERROR');
  }

  if (!res.ok) {
    throw await readError(res, '预约提交失败，请稍后再试');
  }

  const booking = (await res.json()) as Booking;
  if (!booking || !booking.id) {
    throw new BookingApiError('预约提交失败，请稍后再试', res.status, 'EMPTY_RESPONSE');
  }
  return booking;
}

export interface StaffSession {
  token: string;
  expiresAt: number;
}

/** 员工登录：用密码换服务端签发的 token。 */
export async function loginStaff(password: string): Promise<StaffSession> {
  const res = await fetch('/api/public/staff-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) {
    throw await readError(res, '登录失败，请重试');
  }
  return (await res.json()) as StaffSession;
}

/** 员工端拉取全部预约（跨浏览器/跨设备）。 */
export async function fetchStaffBookings(token: string): Promise<Booking[]> {
  const res = await fetch('/api/public/bookings?scope=staff', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw await readError(res, '读取预约失败');
  }
  const payload = await res.json();
  return Array.isArray(payload) ? payload : payload?.bookings || [];
}

/** 员工端更新预约（更新同一笔飞书记录）。 */
export async function updateBookingRemote(
  token: string,
  id: string,
  updates: Partial<Booking>,
): Promise<Booking> {
  const res = await fetch('/api/public/bookings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id, ...updates }),
  });
  if (!res.ok) {
    throw await readError(res, '更新失败，请重试');
  }
  return (await res.json()) as Booking;
}
