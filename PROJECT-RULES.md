# 金刚宠 (Jingangchong) Pet Shop — Project Memory

> Auto-loaded by Mavis/MiniMax Code when a session starts in this workspace.
> Same content as `.trae/skills/jingangchong/SKILL.md` — kept in sync.
> This is the source of truth for the 4 specialist agents (analytics, retention, social, content) and any future ad-hoc work in this project.

## 🏪 Business Identity
- **Shop Name**: 金刚宠宠物美容
- **Location**: 广东中山 / 中山市石岐区白石路22-24号
- **Business Type**: Pet grooming and care center
- **Phone**: 18938740443
- **Binding number (宠老板)**: 18826025100
- **Differentiator**: Premium grooming with real-time status tracking for pet owners

## 💰 Financial Model
- **Monthly Fixed Costs**: ¥14,226.28 (rent ¥5,100 + electricity ¥1,000 + wages ¥5,960 + insurance ¥2,166.28)
- **Break-even**: 104 bath&groom services/month (category-level); 182 (full BE)
- **Current level**: ~70 services/month → **gap: 34 services/month**
- **Target**: 9–12 new weekly recurring dogs to close gap; safer target 110–120 visits/month
- **Service Pricing**:
  | Service | 5kg以下 | 5-10kg | 10kg+ | Margin | Contribution |
  |---|---|---|---|---|---|
  | 标准洗 (Bath) | ¥68 | ¥88 | ¥108 | 85% | ¥68 |
  | 精致洗 (Deluxe) | ¥98 | ¥118 | ¥138 | — | — |
  | 美容 (Groom) | ¥180+ | ¥200+ | ¥220+ | 80% | ¥120 |
  | 寄养 (Hotel) | ¥100/day | — | — | 90% | ¥90 |
- **Service mix** (5-month data): Bath:Groom = 281:69 (80% : 20%); weighted avg contribution ¥78.25/service
- **Revenue mix**: 17% products, 57% bath&groom, 25% hotel
- **AOV target**: ~¥120 | **LTV target**: ¥2,160 (¥120 × 6 visits × 3 years)

## 🌱 Membership / Loyalty Program (现行制度)

**Tagline**: 不需充值，碰头碰优惠！(No pre-payment, discount per visit)

**Source asset**: `D:\金刚宠\Grooming menu\Grooming menu\Ipad\4.jpg`

### 7-tier growth (消费次数 = cumulative service visits)

| Visits | Symbol | Tier | Discount | Tier-up Reward |
|---|---|---|---|---|
| 0次 | 🌰 种子 | 一星会员 | 9.5折 | 普洗价格享精洗产品×1 |
| 11次 | 🌱 小草 | 二星会员 | 9折 | 赠送spa×1 |
| 21次 | 🌳 小树 | 三星会员 | 8.5折 | 赠送小零食盒×1 |
| 31次 | 🌲 大树 | 四星会员 | 8折 | 赠送牵引绳套装×1 |
| 41次 | 🌸 花开 | 五星会员 | 8折+会员活动 | 赠送宠物外出背包 |
| 51次 | 🍎 结果 | 五星永久会员 | 8折+专享活动 | 每季度会员礼品 |
| 61次+ | ⭐ 顶 | — | — | "升级只为宠它更多！" |

### Critical rules
- **2-month dormancy rule**: 连续2个月未到店 → 累计次数重置，但会员等级保留。This is a HARD retention deadline. Any member 50+ days silent is at risk of losing accumulated progress.
- **No pre-payment** (不需充值): pure visit-based; cash-flow friendly
- Discount applies to all 洗护 services (standard / deluxe / groom)

### What this means for each agent
- **Analytics**: Track tier distribution, time-to-upgrade curve, 2-month dormancy cohort, reward cost per tier, % customers on each discount band
- **Retention** (me): Trigger 升级礼 delivery on each tier-up; 50-day+ silent = urgent re-engagement (their progress is at risk); pre-tier-push when customer is ~3 visits from next reward
- **Social**: Tier-milestone celebration posts; "晒等级" UGC hooks; 五星永久会员 story features
- **Content**: Tier-specific copy, reward announcement templates, 种子 onboarding welcome, dormancy-warning re-engagement scripts

