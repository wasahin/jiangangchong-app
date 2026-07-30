# 🚀 MiniMax Setup Guide for 金刚宠 Project

This guide shows how to replicate the MCP + Agent setup from TRAE to MiniMax's ecosystem for the 金刚宠 pet shop project.

---

## 📋 Prerequisites

1. **MiniMax API Key** — Get from [MiniMax Platform](https://platform.minimaxi.com/user-center/basic-information/interface-key)
   - **Global**: https://api.minimax.io (use for international accounts)
   - **Mainland China**: https://api.minimaxi.com (use for 国内版)
2. **Node.js** v18+ (for 宠老板 MCP server)
3. **Python 3.11+** (for MiniMax MCP via uvx)
4. **uv** (Python package manager) — install via:
   ```powershell
   powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
   ```

---

## 🏗️ Part 1: Setup 宠老板 MCP Server (Custom MCP)

The `mcp-chonglaoban/server.js` you already built works as a standard MCP stdio server. It can be connected to any MCP-compatible client.

### Step 1: Install Dependencies

```powershell
cd c:\Users\coolj\.trae-cn\trae projects\mcp-chonglaoban
npm install @modelcontextprotocol/sdk puppeteer-core
```

### Step 2: Verify the Server Works

```powershell
cd c:\Users\coolj\.trae-cn\trae projects\mcp-chonglaoban
node server.js
```
(Press Ctrl+C to stop — it runs in stdio mode)

### Step 3: Configure in Your MCP Client

For any MCP-compatible client (MiniMax Agent platform, Claude Desktop, Cursor, etc.), add:

```json
{
  "mcpServers": {
    "chonglaoban": {
      "command": "node",
      "args": [
        "c:/Users/coolj/.trae-cn/trae projects/mcp-chonglaoban/server.js"
      ],
      "env": {
        "CLB_CREDENTIALS_FILE": "D:/金刚宠/AI material/宠老板credentials.txt",
        "CLB_HEADLESS": "true"
      }
    }
  }
}
```

### 宠老板 MCP Tools Available (v2.1.0)

| Tool | Priority | Description |
|---|---|---|
| `get_monthly_services` | ⭐⭐⭐⭐⭐ | **CRITICAL**: MTD service count vs 104 break-even target + gap |
| `get_order_stats` | ⭐⭐⭐⭐ | Today's orders, revenue, customers, service breakdown |
| `login` | ⭐⭐⭐⭐⭐ | Login using credentials file (nativeSetter pattern for Vue.js) |
| `get_dashboard` | ⭐⭐⭐⭐ | Today's revenue, orders, 临期商品, 库存不足 |
| `get_revenue_report` | ⭐⭐⭐ | Revenue/statistics page data |
| `navigate_to` | ⭐⭐⭐ | Navigate to route (member, stock, yanghuo, cashier) |
| `get_page_text` | ⭐⭐⭐ | Read current page text (5000 chars max) |
| `extract_elements` | ⭐⭐⭐ | Extract elements by CSS selector |
| `run_javascript` | ⭐⭐⭐ | Execute JS for targeted data extraction |
| `take_screenshot` | ⭐⭐ | Full-page screenshot |
| `restart_browser` | ⭐⭐ | Reset browser after edits |
| `logout` | ⭐ | Close browser session |
| `get_status` | ⭐⭐ | Check login state, server v2.1.0, browser mode |

---

## 🏗️ Part 2: Setup MiniMax Native MCP (Multimodal)

MiniMax provides official MCP servers for TTS, image generation, video generation, and voice cloning — useful for creating marketing content (fan audio ads, pet photos, video clips).

### Option A: Python Version (Recommended)

```powershell
# Install uv (if not already)
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

# Test uvx is available
uvx --version
```

**Configure in MCP client:**

```json
{
  "mcpServers": {
    "minimax-multimodal": {
      "command": "uvx",
      "args": ["minimax-mcp", "-y"],
      "env": {
        "MINIMAX_API_KEY": "YOUR_MINIMAX_API_KEY",
        "MINIMAX_MCP_BASE_PATH": "D:/金刚宠/MCP-output",
        "MINIMAX_API_HOST": "https://api.minimaxi.com",
        "MINIMAX_API_RESOURCE_MODE": "url"
      }
    }
  }
}
```

### Option B: JavaScript Version

```powershell
# Ensure Node.js is installed
node --version
npm install -g minimax-mcp-js
```

**Configure in MCP client:**

```json
{
  "mcpServers": {
    "minimax-multimodal": {
      "command": "npx",
      "args": ["-y", "minimax-mcp-js"],
      "env": {
        "MINIMAX_API_KEY": "YOUR_MINIMAX_API_KEY",
        "MINIMAX_MCP_BASE_PATH": "D:/金刚宠/MCP-output",
        "MINIMAX_API_HOST": "https://api.minimaxi.com",
        "MINIMAX_RESOURCE_MODE": "url"
      }
    }
  }
}
```

### MiniMax Multimodal MCP Tools

| Tool | Description | Use Case for 金刚宠 |
|---|---|---|
| `text_to_audio` | Text to speech | Create fan voiceover ads, phone prompts |
| `voice_clone` | Clone a voice | Clone shop owner's voice for personalized messages |
| `voice_design` | Generate custom voice | Create brand character voice |
| `text_to_image` | Generate images | Create marketing posters, pet-themed art |
| `generate_video` | Generate video from prompt | Create event promo videos, service showcase clips |
| `music_generation` | Generate music | Background music for videos/ads |

---

## 🏗️ Part 3: Setup MiniMax Coding Plan MCP (Web Search + Image)

For research tasks (competitor analysis, market research), use MiniMax's Coding Plan MCP.

**Configure in MCP client:**

```json
{
  "mcpServers": {
    "minimax-search": {
      "command": "uvx",
      "args": ["minimax-coding-plan-mcp", "-y"],
      "env": {
        "MINIMAX_API_KEY": "YOUR_CODING_PLAN_API_KEY",
        "MINIMAX_API_HOST": "https://api.minimax.io"
      }
    }
  }
}
```

### Coding Plan MCP Tools

| Tool | Description |
|---|---|
| `web_search` | Web search with results and suggestions |
| `understand_image` | Analyze image content from URL or file |

---

## 🤖 Part 4: Create Agents on MiniMax

### MiniMax Agent Platform

MiniMax provides a native Agent platform with two modes:
- **Lightning Mode** — Fast, efficient for Q&A, light search, simple coding
- **Pro Mode** — Professional, handles complex long-form tasks (deep research, full-stack dev, PPT/reports)

### Agent Definitions for 金刚宠

#### 1. Content Agent (内容代理)
```yaml
name: "content-agent"
description: "Creates pet care content, grooming tips, social media posts for 金刚宠"
system_prompt: |
  You are a content creation specialist for 金刚宠 (Jingangchong) pet grooming shop in Zhongshan, Guangdong.
  
  Your tasks:
  - Write Xiaohongshu posts about pet grooming (trending topics, seasonal tips)
  - Create Douyin short video scripts for grooming demonstrations
  - Generate WeChat moments content for promotions
  - Write pet care guides and educational articles
  
  Key info:
  - Shop location: Zhongshan, Guangdong
  - Services: 精致洗(¥80), 标准洗(¥80), 美容(¥150), 寄养(¥100/day)
  - Brand voice: warm, professional, passionate about pet care
  - Target audience: pet owners in Zhongshan and surrounding areas
  
  When creating content:
  - Use relevant hashtags for pet grooming
  - Include local context (weather, seasonal needs)
  - Keep tone friendly and knowledgeable
  - Emphasize shop's unique real-time status tracking feature
tools: [text_to_audio, text_to_image, music_generation, web_search]
```

#### 2. Social Media Agent (社交媒体代理)
```yaml
name: "social-media-agent"
description: "Manages Xiaohongshu, Douyin, Dianping presence for 金刚宠"
system_prompt: |
  You are a social media strategy specialist for 金刚宠 pet grooming shop.
  
  Your tasks:
  - Plan posting schedules for Xiaohongshu, Douyin, Dianping
  - Analyze competitor pet shop social media presence
  - Optimize content for platform-specific algorithms
  - Manage review strategy (Dianping rating optimization)
  
  Channel priorities:
  1. WeChat Private Domain — highest conversion (45%+ repeat purchase)
  2. Xiaohongshu — organic content, social proof, pet owners' preferred platform
  3. Dianping — review management, local SEO (rating +0.1 = +8% exposure)
  4. Douyin — event awareness, lower precision for local pet grooming
  
  Important: Dianping prohibits direct review-for-benefit exchanges. Focus on genuine service quality.
tools: [web_search, text_to_image, generate_video]
```

#### 3. Customer Retention Agent (客户留存代理)
```yaml
name: "retention-agent"
description: "Manages customer follow-up, loyalty programs, and re-engagement for 金刚宠"
system_prompt: |
  You are a customer retention specialist for 金刚宠 pet grooming shop.
  
  Your tasks:
  - Design WeChat follow-up sequences for new customers
  - Create loyalty program structures
  - Plan re-engagement campaigns for inactive customers
  - Analyze customer lifetime value and referral strategies
  
  Key metrics:
  - Monthly services needed: 104 (break-even)
  - Current monthly: ~70 (gap of 34)
  - New weekly regulars needed: 9-12
  - Referral retention rate: 3x higher than new acquisition
  
  Strategy: RFM segmentation, personalized WeChat sequences, referral incentives
tools: [get_monthly_services, get_order_stats, get_dashboard, get_revenue_report, navigate_to, extract_elements, run_javascript, web_search]
```

#### 4. Analytics Agent (分析代理)
```yaml
name: "analytics-agent"
description: "Tracks event ROI, conversion funnels, and break-even progress for 金刚宠"
system_prompt: |
  You are a business analytics specialist for 金刚宠 pet grooming shop.
  
  Your tasks:
  - Pull daily/weekly metrics from 宠老板 system
  - Analyze conversion funnel performance
  - Track progress toward break-even (104 services/month)
  - Calculate campaign ROI
  - Provide data-driven recommendations
  
  Key data points to track:
  - Monthly fixed costs: ¥14,226
  - Service margins: 精致洗 85%, 标准洗 85%, 美容 80%, 寄养 90%
  - Event investment: ¥5,500, target ROI: +164%
  - Channel conversion rates: WeChat ⭐⭐⭐⭐⭐, Xiaohongshu ⭐⭐⭐⭐, Dianping ⭐⭐⭐, Douyin ⭐⭐
  
  CRITICAL FIRST STEP: Always call get_monthly_services first to see MTD count vs 104 BE target.
  Then call get_order_stats for today's numbers. Always cite specific figures in your output.
  
  Output format:
  1. What's Working (top performers)
  2. What's Not (underperforming areas)
  3. Quick Wins (1-2 immediate actions)
  4. Strategic Moves (1-2 medium-term adjustments)
  5. Red Flags (concerning trends)
  6. Numbers (specific figures and calculations)
tools: [get_monthly_services, get_order_stats, get_dashboard, get_revenue_report, navigate_to, extract_elements, run_javascript, web_search]
```

---

## 🔗 Part 4.5: Shared MCP Config for ALL 4 Agents

All 4 agents use the **EXACT SAME** chonglaoban MCP config. Copy this into each agent's mcp.json:

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
    },
    "minimax-multimodal": {
      "command": "uvx",
      "args": ["minimax-mcp", "-y"],
      "env": {
        "MINIMAX_API_KEY": "YOUR_MINIMAX_API_KEY",
        "MINIMAX_MCP_BASE_PATH": "D:/金刚宠/MCP-output",
        "MINIMAX_API_HOST": "https://api.minimaxi.com"
      }
    },
    "minimax-search": {
      "command": "uvx",
      "args": ["minimax-coding-plan-mcp", "-y"],
      "env": {
        "MINIMAX_API_KEY": "YOUR_CODING_PLAN_API_KEY",
        "MINIMAX_API_HOST": "https://api.minimax.io"
      }
    }
  }
}
```

**Note for Trae users**: Remove the `CLB_BROWSER_URL` line. Trae does NOT kill child process trees, so puppeteer.launch() works fine.

**Note for Mavis users**: Keep `CLB_BROWSER_URL` and run `start_chonglaoban.ps1` BEFORE starting Mavis. See section below.

---

## 🔗 Part 5: Integration with MiniMax API

### Using MiniMax as LLM Backend for Agents

If you want to use MiniMax M2.5 as the model powering your agents (instead of the default model in your MCP client):

```python
# API endpoint configuration
API_BASE = "https://api.minimax.chat"  # Mainland
# or
API_BASE = "https://api.minimax.io"   # Global

