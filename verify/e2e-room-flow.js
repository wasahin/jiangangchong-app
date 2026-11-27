/**
 * 房态 E2E：浏览器真係提交一张寄养预约 → 房号写入备注 → 房态变红 → 完成后放空 → 清理
 * 用法: node e2e-room-flow.js <baseUrl>
 */
const fs = require('fs');
const path = require('path');
const { REPO, loadEnv, apiUrl, launchOptions, requirePuppeteer } = require('./_shared');
const puppeteer = requirePuppeteer();

const BASE = process.argv[2] || 'http://localhost:8899';
const env = loadEnv();
const PASSWORD = env.STAFF_PASSWORD || 'jingangchong';
const CHECKIN = '2026-12-01';
const CHECKOUT = '2026-12-05';
const ROOM = '小房2';
const PET = '__ROOM_E2E__';

let pass = 0, fail = 0;
const check = (label, cond, extra = '') => { cond ? pass++ : fail++; console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${label}${extra ? '  -> ' + extra : ''}`); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function rooms(date) {
  const r = await fetch(`${BASE}${apiUrl('/rooms')}?date=${date}`);
  return r.json();
}

async function cleanup() {
  const t = await (await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: env.NEXT_PUBLIC_FEISHU_APP_ID, app_secret: env.FEISHU_APP_SECRET }),
  })).json();
  const H = { Authorization: 'Bearer ' + t.tenant_access_token };
  const B = env.NEXT_PUBLIC_FEISHU_BASE_ID, T = env.NEXT_PUBLIC_FEISHU_TABLE_ID;
  const recs = await (await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${B}/tables/${T}/records?page_size=50`, { headers: H })).json();
  let deleted = 0;
  for (const it of (recs.data?.items || [])) {
    if (String(it.fields?.pet_name || '').includes('__') || String(it.fields?.owner_name || '').includes('__')) {
      const del = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${B}/tables/${T}/records/${it.record_id}`, { method: 'DELETE', headers: H });
      console.log(`    清理 ${it.fields?.booking_id} ${it.fields?.pet_name} -> ${del.status}`);
      deleted++;
    }
  }
  const rest = await (await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${B}/tables/${T}/records?page_size=50`, { headers: H })).json();
  check('飞书表清干净', rest.data?.total === 0, `剩 ${rest.data?.total} 条 (删了 ${deleted})`);
}