## 🎯 Current Campaign: DIY宠物市集 (Pet DIY Free Market)
- **Timeline**: ~3 weeks from 2026-07-28 (mid-August 2026)
- **Location**: Event venue, far from shop → Dianping on-site check-in NOT viable
- **Booth assets**: Dog bandanas (for sale) + free fans w/ logo + WeChat QR
- **Funnel**: Scan → Add WeChat → Get grooming discount → Book service → Become regular
- **Investment**: ¥500 materials + 20% commission of event revenue
- **Long-term ROI target**: +164% (¥14,520 LTV vs ~¥5,500 investment)
- **Conversion funnel targets**:
  | Stage | Target/day | Rate |
  |---|---|---|
  | Booth traffic | 500+ | — |
  | Engagements | 100+ | 20% |
  | WeChat adds | 80+ | 80% |
  | First bookings | 20-24 | 25-30% |
  | Show-ups | 16-19 | 80% |
  | 30-day return | 5-6 | 30% |
  | Long-term (3yr LTV) | 3-4 | 20% |

## 🏗️ Technical Architecture
- **HTML prototype**: `jingangchong_h5_prototype.html` (working file)
- **Next.js app**: `jingangchong-app/` (production; this dir)
- **宠老板 MCP server**: `C:/Users/coolj/.trae-cn/trae projects/mcp-chonglaoban/server.js`
- **Credentials file**: `D:\金刚宠\AI material\宠老板credentials.txt`
- **Grooming menu source**: `D:\金刚宠\Grooming menu\Grooming menu\Ipad`
- **MCP output dir**: `D:/金刚宠/MCP-output`

### Deployment
- **Platform**: Cloudflare Pages
- **Account ID**: `8574e1c4ec018d0061b1cdcfa8237484`
- **Project**: `jingangchong-app`
- **URL**: https://jiangangchong-app.pages.dev
- **Repo**: https://github.com/wasahin/jiangangchong-app
- **Known issue**: `nodejs_compat` flag may need manual setting in Cloudflare Dashboard

### Data Storage
- **Client-side**: LocalStorage, key `jingangchong_h5_v2`
- **Booking fields**: `review_status`, `createdAt`, `updatedAt`, `display_in_service_list`, `current_phase`, `current_step`

### Core Workflow Rules
- **Single Status Link**: Each booking → ONE permanent status link. WeChat sends it ONCE after confirmation. No new links on updates.
- **Step Rotation**: Timer starts only when staff clicks "Start". Auto-advances. Staff controls: Start / Pause / Finish (3 buttons only).
- **Customer page**: Updates dynamically (polling or WebSocket).

## 🎨 Design System — Brand v3 暖陶橙 (2026-11-02)

> **Brand v3 supersedes v2.** v3 is a **flat** system: neumorphism, decorative gradients, glow and drop shadows are retired. Elevation is a 1px hairline on a white surface over a cream canvas.
> Authoritative tokens: `src/lib/design-tokens.ts` + `src/lib/design-tokens.json`. CSS vars: `src/app/globals.css`. Tailwind namespace: `brand-v3-*`. `brand-v2-*` is a deprecated alias.

### Color Tokens
| Token | Value | Use |
|---|---|---|
| 奶油白 Cream | `#FAF6EE` | Light canvas |
| 藏蓝 Navy | `#1B3A5C` | **Primary ~72%** |
| 金刚金 Gold | `#E2BC6E` | **Secondary ~20%** |
| 近黑 Ink | `#1A1714` | Ceremony, weight, body text |
| 暖陶橙 Terracotta | `#C97B5A` | **Accent ≤8%** (10-12% 会员升级 / 限定活动) |
| Surface | `#FFFFFF` | Card surfaces |
| 成功绿 Success | `#22C55E` | Functional |
| 警告橙 Warning | `#F59E0B` | Functional |
| 错误红 Error | `#EF4444` | Functional |
| 链接蓝 Info | `#2563EB` | Functional |

