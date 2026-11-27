/**
 * 更新基线快照 —— 确认过改动係有意嘅之后先跑。
 *
 * 用法: node verify/update-baseline.js
 *
 * 会将 src/features/home.tsx 入面嘅「已知良好」部分抽出来，存去 verify/baseline/：
 *   placeholders.txt      表单所有 placeholder（逐行）
 *   form.txt              <form>...</form> 整个区块
 *   getBookedTimeSlots.txt / generateTimeOptions.txt   时段规则两个函数
 *   handleSubmit.txt      提交函数（比对时会忽略注释同 createBooking payload）
 */
const fs = require('fs');
const path = require('path');
const { REPO } = require('./_shared');

const OUT = path.join(__dirname, 'baseline');
fs.mkdirSync(OUT, { recursive: true });

const norm = (s) => s.replace(/\r\n/g, '\n');
const src = norm(fs.readFileSync(path.join(REPO, 'src/features/home.tsx'), 'utf8'));

const grab = (s, from, to) => {
  const i = s.indexOf(from);
  const j = s.indexOf(to, i);
  if (i < 0 || j < 0) throw new Error(`搵唔到 ${from} ... ${to}`);
  return s.slice(i, j);
};

const write = (name, text) => {
  fs.writeFileSync(path.join(OUT, name), text, 'utf8');
  console.log(`  wrote baseline/${name}  (${text.length} bytes)`);
};

const ph = [...src.matchAll(/placeholder="([^"]*)"/g)].map((m) => m[1]);
write('placeholders.txt', ph.join('\n') + '\n');

const i = src.indexOf('<form onSubmit={handleSubmit}');
const j = src.indexOf('</form>', i);
if (i < 0 || j < 0) throw new Error('搵唔到 <form> 區塊');
write('form.txt', src.slice(i, j + 7));

write('getBookedTimeSlots.txt', grab(src, '  const getBookedTimeSlots =', '\n\n'));
write('generateTimeOptions.txt', grab(src, '  const generateTimeOptions =', '\n\n'));
write('handleSubmit.txt', grab(src, '  const handleSubmit = async', '  const handleReset = () => {'));

console.log('\n基线已更新。跟住跑 node verify/contract-check.js 睇下有冇破坏合约。');
