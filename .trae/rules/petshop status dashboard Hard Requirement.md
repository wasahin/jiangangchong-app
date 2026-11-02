---
alwaysApply: true
description: Rules for the Jingangchong Petshop Status Dashboard project
---

# 🐕 Jingangchong Petshop Status Dashboard Rules

## Project Identity
- **Project Name**: Jingangchong Petshop (金刚宠)
- **Type**: Pet grooming and care center
- **Main File**: `jingangchong_h5_prototype.html`

## Core Features to Maintain
1. **Customer Page**: Booking form with time selection (only 10:00-17:00, 15-min intervals)
2. **Staff Page**: 
   - Pending bookings list (待审核)
   - Service management with workflow tracking
3. **Owner Page**: Status tracking for pet owners
4. **Public Dashboard**: Real-time service status

## Design Guidelines
- **Theme**: Brand v3 暖陶橙 — cream canvas `#FAF6EE`, navy `#1B3A5C` primary, gold `#E2BC6E` secondary, terracotta `#C97B5A` accent (≤8%)
- **Mobile-first responsive design**
- **Logo**: Use the v3 mark from `/public/logo-v3.svg` (square) or `/public/logo-v3-horizontal.svg` (lockup). `/public/logo.svg` and `/public/logo-dark.svg` serve the same mark at canonical paths.
- **Chinese language interface** (primary), English for technical terms

## UI Design System — Brand v3 暖陶橙 (FLAT)

> Brand v3 supersedes the Liquid Glass / iOS system. v3 is **flat**: neumorphism, decorative gradients, glow and drop shadows are retired. Elevation is a 1px hairline on a white surface over a cream canvas.
> Authoritative tokens: `src/lib/design-tokens.ts` + `src/lib/design-tokens.json`. CSS vars: `src/app/globals.css`. Tailwind namespace: `brand-v3-*`.

### Color Palette
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

### Dark Mode
- Canvas: **藏蓝 `#1B3A5C`** (not iOS grey `#1C1C1E`)
- Text: `#FAF6EE` / `#C9BFB2`
- Functional colours identical to light mode, so status recognition never changes

### Flat Design Rules (from the VI manual — non-negotiable)
- 不得添加阴影、描边或特效 — no drop shadows, no glow, no gradient fills as decoration
- 不得使用非品牌色彩 — only the tokens above
- 不得随意改变图形比例 — auxiliary graphics keep their published sizes
- 不得在复杂背景上使用 — brand graphics need a plain cream / navy / white ground

### Card & Component Specs
```tsx
// Surface card
- bg: #FFFFFF on a #FAF6EE canvas
- border: 1px solid #E6DCCB (hairline = the only "elevation")
- rounded: 12px cards / 10px inputs & buttons
- NO shadow, NO backdrop-blur, NO gradient overlay

// Live cover (services header)
- solid navy #1B3A5C block, flat — no gradient

// Buttons
- Primary: solid navy fill, cream text, flat, no shadow
- Accent: solid terracotta #C97B5A fill (limited use only)
- min-height: 48px (primary), 40px (small)
```

### Auxiliary Graphics
- 金刚爪 paw symbol: sizes 128 / 64 / 48 / 32 / 24 / 16, rotations 0 / 15 / -15 / 30 / 45°
- Brand icons: 藏蓝圆环 + 金色线稿 (宠物 / 星星 / 爱心 / 勋章 / 日历 / 美容护理 / 宠物店 / 购物)
- Tags: 会员专享 (navy) · 小游戏 (gold) · 活动 (navy) · 限定活动 (terracotta)
- Dividers: `.divider-navy` `.divider-gold` `.divider-dotted`
- Ready-made components: `src/components/BookingUI.tsx` (`AvatarCard` `SlotCard` `TimeBar` `MemberBadge` `ProgressRing` `TaskCapsule` `GoldenPaw` `BrandIcon` `BrandTag` `CornerFrame`)

