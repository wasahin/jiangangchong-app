// @ts-nocheck
/**
 * 员工会话 — 用密码换取服务端签发的 staff token
 *
 * 前端不再用 localStorage 标记当授权。所有员工数据接口都必须带
 * `Authorization: Bearer <token>`，由本函数用 HMAC 签名签发、其它接口校验。
 *
 * 环境变量：
 *  - STAFF_PASSWORD         （推荐，服务端 secret，不下发到浏览器）
 *  - NEXT_PUBLIC_STAFF_PASSWORD （兼容旧部署的回落值；前端已不再做本地比对）
 *  - STAFF_TOKEN_SECRET     （推荐，HMAC 密钥；缺省回落到 FEISHU_APP_SECRET）
 */

import crypto from 'node:crypto';

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 小时

function staffSecret(env) {
  return env.STAFF_TOKEN_SECRET || env.FEISHU_APP_SECRET || '';
}

function signStaffToken(payload, secret) {
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const mac = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${mac}`;
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const supplied = String(body?.password ?? '');

    const expected = context.env.STAFF_PASSWORD || context.env.NEXT_PUBLIC_STAFF_PASSWORD || '';
    if (!expected) {
      return json({ error: '服务端未配置员工密码', code: 'STAFF_NOT_CONFIGURED' }, 500);
    }
    if (!supplied) {
      return json({ error: '请输入密码', code: 'PASSWORD_REQUIRED' }, 400);
    }

    // 常数时间比较，避免时序侧信道
    const a = Buffer.from(supplied);
    const b = Buffer.from(expected);
    const ok = a.length === b.length && crypto.timingSafeEqual(a, b);
    if (!ok) {
      return json({ error: '密码错误，请重试', code: 'BAD_PASSWORD' }, 401);
    }

    const secret = staffSecret(context.env);
    if (!secret) {
      return json({ error: '服务端未配置令牌密钥', code: 'TOKEN_SECRET_MISSING' }, 500);
    }

    const expiresAt = Date.now() + TOKEN_TTL_MS;
    const token = signStaffToken({ role: 'staff', exp: expiresAt }, secret);

    return json({ ok: true, token, expiresAt });
  } catch (error) {
    console.error('staff session error:', error);
    return json({ error: '登录失败', code: 'SESSION_ERROR' }, 500);
  }
}

export async function onRequestGet(context) {
  return json({ error: '请使用 POST 登录', code: 'METHOD_NOT_ALLOWED' }, 405);
}
