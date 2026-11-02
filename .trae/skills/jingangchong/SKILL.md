---
name: "jingangchong"
description: "Knowledge base for 金刚宠 pet grooming shop. Invoke when working on petshop status dashboard, marketing campaigns, 宠老板 MCP integration, or any 金刚宠 project task."
---

# 金刚宠 (Jingangchong) Pet Shop - Project Knowledge Base

## 🏪 Business Identity
- **Shop Name**: 金刚宠宠物美容
- **Location**: Guangdong Zhongshan (广东中山)
- **Business Type**: Pet grooming and care center
- **Key Differentiator**: Premium grooming with real-time status tracking for pet owners

## 💰 Financial Model
- **Monthly Fixed Costs**: ¥14,226 (rent, electricity, salary, insurance)
- **Break-even**: 104 grooming services/month (currently ~70, gap: 34)
- **Service Pricing** (by weight): 标准洗 ¥68 / ¥88 / ¥108 · 精致洗 ¥98 / ¥118 / ¥138 · 美容 ¥180+ / ¥200+ / ¥220+ (5kg以下 / 5-10kg / 10kg+) · 寄养 ¥100/day (90% margin)
- **Contribution per service**: 标准洗 ¥68 · 美容 ¥120 · 寄养 ¥90/day · weighted avg ¥78.25
- **Target**: 9-12 new weekly regular customers needed to break even

## 🎯 Current Campaign: Pet DIY Free Market
- **Timeline**: ~3 weeks from start
- **Location**: Zhongshan (off-site, far from shop — Dianping check-ins impractical)
- **Assets**: Dog bandanas (for sale), free fans with logo + WeChat QR code
- **Funnel**: Scan QR → Add WeChat → Get grooming discount → Book service → Become regular
- **Budget**: ¥5,500 total investment | Long-term ROI target: +164%

## 🌱 Membership / Loyalty Program (现行制度)
- **Tagline**: 不需充值，碰头碰优惠！(No pre-payment, discount per visit)
- **Source asset**: `D:\金刚宠\Grooming menu\Grooming menu\Ipad\4.jpg`
- **7 tiers by cumulative service visits**: 0/11/21/31/41/51/61+ → 种子/小草/小树/大树/花开/结果/顶 → 一星→五星永久 (9.5折→8折+专享活动)
- **Tier-up rewards**: 精洗产品×1 → spa×1 → 小零食盒×1 → 牵引绳套装×1 → 宠物外出背包 → 每季度会员礼品
- **2-month dormancy rule (HARD)**: 连续2个月未到店 → 累计次数重置，等级保留。50+ days silent = urgent retention risk
- **No pre-payment** (不需充值): pure visit-based

---

## 🏗️ Technical Architecture

### Project Files
- **HTML Prototype**: `jingangchong_h5_prototype.html` (main working file)
- **Next.js App**: `jingangchong-app/` (production deployment)
- **MCP Server**: `mcp-chonglaoban/server.js` (宠老板 integration)
- **Credentials**: `D:\金刚宠\AI material\宠老板credentials.txt`
- **Grooming Menu**: `D:\金刚宠\Grooming menu\Grooming menu\Ipad`

### Deployment
- **Platform**: Cloudflare Pages
- **Account ID**: `8574e1c4ec018d0061b1cdcfa8237484`
- **Project Name**: `jingangchong-app`
- **URL**: https://jiangangchong-app.pages.dev
- **Repo**: https://github.com/wasahin/jiangangchong-app
- **Issue**: `nodejs_compat` flag may need manual setting in Cloudflare Dashboard

### Data Storage
- **Client-side**: LocalStorage with key `jingangchong_h5_v2`
- **Booking Fields**: `review_status`, `createdAt`, `updatedAt`, `display_in_service_list`, `current_phase`, `current_step`

### Core Workflow Rule: Single Status Link
- Each booking generates ONE unique, permanent status link
- Same link used throughout entire service lifecycle
- WeChat sends link only ONCE after booking confirmation
- No new links on status updates