### Animation & Interaction
- Transition timing: cubic-bezier(0.34, 1.56, 0.64, 1) (spring)
- Hover lift: -translate-y-[1px]
- Active scale: scale-[0.985]
- Border radius: 12px cards, 10px buttons/inputs

### Retired (do not restore)
- ~~Liquid Glass Card~~ (`backdrop-blur: 24px`, `linear-gradient(white/70 → white/40)`, `0 12px 40px` shadow)
- ~~Neumorphism~~ (`shadow-neumo-raised/pressed`) — flattened to hairlines at the Tailwind layer
- ~~Amber / iOS gradients~~ on buttons, badges, status colours
- ~~`/yellowwhite` route + `useBackgroundTheme`~~ — legacy v2 demo only, not part of the product surface

## Data Structure Rules
- **Storage**: LocalStorage with key `jingangchong_h5_v2`
- **Booking Object** must have:
  - `review_status`: "待审核", "已接受", "已拒绝"
  - `createdAt`, `updatedAt`: timestamps
  - `display_in_service_list`: boolean
  - `current_phase`, `current_step`: for workflow

## Development Workflow
- Always test changes with **http://localhost:8084/** (or appropriate port)
- Test both customer and staff workflows
- Verify localStorage persistence
- Check browser console for errors

## When Working on This Project
- Prioritize user experience for pet owners and shop staff
- Ensure booking flow works end-to-end
- Maintain consistency with existing design

## Hard Requirements

### 🔒 Core Requirements - Single Status Link
每个 booking / order 必须生成 唯一且固定 的 customer status link。

同一客户在整个服务周期内只使用 同一条状态链接，不可因状态更新而生成新链接。

微信不应在每次状态变化时重新发送新链接。

客户首次预约确认后，门店只发送 一次 状态查询链接。

若发送额外微信提醒，消息内容只能提醒客户打开 原有链接 查看最新状态。

### ⏱️ Step Rotation & Timer Logic (CRITICAL!)
**Step rotation logic MUST be implemented precisely:**

1. **Timer Start**: Service timer starts ONLY when staff clicks **"Start" button on staff page
2. **Pause Button**: Staff can pause timer at any time
3. **Finish Button**: Staff can mark step as finished
4. **Automatic Step Advancement**: Once service has started, steps rotate **automatically** based on timer
5. **Customer View**: Customer sees real-time status changes automatically (no manual step-by-step updates needed
6. **Booking Flow**: Customer sees sequential updates as:
   - Booking submitted → Status: Awaiting Review
   - After staff accepts → Status: Accepted / Awaiting Service
   - After staff starts service → **Automatic step rotation begins**
   - Steps automatically advance through all grooming phases
7. **Staff Controls Only Need 3 Buttons**: **Start / Pause / Finish - no manual step-by-step updates
8. **Customer View Always Dynamic**: Customer status page updates automatically, no manual page reload needed

### 📄 Dynamic Status Page
客户状态页必须是 动态页面，根据 booking ID / token 从后端读取实时订单数据。

客户状态页必须显示清晰状态，而不是静态文案或写死页面。

员工更新的是订单状态本身，不是生成新页面或新链接。

员工后台操作必须尽量精简，只保留关键动作，避免要求 staff 手动更新每一个细步骤。

一旦员工开始服务，系统必须按 timer + 规则自动推进客户可见状态显示。

状态逻辑必须让客户感觉流程正在持续推进，即使 staff 没有逐项手动切换所有洗护步骤。

同一 customer status page 在订单生命周期内必须持续有效并可重复打开。
## Product Features & UX
🐾 Customer Booking Page
Shop section with store intro text and process explanation

Badge: "Booking requires store review after submission"

Button: "Fill in Booking" — anchor scrolls to form below

Button: "Contact via WeChat" — copies WeChat ID or opens WeChat link

Live store status board (top-right, auto-refresh every 30s):

Card 1 — Currently Under Review: count of review_status = pending

Card 2 — Accepted Today: count of review_status = accepted

Card 3 — Currently In Service: count of display_in_service_list = true

Booking form (10 fields):

Owner name (text input)

Contact phone (text input)

Pet name (text input)

Appointment date & time (text input, format: YYYY-MM-DD HH:MM)（limited appointment time from 10:00 to 17:00) (Display available time on the selected date, darken out the time if its being taken)

