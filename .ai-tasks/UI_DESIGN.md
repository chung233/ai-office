# AI Office — UI 設計規格

> Multi-agent AI 系統即時監控儀表板。深色科技風，繁體中文界面，響應式（桌面 + 平板）。
> 技術假設：React + Tailwind CSS + Framer Motion（動畫）。本文件僅定義設計規格，不含實作程式碼。

---

## 1. 整體佈局（Layout Structure）

採三段式垂直佈局，外層固定深色背景，內容置中限寬 `max-w-[1440px]`。

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER   標題區 + 即時狀態徽章                  (高 80px)       │
├──────────────────────────────────────────────────────────────┤
│  PHASE BAR   7 個 Phase 進度條                  (高 96px)       │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  STAGE   主舞台：4 個 Agent 卡片 + 中央訊息流連線               │
│          (flex-1，自適應高度)                                  │
│                                                                │
├──────────────────────────────────────────────────────────────┤
│  FOOTER   事件日誌 / 連線狀態（可收合）          (高 auto)      │
└──────────────────────────────────────────────────────────────┘
```

### 響應式斷點

| 斷點 | 寬度 | Agent 卡片排列 | Phase Bar |
|------|------|---------------|-----------|
| 桌面 `lg` | ≥ 1024px | 4 欄並排 (`grid-cols-4`)，中央連線 SVG 疊加 | 水平 7 節點 |
| 平板 `md` | 768–1023px | 2×2 格狀 (`grid-cols-2`)，連線改為卡片邊緣箭頭 | 水平 7 節點（縮短標籤） |
| 窄平板 `sm` | < 768px | 單欄堆疊，連線退化為「上一個 → 下一個」垂直指示 | 橫向捲動 |

- 主舞台桌面用 `relative` 容器，Agent 卡片為 `absolute`/grid 定位，中央放一層 `absolute inset-0 pointer-events-none` 的 SVG 畫訊息流連線。
- 平板以下不畫自由曲線，改用卡片間的方向箭頭，避免連線錯亂。

---

## 2. 配色方案（Color Tokens）

深色基底 + 青藍科技主色 + 各 Agent 專屬色。建議定義為 CSS 變數 / Tailwind theme extend。

### 基礎色

| Token | HEX | 用途 |
|-------|-----|------|
| `bg-base` | `#0A0E1A` | 最底層背景（近黑藍） |
| `bg-surface` | `#121829` | 卡片 / 面板表面 |
| `bg-surface-2` | `#1A2238` | 卡片內層 / hover |
| `border-subtle` | `#243049` | 細邊框、分隔線 |
| `text-primary` | `#E6EDF7` | 主要文字 |
| `text-muted` | `#8593AD` | 次要文字、標籤 |
| `text-dim` | `#54607A` | 禁用 / 佔位 |

### 主色 / 強調

| Token | HEX | 用途 |
|-------|-----|------|
| `accent` | `#38BDF8` | 主色（青藍），進度、連線、focus |
| `accent-glow` | `#38BDF8` @ 40% | 發光陰影 |
| `accent-2` | `#A78BFA` | 次強調（紫），訊息流脈衝 |

### 狀態色（5 種 Agent 狀態）

| 狀態 | Token | HEX | 視覺語意 |
|------|-------|-----|---------|
| `idle` | `state-idle` | `#54607A` | 灰，無發光 |
| `working` | `state-working` | `#38BDF8` | 青藍，呼吸發光 + 旋轉光環 |
| `waiting` | `state-waiting` | `#FBBF24` | 琥珀黃，緩慢脈衝 |
| `completed` | `state-completed` | `#34D399` | 翠綠，定格 + 勾選 |
| `error` | `state-error` | `#F87171` | 紅，急促閃爍 |

### Agent 專屬主題色

| Agent | Emoji | 主色 | 漸層 |
|-------|-------|------|------|
| Hermes（Orchestrator） | 🦉 | `#38BDF8` 青藍 | `from-sky-400 to-cyan-500` |
| PM（Project Manager） | 🦊 | `#FB923C` 橘 | `from-orange-400 to-amber-500` |
| SrEng（Sr Engineer） | 🐱 | `#A78BFA` 紫 | `from-violet-400 to-purple-500` |
| Reviewer（Final Reviewer） | 🐰 | `#34D399` 綠 | `from-emerald-400 to-teal-500` |

---

## 3. 各區塊設計描述

### 3.1 Header（標題區）— 高 80px

- 佈局：`flex items-center justify-between px-8`。
- 左側：
  - Logo 標記：32px 圓角方塊，內含 `accent` → `accent-2` 對角漸層，疊一個簡約節點圖示。
  - 標題 `AI Office`：`text-2xl font-semibold tracking-tight text-primary`，旁附小字 `text-muted text-xs` 標語「Multi-Agent 即時監控」。
