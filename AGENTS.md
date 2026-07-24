# Jingangchong Petshop (金刚宠) - Project Rules

## Project Identity

- **Project Name**: Jingangchong Petshop (金刚宠)
- **Type**: Pet grooming and care center status dashboard
- **Main Files**: `jingangchong_h5_prototype.html`, Next.js app
- **Deployment**: Cloudflare Pages at https://jiangangchong-app.pages.dev
- **Language**: Chinese UI (primary), English for technical terms

## Tech Stack

- Next.js with TypeScript
- Tailwind CSS
- Cloudflare Pages deployment
- LocalStorage for client-side data (`jingangchong_h5_v2`)

---

## Core Features to Maintain

1. **Customer Page**: Booking form with time selection (10:00-17:00, 15-min intervals)
2. **Staff Page**: Pending bookings list (待审核) + service management with workflow tracking
3. **Owner Page**: Status tracking for pet owners via unique URL (`?booking=xxxxx`)
4. **Public Dashboard**: Real-time service status board

---

## Design System - Liquid Glass (iOS Style)

### Color Palette

| Token | Value |
|---|---|
| Primary/Gold | `#FF9500`, `#FFA500`, `#E8A020` |
| Blue | `#5AC8FA`, `#007AFF` |
| Green | `#4CD964`, `#34C759` |
| Red | `#FF3B30` |
| Background | `#F2F2F7`, `#F5F0EB` |
| Text | `#1a1a1a` |
| Barley White | `#FFF4CC` |
| Card Surface | `#FFF9E6` |
| Text Primary | `#5C5C5C` |
| Text Secondary | `#9A9A9A` |
| Amber Brand | `#FFA500` |
| Amber Light | `#FFB333` |
| Amber Dark | `#E89000` |
| Pink Accent | `#FF9A9E` |
| Pink Light | `#FFB8BA` |

### Dark Mode Colors

| Token | Value |
|---|---|
| Background | `#1C1C1E` / `#2C2C2E` |
| Card | `#3D3D40` |
| Text Primary | `#FFFFFF` |
| Text Secondary | `#8E8E93` |
| Logo Paw | `#FFD700` to `#FF8C00` |

### Liquid Glass Card Spec

```
backdrop-blur: 24px
saturate: 180%
bg: linear-gradient(135deg, rgba(255,253,240,0.95) 0%, rgba(255,248,225,0.85) 100%)
border: 1px solid rgba(240, 220, 180, 0.2)
shadow: 6px 6px 16px rgba(0,0,0,0.12), -4px -4px 12px rgba(255,255,255,0.9), inset 1px 1px 3px rgba(255,255,255,0.7)
border-radius: 24px
hover: translateY(-4px) scale(1.01) + enhanced shadow
```

### Button Spec

| Type | Style |
|---|---|
| Primary (Amber) | `linear-gradient(180deg, rgba(255,165,24,0.95) 0%, rgba(255,122,0,0.92) 100%)` |
| Blue (iOS) | `linear-gradient(180deg, rgba(90,200,250,0.98) 0%, rgba(50,180,240,0.95) 100%)` |
| Green | `linear-gradient(180deg, rgba(76,217,100,0.95) 0%, rgba(52,199,89,0.92) 100%)` |
| Secondary (Glass) | `linear-gradient(145deg, rgba(255,255,255,0.7) 0%, rgba(240,240,240,0.5) 100%)` + `backdrop-filter: blur(16px)` |

### UI Standards

- **Font**: SF Pro / PingFang SC (never Inter)
- **Border Radius**: buttons 16px, inputs 12px, cards 20-24px
- **Transitions**: `cubic-bezier(0.34, 1.56, 0.64, 1)` or `cubic-bezier(0.25, 0.46, 0.45, 0.94)`
- **Hover**: `-translate-y-[1px]`, `brightness(1.05)`
- **Active (press)**: `scale-[0.985]`, `brightness(0.97)`
- **Min button height**: 48px (small: 40px)
- **Contrast**: All buttons must pass WCAG AA (>= 4.5:1)
- **Shadow system**: outer soft light + top inner highlight + bottom inner depth
- **Glass nav bars**: `backdrop-filter: blur(24px) saturate(180%)` with semi-transparent bg

### Prohibited Design Elements

- No `em-dash (—)` in visible text
- No AI purple gradients, neon glow, pure black `#000000`, pure white `#FFFFFF`
- No three equal-width cards in a row (use asymmetric grids or single column)
- No decorative shadows beyond functional ones
- No pseudo-decorative gradients, borders, or glows

---

## Hard Requirements (Always Apply)

### Single Status Link

- Each booking/order must generate one **unique and fixed** customer status link
- Same link used throughout the entire service lifecycle -- never generate new links on status updates
- WeChat should NOT send a new link on every status change
- Store sends the status link **only once** after first booking confirmation
- Any additional WeChat reminders must tell the customer to open the **existing link**