# Model selection
MODEL = "MiniMax-M2.5"  # Latest agent-optimized model
# or
MODEL = "MiniMax-M2"    # Cost-effective alternative
```

### Quick Test with cURL

```bash
# Test MiniMax API
curl https://api.minimax.chat/v1/text/chat \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "MiniMax-M2.5",
    "messages": [{"role": "user", "content": "你好，请介绍下金刚宠宠物美容店"}]
  }'
```

---

## 📦 Complete MCP Config (All-in-One)

Combine all servers into a single configuration:

```json
{
  "mcpServers": {
    "chonglaoban": {
      "command": "node",
      "args": ["c:/Users/coolj/.trae-cn/trae projects/mcp-chonglaoban/server.js"],
      "env": {
        "CLB_CREDENTIALS_FILE": "D:/金刚宠/AI material/宠老板credentials.txt",
        "CLB_HEADLESS": "true"
      }
    },
    "minimax-multimodal": {
      "command": "uvx",
      "args": ["minimax-mcp", "-y"],
      "env": {
        "MINIMAX_API_KEY": "YOUR_MINIMAX_API_KEY",
        "MINIMAX_MCP_BASE_PATH": "D:/金刚宠/MCP-output",
        "MINIMAX_API_HOST": "https://api.minimaxi.com"
      }
    },
    "minimax-search": {
      "command": "uvx",
      "args": ["minimax-coding-plan-mcp", "-y"],
      "env": {
        "MINIMAX_API_KEY": "YOUR_CODING_PLAN_API_KEY",
        "MINIMAX_API_HOST": "https://api.minimax.io"
      }
    }
  }
}
```

---

## ⚠️ Important Notes

### API Key & Host Region Matching (CRITICAL)
| Region | API Key From | API Host |
|---|---|---|
| Mainland China | platform.minimaxi.com | https://api.minimaxi.com |
| Global | www.minimax.io | https://api.minimax.io |

**Mismatched key + host = "Invalid API key" error**

### Windows Setup Tips
1. Enable "Developer Mode" in your MCP client if needed
2. Use absolute paths (e.g., `C:/Users/...` not `~`)
3. If `uvx` not found, use full path: `(Get-Command uvx).source`
4. 宠老板 MCP requires Chromium-based browser (Edge/Chrome)

### 宠老板 Known Issues
- Login may get stuck on `/survey` page — use `run_javascript` to close modal
- System is Vue.js SPA — pages need 2-3 seconds to render
- Data is 100% cloud-stored (Shanghai servers), no local storage
- Use headless mode for production (faster, no browser window)

### 🔧 Mavis (MiniMax Code) — "Failed to launch browser: Code 0" Fix

**Symptom:** `chonglaoban MCP` works in Trae but fails in Mavis with `Failed to launch the browser process: Code: 0` (empty stderr, browser exits in ~30ms).

**Root Cause:** Mavis spawns the MCP server as a long-lived child process at session start and its process-tree management kills the Edge grandchild before DevTools can connect. Mavis also doesn't re-spawn the server on `server.js` edits.

**Solution: External Browser Mode (RECOMMENDED for Mavis)**

Launch Edge separately, then have the MCP server connect to it instead of launching its own.

#### Step 1: Launch Edge with PowerShell One-Liner (v2.1.0 NEW)

```powershell
# Run in PowerShell — kills existing Edge, starts new one, verifies debug port
& "c:\Users\coolj\.trae-cn\trae projects\mcp-chonglaoban\start_chonglaoban.ps1"
```

**Optional flags:**
```powershell
# Custom port
& "c:\...\start_chonglaoban.ps1" -Port 9223