### Dark Mode
- Background **藏蓝 `#1B3A5C`** (v2 used iOS grey `#1C1C1E`); Text `#FAF6EE` / `#C9BFB2`
- Functional colours identical to light mode, so status recognition never changes

### Flat Design Rules (from the VI manual — non-negotiable)
- 不得添加阴影、描边或特效 — no drop shadows, no glow, no gradient fills as decoration
- 不得使用非品牌色彩 — only the tokens above
- 不得随意改变图形比例 — auxiliary graphics keep their published sizes
- 不得在复杂背景上使用 — brand graphics need a plain cream / navy / white ground

### Cards
- White `#FFFFFF` surface on the cream canvas, `1px solid #E6DCCB` hairline (the only "elevation")
- Radius: 12px (card) / 10px (button, input)
- No shadow, no backdrop-blur, no gradient overlay

### Live Cover
- Solid navy `#1B3A5C` block, flat — no gradient

### Buttons
- **Primary**: solid navy fill, cream text, flat
- **Accent**: solid terracotta `#C97B5A` fill (limited use only)
- Min height: 48px (primary), 40px (small)

### Logo
- `public/logo-v3.svg` (mark) · `public/logo-v3-horizontal.svg` (lockup) · `public/logo-v3-horizontal-reversed.svg` (navy canvas)
- `public/logo.svg` and `public/logo-dark.svg` serve the same mark at canonical paths
- The old amber gradient paw is **deleted** — never reintroduce amber or the `#FF9500 / #5AC8FA / #4CD964 / #FFF4CC` family

### Auxiliary Graphics
- 金刚爪 paw symbol: 128 / 64 / 48 / 32 / 24 / 16, rotations 0 / 15 / -15 / 30 / 45°
- Brand icons: 藏蓝圆环 + 金色线稿 (宠物 / 星星 / 爱心 / 勋章 / 日历 / 美容护理 / 宠物店 / 购物)
- Tags: 会员专享 (navy) · 小游戏 (gold) · 活动 (navy) · 限定活动 (terracotta)
- Ready-made components: `src/components/BookingUI.tsx` (`AvatarCard` `SlotCard` `TimeBar` `MemberBadge` `ProgressRing` `TaskCapsule` `GoldenPaw` `BrandIcon` `BrandTag` `CornerFrame`)

### Animation & Interaction
- Transition: `cubic-bezier(0.34, 1.56, 0.64, 1)` (spring)
- Hover: `translateY(-1px)`, `brightness(1.05)`
- Active: `scale(0.985)`, `brightness(0.97)`
- Letter-spacing: `0.01em`
- Font: SF Pro / PingFang SC (never Inter)

### Retired (do not restore)
- ~~Liquid Glass Card~~ (`backdrop-blur: 24px`, `linear-gradient(white/70 → white/40)`, `0 12px 40px` shadow)
- ~~Neumorphism~~ (`shadow-neumo-raised/pressed`) — flattened to hairlines at the Tailwind layer
- ~~Amber / iOS gradients~~ on buttons, badges, status colours
- ~~`/yellowwhite` route + `useBackgroundTheme`~~ — legacy v2 demo only, not part of the product surface

### Prohibited
- No em-dash (—) in visible text
- No AI purple gradients, neon glow, pure black/white
- No decorative shadows beyond functional
- No Inter as default font
- No button label wrapping

## 🐾 Service Steps

### 精致洗 / 标准洗 (Deluxe / Standard) — 70 min total
1. 全身吹毛检查 (8 min)
2. 脚底剃毛 (5 min)
3. 磨指甲 (5 min)
4. 剃腹底毛 & 屁屁周边 (2 min)
5. 清理耳朵 & 掏耳朵 (10 min)
6. 刷牙 (2 min)
7. 第一遍清洗 (8 min)
8. 第二遍清洗 (8 min)
9. 上护毛素 (7 min)
10. 吹干毛发 (20 min)

### 美容 (Grooming) — 130 min total
All above + 11. 剪毛 (60 min) + 12. 完成出品

### Step rendering: Done `✓` | Active `●` | Pending `○`

## 📄 Page Specs

