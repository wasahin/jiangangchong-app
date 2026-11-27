/**
 * 合約檢查（静态，唔使开浏览器、唔使网络）—— 表单逻辑、placeholder、时段规则、
 * 冻结档案、房态 API、密钥安全。
 *
 * 用法: node verify/contract-check.js
 *
 * 基线唔用 git history，改用 verify/baseline/ 入面嘅文字快照：
 * Lovable 会不停重写档案，git HEAD 唔稳定；快照先係稳定嘅「已知良好」参考。
 * 确认过改动係有意嘅，先跑 `node verify/update-baseline.js` 更新快照。
 */
const fs = require('fs');
const path = require('path');
const { REPO, counter } = require('./_shared');

const { check, done } = counter();

const norm = (s) => s.replace(/\r\n/g, '\n');
const read = (p) => norm(fs.readFileSync(path.join(REPO, p), 'utf8'));
const exists = (p) => fs.existsSync(path.join(REPO, p));

const HOME = 'src/features/home.tsx';
const STAFF = 'src/features/staff.tsx';
const ROOMS_API = 'src/server/legacy/rooms.ts';

const now = read(HOME);
const baselineDir = path.join(__dirname, 'baseline');
const baseline = (name) => {
  const p = path.join(baselineDir, name);
  return fs.existsSync(p) ? norm(fs.readFileSync(p, 'utf8')) : null;
};

