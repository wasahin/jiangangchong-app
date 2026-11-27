# 任务：把金刚宠预约系统补齐成「可自建部署」的完整应用

> **📌 交接说明（2026-11-27 晚）**
> **§2 部署已经完成 —— 站点已经真系上线咗：https://jiangangchong-app-v2.pages.dev**
> 全部验收（253 条断言）喺线上跑过，全绿。详情睇 §2.3 同 §6。
> §3.1、§4.1、§4.2 亦都已经由店主那边搬过来咗，**唔好重做**。
>
> **📌 优先次序店主已经拍板（2026-11-27）：**
> **① 真·微信通知 → ② 价目表／版面抛光 → ③ 员工端房态板。**
> **唔好再问「下一步做边个」，直接睇 §7。**

---

## 0. 背景（读之前先看）

你手上呢个 repo 係 `wasahin/archive-to-app`，係用 `/migrate-external-project` 由一个
**Next.js 15 静态导出 + Cloudflare Pages Functions** 嘅生产系统搬过来嘅
TanStack Start + Vite 版本。**功能大部分已经齐**（房态板、5 间房、寄养选房 + 退房日期、
价格表、单选项目分页、员工登录 + HMAC token、宣传海报 lightbox、员工端房号安排），
而且你嘅构建配置 `@lovable.dev/vite-tanstack-config` **默认就係 cloudflare target**。

**部署已经搞掂，飞书已经真接通。** 呢个 task 而家剩下嘅係：
**用呢个新版本去超越生产版** —— 生产版（`jiangangchong-app.pages.dev`）仲係 Next.js，
未动过。

---

## 1. 硬性约束（绝对不要违反）

1. **唔好再换技术栈。** 唔好再 migrate、唔好换返 Next、唔好换 Vite 版本、唔好加新框架。
2. **唔好改飞书表格结构。** 表嘅 field 名称、type、选项全部冻结。
3. **唔好改价目数据。** 5 间房、洗护／美容／单选项目嘅价格全部系用户上载嘅原图嚟嘅。
4. **唔好改 API 路径。** 维持 `/api/public/bookings`、`/api/public/rooms`、
   `/api/public/staff-session`。
5. **唔好将 `FEISHU_APP_SECRET` 或任何 secret 放进 `import.meta.env.VITE_*`。**
   `VITE_*` 会被 Vite build 时内联进浏览器 bundle = 泄密。
6. **唔好用 git 改写已发布嘅历史**（唔好 force push / rebase / amend）。
7. **唔好动 `src/server/legacy/` 入面嘅飞书写入逻辑**（除非本 task 明确要求）。
8. **开发全程用测试飞书表**（见 §3.3），唔好指向生产表。

---

## 2. ✅ 部署（已完成，2026-11-27）

### 2.1 成果
- **线上地址：https://jiangangchong-app-v2.pages.dev**（Pages 项目 `jiangangchong-app-v2`）
- `wrangler.jsonc`：`compatibility_flags: ["nodejs_compat"]`、`pages_build_output_dir: "./dist"`、
  `vars` 只放公开值（飞书**测试表**）
- `.github/workflows/deploy-v2.yml`：push → 合约检查 → build → 检查浏览器 bundle 无密钥 →
  建 Pages 项目 → `wrangler pages secret put` 三个 secret → `wrangler pages deploy` →
  **部署后自动线上核实**（真系落一单入飞书 + 验鉴权 + 清走测试记录）
- 构建用 `NITRO_PRESET=cloudflare_pages`（**唔使**加 `@cloudflare/vite-plugin`），
  产物係 `dist/_worker.js/`（**目录**，入面有 `index.js`）

### 2.2 ⚠️ 两个 repo、5 个 secret 嘅位置（呢个唔好搞错）
GitHub secret **唔可以跨 repo 抄**，所以：

| repo | 有咩 secret | 角色 |
|---|---|---|
| `archive-to-app` | 只有 `SYNC_PAT` | code 源头（Lovable 喺呢度改代码） |
| `jiangangchong-app` | `CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`、`FEISHU_APP_SECRET`、`STAFF_PASSWORD`、`STAFF_TOKEN_SECRET` | **真正执行部署嘅 repo** |

`archive-to-app` 嘅 `sync.yml` 会把 `main` force-push 去 `jiangangchong-app` 嘅
`lovable-sync` 分支 → `deploy-v2.yml` 就会喺 **jiangangchong-app** 触发，
用嗰边嘅 5 个 secret 真正部署。

`deploy-v2.yml` 嘅 `preflight` job 会先睇下当前 repo 有冇 Cloudflare 凭证：
冇就**优雅跳过**（唔报红），所以喺 `archive-to-app` push main 唔会出错。

**⚠️ 生产项目 `jiangangchong-app` / `jiangangchong-app.pages.dev` 完全唔会被呢个 workflow 碰。**