(async () => {
  console.log(`\n=== 房态 E2E (${BASE}) ===`);

  // 1) 起始状态
  const before = await rooms(CHECKIN);
  const beforeRoom = before.rooms.find(r => r.name === ROOM);
  check('GET /api/rooms 返回 5 间房', before.rooms.length === 5, before.rooms.map(r => r.name).join(','));
  check(`起始 ${ROOM} 系空房`, beforeRoom && beforeRoom.occupied === false, JSON.stringify(beforeRoom));
  check('房态接口唔会回客人资料', !('owner' in (before.rooms[0] || {})) && !('phone' in (before.rooms[0] || {})), JSON.stringify(before.rooms[0]));

  // 2) 浏览器真係提交一张寄养预约
  const browser = await puppeteer.launch(
    launchOptions({ defaultViewport: { width: 390, height: 844, isMobile: true } }),
  );
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 });
  const jsErrors = [];
  page.on('pageerror', e => jsErrors.push(String(e.message)));
  await page.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 60000 });
  await sleep(2500);

  const setInput = async (labelText, value) => page.evaluate((lt, v) => {
    const form = document.getElementById('booking-form');
    const input = Array.from(form.querySelectorAll('input')).find(i => {
      const lab = i.closest('div')?.querySelector('label');
      return lab && lab.innerText.includes(lt);
    });
    if (!input) return false;
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(input, v);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }, labelText, value);

  const setSelect = async (labelText, optText) => page.evaluate((lt, ot) => {
    const form = document.getElementById('booking-form');
    const sel = Array.from(form.querySelectorAll('select')).find(s => {
      const lab = s.closest('div')?.querySelector('label');
      return lab && lab.innerText.includes(lt);
    });
    if (!sel) return false;
    const opt = Array.from(sel.options).find(o => o.text.includes(ot));
    if (!opt) return false;
    const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
    setter.call(sel, opt.value);
    sel.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }, labelText, optText);

  check('填入主人姓名', await setInput('主人姓名', '__ROOM_E2E_OWNER__'));
  check('填入宠物名字', await setInput('宠物名字', PET));
  check('选服务类型 = 寄养', await setSelect('服务类型', '寄养'));
  await sleep(900);
  check('填入预约日期', await setInput('预约日期', CHECKIN));
  await sleep(600);
  check('填入预约时间', await setSelect('预约时间', '10:00'));
  await sleep(600);

  const roomPick = await page.evaluate(() => {
    const sel = Array.from(document.querySelectorAll('#booking-form select')).find(s =>
      Array.from(s.options).some(o => o.text.includes('请选择房间')));
    if (!sel) return { ok: false };
    const opt = Array.from(sel.options).find(o => o.text.startsWith('小房2'));
    const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
    setter.call(sel, opt.value);
    sel.dispatchEvent(new Event('change', { bubbles: true }));
    return { ok: true, value: sel.value, options: Array.from(sel.options).map(o => `${o.text}${o.disabled ? '(x)' : ''}`) };
  });
  check('选定房间 = 小房2', roomPick.ok && roomPick.value === '小房2', JSON.stringify(roomPick));
  check('填入退房日期', await setInput('退房日期', CHECKOUT));
  await sleep(600);

  const beforeSubmit = await page.evaluate(() => {
    const form = document.querySelector('#booking-form form') || document.querySelector('form');
    const btn = Array.from(form.querySelectorAll('button')).find(b => b.textContent.includes('提交预约'));
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    return { clicked: true, note: form.querySelector('textarea')?.value };
  });
  check('撳提交预约', beforeSubmit.clicked);
  await sleep(9000);

  const afterSubmit = await page.evaluate(() => ({
    err: document.body.innerText.includes('预约未提交'),
    stillForm: !!document.querySelector('#booking-form form'),
  }));
  check('提交冇报错', afterSubmit.err === false, JSON.stringify(afterSubmit));
  // React #418 = hydration mismatch，係旧有嘅 Live 时钟（build 时 vs 客户开页面时）造成，
  // 2026-11-27 已喺旧预览（09ab4a19）确认过同房态功能无关。
  const newErrors = jsErrors.filter(e => !/Minified React error #418/.test(e));
  check('页面冇新嘅 JS error（#418 係旧有嘅 Live 时钟 hydration）', newErrors.length === 0, newErrors.join(' | '));

  // 3) 房号写入备注 + 房态变红
  const login = await fetch(BASE + apiUrl('/staff-session'), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: PASSWORD }),
  });
  const { token } = await login.json();
  check('员工登入', login.status === 200 && !!token, `HTTP ${login.status}`);

  const listJson = await (await fetch(BASE + apiUrl('/bookings?scope=staff'), { headers: { Authorization: 'Bearer ' + token } })).json();
  const list = Array.isArray(listJson) ? listJson : (listJson.bookings || []);
  const booking = list.find(b => String(b.petName || '').includes('__'));
  check('飞书搵到新预约', !!booking, `list=${list.length}`);
  check('服务类型 = 寄养', booking && booking.serviceType === '寄养', booking && booking.serviceType);
  check('备注有房号 + 退房日期', booking && /【房号：小房2｜退房：2026-12-05】/.test(String(booking.notes || '')), booking && booking.notes);

  const during = await rooms(CHECKIN);
  const duringRoom = during.rooms.find(r => r.name === ROOM);
  check(`${ROOM} 变成占用（红灯）`, duringRoom && duringRoom.occupied === true, JSON.stringify(duringRoom));
  const otherRooms = during.rooms.filter(r => r.name !== ROOM);
  check('其他房仲系空房', otherRooms.every(r => r.occupied === false), JSON.stringify(otherRooms.map(r => `${r.name}:${r.occupied}`)));

  const onCheckout = await rooms(CHECKOUT);
  check('退房当日已经放空', onCheckout.rooms.find(r => r.name === ROOM)?.occupied === false, JSON.stringify(onCheckout.rooms.find(r => r.name === ROOM)));

  // 4) 店员完成服务 → 房间即刻放空
  if (booking) {
    const fin = await fetch(BASE + apiUrl('/bookings'), {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ id: booking.id, serviceType: '寄养', status: '已完成', currentStep: 1, currentPhase: '服务完成' }),
    });
    check('店员完成服务', fin.status === 200, `HTTP ${fin.status}`);
    await sleep(2500);
    const afterDone = await rooms(CHECKIN);
    check('完成之后房间放空（绿灯）', afterDone.rooms.find(r => r.name === ROOM)?.occupied === false, JSON.stringify(afterDone.rooms.find(r => r.name === ROOM)));
  }

  await browser.disconnect();
  await cleanup();

  console.log(`\n结果: ${pass} pass / ${fail} fail`);
  process.exit(fail > 0 ? 1 : 0);
})().catch(e => { console.error('!! ' + e.message); process.exit(1); });
