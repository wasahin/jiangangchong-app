/**
 * 驗證套件共用設定。
 *
 * 路徑全部相對於本 repo（verify/ 上一層），所以整套可以喺任何機器、
 * 任何 clone 位置直接跑，唔會寫死 D: 之類嘅本地路徑。
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

/** repo 根目錄 */
const REPO = path.resolve(__dirname, '..');

/** 截圖輸出目錄 */
const SHOTS = path.join(__dirname, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });

/**
 * API 前缀。Lovable 版走 /api/public/*（TanStack Router server routes）。
 * 如果之后改成别的前缀，用 VERIFY_API_PREFIX 环境变量覆盖。
 */
const API = (process.env.VERIFY_API_PREFIX || '/api/public').replace(/\/$/, '');

/**
 * 读 .env.local（唔好 commit 落去，.gitignore 已经有 *.local）。
 * 环境变量优先过文件 —— CI 或者 Lovable 预览环境直接用 process.env 就得。
 */
function loadEnv(file) {
  const env = {};
  const envFile = file || process.env.VERIFY_ENV_FILE || path.join(REPO, '.env.local');
  if (fs.existsSync(envFile)) {
    for (const l of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
      const m = l.match(/^\s*([A-Za-z_0-9]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
  return { ...env, ...process.env };
}

/**
 * 揀一个浏览器：优先用 BROWSER_PATH，其次搵系统装咗嘅 Edge / Chrome。
 * （用 puppeteer-core 唔会自己下载 Chromium，所以要自己搵。）
 */
function resolveBrowser() {
  if (process.env.BROWSER_PATH && fs.existsSync(process.env.BROWSER_PATH)) {
    return process.env.BROWSER_PATH;
  }
  const candidates =
    os.platform() === 'win32'
      ? [
          'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
          'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
          'C:/Program Files/Google/Chrome/Application/chrome.exe',
          'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
        ]
      : os.platform() === 'darwin'
        ? [
            '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
          ]
        : ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
  for (const c of candidates) if (fs.existsSync(c)) return c;
  return null;
}

/** puppeteer launch 选项 */
function launchOptions(extra = {}) {
  const executablePath = resolveBrowser();
  if (!executablePath) {
    throw new Error(
      '搵唔到浏览器。装 Chrome / Edge，或者用 BROWSER_PATH 环境变量指定完整路径：\n' +
        '  set BROWSER_PATH=C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    );
  }
  return {
    executablePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
    ...extra,
  };
}

/** 打 API 路径：apiUrl('/rooms?date=x') → '/api/public/rooms?date=x' */
const apiUrl = (p) => `${API}${p.startsWith('/') ? p : '/' + p}`;

/**
 * 载入 puppeteer-core。
 * 正常做法：`cd verify && npm install`（verify/package.json 有呢个 devDependency）。
 * 如果想唔装都跑得（用系统已有嘅 puppeteer-core），可以设：
 *   PUPPETEER_CORE_PATH=/path/to/puppeteer-core
 */
function requirePuppeteer() {
  if (process.env.PUPPETEER_CORE_PATH) {
    return require(process.env.PUPPETEER_CORE_PATH);
  }
  try {
    return require('puppeteer-core');
  } catch (e) {
    throw new Error(
      '搵唔到 puppeteer-core。喺 verify/ 目录跑 `npm install`，或者设 ' +
        'PUPPETEER_CORE_PATH 指向你本机嘅 puppeteer-core 目录。\n' +
        '原本嘅错误: ' + e.message,
    );
  }
}

/** 统计式的小工具 */
function counter() {
  const state = { pass: 0, fail: 0 };
  const check = (label, cond, extra = '') => {
    cond ? state.pass++ : state.fail++;
    console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${label}${extra ? '  -> ' + extra : ''}`);
  };
  return { ...state, check, done: () => {
    console.log(`\n結果: ${state.pass} pass / ${state.fail} fail`);
    process.exit(state.fail > 0 ? 1 : 0);
  } };
}

module.exports = { REPO, SHOTS, API, loadEnv, resolveBrowser, launchOptions, apiUrl, counter, requirePuppeteer };
