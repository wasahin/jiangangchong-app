/**
 * 線上核實（打一個已经部署緊嘅站 —— 本地 preview、Lovable 预览、或者正式站）：
 *  1) 同日多次預約：前端 bundle 冇單次鎖定 marker + 同日兩單真係都收
 *  2) 跨瀏覽器員工審核：token 由伺服器簽發，唔靠 localStorage，另一個 client 都用得
 *  3) 寫接口要员工鉴权：顾客唔可以直接改房号
 * 最後清走測試記錄，確保飛書表乾淨。
 *
 * 用法: node verify/prod-verify.js <baseUrl>
 * 環境变量: .env.local（或者 VERIFY_ENV_FILE 指去别嘅文件）要有
 *   NEXT_PUBLIC_FEISHU_APP_ID / FEISHU_APP_SECRET /
 *   NEXT_PUBLIC_FEISHU_BASE_ID / NEXT_PUBLIC_FEISHU_TABLE_ID /
 *   STAFF_PASSWORD
 */
const fs = require('fs');
const path = require('path');
const { loadEnv, apiUrl } = require('./_shared');

const BASE = process.argv[2] || 'http://localhost:8899';
const env = loadEnv();

let pass = 0, fail = 0;
const check = (label, cond, extra = '') => { cond ? pass++ : fail++; console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${label}${extra ? '  -> ' + extra : ''}`); };

(async () => {
  console.log(`\n=== 線上核實 ${BASE} ===\n--- 1. 同日多次預約 ---`);

  // 1a) 前端 bundle：搵唔到「今日已提交」鎖定 marker
  const html = await (await fetch(BASE + '/')).text();
  // Vite / TanStack 嘅入口 chunk 可能用 <script src> 或者 <link rel="modulepreload" href>
  const srcs = [
    ...[...html.matchAll(/<script[^>]+src="([^"]+\.js)"/g)].map(m => m[1]),
    ...[...html.matchAll(/<link[^>]+href="([^"]+\.js)"/g)].map(m => m[1]),
  ];
  let markers = 0, chunks = 0;
  for (const s of srcs) {
    const url = s.startsWith('http') ? s : BASE + s;
    const txt = await (await fetch(url)).text();
    chunks++;
    if (/jingangchong_last_submit_date|hasSubmittedToday|每日只可预约|今日已预约/.test(txt)) markers++;
  }
  check(`前端 bundle 冇「每日一單」鎖定 (${chunks} 個 chunk)`, markers === 0, `命中 ${markers}`);

  // 1b) 真實落單：同一日兩單
  const body = (petName, time) => JSON.stringify({
    ownerName: '验收测试', petName, phone: '13800138000',
    serviceType: '标准洗', bookingDate: '2026-12-01', bookingTime: time,
    notes: '验收测试用', outsideGroomed: 'No', emotionStable: 'Yes',
  });
  const created = [];
  for (const [pet, time] of [['验收测试A', '10:00'], ['验收测试B', '14:00']]) {
    const res = await fetch(BASE + apiUrl('/bookings'), {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body(pet, time),
    });
    const j = await res.json().catch(() => ({}));
    created.push({ pet, time, status: res.status, id: j.bookingId || j.siteBookingId || j.id || null, err: j.error || null });
  }
  created.forEach(c => console.log(`    ${c.pet} ${c.time} -> HTTP ${c.status}${c.id ? ' id=' + c.id : ''}${c.err ? ' err=' + c.err : ''}`));
  check('同日第一單收咗', created[0].status === 201 || created[0].status === 200, `HTTP ${created[0].status}`);
  check('同日第二單一樣收（冇被「每日一單」擋）', created[1].status === 201 || created[1].status === 200, `HTTP ${created[1].status}`);
  check('兩單都係唔同嘅 id', !!created[0].id && !!created[1].id && created[0].id !== created[1].id, `${created[0].id} / ${created[1].id}`);

  console.log('--- 2. 跨瀏覽器員工審核 ---');
  // 2a) 用密码换 token
  const PW = env.STAFF_PASSWORD || 'jingangchong';
  const loginNew = await fetch(BASE + apiUrl('/staff-session'), {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: PW }),
  });
  const newJson = await loginNew.json().catch(() => ({}));
  check('员工密码可以登入', loginNew.status === 200 && !!newJson.token, `HTTP ${loginNew.status}`);
  const token = newJson.token;

  // 2b) 错密码应该 401
  const loginOld = await fetch(BASE + apiUrl('/staff-session'), {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: '__WRONG_PASSWORD__' }),
  });
  check('错密码被拒（401）', loginOld.status === 401, `HTTP ${loginOld.status}`);

  // 2c) 用 token 讀員工視角清單（模擬另一部機/另一個瀏覽器）
  const listRes = await fetch(BASE + apiUrl('/bookings?scope=staff'), { headers: { Authorization: 'Bearer ' + token } });
  const listJson = await listRes.json().catch(() => ({}));
  const n = Array.isArray(listJson) ? listJson.length : (listJson.bookings || listJson.data || []).length;
  check('另一個 client 帶 token 讀到員工清單', listRes.status === 200, `HTTP ${listRes.status}, ${n} 條`);
  check('清單睇到啱啱落嘅兩單（另一個瀏覽器都見到）', n >= 2, `${n} 條`);

  // 2d) 冇 token 應該 401
  const noToken = await fetch(BASE + apiUrl('/bookings?scope=staff'));
  check('冇 token 讀唔到員工資料', noToken.status === 401, `HTTP ${noToken.status}`);

  console.log('--- 3. 房態寫接口要员工鉴权 ---');
  const noAuth = await fetch(BASE + apiUrl('/rooms'), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookingId: 'whatever', room: '小房1' }),
  });
  check('冇 token 改唔到房号（401）', noAuth.status === 401, `HTTP ${noAuth.status}`);
  const roomsPublic = await fetch(BASE + apiUrl('/rooms') + '?date=2026-12-01');
  const roomsJson = await roomsPublic.json().catch(() => ({}));
  check('GET 房态公开（唔使登录）', roomsPublic.status === 200 && Array.isArray(roomsJson.rooms), `HTTP ${roomsPublic.status}`);
  check('房态唔回客人资料', Array.isArray(roomsJson.rooms) && roomsJson.rooms.every(r => !('owner' in r) && !('phone' in r)));

  console.log('--- 4. 清走測試記錄 ---');
  const t = await (await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: env.NEXT_PUBLIC_FEISHU_APP_ID, app_secret: env.FEISHU_APP_SECRET }),
  })).json();
  const H = { Authorization: 'Bearer ' + t.tenant_access_token };
  const B = env.NEXT_PUBLIC_FEISHU_BASE_ID, T = env.NEXT_PUBLIC_FEISHU_TABLE_ID;
  const list = await (await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${B}/tables/${T}/records?page_size=50`, { headers: H })).json();
  let deleted = 0;
  for (const it of (list.data?.items || [])) {
    if (/验收|DEPLOY_PROBE|E2E|__/.test(String(it.fields?.pet_name || '')) || /验收/.test(String(it.fields?.owner_name || ''))) {
      const del = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${B}/tables/${T}/records/${it.record_id}`, { method: 'DELETE', headers: H });
      console.log(`    删除 ${it.fields?.booking_id} ${it.fields?.pet_name} -> ${del.status}`);
      deleted++;
    }
  }
  const after = await (await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${B}/tables/${T}/records?page_size=50`, { headers: H })).json();
  check('測試記錄已清走', after.data?.total === 0, `剩余 ${after.data?.total} 條 (刪咗 ${deleted})`);

  console.log(`\n結果: ${pass} pass / ${fail} fail`);
  process.exit(fail > 0 ? 1 : 0);
})().catch(e => { console.error('✘ ' + e.message); process.exit(1); });