### Customer Booking Page
- Layout: shop intro + live status board (top-right, 30s refresh) + booking form (10 fields) + result card
- Status board: 3 cards — Under Review | Accepted Today | In Service
- Form fields: owner name, phone, pet name, date/time (10:00-17:00, 15-min slots), service type, weight range, vaccine date, outside groomed, emotionally stable, notes
- Result card: status badge, pet name, info grid, WeChat notice

### Staff Backend Page
- 2-column: Left = Pending Review | Right = Current Service Board
- Pending: Accept / Send WeChat → "Push to Service Board" after accept
- Service board: Start/Pause/Finish, step rendering, "Send WeChat"
- Public display: `display_in_service_list = true`

### Owner Status Page
- URL: `?booking=xxxxx`
- Elements: pet name, status badge, progress bar (0-100%), 4 info boxes, vertical flow steps
- Flow: Booking Submitted → Store Review → In-store Evaluation → Service Begins
- Buttons: Contact via WeChat, View In-Service Example

## 🔌 宠老板 MCP Server (chonglaoban)

**Local path**: `C:/Users/coolj/.trae-cn/trae projects/mcp-chonglaoban/server.js`
**Registered in**: `C:\Users\coolj\.minimax\mcp.json` → `mcpServers.chonglaoban`
**Dependencies**: `@modelcontextprotocol/sdk`, `puppeteer-core`
**Login URL**: `https://v70.chonglaoban.cn/#/login`
**Browser**: Edge or Chrome (Chromium-based, auto-detected)

### Tools (call in order)
1. `login` — auto-login (credentials from file). **Call FIRST.**
2. `get_dashboard` — today's revenue, customer count, quick stats
3. `get_revenue_report` — navigate to statistics/reports
4. `navigate_to` — by route (member / stock / yanghuo / cashier / statistics)
5. `get_page_text` — read page text (≤5000 chars)
6. `extract_elements` — by CSS selector (e.g. `table tr`, `.stat-value`)
7. `run_javascript` — custom JS extraction
8. `take_screenshot` — full-page capture (for debug)
9. `get_status` — check login state + URL
10. `logout` — close browser. **Call when done.**

### Confirmed data
- Dashboard: 今日订单, 今日会员, 今日提醒, 今日预约, 客流分析, 临期商品
- Sidebar: 收银台, 订单管理, 预约服务, 洗护报告, 寄养管理, 提醒
- Shop info: 金刚宠, 绑定号码 18826025100, 到期 2027-05-06, 短信527条

### Workflow rules
- ALWAYS `login` first
- Vue.js SPA → 2-3s render time
- Empty-looking page → use `take_screenshot`
- ALWAYS `logout` when done
- Credentials are read from file — **never ask user for credentials**
- The Vue.js DOM changes often — use `run_javascript` once you know the structure

### Known issues
- Login may get stuck on `/survey` page — use `run_javascript` to close modal
- Data is 100% cloud-stored (Shanghai servers), no public API → Puppeteer only
- Use headless mode for production (faster)

## 🤖 Local Mavis Agents (consolidated 2026-09-07)

| Agent | Stable name | Status |
|---|---|---|
| 金刚宠 (all roles) | `jingangchong-analytics` | **ACTIVE** — the only agent to invoke |

The four original specialists were consolidated into one agent (`jingangchong-analytics`, display name 金刚宠) covering analytics + content + social + retention + branding + market research. `jingangchong-retention`, `jingangchong-social` and `jingangchong-content` are **RETIRED — do not invoke**. Split again only if volume grows or different humans own different streams.