### Core Workflow Rule: Step Rotation
- Timer starts ONLY when staff clicks "Start"
- Automatic step advancement based on timer
- Staff controls: Start / Pause / Finish (only 3 buttons)
- Customer page updates dynamically (polling or WebSocket)

---

## 🎨 Design System — Brand v3 · 暖陶橙 (2026-11-02)

> **Brand v3 supersedes v2.** v3 is a **flat** system: neumorphism, gradients-as-decoration, glow and drop shadows are retired. Elevation is now a 1px hairline on a white surface over a cream canvas.
> Authoritative token source: `src/lib/design-tokens.ts` + `src/lib/design-tokens.json`. CSS vars live in `src/app/globals.css`. Tailwind namespace: `brand-v3-*`.

### Colour Palette
| Token | Value | Role |
|---|---|---|
| 奶油白 Cream | `#FAF6EE` | Light canvas |
| 藏蓝 Navy | `#1B3A5C` | **Primary ~72%** |
| 金刚金 Gold | `#E2BC6E` | **Secondary ~20%** |
| 近黑 Ink | `#1A1714` | Ceremony, weight, body text |
| 暖陶橙 Terracotta | `#C97B5A` | **Accent ≤8%** (10-12% for 会员升级 / 限定活动) |
| Surface | `#FFFFFF` | Cards on cream canvas |
| 成功绿 Success | `#22C55E` | Functional |
| 警告橙 Warning | `#F59E0B` | Functional |
| 错误红 Error | `#EF4444` | Functional |
| 链接蓝 Info | `#2563EB` | Functional |

Tailwind: `bg-brand-v3-cream`, `text-brand-v3-navy`, `border-brand-v3-gold`, `bg-brand-v3-terracotta`, `text-brand-v3-success`, …
`brand-v2-*` is a **deprecated alias** pointing at the v3 values; keep for one release only, then delete.

### Dark Mode
- Canvas: **藏蓝 `#1B3A5C`** (v2 used iOS grey `#1C1C1E`)
- Surface: `#1B3A5C` → slightly lifted navy; text `#FAF6EE` / `#C9BFB2`
- Functional colours stay identical to light mode so status recognition never changes
- Light and dark are the same identity with only the canvas flipping

### Flat Design Rules (non-negotiable, from the VI manual)
- 不得添加阴影、描边或特效 — no drop shadows, no glow, no gradient fills as decoration
- 不得使用非品牌色彩 — only the 9 tokens above
- 不得随意改变图形比例 — auxiliary graphics keep their published sizes
- 不得在复杂背景上使用 — brand graphics need plain cream/navy/white ground
- Elevation = 1px hairline border (`#E6DCCB` on cream, rgba navy on navy)

### Logo Assets (`public/`)
| File | Use |
|---|---|
| `logo-v3.svg` | Primary mark — navy dog head, flat, single-path silhouette |
| `logo-v3-horizontal.svg` | Mark + 金刚宠 wordmark + gold rule/爪 + JINGANGCHONG + tagline |
| `logo-v3-horizontal-reversed.svg` | Reversed lockup for the navy canvas |
| `logo.svg`, `logo-dark.svg` | Canonical path aliases serving the v3 mark |

> The old amber gradient paw (`amberlogo.png`, `amberlogo.svg`) is **deleted**. Never reintroduce amber gradients or the `#FF9500 / #5AC8FA / #4CD964 / #FFF4CC` family.

### Auxiliary Graphics System (`src/components/BookingUI.tsx`)
- `GoldenPaw` — 金刚爪超级符号. Sizes `128 / 64 / 48 / 32 / 24 / 16` (`PAW_SIZES`), rotations `0 / 15 / -15 / 30 / 45°` (`PAW_ROTATIONS`)
- `BrandIcon` — 藏蓝圆环 + 金色线稿 icons: 宠物 / 星星 / 爱心 / 勋章 / 日历 / 美容护理 / 宠物店 / 购物
- `BrandTag` — 会员专享 (navy) · 小游戏 (gold) · 活动 (navy) · 限定活动 (terracotta)
- `CornerFrame` — navy L-corner + paw decoration
- CSS primitives in `globals.css`: `.surface-card` `.paw-symbol` `.icon-ring` `.divider-navy` `.divider-gold` `.divider-dotted` `.corner-frame` `.font-label` `.font-serif-cn`