### 2.3 已修正嘅两个坑
1. **`test -f dist/_worker.js` 永远失败** —— `dist/_worker.js` 係**目录**，唔系文件。
   改成 `test -d dist/_worker.js` + `test -f dist/_worker.js/index.js`。
2. **`vite preview` serve 唔到呢个 build**（nitro 产物唔係 `dist/server/server.js`）。
   本地跑应用用 **`npx vite dev`**；要模拟真实 Pages runtime 用
   **`npx wrangler@4 pages dev dist`**。

### 2.4 本地模拟真实部署（重要）
`.dev.vars`（repo 根目录，已 gitignore）係 wrangler 嘅 secret 来源，等同真部署嘅 binding：

```bash
# .dev.vars
FEISHU_APP_SECRET=...
STAFF_PASSWORD=...
STAFF_TOKEN_SECRET=...
```
```bash
npx wrangler@4 pages dev dist --port 8902 --compatibility-date=2026-11-01
```
⚠️ 本地模拟时**唔好**同时存在 `.env.local`（wrangler 会读佢，会令你误以为 binding 通咗）。
正式做法：`.env.local` 收埋，只留 `.dev.vars`。

> 呢条链路已经实测过：**binding → `process.env` → 飞书写入** 喺真实 Cloudflare Pages
> runtime 度通（booking POST → 201，员工登录 → 200，错密码 → 401）。

---

## 3. ✅ 飞书真接通

### 3.1 ✅ 已删除 `src/lib/feishu.ts`
佢读 `import.meta.env.VITE_FEISHU_APP_SECRET`（会内联落前端 bundle），而且佢嘅
`createBookingInFeishu` 会写字符串落 AutoNumber `booking_id`（飞书必拒）。
两个占位通知函数搬咗去 `src/lib/notifications.ts`。
`verify/contract-check.js` 会持续检查呢件事。

### 3.2 飞书表格结构（冻结，唔好改）
field：`pet_name` Text · `owner_name` Text · `phone` Phone ·
`booking_id` AutoNumber(1005，**唔可以写字符串**) · `site_booking_id` Text ·
`service_type` SingleSelect(标准洗|精致洗|美容|寄养|医疗问诊|其他服务) ·
`status` SingleSelect(待审核|已接受|服务中|已完成) · `current_step` Text · `progress` Number ·
`created_at`/`updated_at` DateTime · `weight_range` SingleSelect(5kg以下|5–10kg|10kg以上) ·
`booking_datetime` Text(`YYYY-MM-DD HH:MM`) · `vaccine_date` DateTime · `notes` Text ·
`outside_groomed` SingleSelect(Yes|No) · `emotion_stable` SingleSelect(Yes|No)

### 3.3 🟡 开发用测试飞书表
| | base id | table id |
|---|---|---|
| **开发／线上灰度** | `PhDPbd1xgaKHposYFmycmRoTnLc` | `tblRztsA3fCnTdWM` |
| 生产（暂时唔好碰） | `BvDWb88lHaPI55s6VBCccn4hnpd` | `tbldcraKiZB6kBTK` |

飞书 app「金刚宠服务看板」`cli_aacebd7850b8dcff` 对测试表有**可管理**权限。
**全部验收通过、店主确认之后，先切生产表。**

---

## 4. ✅ 已交付嘅两个业务功能（唔好重做）

### 4.1 ✅ 员工端房号安排（`src/features/staff.tsx`）
由生产 commit `70e06d5` 逐字移植：`RoomAssign` 组件（房号下拉 + 退房日期）、
寄养卡显示房间安排、唔再显示永远 0% 嘅进度条、「预计剩余」→「寄养时长／按门店安排」。

### 4.2 ✅ 房号写入收紧（`src/server/legacy/rooms.ts` + `src/features/home.tsx`）
由生产 commit `0b0822f` 逐字移植：房号随预约写入备注、`POST` 改员工专用、`room=''` 放空房间。

### 4.3 房态占用推算规则（唔好改）
- 房号写喺预约 `notes`：`【房号：小房2｜退房：2026-12-05】`
- `checkIn <= date < checkOut` 算占用；退房当日自动放空
- `status = 已完成` → 即时放空
- `GET /api/public/rooms?date=` **公开**，只返 `{name,type,capacity,price,occupied}`，
  **绝对唔可以返客人资料**

---

## 5. ✅ 验收套件喺 `verify/`（唔好另起炉灶）

```bash
cd verify && npm install     # puppeteer-core
npm run contract             # 静态，<5 秒，唔使网络
```

| 命令 | 断言数 | 几时跑 |
|---|---|---|
| `npm run contract` | 85 | **每次改完都跑** |
| `npm run mobile -- <url>` | 132 | 改版面／文案／样式之后 |
| `npm run e2e -- <url>` | 23 | 改房态／预约流程之后 |
| `npm run live -- <url>` | 13 | 部署咗新版本之后 |

