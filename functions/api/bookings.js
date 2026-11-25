/**
 * 宠老板后端 — 预约（飞书多维表格为唯一数据源）
 *
 * 表结构（2026-11-25 已核实，字段名用 ASCII，便于程序引用）：
 *  - booking_id        AutoNumber（type=1005）—— 飞书自动生成，**不能写入字符串**
 *  - pet_name          Text
 *  - owner_name        Text
 *  - phone             Phone
 *  - service_type      SingleSelect: 标准洗 / 精致洗 / 美容 / 寄养 / 医疗问诊 / 其他服务
 *  - status            SingleSelect: 待审核 / 已接受 / 服务中 / 已完成
 *  - current_step      Text（存当前步骤序号）
 *  - progress          Number
 *  - created_at        DateTime
 *  - updated_at        DateTime
 *  - weight_range      SingleSelect: 5kg以下 / 5–10kg / 10kg以上（与网站标签完全一致）
 *  - booking_datetime  Text（"YYYY-MM-DD HH:MM"）
 *  - vaccine_date      DateTime（需转毫秒时间戳）
 *  - notes             Text
 *  - outside_groomed   SingleSelect: Yes / No
 *  - emotion_stable    SingleSelect: Yes / No
 *  - not_settled       Text（未用）
 *  - site_booking_id   Text（**可选**）：存在时用它做站点唯一 id；
 *                      不存在时回落到 booking_id（自增、可被枚举 —— 建议补上这个字段）
 *
 * 权限模型：
 *  - 顾客端 POST 公开：写入飞书并读回校验后才返回 201；写入失败返回 5xx。
 *  - 员工端 GET ?scope=staff 与 PUT 需要 `Authorization: Bearer <staff token>`；
 *    token 由 POST /api/staff-session 用密码换取（服务端 HMAC 签发 + 校验）。
 *  - 无 id 的公开 GET 一律 401，不会回传任何客单。
 */

import crypto from 'node:crypto';

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
    { name: '上护毛素', durationMinutes: 7 },
    { name: '吹干毛发', durationMinutes: 20 },
    { name: '剪毛', durationMinutes: 60 },
  ],
};

const FIELD = {
  PET: 'pet_name',
  OWNER: 'owner_name',
  PHONE: 'phone',
  SERVICE: 'service_type',
  STATUS: 'status',
  STEP: 'current_step',
  PROGRESS: 'progress',
  CREATED: 'created_at',
  UPDATED: 'updated_at',
  WEIGHT: 'weight_range',
  DATETIME: 'booking_datetime',
  NOTES: 'notes',
  VACCINE: 'vaccine_date',
  OUTSIDE: 'outside_groomed',
  EMOTION: 'emotion_stable',
  // 站点自用 ID（可选字段）。存在时用它做唯一 id，避免 AutoNumber 递增 id 被枚举。
  SITE_ID: 'site_booking_id',
};

// DateTime 字段必须用毫秒时间戳；'YYYY-MM-DD' 按东八区零点解析
function toFeishuTimestamp(value) {
  if (value === null || value === undefined || value === '') return undefined;
  if (typeof value === 'number') return value;
  const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    const t = Date.parse(`${m[1]}-${m[2]}-${m[3]}T00:00:00+08:00`);
    return Number.isFinite(t) ? t : undefined;
  }
  const t = Date.parse(String(value));
  return Number.isFinite(t) ? t : undefined;
}

const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  });

const tokenCaches = new Map();
const schemaCaches = new Map();