// ─────────────────────────────────────────────────────────────
console.log('\n=== 1. 必須保留嘅表單合約 ===');
check('handleSubmit 仍然呼叫 createBooking(', /const booking = await createBooking\(/.test(now));
check('isSubmitting 防連按仍在', /if \(isSubmitting\) return;/.test(now));
check('submitError 狀態仍在', /const \[submitError, setSubmitError\] = useState<string \| null>\(null\);/.test(now));
check('submitError 有顯示出嚟', now.includes('{submitError && ('));
check('時段規則 getBookedTimeSlots 仍在', /const getBookedTimeSlots = \(date: string\)/.test(now));
check('時段規則 generateTimeOptions 仍在', /const generateTimeOptions = \(\)/.test(now));
check('handleReset 仍在', /const handleReset = \(\) =>/.test(now));

console.log('\n=== 2. 唔准加返嘅嘢 ===');
check('冇 hasSubmittedToday', !now.includes('hasSubmittedToday'));
check('冇 jingangchong_last_submit_date', !now.includes('jingangchong_last_submit_date'));

console.log('\n=== 3. 表單欄位 placeholder 完全冇改 ===');
const ph = (s) => [...s.matchAll(/placeholder="([^"]*)"/g)].map((m) => m[1]);
const phBase = baseline('placeholders.txt');
if (phBase === null) {
  check('基线快照存在（跑 node verify/update-baseline.js 生成）', false);
} else {
  const phNow = ph(now);
  const phBefore = phBase.trim().split('\n');
  check('placeholder 數量一樣', phNow.length === phBefore.length, `${phBefore.length} -> ${phNow.length}`);
  check('placeholder 內容一樣', JSON.stringify(phNow) === JSON.stringify(phBefore));
}

console.log('\n=== 4. 表單 JSX 區塊逐字比對（由 <form 到 </form>） ===');
const grab = (s) => {
  const i = s.indexOf('<form onSubmit={handleSubmit}');
  const j = s.indexOf('</form>', i);
  return i >= 0 && j > i ? s.slice(i, j + 7) : '';
};
// 「服务类型」下拉多咗一个「寄养」选项（2026-11-26 用户确认），
// 所以比较时抽走所有 <option> 行，其余任何改动照旧要 fail。
// 寄养嘅「选择房间 + 退房日期」两个新欄位用 ROOM-FIELDS-BEGIN/END 包住，
// 比对时抽走，但下面会另外逐项检查佢哋存在、内容正确。
const stripOptions = (s) => s.split('\n').filter((l) => !l.trim().startsWith('<option')).join('\n');
const stripRoomFields = (s) =>
  s.replace(/^[ \t]*\{\/\* ROOM-FIELDS-BEGIN[\s\S]*?\/\* ROOM-FIELDS-END \*\/\}[ \t]*\r?\n(\r?\n)?/m, '');
const formNow = grab(now);
const formBase = baseline('form.txt');
if (!formNow) {
  check('搵到 <form> 區塊', false);
} else if (formBase === null) {
  check('基线快照存在（跑 node verify/update-baseline.js 生成）', false);
} else {
  check(
    '表單區塊完全冇改動（淨係加咗服务类型选项同寄养两个新欄位）',
    stripOptions(stripRoomFields(formNow)) === stripOptions(stripRoomFields(formBase)),
    `now ${stripOptions(stripRoomFields(formNow)).length} bytes / base ${stripOptions(stripRoomFields(formBase)).length} bytes`,
  );
}
const opts = [...formNow.matchAll(/<option value=\{ServiceType\.(\w+)\}>([^<]+)<\/option>/g)].map((m) => `${m[1]}=${m[2]}`);
check(
  '服务类型选项 = 精致洗/标准洗/美容/寄养',
  JSON.stringify(opts) === JSON.stringify(['PREMIUM_WASH=精致洗', 'STANDARD_WASH=标准洗', 'GROOMING=美容', 'BOARDING=寄养']),
  opts.join(', '),
);

console.log('\n=== 4b. 寄养新欄位（2026-11-27 用户确认） ===');
const roomBlock = (() => {
  const m = now.match(/ROOM-FIELDS-BEGIN[\s\S]*?ROOM-FIELDS-END/);
  return m ? m[0] : '';
})();
check('房间/退房日期区块存在', roomBlock.length > 0);
check('有「选择房间」下拉', /选择房间/.test(roomBlock) && /<select/.test(roomBlock));
check('有「退房日期」日期栏', /退房日期/.test(roomBlock) && /type="date"/.test(roomBlock));
check('退房日期係必填', /type="date"\s+required/.test(roomBlock));
check('退房日期有 min（唔可以早过入住日）', /min=\{minCheckOutDate\}/.test(roomBlock));
check('房间下拉用 5 间房名册', /formRoomOptions\.map/.test(roomBlock));
check('只喺寄养时显示', /formData\.serviceType === ServiceType\.BOARDING/.test(roomBlock));
check(
  '房号/退房日期随预约写入备注（唔再事后补写）',
  /roomNoteForBooking/.test(now) && /【房号：\$\{selectedRoom\}｜退房：\$\{checkOutDate\}】/.test(now) && !/fetch\('\/api\/public\/rooms'/.test(now),
  '顾客页面唔再调用 POST /api/public/rooms',
);
check('寄养价目表 = 2 行（小房/大房）', /BOARDING_ROOMS\.map/.test(now) && !now.includes('迷你房') && !now.includes('家庭房'));
check('房态板 5 间房（小房1-3、大房1-2）', /ROOM_CATALOGUE/.test(now) && /count: 3/.test(now) && /count: 2/.test(now));
check('绿灯=空房、红灯=占用', /bg-brand-v3-success/.test(now) && /bg-brand-v3-error/.test(now));

console.log('\n=== 5. handleSubmit / 時段規則函式未改 ===');
const grabFn = (s, from, to) => {
  const i = s.indexOf(from);
  const j = s.indexOf(to, i);
  return i >= 0 && j > i ? s.slice(i, j) : '';
};
for (const [from, to, label] of [
  ['  const getBookedTimeSlots =', '\n\n', 'getBookedTimeSlots'],
  ['  const generateTimeOptions =', '\n\n', 'generateTimeOptions'],
]) {
  const base = baseline(label + '.txt');
  if (base === null) {
    check(`${label} 基线快照存在`, false);
  } else {
    check(`${label} 函式未改動`, grabFn(now, from, to) === base, `${base.length} -> ${grabFn(now, from, to).length} bytes`);
  }
}
// handleSubmit 2026-11-27 获准改：寄养房号要随预约一齐写入备注
// （飞书表冇新字段，备注係唯一自由文字通道）。其余行为逐项检查。
const hs = grabFn(now, '  const handleSubmit = async', '  const handleReset = () => {');
check('handleSubmit 抽取到完整函数', hs.length > 400, `${hs.length} bytes`);
check('handleSubmit 仍然呼叫 createBooking(', /const booking = await createBooking\(/.test(hs));
check('handleSubmit 仍然有 isSubmitting 防连按', /if \(isSubmitting\) return;/.test(hs));
check('handleSubmit 仍然 setSubmitError(null)', /setSubmitError\(null\);/.test(hs));
check('handleSubmit 仍然用 try/catch + finally', /catch \(error: any\)/.test(hs) && /finally \{/.test(hs));
check('handleSubmit 仍然 setLastBookingId / setSubmitted', /setLastBookingId\(booking\.id\)/.test(hs) && /setSubmitted\(true\)/.test(hs));
check('handleSubmit 写入房号备注（roomNoteForBooking）', /roomNoteForBooking/.test(hs) && /notes: roomNoteForBooking/.test(hs));
const hsBase = baseline('handleSubmit.txt');
if (hsBase === null) {
  check('handleSubmit 基线快照存在', false);
} else {
  const normalizeHs = (s) =>
    s
      .replace(/\/\/[^\n]*\n/g, '') // 注释唔影响行为，比对时拎走
      .replace(/const booking = await createBooking\(\{[\s\S]*?\}\);/g, 'BOOKING_PAYLOAD')
      .replace(/const booking = await createBooking\(formData\);/g, 'BOOKING_PAYLOAD')
      .split('\n')
      .map((l) => l.trim())
      .join('\n');
  check(
    'handleSubmit 其余部分未改（除咗 createBooking payload）',
    normalizeHs(hs) === normalizeHs(hsBase),
    `${normalizeHs(hsBase).length} -> ${normalizeHs(hs).length} bytes`,
  );
}
check('顾客提交唔会另外打 /api/public/rooms（写接口要员工鉴权）', !/fetch\('\/api\/public\/rooms'/.test(now));

console.log('\n=== 6. 唔准改嘅档案（冻结数据层 + 员工端房号安排） ===');
const bookingsApi = exists('src/server/legacy/bookings.ts') ? read('src/server/legacy/bookings.ts') : '';
const sessionApi = exists('src/server/legacy/staff-session.ts') ? read('src/server/legacy/staff-session.ts') : '';
const bookingApi = exists('src/lib/booking-api.ts') ? read('src/lib/booking-api.ts') : '';
const storage = exists('src/lib/storage.ts') ? read('src/lib/storage.ts') : '';
const useBookings = exists('src/hooks/useBookings.ts') ? read('src/hooks/useBookings.ts') : '';

check('bookings.ts 仲有 sanitizeFields（唔好随便改字段映射）', /sanitizeFields/.test(bookingsApi));
check('bookings.ts 仲有 site_booking_id（站点自用 id，唔用 AutoNumber）', /site_booking_id/.test(bookingsApi));
check('bookings.ts 唔会写字符串落 AutoNumber booking_id', !/booking_id:\s*['"`]/.test(bookingsApi));
check('staff-session.ts 仲有 HMAC 签名 + 12 小时 TTL', /createHmac/.test(sessionApi) && /TOKEN_TTL_MS/.test(sessionApi));
check('staff-session.ts 密钥唔会下发到浏览器', !/NEXT_PUBLIC_STAFF_PASSWORD/.test(sessionApi) || /回落值/.test(sessionApi));
check('booking-api.ts 仲係打 /api/public/bookings', /\/api\/public\/bookings/.test(bookingApi));
check('booking-api.ts 仲有 SubmitBookingPayload（notes 係可选字段）', /SubmitBookingPayload/.test(bookingApi) && /notes\?/.test(bookingApi));
check('storage.ts 仲有 persistBooking', /persistBooking/.test(storage));
check('useBookings.ts 顾客提交行经 submitBooking（唔係本地假写）', /submitBooking/.test(useBookings));
check('useBookings.ts 员工读取行经 loadStaffBookings', /loadStaffBookings/.test(useBookings));
check('useBookings.ts 员工更新行经 updateBookingRemote', /updateBookingRemote/.test(useBookings));

console.log('\n=== 7. 员工端房号安排（70e06d5） ===');
const staff = exists(STAFF) ? read(STAFF) : '';
check('员工页有 RoomAssign 组件', /function RoomAssign/.test(staff));
check('员工页 5 间房名册', /ROOM_NAMES = \['小房1', '小房2', '小房3', '大房1', '大房2'\]/.test(staff));
check('员工页会读返备注入面嘅房号', /ROOM_LINE/.test(staff));
check('员工页用员工 token 写入（Authorization: Bearer）', /Authorization: `Bearer \$\{token\}`/.test(staff));
check('员工页打 /api/public/rooms', /'\/api\/public\/rooms'/.test(staff));
check('寄养卡显示房间安排（唔再显示永远 0% 嘅进度条）', /serviceType === ServiceType\.BOARDING \? \(/.test(staff));
check('寄养时「预计剩余」改成「寄养时长／按门店安排」', /寄养时长/.test(staff) && /按门店安排/.test(staff));

console.log('\n=== 8. 房态 API ===');
const roomsApi = exists(ROOMS_API) ? read(ROOMS_API) : '';
check('src/server/legacy/rooms.ts 存在', roomsApi.length > 0);
const getHandler = (() => {
  const i = roomsApi.indexOf('export async function onRequestGet');
  const j = roomsApi.indexOf('export async function onRequestPost');
  return i >= 0 && j > i ? roomsApi.slice(i, j) : '';
})();
check(
  'GET /api/public/rooms 公开、唔回客人资料',
  getHandler.length > 0 && !/owner/i.test(getHandler) && !/phone/i.test(getHandler) && !/requireStaff/.test(getHandler),
  getHandler.length ? 'GET handler 冇 phone/owner/鉴权' : '搵唔到 GET handler',
);
check('POST 写入备注（房号 + 退房日期）', /export async function onRequestPost/.test(roomsApi) && /房号/.test(roomsApi) && /退房/.test(roomsApi));
check('房态由预约推算（唔开新表、唔会走样）', /listAllRecords/.test(roomsApi) && /已完成/.test(roomsApi));
check('5 间房定义同前端一致', /小房1/.test(roomsApi) && /小房3/.test(roomsApi) && /大房2/.test(roomsApi));
check('POST 要员工鉴权（顾客唔可以直接改房号）', /requireStaff/.test(roomsApi) && /STAFF_AUTH_REQUIRED/.test(roomsApi) && !/proofPhone/.test(roomsApi));
check('GET 仍然公开（顾客睇房态唔使登录）', /export async function onRequestGet/.test(roomsApi) && !/requireStaff\(context\)\s*;[\s\S]{0,200}onRequestGet/.test(roomsApi));
check('room = "" 即系放空房间（店员可以取消安排）', /room\s*\?\s*\(checkOut/.test(roomsApi) || /:\s*'';/.test(roomsApi));

console.log('\n=== 9. 密钥安全 ===');
check('src/lib/feishu.ts 已删除（会内联 VITE_ 密钥入前端 bundle）', !exists('src/lib/feishu.ts'));
const allSrc = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(e.name)) allSrc.push(p);
  }
})(path.join(REPO, 'src'));
// 注释唔算（注释可以解释点解唔好用），只睇真係会执行嘅代码
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
const codeOf = (p) => stripComments(fs.readFileSync(p, 'utf8'));
const secretHits = allSrc.filter((p) => /VITE_FEISHU_APP_SECRET|VITE_NEXT_PUBLIC_FEISHU_APP_SECRET/.test(codeOf(p)));
check('冇任何档案读 VITE_* 飞书密钥', secretHits.length === 0, secretHits.map((p) => path.relative(REPO, p)).join(', '));
check(
  '飞书密钥唔会经 import.meta.env 落到浏览器',
  !allSrc.some((p) => /import\.meta\.env/.test(codeOf(p)) && /FEISHU_APP_SECRET/.test(codeOf(p))),
);
check(
  '飞书密钥只喺服务端档案出现',
  allSrc
    .filter((p) => /FEISHU_APP_SECRET/.test(codeOf(p)))
    .every((p) => /server[\\/]legacy[\\/]/.test(p)),
  allSrc.filter((p) => /FEISHU_APP_SECRET/.test(codeOf(p))).map((p) => path.relative(REPO, p)).join(', '),
);

console.log('\n=== 10. 宣傳圖 ===');
// 只喺 PROMOS 数组入面搵（id: 'boarding' 喺 SERVICE_MENUS 都出现过）
const promosBlock = (() => {
  const i = now.indexOf('const PROMOS');
  if (i < 0) return '';
  const j = now.indexOf('\n];', i);
  return j > 0 ? now.slice(i, j) : '';
})();
check('搵到 PROMOS 数组', promosBlock.length > 0);
for (const n of ['membership', 'care', 'wash-plan', 'boarding']) {
  check(`${n}.webp 卡面存在`, exists(`public/homepage-promo/${n}.webp`));
  check(`${n}-full.webp 完整海报存在（lightbox 用）`, exists(`public/homepage-promo/${n}-full.webp`));
  const block = (() => {
    const i = promosBlock.indexOf(`id: '${n}',`);
    if (i < 0) return '';
    const j = promosBlock.indexOf("id: '", i + 10);
    return promosBlock.slice(i, j > 0 ? j : promosBlock.length);
  })();
  check(`${n} 卡：lightbox 用完整海报`, block.includes(`image: '/homepage-promo/${n}-full.webp'`));
  check(`${n} 卡：卡面用裁切版`, block.includes(`cardImage: '/homepage-promo/${n}.webp'`));
}
check('PROMOS 有 4 张卡', (promosBlock.match(/id: '[a-z-]+',/g) || []).length === 4);
check('冇 CDN 资产依赖（self-host 都唔会断图）', !/asset\.json/.test(now) && !/membershipPoster|groomingPoster|washPlanPoster/.test(now));
check('卡面用裁切版、lightbox 用完整版（唔会搞混）', now.includes('src={promo.cardImage ?? promo.image}') && now.includes('setZoomPromo(promo.image)'));

done();
