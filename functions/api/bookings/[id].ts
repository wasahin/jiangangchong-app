type ServiceType = 'premium' | 'standard' | 'grooming';

type BookingStatus = 'pending' | 'accepted' | 'in_service' | 'completed' | 'cancelled';

interface WeightRange {
  label: string;
  min: number;
  max: number;
}

interface Booking {
  id: string;
  ownerName: string;
  phone: string;
  petName: string;
  serviceType: ServiceType;
  weightRange: WeightRange;
  bookingDateTime: string;
  vaccineDate: string;
  outsideGroomed: boolean;
  emotionStable: boolean;
  notes?: string;
  status: BookingStatus;
  currentPhase: string;
  currentStep: number;
  wechatNoticeSent: boolean;
  displayInServiceList: boolean;
  createdAt: string;
  updatedAt: string;
  serviceStartedAt?: string;
  isPaused?: boolean;
}

const WEIGHT_RANGES: WeightRange[] = [
  { label: '5kg以下', min: 0, max: 5 },
  { label: '5–10kg', min: 5, max: 10 },
  { label: '10kg以上', min: 10, max: 100 },
];

const GROOMING_STAGES: Record<ServiceType, Array<{ name: string; durationMinutes: number }>> = {
  standard: [
    { name: '全身吹毛检查', durationMinutes: 8 },
    { name: '脚底剃毛', durationMinutes: 5 },
    { name: '磨指甲', durationMinutes: 5 },
    { name: '剃腹底毛&屁屁周边', durationMinutes: 2 },
    { name: '清理耳朵&掏耳朵', durationMinutes: 10 },
    { name: '刷牙', durationMinutes: 2 },
    { name: '第一遍清洗', durationMinutes: 8 },
    { name: '第二遍清洗', durationMinutes: 8 },
    { name: '上护毛素', durationMinutes: 7 },
    { name: '吹干毛发', durationMinutes: 20 },
  ],
  premium: [
    { name: '全身吹毛检查', durationMinutes: 8 },
    { name: '脚底剃毛', durationMinutes: 5 },
    { name: '磨指甲', durationMinutes: 5 },
    { name: '剃腹底毛&屁屁周边', durationMinutes: 2 },
    { name: '清理耳朵&掏耳朵', durationMinutes: 10 },
    { name: '刷牙', durationMinutes: 2 },
    { name: '第一遍清洗', durationMinutes: 8 },
    { name: '第二遍清洗', durationMinutes: 8 },
    { name: '上护毛素', durationMinutes: 7 },
    { name: '吹干毛发', durationMinutes: 20 },
  ],
  grooming: [
    { name: '全身吹毛检查', durationMinutes: 8 },
    { name: '脚底剃毛', durationMinutes: 5 },
    { name: '磨指甲', durationMinutes: 5 },
    { name: '剃腹底毛&屁屁周边', durationMinutes: 2 },
    { name: '清理耳朵&掏耳朵', durationMinutes: 10 },
    { name: '刷牙', durationMinutes: 2 },
    { name: '第一遍清洗', durationMinutes: 8 },
    { name: '第二遍清洗', durationMinutes: 8 },
    { name: '吹干毛发', durationMinutes: 20 },
    { name: '剪毛', durationMinutes: 60 },
  ],
};

interface FeishuToken {
  tenant_access_token: string;
  expire: number;
}

interface FeishuBookingRecord {
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

interface Env {
  NEXT_PUBLIC_FEISHU_APP_ID: string;
  FEISHU_APP_SECRET: string;
  NEXT_PUBLIC_FEISHU_BASE_ID: string;
  NEXT_PUBLIC_FEISHU_TABLE_ID: string;
}

let tokenCache: { token: string; expireAt: number } | null = null;

async function getTenantToken(env: Env): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expireAt) {
    return tokenCache.token;
  }

  const res = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_id: env.NEXT_PUBLIC_FEISHU_APP_ID,
      app_secret: env.FEISHU_APP_SECRET,
    }),
  });

  const data: FeishuToken = await res.json();
  
  tokenCache = {
    token: data.tenant_access_token,
    expireAt: Date.now() + (data.expire - 300) * 1000,
  };

  return data.tenant_access_token;
}

