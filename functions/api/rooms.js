/**
 * 房态 API —— 新店 5 间房的占用情况（公开，只讲房，唔讲客）
 *
 * GET  /api/rooms?date=YYYY-MM-DD
 *      → { date, rooms: [{ name, type, capacity, price, occupied }] }
 *      公开接口：只返回「边间房 occupied」，唔返回任何客人资料。
 *
 * POST /api/rooms  { bookingId, room, checkOutDate }
 *      → 喺嗰笔预约嘅备注补上房号同退房日期，店员喺员工页即刻睇到。
 *      需要员工鉴权（Authorization: Bearer <staff token>）：呢个接口会改预约，
 *      唔应该俾客人自己调用（顾客系喺公开表单拣房，服务端自动写入）。
 *
 * 点解房号写喺备注：
 *   functions/api/bookings.js 係冻结嘅，加唔到新字段；而备注係唯一自由文字通道，
 *   而且员工页会显示备注 —— 店员即刻睇到「房号：小房2｜退房：2026-12-05」。
 *   房态就由呢行备注 + 预约日期推算，所以飞书表永远只有一份真相，唔会走样。
 */

import crypto from 'node:crypto';

const FIELD = {
  DATETIME: 'booking_datetime',
  NOTES: 'notes',
  SERVICE: 'service_type',
  STATUS: 'status',
  PHONE: 'phone',
  SITE_ID: 'site_booking_id',
};

/** 新店 5 间房 */
const ROOMS = [
  { name: '小房1', type: '小房', capacity: '小型一只', price: '¥80/天' },
  { name: '小房2', type: '小房', capacity: '小型一只', price: '¥80/天' },
  { name: '小房3', type: '小房', capacity: '小型一只', price: '¥80/天' },
  { name: '大房1', type: '大房', capacity: '小型三只／大型一只', price: '¥120/天' },
  { name: '大房2', type: '大房', capacity: '小型三只／大型一只', price: '¥120/天' },
];

const ROOM_NAMES = ROOMS.map((r) => r.name);
const ROOM_LINE = /【房号：([^｜】\n]+)(?:[｜|]退房：(\d{4}-\d{2}-\d{2}))?】/;

// ─────────────────────────── 员工鉴权（同 functions/api/bookings.js 一致） ───────────────────────────

function staffSecret(env) {
  return env.STAFF_TOKEN_SECRET || env.FEISHU_APP_SECRET || '';
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

const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  });

function parseText(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map((item) => item.text || '').join('');
  return String(value);
}

const apiBase = (env) =>
  `https://open.feishu.cn/open-apis/bitable/v1/apps/${env.NEXT_PUBLIC_FEISHU_BASE_ID}/tables/${env.NEXT_PUBLIC_FEISHU_TABLE_ID}`;

let tokenCache = { token: '', expireAt: 0 };

async function getTenantToken(env) {
  if (tokenCache.token && Date.now() < tokenCache.expireAt) return tokenCache.token;
  const appId = env.NEXT_PUBLIC_FEISHU_APP_ID || '';
  let lastError = null;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const res = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_id: appId, app_secret: env.FEISHU_APP_SECRET }),
      });
      const data = await res.json();
      if (data.code === 0 && data.tenant_access_token) {
        tokenCache = { token: data.tenant_access_token, expireAt: Date.now() + 30 * 60 * 1000 };
        return tokenCache.token;
      }
      lastError = new Error(`飞书鉴权失败: ${data.msg || data.code}`);
    } catch (error) {
      lastError = error;
    }
    if (attempt === 0) await new Promise((r) => setTimeout(r, 600));
  }
  throw lastError || new Error('飞书鉴权失败');
}

