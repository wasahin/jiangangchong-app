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
- **Theme**: Warm beige background (#f5f0eb) with golden accents (#e8a020)
- **Mobile-first responsive design**
- **Logo**: Use actual logo image from `/public/logo.jpg`
- **Chinese language interface** (primary), English for technical terms

## UI Design System - Liquid Glass (iOS Style)
Use these specs for all UI components to achieve iOS-style liquid glass effect:

### LiquidGlassCard Component
```tsx
// Props: intensity = 'light' | 'medium' | 'heavy'
// Default: medium intensity

// Medium intensity (default):
- backdrop-blur: 24px
- saturate: 180%
- background: linear-gradient from-white/70 via-white/50 to-white/40
- border: white/50
- shadow: 0_12px_40px_rgba(0,0,0,0.08)
- rounded: 24px
- Inner top gradient: rgba(255,255,255,0.4) to transparent
- Padding: p-5
```

### Button Component
```tsx
// Primary (Orange/Gold):
- bg: linear-gradient from-[rgba(255,165,24,0.95)] to-[rgba(255,122,0,0.92)]
- text: white
- shadow with inner highlight
- hover: lift up 1px, increase shadow

// Secondary (Liquid Glass):
- bg: linear-gradient from-white/70 via-white/50 to-white/40
- backdrop-blur: 16px, saturate: 180%
- border: white/50
- text: gray-700
- inner top highlight

// Blue:
- bg: linear-gradient from-[rgba(90,200,250,0.98)] to-[rgba(50,180,240,0.95)]

// Green:
- bg: linear-gradient from-[rgba(76,217,100,0.95)] to-[rgba(52,199,89,0.92)]
```

### Color Palette
- **Primary/Gold**: #FF9500, #FFA500, #E8A020
- **Blue**: #5AC8FA, #007AFF
- **Green**: #4CD964, #34C759
- **Red**: #FF3B30
- **Background**: #F2F2F7, #F5F0EB
- **Text**: #1a1a1a (black outline for logo)

### Animation & Interaction
- Transition timing: cubic-bezier(0.34, 1.56, 0.64, 1)
- Hover lift: -translate-y-[1px]
- Active scale: scale-[0.985]
- Border radius: 16px-24px for cards, 16px for buttons

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