# Visible browser window (for debugging)
& "c:\...\start_chonglaoban.ps1" -Visible

# Custom profile dir
& "c:\...\start_chonglaoban.ps1" -UserDataDir "D:\clb_profile"
```

**Expected output:**
```
==============================================
  READY — 宠老板 MCP Browser Online
==============================================
  Browser:   Edge/128.0.0.0
  Endpoint:  http://127.0.0.1:9222
  PID:       12345
  Profile:   C:\Users\...\Temp\clb_edge_profile

  Set this in your MCP config:
  "CLB_BROWSER_URL": "http://127.0.0.1:9222"
==============================================
```

**Alternative — Batch script (double-click):**
```
Run: c:\Users\coolj\.trae-cn\trae projects\mcp-chonglaoban\launch_browser.bat
```

**Alternative — Node.js script (more control):**
```powershell
node "c:\Users\coolj\.trae-cn\trae projects\mcp-chonglaoban\launch_browser.js"
node "c:\...\launch_browser.js" --visible
node "c:\...\launch_browser.js" --port=9223
```

Verify the browser is running: open `http://127.0.0.1:9222/json/version` in any browser — should return JSON with browser info.

#### Step 2: Configure Mavis MCP with `CLB_BROWSER_URL`

```json
{
  "mcpServers": {
    "chonglaoban": {
      "command": "node",
      "args": ["c:\\Users\\coolj\\.trae-cn\\trae projects\\mcp-chonglaoban\\server.js"],
      "env": {
        "CLB_CREDENTIALS_FILE": "D:\\金刚宠\\AI material\\宠老板credentials.txt",
        "CLB_LOGIN_URL": "https://v70.chonglaoban.cn/#/login",
        "CLB_HEADLESS": "true",
        "CLB_BROWSER_URL": "http://127.0.0.1:9222",
        "CLB_DEBUG": "true"
      }
    }
  }
}
```

