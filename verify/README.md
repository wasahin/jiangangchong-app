# 验收套件（verify/）

呢套脚本係从生产站（Next.js 版）嘅 **227 条断言** 移植过来嘅，结构已经改成
Lovable 版（TanStack Start + Vite）。目的是：**Lovable 每改一步都可以自己验证，
唔使等住你（店主）睇。**

---

## 快速开始

```bash
cd verify
npm install                 # 装 puppeteer-core（唔会下载 Chromium）
cp ../.env.local .env.local # 或者直接喺 repo 根目录放 .env.local
npm run contract            # 静态合约检查（唔使开浏览器，最快）
```

浏览器检查需要一部本机装咗嘅 Chrome / Edge。脚本会自动搵；
搵唔到就用 `BROWSER_PATH` 指：

```bash
# Windows
set BROWSER_PATH=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe
# macOS / Linux
export BROWSER_PATH=/usr/bin/google-chrome
```

---

## 四条命令 / 四个层级

| 命令 | 断言数 | 要网络？ | 要浏览器？ | 几耐 | 几时跑 |
|---|---|---|---|---|---|
| `npm run contract` | ~70 | 唔使 | 唔使 | < 5 秒 | **每次改完都跑** |
| `npm run mobile -- <url>` | 132 | 要（睇页面） | 要 | ~2 分 | 改版面 / 改文案 / 改样式之后 |
| `npm run e2e -- <url>` | 23 | 要 | 要 | ~1 分 | 改房态 / 改预约流程之后 |
| `npm run live -- <url>` | ~14 | 要 | 唔使 | ~20 秒 | 部署咗新版本之后 |

> **唔使每次都跑全套。** 改嘅嘢冇碰关键路径，就跑 `contract` + 你嗰次改动对应嗰条。
> 碰咗飞书写入路径、鉴权、或者部署配置，就全套跑齐。

---

## 各脚本做咩

### `contract-check.js` —— 静态合约（最重要，唔使网络）
检查源代码层面嘅约定：

- 预约表单嘅合约：`handleSubmit` 仍然呼叫 `createBooking`、防连按、`submitError`、时段规则函数
- **唔准**加返 `hasSubmittedToday` / `jingangchong_last_submit_date`（每日一单锁）
- 表单所有 `placeholder` 一个字都冇改过（对照 `baseline/placeholders.txt`）
- `<form>` 区块逐字比对（对照 `baseline/form.txt`）
- 寄养专属嘅「选择房间 + 退房日期」两个欄位存在、必填、有 `min` 限制、只喺寄养时显示
- 房号随预约写入备注（顾客页面唔会另外打 POST /api/public/rooms）
- 冻结数据层嘅关键标记仲喺度（`sanitizeFields`、`site_booking_id`、HMAC 签名、`persistBooking`…）
- 员工端 `RoomAssign` 房号安排组件存在
- 房态 API：GET 公开唔回客人资料、POST 要员工鉴权、`room = ""` 放空房间
- **密钥安全**：`src/lib/feishu.ts` 唔存在、冇任何档案读 `VITE_*` 飞书密钥

### `mobile-check2.js` —— 手机版面（390×844）
首屏放大、宣傳卡自动轮播、价目表唔挤、字级、房态板、寄养房间下拉、退房日期 `min` 限制。
截图会写入 `verify/shots/`。

### `e2e-room-flow.js` —— 房态 E2E（会真係落单）
浏览器真係提交一张寄养预约 → 房号写入备注 → 房态变红 → 退房当日放空 →
店员标记完成 → 房间即刻放空 → **清走测试记录**（飞书表清到 0 条）。

### `prod-verify.js` —— 线上核实
前端 bundle 冇「每日一单」锁、同日两单都收、员工登入 / 错密码 401 / 冇 token 401、
房态 GET 公开但 POST 要鉴权 → **清走测试记录**。

---

## 基线快照（baseline/）

`contract-check.js` 唔用 git history 做比对（因为 Lovable 会不停重写档案，
`git HEAD` 唔稳定），改用 `baseline/` 入面嘅文字快照。

> **确认过改动係有意嘅**（例如用户批准咗一个新欄位），先跑：
> ```bash
> npm run baseline
> ```
> 跑完记得睇 `git diff verify/baseline/`，唔好乱更新。

---

## 环境变量

| 变量 | 用途 |
|---|---|
| `VERIFY_API_PREFIX` | API 前缀，默认 `/api/public` |
| `VERIFY_ENV_FILE` | `.env.local` 嘅路径，默认 `<repo>/.env.local` |
| `BROWSER_PATH` | 指定浏览器完整路径（搵唔到自动浏览器时用） |

`.env.local` 需要有（喺**测试**飞书表上面跑）：

```
NEXT_PUBLIC_FEISHU_APP_ID=cli_aacebd7850b8dcff
FEISHU_APP_SECRET=...
NEXT_PUBLIC_FEISHU_BASE_ID=PhDPbd1xgaKHposYFmycmRoTnLc   <- 测试表
NEXT_PUBLIC_FEISHU_TABLE_ID=tblRztsA3fCnTdWM              <- 测试表
STAFF_PASSWORD=...
STAFF_TOKEN_SECRET=...
```

⚠️ **跑 e2e / live 之前确认 `NEXT_PUBLIC_FEISHU_BASE_ID` 指向测试表**
（`PhDPbd1xgaKHposYFmycmRoTnLc`），唔好指向生产表
（`BvDWb88lHaPI55s6VBCccn4hnpd`），唔好客人嘅真实预约俾测试清走。

---

## 点解会有呢个目录？

生产站嘅验收套件跑咗 227 条断言，全绿。因为 Lovable 版係重写（TanStack Start +
Vite，唔同框架），最安全嘅做法係：**将已知良好嘅代码同已知良好嘅断言一齐搬过来**，
唔好让 AI 重新发明。呢个目录就係搬过来嘅断言，改成 Lovable 结构。
