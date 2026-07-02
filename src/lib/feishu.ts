// 飞书(Feishu/Lark) API 集成
// 用于获取预订状态和生成固定状态链接

const FEISHU_APP_ID = process.env.NEXT_PUBLIC_FEISHU_APP_ID || '';
const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET || '';
const FEISHU_BASE_ID = process.env.NEXT_PUBLIC_FEISHU_BASE_ID || '';
const FEISHU_TABLE_ID = process.env.NEXT_PUBLIC_FEISHU_TABLE_ID || '';

interface FeishuToken {
  tenant_access_token: string;
  expire: number;
}

interface BookingRecord {
  record_id: string;
  fields: {
    booking_id?: string;
    pet_name?: string;
    owner_name?: string;
    phone?: string;
    service_type?: string;
    status?: string;
    current_step?: string;
    progress?: number;
    created_at?: number;
    updated_at?: number;
  };
}

let tokenCache: { token: string; expireAt: number } | null = null;

// 获取飞书 tenant_access_token
async function getTenantToken(): Promise<string> {
  // 检查缓存
  if (tokenCache && Date.now() < tokenCache.expireAt) {
    return tokenCache.token;
  }

  const res = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_id: FEISHU_APP_ID,
      app_secret: FEISHU_APP_SECRET,
    }),
  });

  const data: FeishuToken = await res.json();
  
  // 缓存 token（提前 5 分钟过期）
  tokenCache = {
    token: data.tenant_access_token,
    expireAt: Date.now() + (data.expire - 300) * 1000,
  };

  return data.tenant_access_token;
}

// 根据 booking_id 查询预订记录
export async function getBookingById(bookingId: string): Promise<BookingRecord | null> {
  const token = await getTenantToken();

  const res = await fetch(
    `https://open.feishu.cn/open-apis/bitable/v1/apps/${FEISHU_BASE_ID}/tables/${FEISHU_TABLE_ID}/records/search`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: {
          conjunction: 'and',
          conditions: [
            {
              field_name: 'booking_id',
              operator: 'is',
              value: [bookingId],
            },
          ],
        },
      }),
    }
  );

  const data = await res.json();
  
  if (data.data?.items?.length > 0) {
    return data.data.items[0];
  }
  
  return null;
}

// 生成固定状态链接
export function generateStatusLink(bookingId: string, origin?: string): string {
  const baseUrl = origin || process.env.NEXT_PUBLIC_APP_URL || 'https://jiangangchong-app.pages.dev';
  return `${baseUrl}/status?booking=${encodeURIComponent(bookingId)}`;
}

// 生成 booking_id（前端备用方案，建议由飞书自动生成）
export function generateBookingId(): string {
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const random = Math.floor(Math.random() * 900 + 100); // 100-999
  return `JKC-${dateStr}-${random}`;
}

// 创建新预订记录到飞书
export async function createBookingInFeishu(bookingData: {
  pet_name: string;
  owner_name: string;
  phone: string;
  service_type: string;
}): Promise<string> {
  const token = await getTenantToken();
  const bookingId = generateBookingId();

  const res = await fetch(
    `https://open.feishu.cn/open-apis/bitable/v1/apps/${FEISHU_BASE_ID}/tables/${FEISHU_TABLE_ID}/records`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          booking_id: bookingId,
          ...bookingData,
          status: '待审核',
          progress: 0,
          created_at: Date.now(),
          updated_at: Date.now(),
        },
      }),
    }
  );

  const data = await res.json();
  
  if (data.data?.record?.fields?.booking_id) {
    return data.data.record.fields.booking_id;
  }
  
  throw new Error('创建预订失败');
}

// 更新预订状态（员工端调用）
export async function updateBookingStatus(
  bookingId: string,
  updates: {
    status?: string;
    current_step?: string;
    progress?: number;
  }
): Promise<void> {
  const token = await getTenantToken();

  // 先查询 record_id
  const record = await getBookingById(bookingId);
  if (!record) throw new Error('预订不存在');

  await fetch(
    `https://open.feishu.cn/open-apis/bitable/v1/apps/${FEISHU_BASE_ID}/tables/${FEISHU_TABLE_ID}/records/${record.record_id}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          ...updates,
          updated_at: Date.now(),
        },
      }),
    }
  );
}

// 微信通知
export async function sendWeChatNotification(bookingId: string, phone: string): Promise<void> {
  // 实现微信通知逻辑
  console.log('Sending WeChat notification:', { bookingId, phone });
}

// 发送状态更新通知
export async function sendStatusUpdate(bookingId: string, message: string, phone: string): Promise<void> {
  console.log('Sending status update:', { bookingId, message, phone });
}