async function getBookingById(bookingId: string, env: Env): Promise<FeishuBookingRecord | null> {
  const token = await getTenantToken(env);

  const res = await fetch(
    `https://open.feishu.cn/open-apis/bitable/v1/apps/${env.NEXT_PUBLIC_FEISHU_BASE_ID}/tables/${env.NEXT_PUBLIC_FEISHU_TABLE_ID}/records/search`,
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

async function createBookingInFeishu(bookingData: {
  pet_name: string;
  owner_name: string;
  phone: string;
  service_type: string;
}, env: Env): Promise<string> {
  const token = await getTenantToken(env);
  
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const random = Math.floor(Math.random() * 900 + 100);
  const bookingId = `JKC-${dateStr}-${random}`;

  const res = await fetch(
    `https://open.feishu.cn/open-apis/bitable/v1/apps/${env.NEXT_PUBLIC_FEISHU_BASE_ID}/tables/${env.NEXT_PUBLIC_FEISHU_TABLE_ID}/records`,
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

async function updateBookingStatus(
  bookingId: string,
  updates: { status?: string; current_step?: string; progress?: number },
  env: Env
): Promise<void> {
  const token = await getTenantToken(env);
  const record = await getBookingById(bookingId, env);
  if (!record) throw new Error('预订不存在');

  await fetch(
    `https://open.feishu.cn/open-apis/bitable/v1/apps/${env.NEXT_PUBLIC_FEISHU_BASE_ID}/tables/${env.NEXT_PUBLIC_FEISHU_TABLE_ID}/records/${record.record_id}`,
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

function parseText(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value.map(item => item.text || '').join('');
  }
  return String(value);
}

function mapFeishuToBooking(record: FeishuBookingRecord): Booking {
  const serviceType = parseText(record.fields.service_type) || 'standard';
  const steps = GROOMING_STAGES[serviceType as ServiceType];
  
  return {
    id: parseText(record.fields.booking_id) || '',
    ownerName: parseText(record.fields.owner_name) || '',
    phone: parseText(record.fields.phone) || '',
    petName: parseText(record.fields.pet_name) || '',
    serviceType: serviceType as ServiceType,
    weightRange: { label: '未知', min: 0, max: 0 },
    bookingDateTime: '',
    vaccineDate: '',
    outsideGroomed: false,
    emotionStable: true,
    notes: '',
    status: (parseText(record.fields.status) || '待审核') as BookingStatus,
    currentPhase: '',
    currentStep: parseInt(parseText(record.fields.current_step) || '0'),
    wechatNoticeSent: false,
    displayInServiceList: false,
    createdAt: record.fields.created_at ? new Date(record.fields.created_at).toISOString() : new Date().toISOString(),
    updatedAt: record.fields.updated_at ? new Date(record.fields.updated_at).toISOString() : new Date().toISOString(),
    serviceStartedAt: '',
    isPaused: false
  };
}

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  
  if (id) {
    try {
      const feishuBooking = await getBookingById(id, env);
      if (feishuBooking) {
        return new Response(JSON.stringify(mapFeishuToBooking(feishuBooking)), {
          headers: { 'Content-Type': 'application/json' },
          status: 200
        });
      }
    } catch (error) {
      console.warn('Failed to fetch from Feishu:', error);
    }
    
    return new Response(JSON.stringify({ error: '预约不存在' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 404
    });
  }
  
  return new Response(JSON.stringify([]), {
    headers: { 'Content-Type': 'application/json' },
    status: 200
  });
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;
  
  try {
    const body = await request.json();
    
    if (!body.ownerName || !body.petName) {
      return new Response(JSON.stringify({ error: '缺少必填字段' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
    const bookingId = `BK${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const weightRangeObj = WEIGHT_RANGES.find(w => w.label === body.weightRange) || WEIGHT_RANGES[0];
    
    const booking: Booking = {
      id: bookingId,
      ownerName: body.ownerName,
      phone: body.phone,
      petName: body.petName,
      serviceType: body.serviceType as ServiceType,
      weightRange: weightRangeObj,
      bookingDateTime: `${body.bookingDate} ${body.bookingTime}`,
      vaccineDate: body.vaccineDate,
      outsideGroomed: body.outsideGroomed === 'Yes',
      emotionStable: body.emotionStable === 'Yes',
      notes: body.notes,
      status: 'pending',
      currentPhase: '等待审核',
      currentStep: 0,
      wechatNoticeSent: false,
      displayInServiceList: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    try {
      await createBookingInFeishu({
        pet_name: body.petName,
        owner_name: body.ownerName,
        phone: body.phone,
        service_type: body.serviceType
      }, env);
    } catch (err) {
      console.warn('Failed to sync to Feishu:', err);
    }
    
    return new Response(JSON.stringify(booking), {
      headers: { 'Content-Type': 'application/json' },
      status: 201
    });
  } catch (error) {
    console.error('Create booking error:', error);
    return new Response(JSON.stringify({ error: '创建失败' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}

export async function onRequestPut(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;
  
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return new Response(JSON.stringify({ error: '缺少预约ID' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
    try {
      const booking = updates as Partial<Booking>;
      const currentStep = booking.currentStep ?? 0;
      const serviceType = booking.serviceType as ServiceType || 'standard';
      await updateBookingStatus(id, {
        status: booking.status,
        current_step: String(currentStep),
        progress: Math.floor((currentStep / (GROOMING_STAGES[serviceType]?.length || 10)) * 100)
      }, env);
    } catch (err) {
      console.warn('Failed to sync to Feishu:', err);
      return new Response(JSON.stringify({ error: '更新失败' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      });
    }
    
    return new Response(JSON.stringify({ ...body, updatedAt: new Date().toISOString() }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Update booking error:', error);
    return new Response(JSON.stringify({ error: '更新失败' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}