async function listAllRecords(env) {
  const token = await getTenantToken(env);
  const out = [];
  let pageToken = null;
  for (let i = 0; i < 50; i += 1) {
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

async function updateNotes(recordId, notes, env) {
  const token = await getTenantToken(env);
  const res = await fetch(`${apiBase(env)}/records/${recordId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: { [FIELD.NOTES]: notes } }),
  });
  const data = await res.json();
  if (data.code !== 0) throw new Error(`更新备注失败: ${data.msg || data.code}`);
  return true;
}

/** 预约日期（booking_datetime = "2026-12-01 10:00"）嘅日期部分 */
function checkInDate(record) {
  const raw = parseText(record.fields?.[FIELD.DATETIME]);
  const m = raw.match(/(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : '';
}

/** 从备注抽出房号 + 退房日期 */
function parseRoomLine(notes) {
  const m = parseText(notes).match(ROOM_LINE);
  if (!m) return null;
  return { room: m[1].trim(), checkOut: m[2] || '' };
}

/** 某一日，5 间房边间被占 */
export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    const date = url.searchParams.get('date') || new Date().toISOString().slice(0, 10);

    let records = [];
    try {
      records = await listAllRecords(context.env);
    } catch (error) {
      console.error('rooms list failed:', error.message);
      // 飞书暂时读唔到：唔好报错误害客人见唔到房态，当全部空闲
      return json({ date, rooms: ROOMS.map((r) => ({ ...r, occupied: false })) }, 200, {
        'Cache-Control': 'public, max-age=0, s-maxage=15',
      });
    }

    const occupiedRooms = new Set();
    for (const record of records) {
      const line = parseRoomLine(record.fields?.[FIELD.NOTES]);
      if (!line || !ROOM_NAMES.includes(line.room)) continue;
      const checkIn = checkInDate(record);
      if (!checkIn) continue;
      // 已经完成（宠物已经回家）→ 房间放空
      if (parseText(record.fields?.[FIELD.STATUS]) === '已完成') continue;
      const checkOut = line.checkOut || checkIn; // 冇退房日期 = 只占当日
      if (date >= checkIn && date < checkOut) occupiedRooms.add(line.room);
    }

    return json(
      { date, rooms: ROOMS.map((r) => ({ ...r, occupied: occupiedRooms.has(r.name) })) },
      200,
      { 'Cache-Control': 'public, max-age=0, s-maxage=30' },
    );
  } catch (error) {
    console.error('rooms get error:', error);
    return json({ error: '房态读取失败' }, 500);
  }
}

/** 落房：喺预约备注补上房号同退房日期（room = '' 即系放空房间） */
export async function onRequestPost(context) {
  try {
    // 改预约要员工鉴权：顾客落单时房号已经随预约写入备注，
    // 呢个接口係俾店员改房／放空房用。
    const auth = requireStaff(context);
    if (auth.error) return auth.error;

    const body = await context.request.json();
    const bookingId = String(body?.bookingId || '').trim();
    const room = String(body?.room || '').trim();
    const checkOut = String(body?.checkOutDate || '').trim();

    if (!bookingId) return json({ error: '缺少预约ID' }, 400);
    if (room && !ROOM_NAMES.includes(room)) return json({ error: '房间不存在' }, 400);
    if (checkOut && !/^\d{4}-\d{2}-\d{2}$/.test(checkOut)) return json({ error: '退房日期格式不对' }, 400);

    const records = await listAllRecords(context.env);
    const record = records.find(
      (it) =>
        parseText(it.fields?.[FIELD.SITE_ID]) === bookingId
        || parseText(it.fields?.booking_id) === bookingId
        || String(it.record_id || '') === bookingId,
    );
    if (!record) return json({ error: '预约不存在' }, 404);

    const notes = parseText(record.fields?.[FIELD.NOTES]);
    const withoutOld = notes.replace(ROOM_LINE, '').trim();
    // room = '' → 放空房间（店员取消安排）
    const line = room
      ? (checkOut ? `【房号：${room}｜退房：${checkOut}】` : `【房号：${room}】`)
      : '';
    const next = line ? (withoutOld ? `${line}\n${withoutOld}` : line) : withoutOld;

    await updateNotes(record.record_id, next, context.env);

    return json({ ok: true, room, checkOutDate: checkOut, notes: next }, 200);
  } catch (error) {
    console.error('rooms post error:', error);
    return json({ error: '房态保存失败' }, 500);
  }
}