- 右側即時狀態徽章群（`flex gap-3`）：
  - **連線狀態**：`idle/連線中/已斷線` pill，左側 8px 圓點。已連線 = `state-completed` 並有微脈衝；斷線 = `state-error`。
  - **執行中徽章**：顯示目前 Phase 名稱 + 全域進度 `3 / 7`。
  - **耗時計時器**：`text-muted font-mono`，格式 `mm:ss`。
- 底部 1px `border-subtle` 分隔線。

**動畫**：連線圓點 `animate-pulse`（2s）。標題首次載入做 200ms 淡入下滑。

### 3.2 Phase Bar（Phase 進度條）— 高 96px

7 個 Phase 水平等距節點，以一條進度軌串接。

```
UNDERSTAND ─ DECOMPOSE ─ CHECK PM ─ ITERATE ─ FINAL REVIEW ─ DELIVER ─ REFLECT
   ✓            ✓           ◉          ○           ○            ○         ○
```

- 容器：`relative flex items-center justify-between px-8`。
- 底軌：絕對定位 2px 線 `bg-border-subtle`，貫穿全部節點中心。
- 已完成軌段：覆蓋一層 `accent` 漸層線，寬度依進度動畫過渡（`transition-[width] duration-500`）。
- 節點（每個 Phase）：
  - 24px 圓，三種型態：
    - **已完成**：填 `state-completed`，內白色勾選，定格。
    - **進行中**：填 `accent`，外圈 `ring-4 ring-accent/30`，**呼吸發光** + 緩慢旋轉的 conic 光環。
    - **未開始**：`bg-surface-2` 空心 + `border-subtle`。
  - 節點下方標籤：`text-xs`，進行中 `text-primary font-medium`，其餘 `text-muted`。平板縮寫（如 `CHECK PM` → `CHK`）。
- Phase 切換時，新節點做 `scale 0.8 → 1` 彈跳（spring），舊節點勾選打勾描邊動畫（stroke-dashoffset）。

### 3.3 Agent 卡片（4 個）

桌面 `grid-cols-4 gap-6`，卡片尺寸約 `260 × 320px`，平板 `grid-cols-2`。

每張卡片結構（由上而下）：

```
┌─────────────────────────────┐
│  ●狀態燈            ⌁ 計時   │  ← 頂列
│                             │
│        ╭───────╮            │
│        │  🦉   │  ← 頭像光環 │
│        ╰───────╯            │
│                             │
│      Hermes                 │  ← 名稱
│      Orchestrator           │  ← 角色（muted）
│                             │
│   ┌───────────────────┐     │
│   │ 狀態徽章：working  │     │  ← 狀態 pill
│   └───────────────────┘     │
│                             │
│   目前任務：分析需求…        │  ← 任務摘要（2 行截斷）
│   ▓▓▓▓▓░░░░  ← 任務進度條    │
└─────────────────────────────┘
```

- 卡片樣式：`bg-surface rounded-2xl border border-subtle p-5`，狀態為 `working` 時加 Agent 主色發光邊框 `shadow-[0_0_24px_var(--agent-glow)]`。
- 頭像：72px 圓，內 emoji `text-4xl`，外圈漸層光環（Agent 專屬漸層）。
  - `working`：光環旋轉（`animate-spin` 4s）+ 呼吸 scale。
  - `waiting`：琥珀虛線光環緩慢轉動。
  - `completed`：綠色實圈定格，emoji 右下角浮現 ✓ 小徽章。
  - `error`：紅光環急促閃爍（0.4s）+ 卡片輕微左右抖動一次。
  - `idle`：無光環，整卡 `opacity-70` 降飽和。
- 狀態燈（頂列左）：8px 圓點，顏色對應狀態，`working/waiting` 脈衝。
- 狀態 pill：背景 = 狀態色 @ 15%，文字 = 狀態色，繁中標籤（待命 / 工作中 / 等待中 / 已完成 / 錯誤）。
- 任務進度條：2px，`working` 時 `accent` 不確定進度（indeterminate 滑動）；有明確百分比則顯示寬度過渡。

**卡片進場**：四張卡片 stagger 淡入上浮（每張延遲 80ms）。

### 3.4 訊息流 / 連線視覺化

表現 Agent 之間的事件傳遞（例如 Hermes → PM 派工、PM → SrEng、SrEng → Reviewer）。

- 桌面：主舞台 `absolute inset-0` 一層 SVG，pointer-events-none。
  - 連線：來源卡片與目標卡片中心之間的貝茲曲線，`stroke` 用來源 Agent 主色，1.5px，預設 `opacity-20`。
  - **活躍訊息**：沿曲線跑一顆發光圓點（4px + glow），`accent-2` 紫色脈衝，搭配 stroke-dashoffset 流動動畫，模擬封包傳遞；到達後目標卡片狀態燈閃一下。
  - 同時最多顯示 1–2 條活躍連線，過期連線 800ms 淡出。
- 平板：不畫曲線，改在卡片邊緣顯示方向箭頭 + 短暫高亮（來源→目標）。
- 提供「訊息類型」色彩：派工=青藍，回報=綠，重試/錯誤=紅。

### 3.5 Footer（事件日誌）— 可收合