async function getTenantToken(env) {
  const appId = env.NEXT_PUBLIC_FEISHU_APP_ID || '';
  const cached = tokenCaches.get(appId);
  if (cached && Date.now() < cached.expireAt) return cached.token;

  let lastError = null;
  // 冷启动首次请求偶发失败，重试一次再放弃
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const res = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app_id: env.NEXT_PUBLIC_FEISHU_APP_ID,
          app_secret: env.FEISHU_APP_SECRET,
        }),
      });
      const data = await res.json();
      if (!data.tenant_access_token) {
        throw new Error(`飞书鉴权失败: ${data.msg || data.code || 'unknown'}`);
      }
      tokenCaches.set(appId, {
        token: data.tenant_access_token,
        expireAt: Date.now() + Math.max(60, (data.expire || 7200) - 300) * 1000,
      });
      return data.tenant_access_token;
    } catch (error) {
      lastError = error;
      console.warn(`tenant token attempt ${attempt + 1} failed:`, error.message);
      if (attempt === 0) await new Promise((r) => setTimeout(r, 600));
    }
  }
  throw lastError || new Error('飞书鉴权失败');
}

function apiBase(env) {
  return `https://open.feishu.cn/open-apis/bitable/v1/apps/${env.NEXT_PUBLIC_FEISHU_BASE_ID}/tables/${env.NEXT_PUBLIC_FEISHU_TABLE_ID}`;
}