### Booking UI Component Tokens
| Component | Size |
|---|---|
| `AvatarCard` | 120×120 |
| `SlotCard` | 280×96 |
| `TimeBar` | 360×48 |
| `MemberBadge` | 160×56 |
| `ProgressRing` | 100×100 |
| `TaskCapsule` | 220×56 |

### IP Characters
- 理容师 / Groomer · 生活方式 / Lifestyle · 守护者 / Guardian
- 服装语言: 眼罩 = 职业符号 · 围裙 = 服务场景 · 衬衫 = 生活方式 · 披风 = 限定仪式
- The navy eye-mask band on the logo mark is the signature taken from the 理容师 character

### Typography
- Serif display for brand moments (`.font-serif-cn`, 金刚宠 wordmark)
- `.font-label` for tracking-wide small caps labels
- Body: PingFang SC / Noto Sans SC (never Inter)

### Retired v2 Specs (do not restore)
- ~~Liquid Glass Card~~ (`backdrop-blur: 24px`, gradient overlays, `0 12px 40px` shadow) — retired
- ~~Neumorphism~~ (`shadow-neumo-raised/pressed`, `neumo-light-*`) — flattened to hairlines at the Tailwind layer
- ~~Amber / iOS gradients~~ on buttons, badges, status colours — retired
- `/yellowwhite` route and `useBackgroundTheme` are **legacy v2 demo only**, not part of the product surface

### Prohibited Elements
- No em-dash (—) in visible text
- No AI purple gradients, neon glow, pure black/white
- No decorative shadows beyond functional ones
- No Inter as default font
- No button label wrapping
- No amber / iOS colour family

---

## 🐾 Service Steps

### 精致洗 / 标准洗 (Deluxe / Standard)
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
- **Total**: 70 min

### 美容 (Grooming)
All above +:
11. 剪毛 (60 min)
12. 完成出品
- **Total**: 130 min

### Step Rendering
- Done: `✓`
- Active: `●`
- Pending: `○`

---

## 📄 Page Specifications

### Customer Booking Page
- **Layout**: Shop intro + live status board (top-right, 30s auto-refresh) + booking form (10 fields) + result card
- **Status Board**: 3 cards — Under Review | Accepted Today | In Service
- **Form Fields**: Owner name, phone, pet name, date/time (10:00-17:00, 15-min intervals), service type, weight range, vaccine date, outside groomed, emotionally stable, notes
- **Result Card**: Status badge, pet name, info grid, WeChat notice

### Staff Backend Page
- **Layout**: Two-column — Left = Pending Review | Right = Current Service Board
- **Pending Review**: Accept / Send WeChat buttons → "Push to Service Board" after accept
- **Service Board**: Start / Pause / Finish controls, step rendering, "Send WeChat" button
- **Public Display**: `display_in_service_list = true` controls visibility

### Owner Status Page
- **URL**: `?booking=xxxxx` (unique per booking)
- **Elements**: Pet name, status badge, progress bar (0-100%), 4 info boxes, vertical flow steps
- **Flow**: Booking Submitted → Store Review → In-store Evaluation → Service Begins
- **Buttons**: Contact via WeChat, View In-Service Example

---

## 🔌 宠老板 MCP Server

### Setup
- **Location**: `mcp-chonglaoban/server.js`
- **Dependencies**: `@modelcontextprotocol/sdk`, `puppeteer-core`
- **Credentials File**: `D:\金刚宠\AI material\宠老板credentials.txt`
- **Browser**: Edge/Chrome (Chromium-based)
- **Login URL**: `https://v70.chonglaoban.cn/#/login`

