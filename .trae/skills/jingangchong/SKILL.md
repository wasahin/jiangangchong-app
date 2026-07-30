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
- **Service Pricing**: 精致洗 ¥80 (85% margin) | 标准洗 ¥80 (85% margin) | 美容 ¥150 (80% margin) | 寄养 ¥100/day (90% margin)
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

## 🎨 Design System

### Color Palette
| Token | Value | Usage |
|---|---|---|
| Primary/Gold | `#FF9500`, `#FFA500`, `#E8A020` | Brand, primary buttons |
| Blue | `#5AC8FA`, `#007AFF` | Info, secondary actions |
| Green | `#4CD964`, `#34C759` | Success, active states |
| Red | `#FF3B30` | Errors, alerts |
| Background | `#F2F2F7`, `#F5F0EB` | Page backgrounds |
| Barley White | `#FFF4CC`, `#FFF9E6` | Card surfaces |
| Text Primary | `#5C5C5C`, `#1a1a1a` | Main text |
| Text Secondary | `#9A9A9A` | Descriptions, hints |

### Dark Mode
- Background: `#1C1C1E` / `#2C2C2E`
- Card: `#3D3D40`
- Text: `#FFFFFF` / `#8E8E93`
- Logo: Gold gradient `#FFD700` → `#FF8C00`

### Liquid Glass Card Spec
- `backdrop-blur: 24px`, `saturate: 180%`
- Background: `linear-gradient(white/70 → white/50 → white/40)`
- Border: `white/50`
- Shadow: `0 12px 40px rgba(0,0,0,0.08)`
- Rounded: `24px`
- Inner top gradient: `rgba(255,255,255,0.4)` → transparent

### Button Specs
- **Primary (Orange)**: `linear-gradient(rgba(255,165,24,0.95) → rgba(255,122,0,0.92))`
- **Secondary (Glass)**: `linear-gradient(white/70 → white/50 → white/40)` + `backdrop-blur: 16px`
- **Blue**: `linear-gradient(rgba(90,200,250,0.98) → rgba(50,180,240,0.95))`
- **Green**: `linear-gradient(rgba(76,217,100,0.95) → rgba(52,199,89,0.92))`
- **Radius**: 16px (buttons), 12px (inputs), 20px (cards)
- **Min Height**: 48px (primary), 40px (small)

### Animation & Interaction
- Transition: `cubic-bezier(0.34, 1.56, 0.64, 1)` (spring)
- Hover: `translateY(-1px)`, `brightness(1.05)`
- Active: `scale(0.985)`, `brightness(0.97)`
- Letter-spacing: `0.01em`
- Font: SF Pro / PingFang SC (never Inter)

### Prohibited Elements
- No em-dash (—) in visible text
- No AI purple gradients, neon glow, pure black/white
- No decorative shadows beyond functional ones
- No Inter as default font
- No button label wrapping

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

### 🔗 Shared MCP Config (for ALL 4 Agents)
All 4 agents (analytics, retention, social, content) share the **same exact MCP config**. Copy-paste this block into each agent's mcp.json — no per-agent changes needed.

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

## 🤖 Agent Definitions

### 1. Content Agent (内容代理)
- **Role**: Create pet care content, grooming tips, social media posts
- **Trigger**: User needs Xiaohongshu posts, Douyin scripts, WeChat moments, pet care articles
- **Key Knowledge**: Zhongshan pet market, seasonal grooming needs, customer pain points
- **Output**: Post copy, hashtags, campaign content calendars

### 2. Social Media Agent (社交媒体代理)
- **Role**: Manage Xiaohongshu, Douyin, Dianping presence
- **Trigger**: User needs social media strategy, posting schedule, engagement plan
- **Channel Priority**: WeChat (highest conversion) > Xiaohongshu (organic) > Dianping (validation) > Douyin (awareness)
- **Key Insight**: 大众点评 prohibits direct review-for-benefit exchanges; use genuine service quality

### 3. Customer Retention Agent (客户留存代理)
- **Role**: WeChat follow-ups, loyalty programs, re-engagement campaigns
- **Trigger**: User needs customer journey mapping, loyalty design, churn reduction
- **Strategy**: RFM segmentation, personalized WeChat sequences, referral incentives
- **Key Insight**: Existing customer referral retention rate is 3x higher than new acquisition

### 4. Analytics Agent (分析代理)
- **Role**: Track event ROI, conversion funnels, break-even progress
- **Trigger**: User needs performance review, funnel analysis, budget optimization
- **Data Source**: 宠老板 MCP server (get_dashboard, get_revenue_report)
- **Key Metrics**: Monthly services, new customer rate, repeat purchase rate, event conversion

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