- 預設收合為單行「最新事件」摘要 + 展開鈕（`▲`）。
- 展開：`max-h-48 overflow-y-auto` 滾動清單，每列：時間 `font-mono text-dim` + Agent 色點 + 事件文字。
- 新事件由上方滑入（120ms），列表自動捲到最新。
- 連線中斷時，footer 變紅底警示條：「WebSocket 已斷線，重新連線中…」。

---

## 4. CSS / Tailwind 關鍵樣式建議

### theme extend（`tailwind.config`）

```
colors: {
  base:'#0A0E1A', surface:'#121829', 'surface-2':'#1A2238',
  subtle:'#243049', accent:'#38BDF8', accent2:'#A78BFA',
  // 狀態
  'st-idle':'#54607A','st-work':'#38BDF8','st-wait':'#FBBF24',
  'st-done':'#34D399','st-err':'#F87171',
}
```

### 關鍵 utility 組合

| 元件 | className 重點 |
|------|---------------|
| 外層背景 | `min-h-screen bg-base text-primary antialiased` + 角落 radial 漸層光暈 |
| 玻璃面板 | `bg-surface/80 backdrop-blur-md border border-subtle rounded-2xl` |
| 發光邊框 | `shadow-[0_0_24px_-4px_var(--glow)]`（`--glow` 隨 Agent / 狀態切換） |
| 狀態脈衝 | `animate-pulse` 或自訂 `@keyframes breathe`（scale 1→1.06→1, 2s ease-in-out infinite） |
| 進度軌過渡 | `transition-[width] duration-500 ease-out` |
| indeterminate 條 | 自訂 `@keyframes slide`（translateX -100%→100%, 1.2s linear infinite） |

### 自訂 keyframes（建議）

```
breathe   : scale + box-shadow 強度循環（working 發光）
orbit     : rotate 0→360（頭像光環、進行中 Phase conic 環）
packet    : stroke-dashoffset 流動（連線封包）
shake     : translateX ±4px 三次（error 卡片）
fade-up   : opacity 0→1 + translateY 8px→0（進場）
```

動畫遵循 `prefers-reduced-motion`：偵測到時關閉 orbit/packet/shake，保留淡入與顏色變化。

---

## 5. 組件樹（Component Tree）

```
<App>
└─ <OfficeDashboard>                  // 全頁容器，訂閱 WebSocket，持有 agents/phases/events state
   ├─ <Header>
   │  ├─ <Logo />
   │  ├─ <Title />
   │  └─ <StatusBadges>
   │     ├─ <ConnectionPill />        // 連線狀態
   │     ├─ <CurrentPhaseBadge />     // 目前 phase + n/7
   │     └─ <ElapsedTimer />
   │
   ├─ <PhaseBar phases={…} current={…}>
   │  ├─ <PhaseTrack />               // 底軌 + 已完成漸層
   │  └─ <PhaseNode />  × 7           // 完成 / 進行中 / 未開始 三態
   │
   ├─ <Stage>                         // relative 主舞台
   │  ├─ <MessageFlowLayer>           // absolute SVG，桌面顯示
   │  │  └─ <FlowEdge />  × n         // 貝茲連線 + <FlowPacket /> 封包
   │  └─ <AgentGrid>
   │     └─ <AgentCard agent={…} />  × 4
   │        ├─ <StatusDot />
   │        ├─ <Avatar />             // emoji + 狀態光環
   │        ├─ <AgentMeta />          // 名稱 / 角色
   │        ├─ <StatusPill />         // 5 種狀態
   │        └─ <TaskProgress />       // 任務摘要 + 進度條
   │
   └─ <EventLog events={…} collapsed>
      ├─ <LogToggle />
      └─ <LogRow />  × n
```

### 資料模型（驅動 UI 的最小狀態）

```
phase   : { id, label, status: 'done'|'active'|'pending' }      // 7 個
agent   : { id, name, role, emoji, color,
            status: 'idle'|'working'|'waiting'|'completed'|'error',
            task: string, progress?: number }                    // 4 個
event   : { ts, fromAgent, toAgent?, type:'assign'|'report'|'error', text }
conn    : 'connecting' | 'open' | 'closed'
```

WebSocket 事件 → 更新對應 `agent.status` / `phase.status` / push `event`；`MessageFlowLayer` 監看帶 `toAgent` 的新事件觸發一次封包動畫。

---

## 設計重點摘要

1. **深色科技感**：近黑藍基底 + 青藍主色 + Agent 專屬漸層 + 發光，而非花俏。
2. **狀態一眼可辨**：顏色 + 動畫雙編碼（working 呼吸發光、error 抖動閃爍、completed 定格勾選）。
3. **流動感**：Phase 軌推進 + Agent 間封包傳遞，把「正在運作」這件事視覺化。
4. **響應式退化策略明確**：桌面畫自由連線，平板退化為箭頭，不硬塞曲線。
5. **可及性**：尊重 `prefers-reduced-motion`，狀態不僅靠顏色（附文字標籤 + 圖示）。