Service type (dropdown: 精致洗 / 标准洗 / 美容)

Pet weight range (dropdown: 5kg以下 / 5–10kg / 10kg以上)

Most recent vaccine date (text input, format: YYYY-MM-DD)

Previously groomed at another salon (dropdown: Yes / No)

Pet emotionally stable (dropdown: Yes / No)

Special notes (textarea)

Non-editable disclaimer text below form

Submit button — writes booking to storage, shows result card

Reset button — clears all fields, hides result card

Booking result card (right column, shown after submit):

Top-right badge: "Pending Review" or "Accepted"

Pet name (bold, large)

Booking time · service type · weight range

Tag "Awaiting store confirmation"

4-cell info grid: vaccine date / outside groomed / emotion stable / store note

Blue notice box: "Please watch for WeChat notification. Final suitability determined by groomer on-site."

Current service list (public board):

Only shows bookings with display_in_service_list = true

Each card shows: status, WeChat sent state, current phase, current step

autorotate step list to advance service progress:

Steps for 精致洗 / 标准洗:全身吹毛检查(8mins)
 → 脚底剃毛（5mins) → 磨指甲(5mins) → 剃腹底毛&屁屁周边
 (2mins) → 清理耳朵&掏耳朵(10mins) → 刷牙(2mins) → 第一遍清(8mins) →第二遍清洗(8mins) →上护毛素(7mins) → 吹干毛发(20mins) 

 Steps for 美容:全身吹毛检查(8mins)
 → 脚底剃毛（5mins) → 磨指甲(5mins) → 剃腹底毛&屁屁周边
 (2mins) → 清理耳朵&掏耳朵(10mins) → 刷牙(2mins) → 第一遍清(8mins) →第二遍清洗(8mins) → 吹干毛发(20mins) → 剪毛(60mins) 完成出品

Steps render as: ✓ done / ● active(display related steps when start button is initiated) / ○ pending

"Send WeChat Notification" button per service card

Badge shows "Public Display On"

👩‍💼 Staff Backend Page
Two-column layout: Left = Pending Review list / Right = Current Service Board

Left column — Pending Review:

Shows all bookings with review_status = pending

Each card displays: pet name, time, service, weight + 4 info fields (vaccine, outside groom, emotion, staff note)

Button: "Accept Booking" → sets review_status = accepted, card leaves pending list

Button: "Send WeChat Notification" → triggers Webhook push, becomes disabled "Sent ✓"

After acceptance: button "Push to Service Board" appears → sets display_in_service_list = true

Right column — Current Service Board:

Badge: "Public Display On"

Shows only bookings with display_in_service_list = true

Each card shows: pet name, time, service type

Info grid: review status / WeChat sent / current phase / current step
 Clickable button to advance service progress: start, pause, done


Steps render as: ✓ done / ● active / ○ pending

"Send WeChat Notification" button per service card

Badge shows "Public Display On"

 Owner Status Page
Accessible via unique URL param: ?booking=xxxxx

Displays single booking's real-time status

Top section:

Title: "Owner Exclusive Status Page"

Right badge: Accepted / Pending / In Service

Pet name (large font)

Status description text (e.g. "Booking accepted, awaiting in-store evaluation")

Progress bar (0–100%, auto-calculated from step index)

4 info boxes: current phase, estimated duration, current step, store reminder

Flow step list (4 steps, vertical):

1. Booking Submitted — Completed

2. Store Review — Passed / Pending

3. In-store Evaluation — Pending / In Progress / Done

4. Service Begins — Not Started / In Progress / Done

"Contact Store via WeChat" button

"View In-Service Example" button

Footer disclaimer text