#### Step 3: Restart Mavis Session

Mavis caches the MCP server process — restart the Mavis session (or close/reopen the chat) to force it to re-spawn the server with the new config and updated `server.js`.

#### Step 4: Verify Setup

Call `get_status` tool. Expected output includes:
```json
{
  "serverVersion": "2.1.0",
  "browserMode": "connect:http://127.0.0.1:9222",
  "helpers": ["setInputValue (nativeSetter)", "setSelectValue", "clickElement"],
  "newTools_v210": ["get_monthly_services", "get_order_stats"]
}
```

### 🔧 NativeSetter Pattern — What It Solves

**v2.0.0 login bug in puppeteer.connect() mode**: `page.click() + page.keyboard.type()` did NOT trigger Vue.js v-model updates. The page sees the text visually but the form submission sends empty values because Vue.js only updates v-model when it sees native `input` events.

**Fix in v2.1.0**: Use `Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set` to directly call the browser's native input setter (bypassing any framework interceptors), then dispatch synthetic `input` + `change` events. This works in BOTH `puppeteer.launch()` and `puppeteer.connect()` modes.

**Helpers in server.js (reusable for any future form interactions)**:
```js
// Set any <input> or <textarea> value
await setInputValue(page, 'input[placeholder="搜索"]', '关键词');

// Set <select> dropdown
await setSelectValue(page, 'select.service-type', 'grooming');

// Click any element via JS (bypasses focus issues)
await clickElement(page, 'button.submit');
```

