# Sr Engineer Task — ai-office 完整實作

你是 Sr Engineer (DeepSeek V4 Pro)。請根據以下 PM 規劃和 UI 設計規格，建立完整的 ai-office 專案。

## 專案位置
/Users/chung/Desktop/Work/ai-office/

## 任務：建立完整的 React 應用

請依序完成以下工作（不要跳過任何一步）：

### Step 1: 專案腳手架
- 使用 Vite 建立 React + TypeScript 專案（`npm create vite@latest . -- --template react-ts`，在現有目錄中）
- 安裝 Tailwind CSS v3 及必要依賴
- 設定 `index.html`：`lang="zh-Hant"`、標題 "AI Office"
- 設定 `.gitignore`（包含 node_modules、dist、.env）
- 建立 `.env.example`：`VITE_API_BASE_URL=http://localhost:4820`、`VITE_WS_URL=ws://localhost:4820/ws`
- 確認 `npm run build` 和 TypeScript 檢查通過

### Step 2: 型別定義 + API 層
建立 `src/types/office.ts` — 定義所有資料型別（參考 PLANNING 中的設計）：
```typescript
// Agent 狀態
type AgentStatus = 'idle' | 'working' | 'waiting' | 'completed' | 'error';
// Agent 資料
interface Agent { id, name, role, emoji, color, status, task, progress? }
// Phase 資料
interface PhaseData { id, label, status: 'done' | 'active' | 'pending' }
// Event
interface OfficeEvent { ts, fromAgent, toAgent?, type: 'assign'|'report'|'error', text }
// WebSocket 狀態
type ConnStatus = 'connecting' | 'open' | 'closed';
```

建立 `src/lib/office-api.ts`：
- `fetchInitialState()` — GET http://localhost:4820/api/hermes/state，返回 Agent[] + Phase[]
- `createWebSocket()` — 原生 WebSocket，連到 ws://localhost:4820/ws，含自動重連（3 秒延遲）、清理
- 支援 VITE_API_BASE_URL 和 VITE_WS_URL 環境變數
- 使用上面定義的型別，不用 `any`

### Step 3: UI 實作（依照 UI_DESIGN.md 設計規格）

建立以下組件，所有文字用繁體中文：

**`src/App.tsx`** — 主應用，包含所有狀態管理
- 持有 agents、phases、events、connStatus 狀態
- useEffect 呼叫 fetchInitialState + createWebSocket
- WebSocket 訊息處理：更新對應 agent/phases/events
- 渲染 OfficeDashboard

**`src/components/Header.tsx`** — 標題區
- "AI Office" 標題，左側 logo 方塊（青藍漸層）
- 右側：連線狀態 pill、Phase 進度 n/7、計時器
- 底部 border 分隔線

**`src/components/PhaseBar.tsx`** — Phase 進度條
- 7 個節點水平排列，底軌串接
- 已完成的填綠色 + 勾選、進行中的填青藍 + 發光 + 旋轉光環、未開始的空心灰
- 已完成軌段覆蓋青藍漸層線
- 節點下方顯示繁體標籤（理解 → 分解 → 檢查 → 迭代 → 審查 → 交付 → 反思）
- 切換時 scale 彈跳 + 勾選描邊動畫

**`src/components/AgentCard.tsx`** — Agent 卡片
- 依 UI_DESIGN.md 的卡片結構實作
- 頭像光環（72px 圓，emoji，外圈專屬漸層光環）
- 狀態燈、狀態 pill（5 種繁中標籤：待命/工作中/等待中/已完成/錯誤）
- working 狀態：呼吸發光 + 光環旋轉
- waiting 狀態：琥珀虛線光環緩慢轉動
- completed 狀態：綠色圈定格 + emoji 右下 ✓
- error 狀態：紅光環閃爍 + 卡片抖動
- idle 狀態：無光環，降透明度
- 任務摘要 + 進度條
- 4 個 Agent 資訊：
  - Hermes (🦉 Orchestrator) — 青藍 #38BDF8
  - PM (🦊 Project Manager) — 橘 #FB923C  
  - SrEng (🐱 Sr Engineer) — 紫 #A78BFA
  - Reviewer (🐰 Final Reviewer) — 綠 #34D399

**`src/components/MessageFlow.tsx`** — 訊息流連線（桌面版 SVG）
- 覆蓋在 agent grid 上層，pointer-events-none
- 畫 agent 之間的貝茲連線
- 活躍訊息：發光圓點沿連線流動（紫色脈衝，stroke-dashoffset 動畫）
- 同時最多 1-2 條活躍連線

**`src/components/EventLog.tsx`** — 事件日誌
- 預設收合為單行摘要
- 展開顯示滾動清單：時間 + Agent 色點 + 事件文字
- 新事件上方滑入，自動捲到底
- 斷線時顯示紅底警示

**`src/components/OfficeDashboard.tsx`** — 全頁容器
- 組裝所有子組件
- 傳遞 props（agents, phases, events, connStatus）
- 深色背景 + 響應式佈局

### 設計要求
- 配色嚴格依照 UI_DESIGN.md 的 token 定義
- 所有動畫 CSS keyframes 定義在 `src/index.css` 中
- 支援 `prefers-reduced-motion`：關閉旋轉/抖動，保留淡入和顏色變化
- 響應式：桌面 lg (4欄) → 平板 md (2×2) → 手機 sm (單欄)
- 深色背景 `bg-[#0A0E1A]`，卡片 `bg-[#121829]`
- 全繁體中文，沒有任何英文 UI 文字（除 agent 名稱外）

### Step 4: 驗證
- `npm run build` 必須成功，無 TypeScript 錯誤
- `npm run lint` 必須通過（如有設定）
- 確保 WebSocket 連線/斷線/重連邏輯正確
- 確保組件卸載時清理 WebSocket 和計時器

## 不要做的事
- 不要引入 react-router 或其他路由
- 不要引入 i18n 框架（直接寫繁體中文）
- 不要引入 Redux/Zustand 等狀態管理
- 不要 commit 或 push
- 不要使用任何 demo/fake/mock 資料

## 產出
完成後請回報：改動的檔案清單、build 結果、任何遇到的問題。