### MCP Tools Available (v2.1.0)
| Tool | Priority | Description |
|---|---|---|
| `get_monthly_services` | ⭐⭐⭐⭐⭐ | **CRITICAL**: MTD service count vs 104 break-even target + gap analysis |
| `get_order_stats` | ⭐⭐⭐⭐ | Today's orders, revenue, customers, service breakdown |
| `login` | ⭐⭐⭐⭐⭐ | Login using credentials file. Uses nativeSetter pattern for Vue.js |
| `get_dashboard` | ⭐⭐⭐⭐ | Today's revenue, orders, stats, 临期商品, 库存不足 |
| `get_revenue_report` | ⭐⭐⭐ | Navigate to revenue/statistics page |
| `navigate_to` | ⭐⭐⭐ | Navigate to route (member, stock, yanghuo, cashier, statistics) |
| `get_page_text` | ⭐⭐⭐ | Read current page text (up to 5000 chars) |
| `extract_elements` | ⭐⭐⭐ | Extract elements by CSS selector |
| `run_javascript` | ⭐⭐⭐ | Execute JS in browser for data extraction |
| `take_screenshot` | ⭐⭐ | Full-page screenshot for visual debugging |
| `restart_browser` | ⭐⭐ | Reset browser state after server.js edits |
| `logout` | ⭐ | Close browser session |
| `get_status` | ⭐⭐ | Check login state, server version, browser mode |

### 🔗 Shared MCP Config
All agents share the **same exact MCP config**. Copy-paste this block into each agent's mcp.json — no per-agent changes needed.

```json
{
  "mcpServers": {
    "chonglaoban": {
      "command": "node",
      "args": ["c:/Users/coolj/.trae-cn/trae projects/mcp-chonglaoban/server.js"],
      "env": {
        "CLB_CREDENTIALS_FILE": "D:/金刚宠/AI material/宠老板credentials.txt",
        "CLB_LOGIN_URL": "https://v70.chonglaoban.cn/#/login",
        "CLB_HEADLESS": "true",
        "CLB_BROWSER_URL": "http://127.0.0.1:9222",
        "CLB_DEBUG": "false"
      }
    }
  }
}
```

**For Trae** (MCP host does NOT kill child processes): Remove the `CLB_BROWSER_URL` line — server.js will launch Edge directly.
**For Mavis** (MCP host kills child process tree): Keep `CLB_BROWSER_URL` and run `start_chonglaoban.ps1` before starting Mavis.

### 🔧 NativeSetter Pattern (Why We Use It)
In `puppeteer.connect()` mode (attached to external browser), `page.click() + page.keyboard.type()` does NOT trigger Vue.js v-model updates because the page doesn't receive proper keyboard focus.

**Fix**: Use `Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set` to directly set values, then dispatch synthetic `input` + `change` events.

Helpers available in server.js:
- `setInputValue(page, selector, value)` — for `<input>` and `<textarea>`
- `setSelectValue(page, selector, value)` — for `<select>` dropdowns
- `clickElement(page, selector)` — click via JS evaluate (bypasses focus)

**Pattern reference** (reusable in any Puppeteer + Vue.js project):
```js
async function setInputValue(page, selector, value) {
  return page.evaluate((sel, val) => {
    const el = document.querySelector(sel);
    if (!el) return false;
    const proto = el.tagName === 'TEXTAREA'
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
    const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value').set;
    nativeSetter.call(el, String(val));
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }, selector, value);
}
```

### v2.1.0 Changelog
- ✅ Refactored nativeSetter into reusable `setInputValue` / `setSelectValue` / `clickElement` helpers
- ✅ Login optimized: 4s→2.5s initial wait, 15s→8s polling (15s fallback), 500ms poll interval. Target: 8-10s total
- ✅ Added `get_monthly_services` — auto-extracts MTD service count vs 104 BE target, returns gap analysis
- ✅ Added `get_order_stats` — today's orders/revenue/customers + service type breakdown
- ✅ `get_status` now reports server version, available helpers, new tools
- ✅ PowerShell launcher: `mcp-chonglaoban/start_chonglaoban.ps1` (one-click, auto-verifies debug endpoint)