#### Troubleshooting Checklist

| Issue | Fix |
|---|---|
| `Cannot connect to browser at http://127.0.0.1:9222` | Run `start_chonglaoban.ps1` first; verify `http://127.0.0.1:9222/json/version` responds |
| Browser was killed after system restart | Re-run `start_chonglaoban.ps1` before starting Mavis |
| Port 9222 already in use | Use `-Port 9223` flag and update `CLB_BROWSER_URL` |
| `SingletonLock` error | Script auto-clears it; if persists delete `%TEMP%\clb_edge_profile\SingletonLock` |
| Stale server.js running in Mavis | Restart Mavis session (Mavis doesn't watch for file edits) |
| Need to debug browser stderr | Set `CLB_DEBUG=true` — routes browser stderr to MCP log |
| Login is slow (>15s) | v2.1.0 optimized to 8-10s. Check network latency to v70.chonglaoban.cn |
| get_monthly_services returns null | Call `take_screenshot` to see actual page layout; find correct CSS selector via `extract_elements` |
| Want to check server version | Call `get_status` tool — returns `serverVersion: '2.1.0'` |
| Browser in bad state | Call `restart_browser` tool — closes & re-connects without restarting MCP server |

### Trae vs Mavis MCP Host Behaviour

| Aspect | Trae | Mavis |
|---|---|---|
| Server spawn timing | On session start; re-spawns if process dies | On session start; long-lived |
| File edit detection | Re-spawns on `server.js` change | **No** — must restart session |
| cwd | Project directory | `C:\Users\coolj` (user home) |
| Process tree | Lets child processes live | Kills child process tree (breaks Edge launch) |
| Signal handling | Clean SIGTERM on shutdown | Sends signals that kill browser grandchild |

**Key takeaway:** Trae and Mavis can share the same `server.js`, but Mavis needs the **external browser mode** (`CLB_BROWSER_URL`) because its process-tree management kills Edge before DevTools can connect.

### File Locations Reference
| Resource | Path |
|---|---|
| 宠老板 MCP Server | `c:/Users/coolj/.trae-cn/trae projects/mcp-chonglaoban/server.js` |
| Credentials | `D:/金刚宠/AI material/宠老板credentials.txt` |
| SKILL.md | `jingangchong-app/.trae/skills/jingangchong/SKILL.md` |
| Project Rules | `.trae/rules/` |
| MCP Output | `D:/金刚宠/MCP-output` (create this folder) |

---

## 🧪 Testing Checklist

- [ ] 宠老板 MCP: `node server.js` starts without errors
- [ ] 宠老板 MCP: `get_status` returns `isLoggedIn: true` after `login`
- [ ] MiniMax MCP: `uvx minimax-mcp` starts without errors
- [ ] MiniMax MCP: `text_to_image` generates an image successfully
- [ ] MiniMax Search: `web_search` returns relevant results
- [ ] All MCP servers appear in client's tool list
- [ ] Analytics Agent can pull 宠老板 dashboard data
- [ ] Content Agent can generate Xiaohongshu post text
- [ ] API key + host regions match correctly

---

## 📚 Reference Links
- MiniMax MCP Docs: https://platform.minimax.io/docs/guides/mcp-guide
- MiniMax MCP Python: https://github.com/MiniMax-AI/MiniMax-MCP
- MiniMax MCP JS: https://github.com/MiniMax-AI/MiniMax-MCP-JS
- 宠老板 Admin: https://v70.chonglaoban.cn
- MCP Specification: https://modelcontextprotocol.io