/** 读取表结构：字段名集合 + 单选字段的可选值。只发送表里真实存在的字段。 */
async function getSchema(env) {
  const key = env.NEXT_PUBLIC_FEISHU_TABLE_ID || '';
  const cached = schemaCaches.get(key);
  if (cached && Date.now() < cached.expireAt) return cached;

  const token = await getTenantToken(env);
  const res = await fetch(`${apiBase(env)}/fields?page_size=100`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (data.code !== 0) throw new Error(`读取表结构失败: ${data.msg || data.code}`);

  const names = new Set();
  const options = {};
  const types = {};
  for (const f of data.data?.items || []) {
    names.add(f.field_name);
    types[f.field_name] = f.type;
    if (f.property?.options) {
      options[f.field_name] = new Set(f.property.options.map((o) => o.name));
    }
  }
  const schema = { names, options, types, expireAt: Date.now() + 5 * 60 * 1000 };
  schemaCaches.set(key, schema);
  return schema;
}

/** DateTime 字段（type=5）必须用毫秒时间戳；其余类型原样发送 */
function coerceValue(key, value, schema) {
  const type = schema.types ? schema.types[key] : undefined;
  if (type === 5) return toFeishuTimestamp(value);
  return value;
}

/**
 * 只保留表里存在的字段；单选字段还要校验取值合法；
 * DateTime 字段按 schema 的实际类型转成毫秒时间戳。
 */
function sanitizeFields(fields, schema) {
  const out = {};
  const dropped = [];
  for (const [key, value] of Object.entries(fields)) {
    if (!schema.names.has(key)) { dropped.push(key); continue; }
    const allowed = schema.options[key];
    if (allowed && !allowed.has(value)) { dropped.push(`${key}=${value}`); continue; }
    if (value === undefined) continue;
    out[key] = coerceValue(key, value, schema);
  }
  return { fields: out, dropped };
}

function parseText(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map((item) => item.text || '').join('');
  return String(value);
}

function parseNumber(value) {
  const n = parseFloat(String(value ?? '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function phaseFromStatus(status, step) {
  if (status === '已完成') return '服务完成';
  if (status === '服务中') return step > 0 ? '服务进行中' : '等待开始服务';
  if (status === '已接受') return '等待到店';
  return '等待审核';
}

const STEP_BY_PHASE = {
  预约提交: 0, 等待审核: 0, 已确认: 0, 等待到店: 0, 等待开始: 0, 等待开始服务: 0,
  服务中: 1, 服务进行中: 1, 服务暂停: 1, 已完成: 99, 服务完成: 99,
};

function mapFeishuToBooking(record, { includePhone = true } = {}) {
  const fields = record.fields || {};
  const status = parseText(fields[FIELD.STATUS]) || '待审核';
  const rawStep = parseText(fields[FIELD.STEP]);
  let currentStep = parseInt(rawStep, 10);
  if (!Number.isFinite(currentStep)) currentStep = STEP_BY_PHASE[rawStep] ?? 0;
  const bookingDateTime = parseText(fields[FIELD.DATETIME]);
  const siteId = parseText(fields[FIELD.SITE_ID]);

  return {
    id: siteId || parseText(fields.booking_id) || record.record_id || '',
    recordId: record.record_id || '',
    ownerName: parseText(fields[FIELD.OWNER]) || '',
    phone: includePhone ? parseText(fields[FIELD.PHONE]) || '' : '',
    petName: parseText(fields[FIELD.PET]) || '',
    serviceType: parseText(fields[FIELD.SERVICE]) || '标准洗',
    weightRange: { label: parseText(fields[FIELD.WEIGHT]) || '未知', min: 0, max: 0 },
    bookingDateTime,
    vaccineDate: parseText(fields[FIELD.VACCINE]) || '',
    outsideGroomed: parseText(fields[FIELD.OUTSIDE]) === 'Yes',
    emotionStable: parseText(fields[FIELD.EMOTION]) !== 'No',
    notes: parseText(fields[FIELD.NOTES]) || '',
    status,
    currentPhase: phaseFromStatus(status, currentStep),
    currentStep,
    progress: parseNumber(fields[FIELD.PROGRESS]),
    wechatNoticeSent: false,
    displayInServiceList: status === '服务中',
    createdAt: fields[FIELD.CREATED] ? new Date(Number(fields[FIELD.CREATED])).toISOString() : new Date().toISOString(),
    updatedAt: fields[FIELD.UPDATED] ? new Date(Number(fields[FIELD.UPDATED])).toISOString() : new Date().toISOString(),
    serviceStartedAt: '',
    isPaused: false,
  };
}

/**
 * 按 id 找记录。
 * 优先用 site_booking_id（站点自用 id，不可枚举）；
 * 没有该字段时回落到 booking_id（AutoNumber，递增且可枚举 —— 只应作为过渡方案）。
 */
async function findRecordById(bookingId, env) {
  const token = await getTenantToken(env);
  const id = String(bookingId || '').trim();
  if (!id) return null;

  const schema = await getSchema(env);
  const hasSiteId = schema.names.has(FIELD.SITE_ID);

  const search = async (fieldName, value) => {
    const res = await fetch(`${apiBase(env)}/records/search`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page_size: 1,
        filter: {
          conjunction: 'and',
          conditions: [{ field_name: fieldName, operator: 'is', value: [value] }],
        },
      }),
    });
    const data = await res.json();
    return data.code === 0 && data.data?.items?.length ? data.data.items[0] : null;
  };

  if (hasSiteId) {
    const bySite = await search(FIELD.SITE_ID, id);
    if (bySite) return bySite;
  }

  // booking_id 是 AutoNumber（数字型）：先按数字查，再按字符串查
  const numeric = Number(id);
  let record = Number.isFinite(numeric) ? await search('booking_id', numeric) : null;
  if (!record) record = await search('booking_id', id);
  if (record) return record;

  // 兜底：分页扫描比对
  let pageToken = null;
  for (let i = 0; i < 50; i += 1) {
    const url = `${apiBase(env)}/records?page_size=100${pageToken ? `&page_token=${encodeURIComponent(pageToken)}` : ''}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (data.code !== 0) break;
    const items = data.data?.items || [];
    const hit = items.find((it) =>
      String(it.fields?.[FIELD.SITE_ID] ?? '') === id
      || String(it.fields?.booking_id ?? '') === id
    );
    if (hit) return hit;
    if (!data.data?.has_more || !data.data?.page_token) break;
    pageToken = data.data.page_token;
  }
  return null;
}

async function listAllRecords(env) {
  const token = await getTenantToken(env);
  const out = [];
  let pageToken = null;
  for (let i = 0; i < 100; i += 1) {
    const url = `${apiBase(env)}/records?page_size=100${pageToken ? `&page_token=${encodeURIComponent(pageToken)}` : ''}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (data.code !== 0) throw new Error(`读取记录失败: ${data.msg || data.code}`);
    for (const item of data.data?.items || []) out.push(item);
    if (!data.data?.has_more || !data.data?.page_token) break;
    pageToken = data.data.page_token;
  }
  return out;
}

