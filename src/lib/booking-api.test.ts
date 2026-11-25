import {
  submitBooking,
  loginStaff,
  fetchStaffBookings,
  updateBookingRemote,
  BookingApiError,
} from '@/lib/booking-api';
import { BookingStatus, ServiceType } from '@/types/booking';

const payload = {
  ownerName: '测试主人',
  phone: '13800138000',
  petName: '测试豆豆',
  serviceType: ServiceType.PREMIUM_WASH,
  weightRange: '5kg以下',
  bookingDate: '2026-11-25',
  bookingTime: '10:00',
  vaccineDate: '2026-01-01',
  outsideGroomed: 'No',
  emotionStable: 'Yes',
  notes: '测试单',
};

let fetchMock: jest.Mock;

function mockFetchOnce(status: number, body: any) {
  fetchMock = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as any);
  (globalThis as any).fetch = fetchMock;
  return fetchMock;
}

afterEach(() => {
  delete (globalThis as any).fetch;
  jest.restoreAllMocks();
});

describe('booking-api — 顾客提交', () => {
  it('服务端确认写入后返回预约，并带上飞书生成的唯一 id', async () => {
    const spy = mockFetchOnce(201, {
      id: '12',
      petName: '测试豆豆',
      ownerName: '测试主人',
      serviceType: '精致洗',
      status: BookingStatus.PENDING,
    });

    const booking = await submitBooking(payload);

    expect(booking.id).toBe('12');
    expect(booking.status).toBe(BookingStatus.PENDING);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toBe('/api/bookings');
    expect(spy.mock.calls[0][1]?.method).toBe('POST');
  });

  it('飞书写入失败时抛错 —— 不得当作提交成功', async () => {
    mockFetchOnce(502, {
      error: '写入飞书失败，预约未创建',
      code: 'FEISHU_WRITE_FAILED',
      detail: 'Forbidden',
    });

    await expect(submitBooking(payload)).rejects.toThrow(BookingApiError);
    await expect(submitBooking(payload)).rejects.toThrow('写入飞书失败，预约未创建');
  });

  it('响应缺少 id 时视为失败', async () => {
    mockFetchOnce(201, { petName: '测试豆豆' });
    await expect(submitBooking(payload)).rejects.toThrow('预约提交失败，请稍后再试');
  });

  it('网络异常时抛错并提示未提交', async () => {
    (globalThis as any).fetch = jest.fn().mockRejectedValue(new Error('boom'));
    await expect(submitBooking(payload)).rejects.toThrow('网络异常，预约未提交，请稍后再试');
  });
});

describe('booking-api — 员工会话', () => {
  it('密码正确时换取 token', async () => {
    const spy = mockFetchOnce(200, { ok: true, token: 'abc.def', expiresAt: 123 });

    const session = await loginStaff('correct-password');

    expect(session.token).toBe('abc.def');
    expect(spy.mock.calls[0][0]).toBe('/api/staff-session');
  });

  it('密码错误时抛错并带出服务端提示', async () => {
    mockFetchOnce(401, { error: '密码错误，请重试', code: 'BAD_PASSWORD' });
    await expect(loginStaff('wrong')).rejects.toThrow('密码错误，请重试');
  });
});

describe('booking-api — 员工读取与审核', () => {
  it('读取员工列表时带上 Bearer token', async () => {
    const spy = mockFetchOnce(200, { bookings: [{ id: '12' }], count: 1 });

    const bookings = await fetchStaffBookings('staff-token');

    expect(bookings).toHaveLength(1);
    expect(spy.mock.calls[0][0]).toBe('/api/bookings?scope=staff');
    expect((spy.mock.calls[0][1]?.headers as any).Authorization).toBe('Bearer staff-token');
  });

  it('没有鉴权时（401）抛错，不返回任何客单', async () => {
    mockFetchOnce(401, { error: '需要员工鉴权', code: 'STAFF_AUTH_REQUIRED' });
    await expect(fetchStaffBookings('bad-token')).rejects.toThrow('需要员工鉴权');
  });

  it('接受预约时提交 id 与更新内容到服务端', async () => {
    const spy = mockFetchOnce(200, { id: '12', status: BookingStatus.ACCEPTED });

    const updated = await updateBookingRemote('staff-token', '12', {
      status: BookingStatus.ACCEPTED,
      currentPhase: '等待到店',
    });

    expect(updated.status).toBe(BookingStatus.ACCEPTED);
    const body = JSON.parse((spy.mock.calls[0][1]?.body as string));
    expect(body.id).toBe('12');
    expect(body.status).toBe(BookingStatus.ACCEPTED);
    expect((spy.mock.calls[0][1]?.headers as any).Authorization).toBe('Bearer staff-token');
  });
});