### Step Rotation & Timer Logic (CRITICAL)

1. **Timer starts ONLY when staff clicks "Start" button**
2. Staff can **pause** at any time
3. Staff can **finish** a step
4. Once started, steps rotate **automatically** based on timer
5. Customer sees real-time status changes **automatically** (no manual step-by-step updates)
6. Customer flow:
   - Booking submitted -> Awaiting Review
   - After staff accepts -> Accepted / Awaiting Service
   - After staff starts -> **Automatic step rotation begins**
7. **Staff only needs 3 buttons**: Start / Pause / Finish
8. **Customer page is always dynamic** -- updates automatically, no reload needed

### Dynamic Status Page

- Customer status page must be **dynamic** -- reads real-time order data by booking ID/token
- Must show clear status, not static or hardcoded text
- Staff updates the **order status itself**, not generating new pages or links
- Staff backend must be minimal -- only key actions, no manual per-step updates
- Once service starts, the system auto-advances customer-visible status via timer + rules
- Status logic must make the customer feel progress is happening even if staff does not manually toggle every micro-step
- Same customer status page must remain valid and re-openable throughout the order lifecycle

---

## Context-Dependent Preferences (Adjustable)

### Customer-Visible Status Labels

Recommended: 已确认, 护理准备中, 清洗护理中, 吹干修整中, 可接回

### Service Duration

- Default ~60 minutes for dogs under 5kg
- Timer segments can be adjusted per service flow (e.g. first half / second half / complete)

### Auto-Update Mechanism

- Use polling (every 15-30 seconds) or WebSocket/SSE depending on technical cost

### Staff Backend Fields

- Optional: ETA, notes, exception descriptions

### WeChat Notifications

- At key nodes (e.g. "completed, ready for pickup"), optionally send proactive WeChat reminder

### Page Copy & Visual Style

- Professional, transparent, efficient
- Clean, readable, iOS-style information hierarchy

### Excel Service Steps

- Use as reference for status segmentation, not necessarily displayed verbatim to customer

### Future Extensibility

- If different dog sizes or service packages have significantly different durations, introduce multiple timer templates later

---

## Data Structure

### Booking Object (Required Fields)

```
review_status: "待审核" | "已接受" | "已拒绝"
createdAt: timestamp
updatedAt: timestamp
display_in_service_list: boolean
current_phase: string
current_step: string
```

### Storage

- Client: LocalStorage with key `jingangchong_h5_v2`

---

## Service Steps

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

### 美容 (Grooming)

Same as above, plus:
11. 剪毛 (60 min)
12. 完成出品

### Step Rendering

- Done: `✓`
- Active (displayed when start button initiated): `●`
- Pending: `○`

---

## Page Layouts

### Customer Booking Page

- Shop intro + process explanation
- Badge: "Booking requires store review after submission"
- Buttons: "Fill in Booking" (scrolls to form), "Contact via WeChat"
- Live store status board (auto-refresh 30s): Currently Under Review / Accepted Today / Currently In Service
- 10-field booking form (owner name, phone, pet name, date/time 10:00-17:00, service type, weight, vaccine date, outside groomed, emotionally stable, special notes)
- Submit button -> writes to storage, shows result card
- Result card: status badge, pet name, time/service/weight, info grid, WeChat notice

### Staff Backend Page

- Two-column: Left = Pending Review / Right = Current Service Board
- Left: pending bookings with Accept / Send WeChat buttons
- After acceptance: "Push to Service Board" -> sets `display_in_service_list = true`
- Right: service cards with Start / Pause / Finish controls
- Step rendering: `✓` done / `●` active / `○` pending

### Owner Status Page

- URL: `?booking=xxxxx`
- Title: "Owner Exclusive Status Page"
- Badge: Accepted / Pending / In Service
- Pet name (large), status description, progress bar (0-100%)
- 4 info boxes: current phase, estimated duration, current step, store reminder
- Vertical flow steps: Booking Submitted -> Store Review -> In-store Evaluation -> Service Begins
- Buttons: "Contact Store via WeChat", "View In-Service Example"

---

## Development Workflow

- Test at `http://localhost:8084/` (or appropriate port)
- Test both customer and staff workflows end-to-end
- Verify localStorage persistence
- Check browser console for errors
- Prioritize UX for pet owners and shop staff
- Maintain consistency with existing design

---

## Deployment Notes

- Cloudflare Pages: https://jiangangchong-app.pages.dev
- Account ID: `8574e1c4ec018d0061b1cdcfa8237484`
- Project: `jingangchong-app`
- If `nodejs_compat` errors persist, manually add the compatibility flag in Cloudflare Dashboard: Pages -> Settings -> Functions -> Compatibility Flags