// ─────────────────────────── 员工鉴权 ───────────────────────────

function staffSecret(env) {
  return env.STAFF_TOKEN_SECRET || env.FEISHU_APP_SECRET || '';
}

function signStaffToken(payload, secret) {
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const mac = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${mac}`;
}

function verifyStaffToken(token, secret) {
  if (!token || !secret) return null;
  const parts = String(token).split('.');
  if (parts.length !== 2) return null;
  const expected = crypto.createHmac('sha256', secret).update(parts[0]).digest('base64url');
  const a = Buffer.from(parts[1]);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function requireStaff(context) {
  const header = context.request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  const payload = verifyStaffToken(token, staffSecret(context.env));
  if (!payload) {
    return { error: json({ error: '需要员工鉴权', code: 'STAFF_AUTH_REQUIRED' }, 401) };
  }
  return { payload };
}

// ─────────────────────────── 路由 ───────────────────────────

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const id = url.searchParams.get('id');
  const scope = url.searchParams.get('scope');

  // 员工列表：必须带服务端签发的 token
  if (scope === 'staff') {
    const auth = requireStaff(context);
    if (auth.error) return auth.error;
    try {
      const records = await listAllRecords(context.env);
      const bookings = records
        .map((r) => mapFeishuToBooking(r))
        .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
      return json({ bookings, count: bookings.length });
    } catch (error) {
      console.error('staff list error:', error);
      return json({ error: '读取员工列表失败' }, 500);
    }
  }

  // 单笔查询（顾客状态页）：公开，但遮蔽电话
  if (id) {
    try {
      const record = await findRecordById(id, context.env);
      if (record) {
        return json(mapFeishuToBooking(record, { includePhone: false }));
      }
    } catch (error) {
      console.warn('fetch by id failed:', error);
    }
    return json({ error: '预约不存在' }, 404);
  }

  // 无 id：拒绝返回任何客单
  return json({ error: '需要 id 参数或员工鉴权', code: 'UNAUTHORIZED' }, 401);
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();

    if (!body.ownerName || !body.petName) {
      return json({ error: '缺少必填字段' }, 400);
    }

    const schema = await getSchema(context.env);
    const token = await getTenantToken(context.env);

    // 站点自用 id：仅当表里有 site_booking_id 字段时才写；否则用飞书自动编号
    const siteBookingId = 'BK' + Date.now().toString(36).toUpperCase()
      + Math.random().toString(36).slice(2, 6).toUpperCase();

    const raw = {
      [FIELD.PET]: body.petName,
      [FIELD.OWNER]: body.ownerName,
      [FIELD.PHONE]: body.phone || '',
      [FIELD.SERVICE]: body.serviceType || '标准洗',
      [FIELD.STATUS]: '待审核',
      [FIELD.STEP]: '0',
      [FIELD.PROGRESS]: 0,
      [FIELD.CREATED]: Date.now(),
      [FIELD.UPDATED]: Date.now(),
      [FIELD.WEIGHT]: body.weightRange || '',
      [FIELD.DATETIME]: `${body.bookingDate || ''} ${body.bookingTime || ''}`.trim(),
      [FIELD.NOTES]: body.notes || '',
      [FIELD.OUTSIDE]: body.outsideGroomed === 'Yes' ? 'Yes' : 'No',
      [FIELD.EMOTION]: body.emotionStable === 'No' ? 'No' : 'Yes',
      [FIELD.VACCINE]: body.vaccineDate || '',
    };
    if (schema.names.has(FIELD.SITE_ID)) raw[FIELD.SITE_ID] = siteBookingId;

    const { fields, dropped } = sanitizeFields(raw, schema);
    if (dropped.length) console.warn('dropped fields:', dropped.join(', '));

    // 写入飞书。网络抖动时重试一次（冷启动首次请求较容易失败）。
    let data = null;
    let lastStatus = 0;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const res = await fetch(`${apiBase(context.env)}/records`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields }),
      });
      lastStatus = res.status;
      const txt = await res.text();
      try { data = JSON.parse(txt); } catch (e) { data = { code: -1, msg: txt.slice(0, 200) }; }
      if (data.code === 0 && data.data?.record?.record_id) break;
      console.warn(`feishu create attempt ${attempt + 1} failed:`, data.code, data.msg);
      if (attempt === 0) await new Promise((r) => setTimeout(r, 700));
    }

    if (!data || data.code !== 0 || !data.data?.record?.record_id) {
      console.error('feishu create failed:', data);
      return json(
        {
          error: '写入飞书失败，预约未创建',
          code: 'FEISHU_WRITE_FAILED',
          detail: (data && (data.msg || String(data.code))) || String(lastStatus),
        },
        502,
      );
    }

    // 关键：按 record_id 读回记录做校验。
    // 注意：AutoNumber 字段（booking_id）在 create 响应里不会回写，
    // 必须再 GET 一次 records/{record_id} 才能拿到 booking_id。
    const created = data.data.record;
    if (!created.record_id) {
      console.error('feishu create returned no record_id:', JSON.stringify(data));
      return json({ error: '写入飞书失败，预约未创建', code: 'FEISHU_WRITE_FAILED' }, 502);
    }

    const readBack = await fetch(`${apiBase(context.env)}/records/${created.record_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const readBackData = await readBack.json();
    const verified = readBackData.code === 0 ? readBackData.data?.record : null;

    if (!verified) {
      console.error('feishu create not verifiable:', created.record_id, JSON.stringify(readBackData));
      return json(
        { error: '写入飞书后校验失败，预约未确认', code: 'FEISHU_VERIFY_FAILED' },
        502,
      );
    }

    return json(mapFeishuToBooking(verified), 201);
  } catch (error) {
    console.error('create booking error:', error);
    return json(
      { error: '创建失败，请稍后再试', code: 'CREATE_ERROR', detail: error.message },
      502,
    );
  }
}

