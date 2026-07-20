const GROOMING_STAGES = {
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

let tokenCache = null;

async function getTenantToken(env) {
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

  const data = await res.json();

  tokenCache = {
    token: data.tenant_access_token,
    expireAt: Date.now() + (data.expire - 300) * 1000,
  };

  return data.tenant_access_token;
}

function parseText(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value.map(function(item) { return item.text || ''; }).join('');
  }
  return String(value);
}

async function getBookingById(bookingId, env) {
  const token = await getTenantToken(env);

  const res = await fetch(
    'https://open.feishu.cn/open-apis/bitable/v1/apps/' + env.NEXT_PUBLIC_FEISHU_BASE_ID + '/tables/' + env.NEXT_PUBLIC_FEISHU_TABLE_ID + '/records/search',
    {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
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

  if (data.data && data.data.items && data.data.items.length > 0) {
    return data.data.items[0];
  }

  return null;
}

function mapFeishuToBooking(record) {
  const serviceType = parseText(record.fields.service_type) || 'standard';

  return {
    id: parseText(record.fields.booking_id) || '',
    ownerName: parseText(record.fields.owner_name) || '',
    phone: parseText(record.fields.phone) || '',
    petName: parseText(record.fields.pet_name) || '',
    serviceType: serviceType,
    weightRange: { label: '未知', min: 0, max: 0 },
    bookingDateTime: '',
    vaccineDate: '',
    outsideGroomed: false,
    emotionStable: true,
    notes: '',
    status: parseText(record.fields.status) || '待审核',
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

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const id = url.searchParams.get('id');

  if (id) {
    try {
      const feishuBooking = await getBookingById(id, context.env);
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

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();

    if (!body.ownerName || !body.petName) {
      return new Response(JSON.stringify({ error: '缺少必填字段' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400
      });
    }

    const bookingId = 'BK' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();

    const booking = {
      id: bookingId,
      ownerName: body.ownerName,
      phone: body.phone,
      petName: body.petName,
      serviceType: body.serviceType,
      weightRange: { label: body.weightRange || '5kg以下', min: 0, max: 5 },
      bookingDateTime: (body.bookingDate || '') + ' ' + (body.bookingTime || ''),
      vaccineDate: body.vaccineDate || '',
      outsideGroomed: body.outsideGroomed === 'Yes',
      emotionStable: body.emotionStable === 'Yes',
      notes: body.notes || '',
      status: 'pending',
      currentPhase: '等待审核',
      currentStep: 0,
      wechatNoticeSent: false,
      displayInServiceList: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const token = await getTenantToken(context.env);
      await fetch(
        'https://open.feishu.cn/open-apis/bitable/v1/apps/' + context.env.NEXT_PUBLIC_FEISHU_BASE_ID + '/tables/' + context.env.NEXT_PUBLIC_FEISHU_TABLE_ID + '/records',
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fields: {
              booking_id: bookingId,
              pet_name: body.petName,
              owner_name: body.ownerName,
              phone: body.phone,
              service_type: body.serviceType,
              status: '待审核',
              progress: 0,
              created_at: Date.now(),
              updated_at: Date.now(),
            },
          }),
        }
      );
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

export async function onRequestPut(context) {
  try {
    const body = await context.request.json();
    const id = body.id;
    const updates = {};
    for (const key in body) {
      if (key !== 'id') {
        updates[key] = body[key];
      }
    }

    if (!id) {
      return new Response(JSON.stringify({ error: '缺少预约ID' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400
      });
    }

    try {
      const currentStep = updates.currentStep || 0;
      const serviceType = updates.serviceType || 'standard';
      const stages = GROOMING_STAGES[serviceType] || GROOMING_STAGES.standard;
      const progress = Math.floor((currentStep / stages.length) * 100);

      const token = await getTenantToken(context.env);
      const record = await getBookingById(id, context.env);
      if (!record) throw new Error('预订不存在');

      await fetch(
        'https://open.feishu.cn/open-apis/bitable/v1/apps/' + context.env.NEXT_PUBLIC_FEISHU_BASE_ID + '/tables/' + context.env.NEXT_PUBLIC_FEISHU_TABLE_ID + '/records/' + record.record_id,
        {
          method: 'PUT',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fields: {
              status: updates.status,
              current_step: String(currentStep),
              progress: progress,
              updated_at: Date.now(),
            },
          }),
        }
      );
    } catch (err) {
      console.warn('Failed to sync to Feishu:', err);
      return new Response(JSON.stringify({ error: '更新失败' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      });
    }

    updates.updatedAt = new Date().toISOString();
    return new Response(JSON.stringify(updates), {
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