Agent home: `C:\Users\coolj\.minimax\agents\jingangchong-analytics\`. Default workspace = this dir (`D:\金刚宠\jingangchong-app\`, as of 2026-09-01). Use MiniMax Code's built-in MCP tooling to call chonglaoban tools (no CLI).

## 📬 Handoff Protocol (inter-agent file drops)

Cross-agent coordination uses **file-based handoffs** — no real-time bus, no message broker. Each agent reads inputs from its own subfolder and writes outputs to its own subfolder. Coordination across agents is the orchestrator's (Mavis) job, not the agents'.

### Folder layout
```
handoffs/
├── content/      # legacy (agent retired) — jingangchong-content wrote here
├── social/       # legacy (agent retired) — jingangchong-social wrote here
├── retention/    # legacy (agent retired) — jingangchong-retention wrote here
└── analytics/    # jingangchong-analytics writes here; others read
```

### File naming convention
- **Date-based ISO week**: `YYYY-Www-{type}.{ext}` — e.g. `2026-W37-drafts.json`
- **Ad-hoc / one-off**: `YYYY-MM-DD-{topic}.{ext}` — e.g. `2026-09-15-event-summary.md`
- Per-domain `README.md` documents the input/output contract for that subfolder (read it first)

### Data formats
- **JSON** for structured data (drafts, schedules, metrics)
- **Markdown** for human-readable summaries (strategies, retrospectives)
- **Avoid** binary files in `handoffs/` — images belong in `public/` or `D:\金刚宠\Promotion\`

### On startup
Each jingangchong agent should:
1. Read `handoffs/<your-domain>/README.md` to understand the contract
2. Check `handoffs/<other-domains>/` for upstream input
3. Write outputs to `handoffs/<your-domain>/YYYY-Www-{type}.{ext}`
4. Reply to the orchestrator with the file path

### On cross-agent workflow
The orchestrator (Mavis root session) routes work via `session send`. Each agent completes its slice, writes the handoff file, and replies. The orchestrator reads the handoff file and dispatches the next agent. No agent-to-agent direct calls.

### Why no real-time bus
- Each `session send` is its own HTTP call with full agent context loaded — a "bus" of N agents calling each other would multiply the cost
- File handoffs survive process restarts; in-memory buses don't
- Per-step handoffs are auditable on disk
- The 4 agents already share this `PROJECT-RULES.md` — same context, no need for additional sync layer

## 📊 Channel Strategy

| Channel | Priority | Est. Leads | Role |
|---|---|---|---|
| 微信私域 | ⭐⭐⭐⭐⭐ | 80 | Primary conversion |
| 小红书 | ⭐⭐⭐⭐ | 20 | Discovery + social proof |
| 大众点评 | ⭐⭐⭐ | 10 | Local search + reviews |
| 抖音 | ⭐⭐ | 15 | Brand awareness |
| 转介绍 | ⭐⭐⭐⭐ | 10 | Highest retention |
| 地图/高德 | ⭐⭐ | 5 | Local SEO |

**Key insights**:
- WeChat private domain: 45%+ repeat purchase — primary conversion
- Dianping +0.1 rating = +8% exposure; 4.8★+ = 230% more than 4.5★
- Dianping **prohibits** direct review-for-benefit exchanges — focus on genuine service quality
- 60%+ users search via Amap/Gaode for nearby shops
- Referral retention rate: 3x higher than new acquisition

## ⚠️ Known Issues & Decisions
1. **Cloudflare `nodejs_compat`**: may need manual flag in dashboard
2. **Event location constraint**: far from shop → Dianping on-site check-in not feasible
3. **宠老板 `/survey` page**: auto-login gets stuck → needs `run_javascript` modal close
4. **宠老板 API**: closed SaaS, no public API → Puppeteer scraping only
5. **WeChat Moments**: cannot tag Dianping locations; cannot control UGC
6. **Fan design**: lifespan 3-6 months (summer high-use item)
7. **Logging on Windows**: when 宠老板 server prints Chinese to a redirected stderr, the PowerShell console shows mojibake — content is correct, display is wrong

## 🔗 Quick Reference
- **Live dashboard**: https://jiangangchong-app.pages.dev
- **GitHub repo**: https://github.com/wasahin/jiangangchong-app
- **Cloudflare**: https://dash.cloudflare.com
- **宠老板 admin**: https://v70.chonglaoban.cn
- **Local dev**: http://localhost:8084
- **宠老板 MCP server entry**: `C:/Users/coolj/.trae-cn/trae projects/mcp-chonglaoban/server.js`
- **MCP config**: `C:\Users\coolj\.minimax\mcp.json`
- **Credentials**: `D:\金刚宠\AI material\宠老板credentials.txt`