细节睇 `verify/README.md`。跑 e2e / live 之前确认 `.env.local` 指向测试表（§3.3）。

---

## 6. ✅ 验收结果（线上跑，2026-11-27）

线上地址 `https://jiangangchong-app-v2.pages.dev`：

| # | 检查 | 结果 |
|---|---|---|
| 1 | 部署 | ✅ build → `dist/_worker.js/index.js` → `wrangler pages deploy` 成功 |
| 2 | 秘密变量 | ✅ `wrangler pages secret put` 三个 secret 成功；build step 检查浏览器 bundle 无密钥 |
| 3 | 飞书写入 | ✅ POST → **201**，记录真系入测试表 |
| 4 | AutoNumber | ✅ `booking_id` 由飞书自动生成数字（实测 24） |
| 5 | 空手机号 | ✅ 冇 phone 嘅预约 → **201**，唔会静默丢单 |
| 6 | 公开房态 | ✅ 5 间房 + `occupied`，冇任何客人资料 |
| 7 | 房间占用 | ✅ 落单后该房 `occupied: true`，其他房 false |
| 8 | 退房放空 | ✅ 退房当日 `occupied: false` |
| 9 | 完成放空 | ✅ 店员完成后即时放空 |
| 10 | 员工鉴权 | ✅ 正确密码 200 / 错密码 401 / 冇 token 401 |
| 11 | 跨浏览器 | ✅ 带 token 读员工清单 |
| 12 | 同日多单 | ✅ 同日两单都收（冇「每日一单」锁） |
| 13 | 房号收紧 | ✅ 顾客 POST 房态 → 401；员工带 token → 200 |
| 14 | 公开接口 | ✅ 冇 token 读员工清单 → 401 |
| 15 | 页面 | ✅ `/`、`/staff`、`/status`、`/yellowwhite` 全部 200；390px 冇横向溢出 |
| 16 | 回归 | ✅ 房态板 5 间房灯色、寄养选房 + 退房日期、价目表 4 分页 + 单选项目、海报 lightbox 全部照旧 |
| 17 | 合约 | ✅ `npm run contract` 85/85 |
| 18 | 密钥 | ✅ 浏览器 bundle 搵唔到 `FEISHU_APP_SECRET` |

**合计 253/253 全绿**（contract 85 + mobile 132 + e2e 23 + live 13）。
测试飞书表已清回 **0 条**。

---

## 7. 下一步（店主 2026-11-27 已经拍板，唔好再问「下一步做边个」）

**优先次序**：

| 优先 | 功能 | 状态 | 点解 |
|---|---|---|---|
| 1 | **真·微信通知** | 未做 | 唯一一个客人感觉得到嘅缺口：客人落完单之后完全冇回应，`/status` 页面仲係「客人自己查」，唔係「通知客人」 |
| 2 | **价目表／版面抛光** | 做咗一半 | 零风险、纯视觉 |
| 3 | **员工端房态板可视化** | 未做 | 5 间房、每星期 3–5 单 → 唔急 |

**通知拆成两件独立嘅嘢，唔好同一个 commit 打包做**：

| | A. 员工提醒 | B. 客人消息 |
|---|---|---|
| 渠道 | 企业微信群机器人 | 微信公众号模板消息 |
| 需唔需要店主俾资料 | 只需要 webhook URL | 需要 AppID / AppSecret / 模板 ID |
| 阻塞 | 未收到 webhook URL | 未确认有冇认证服务号 |
| 顺序 | **先做呢件** | 等资料齐先开 |

> 下面 7.1 / 7.2 嘅代码落点係**建议做法**，你可以改；但 §1 嘅硬性约束、飞书表结构、
> 「失败唔准影响落单」嘅原则唔可以改。

### 7.1 员工提醒：企业微信群机器人（先做呢件）

- 新建 `src/server/legacy/notify.ts`（同 `bookings.ts` 同一层，方便共用 `env`）。
- webhook URL → Pages secret **`STAFF_WEBHOOK_URL`**。
  **唔可以**入 `import.meta.env.VITE_*`、唔可以入前端 bundle、唔可以硬编码喺 source。
  （`verify/contract-check.js` 已经有「浏览器 bundle 唔准有 secret」嘅检查，扩展佢去查呢个 URL。）
- **两个触发点**（都喺 `src/server/legacy/bookings.ts`）：
  - `onRequestPost` —— 飞书写入**成功之后**（唔好喺写之前发）
  - `onRequestPut` —— 员工更新状态之后（接受／开始／完成全部经呢条 PUT）