### Key Data Insights from 宠老板
- RFM user segmentation is most valuable for retention analysis
- 大众点评 rating +0.1 = +8% exposure; 4.8★+ = 230% more than 4.5★
- WeChat private domain: highest conversion rate, 45%+ repeat purchase
- 大众点评: last-step decision validation, rating quality determines conversion
- 60%+ users search via Amap/Gaode Maps for nearby shops

---

## 🤖 Agent Roster (2026-09-07 consolidation)

The four original agents were consolidated into **one** agent: `jingangchong-analytics`, display name **金刚宠 / jingangchong**, covering analytics + content + social + retention + branding + market research.

| Agent | Status |
|---|---|
| `jingangchong-analytics` (displayName 金刚宠) | **ACTIVE** — the only agent to invoke |
| `jingangchong-content` | RETIRED — do not invoke |
| `jingangchong-social` | RETIRED — do not invoke |
| `jingangchong-retention` | RETIRED — do not invoke |

Single-agent setup is sufficient at the shop's current volume (~3-5 posts/week, ~10-20 WeChat follow-ups/day). Split again if volume grows or different humans own different streams.

### Role coverage inside the one agent

**Content (内容)** — Xiaohongshu posts, Douyin scripts, WeChat moments, grooming tips, pet-care articles. Key knowledge: Zhongshan pet market, seasonal grooming needs, customer pain points. Output: post copy, hashtags, content calendars.

**Social (社交媒体)** — Xiaohongshu / Douyin / Dianping channel strategy and posting schedule. Channel priority: WeChat (highest conversion) > Xiaohongshu (organic) > Dianping (validation) > Douyin (awareness). 大众点评 prohibits direct review-for-benefit exchanges — use genuine service quality.

**Retention (客户留存)** — WeChat follow-ups, loyalty programs, re-engagement. RFM segmentation, personalised WeChat sequences, referral incentives. Existing-customer referral retention is 3x higher than new acquisition.

**Analytics (分析)** — event ROI, conversion funnels, break-even progress, budget optimisation. Data source: 宠老板 MCP server. Key metrics: monthly services, new-customer rate, repeat-purchase rate, event conversion.

**Branding (品牌)** — Brand v3 system, IP characters, VI boards, Lovart briefs.

Cross-agent info sharing happens via (a) duplicated system prompts, (b) the shared `C:\Users\coolj\.minimax\memory\user.md`, (c) `PROJECT-RULES.md` in this workspace. There is **no real-time bus** between agents — the user routes work via session send.

---

## 📊 Channel Strategy Reference

| Channel | Conversion | Effort | Use Case |
|---|---|---|---|
| WeChat Private Domain | ⭐⭐⭐⭐⭐ | Low | Primary conversion channel |
| Xiaohongshu | ⭐⭐⭐⭐ | Medium | Organic content, social proof |
| Dianping | ⭐⭐⭐ | Medium | Review management, local SEO |
| Douyin | ⭐⭐ | High | Event awareness, low precision |
| Referrals | ⭐⭐⭐⭐⭐ | Low | Highest ROI, 3x retention |

---

## ⚠️ Known Issues & Decisions

1. **Cloudflare `nodejs_compat`**: May need manual flag addition in dashboard
2. **Event location constraint**: Far from shop, Dianping on-site check-ins not feasible
3. **宠老板 survey page**: Auto-login may get stuck on `/survey` page — needs manual close
4. **宠老板 API**: Closed SaaS, no public API — web scraping via Puppeteer only
5. **WeChat moments**: Cannot tag Dianping locations; cannot control user-generated content
6. **Fan design**: Lifespan 3-6 months (summer high-use item)

---

## 🔗 Quick Reference Links
- **Live Dashboard**: https://jiangangchong-app.pages.dev
- **GitHub Repo**: https://github.com/wasahin/jiangangchong-app
- **Cloudflare**: https://dash.cloudflare.com
- **宠老板 Admin**: https://v70.chonglaoban.cn
- **Local Dev**: http://localhost:8084