export async function onRequestPut(context) {
  const auth = requireStaff(context);
  if (auth.error) return auth.error;

  try {
    const body = await context.request.json();
    const id = body.id;
    if (!id) return json({ error: '缺少预约ID' }, 400);

    const schema = await getSchema(context.env);
    const token = await getTenantToken(context.env);

    const record = await findRecordById(id, context.env);
    if (!record) return json({ error: '预约不存在' }, 404);

    const serviceType = body.serviceType || '标准洗';
    const stages = GROOMING_STAGES[serviceType] || GROOMING_STAGES.standard;
    const currentStep = Number(body.currentStep) || 0;
    const progress = body.progress !== undefined
      ? Number(body.progress)
      : Math.floor((currentStep / stages.length) * 100);

    const raw = {
      [FIELD.STATUS]: body.status,
      [FIELD.STEP]: String(currentStep),
      [FIELD.PROGRESS]: progress,
      [FIELD.UPDATED]: Date.now(),
    };
    if (body.notes !== undefined) raw[FIELD.NOTES] = body.notes;

    const { fields, dropped } = sanitizeFields(raw, schema);
    if (dropped.length) console.warn('dropped fields on update:', dropped.join(', '));

    const res = await fetch(`${apiBase(context.env)}/records/${record.record_id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    });
    const data = await res.json();

    if (data.code !== 0) {
      console.error('feishu update failed:', data);
      return json({ error: '更新失败', code: 'FEISHU_UPDATE_FAILED', detail: data.msg || String(data.code) }, 502);
    }

    // 读回确认是「同一笔」被更新，而不是新增
    const verified = await findRecordById(id, context.env);
    if (!verified || verified.record_id !== record.record_id) {
      console.error('feishu update not verifiable:', id, record.record_id, verified?.record_id);
      return json({ error: '更新后校验失败', code: 'FEISHU_VERIFY_FAILED' }, 502);
    }

    return json(mapFeishuToBooking(verified), 200);
  } catch (error) {
    console.error('update booking error:', error);
    return json({ error: '更新失败', code: 'UPDATE_ERROR', detail: error.message }, 500);
  }
}