- 企业微信群机器人 API：
  ```
  POST https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=…
  Content-Type: application/json
  {"msgtype":"markdown","markdown":{"content":"**新预约**\n宠物：小花\n服务：精致洗\n日期：2026-12-02 10:00\n电话：138…\n房号：小房1（退房 2026-12-05）"}}
  ```
- **失败唔准影响落单**：try/catch 吞掉 + `console.error` 记低，飞书写入成功就照样返 201 / 200。
  群机器人挂咗唔应该令客人见唔到自己嘅单。
- 内容只放员工需要嘅嘢：宠物名、服务类型、预约日期、电话、房号／退房日期。
  唔好放身份证、详细地址之类。
- 验收：`npm run contract` 加一条静态断言（webhook URL 唔喺前端 bundle／唔喺 source），
  `npm run live` 加一条「webhook 打唔通都唔影响落单」嘅断言。

### 7.2 客人消息：微信公众号模板消息（**等店主俾资料先开工**）

需要：认证服务号 **AppID + AppSecret** + **审核通过嘅模板 ID** + 模板字段名。

**障碍**：预约表只收电话，冇 `openid`；飞书表结构冻结，唔可以加字段。

建议做法（等店主确认咗先动手）：

1. 顾客用微信打开页面 → 静默网页授权（`snsapi_base`）→ 拿到 `openid`，写入 **httpOnly cookie**；
2. POST 落单时（飞书写入成功之后）即时发模板消息；
3. **唔写入飞书**（表结构冻结）→ 代价係「进度更新」阶段发唔到客人，
   客人只能自己开 `/status` 链接睇进度。

Secret：`WECHAT_APP_SECRET`、`WECHAT_TEMPLATE_ID`（AppID 唔算 secret，可以入 `wrangler.jsonc` 嘅 `vars`）。

⚠️ 如果冇认证服务号 → 做唔到，客人消息呢半只能维持现状（顾客自己查 status 链接）。

### 7.3 抛光（第二）

- 价目表逐格对用户上载嘅原图（`05/06/07/08/09.png`）；美容造型最顶档 = **10 KG以上 ¥240/¥300**。
- 预约日期 input 喺 390px 只有 131px 阔、Chrome 日历图标盖住最后一个字 ——
  **Lovable 已经喺 `d936ded5` 修咗**，验一下就够，唔好重做。
- 唔好重画 logo（用 `public/logo-jingangchong*.png`）。
- 视觉改动 = **Tier 0 验证**（build + typecheck + 390px 截图 + 2–3 条 smoke 断言），
  唔好跑全套 253 条。

### 7.4 员工端房态板（第三，唔急）

- 5 间房、每星期 3–5 单 → 唔需要复杂 kanban。
- 做「今日入住／今日退房」清单 + 一键改状态（复用现有 PUT）就够。
- 唔好新增飞书字段。

---

## 8. 成功嘅定义（更新）

**已经达成**：Cloudflare Pages 自己跑得起来 · 员工登录得到 · 客人落预约真系写进飞书（测试表）·
房态灯真系会变红变绿 · 18 项验收 + 253 条断言全绿 · 线上 v2 可访问。

**下一个成功定义**（按次序）：

1. 店主喺企业微信群收到**第一条真·新单提醒**（7.1）；
2. 顾客喺微信收到**第一条模板消息**（7.2，视乎有冇认证服务号）；
3. 抛光版过咗店主眼（7.3）。

**切生产的条件**：店主明确话「切」→ 先跑 §9。唔好自己切。

---

## 9. 切生产 runbook（**店主批准之后**先做，唔好自己嚟）

1. `wrangler.jsonc` 嘅 `vars` 由测试表换成生产表：
   base `BvDWb88lHaPI55s6VBCccn4hnpd` / table `tbldcraKiZB6kBTK`
2. 加 Pages secret：`STAFF_WEBHOOK_URL`（+ 公众号 secret，如果有）。
3. ⚠️ **Pages 项目名唔可以改** —— v2 叫 `jiangangchong-app-v2`，生产叫 `jiangangchong-app`。
   切 = 真系部署去 `jiangangchong-app` 项目（内容会被**整个替换**）。
4. ⚠️ `jiangangchong-app` repo 入面 Next.js 嘅 `deploy.yml` trigger 係 `'**'` ——
   切嘅时候要确保佢**唔会同时触发**，否则两个 workflow 会争同一个 Pages 项目。
   （平时唔会撞，因为 `lovable-sync` 分支嘅树只有 `deploy-v2.yml` + `sync.yml`。）
5. 部署后跑：`npm run live https://jiangangchong-app.pages.dev` + `npm run mobile` + `npm run e2e`。
6. 回滚：Cloudflare Pages 有 deployment 历史，可以喺项目里退返上一个 deployment。
7. 保留生产版 Next.js（`jiangangchong-app:main` = `3371c1eb09`）唔好删，作为回滚底。
