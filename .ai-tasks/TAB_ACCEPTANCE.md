# Phase Tab 驗收標準

> 驗收範圍：Phase Tab 功能（7 個 Phase Tab + 內容面板）。
> 不重複驗收既有功能（AgentCard、PhaseBar、EventLog、WebSocket）。

---

## 1. Tab 列呈現

- [ ] **1.1** 7 個 Tab 水平排列於 Header 下方、PhaseBar 下方、主內容上方
- [ ] **1.2** Tab 文字為繁體中文：理解、分解、檢查、迭代、審查、交付、反思
- [ ] **1.3** 預設選中當前 active phase 對應的 tab（若無 active phase 則選第一個）
- [ ] **1.4** 選中的 tab 以 `accent`（青藍色 `#38BDF8`）高亮，底部有 `border-b-2 border-accent`
- [ ] **1.5** 未選中的 tab 為 `text-text-muted`，hover 時變為 `text-text-primary`
- [ ] **1.6** 每個 tab 左側顯示 phase 狀態小圓點：done=綠、active=青藍脈衝、pending=灰

## 2. Tab 與 PhaseBar 同步

- [ ] **2.1** PhaseBar 的 active phase 對應的 tab 顯示發光效果（`shadow-[0_0_12px_rgba(56,189,248,0.4)]`）
- [ ] **2.2** 當後端 WebSocket 推送 phase 變更時，active phase tab 的發光自動更新
- [ ] **2.3** （可選）當 active phase 改變時，自動切換選中的 tab 到對應 phase
- [ ] **2.4** PhaseBar 本身行為不變（進度條、節點三態、動畫均維持）

## 3. Tab 切換行為

- [ ] **3.1** 點擊任一 tab 切換內容面板，無頁面重整
- [ ] **3.2** 切換有平滑過渡動畫（`fade-up` 200ms，沿用既有 keyframe）
- [ ] **3.3** 快速連續點擊多個 tab 不會造成畫面閃爍或狀態錯亂
- [ ] **3.4** Tab 切換不觸發任何 API 呼叫或 WebSocket 訊息

## 4. Tab 內容面板（PhaseTabPanel）

### 4.1 理解（understand）
- [ ] **4.1a** 標題顯示「理解」，描述為「Orchestrator 分析需求、確認範圍與限制條件」
- [ ] **4.1b** 參與 Agent 列表僅顯示 Hermes（🦉 Orchestrator）
- [ ] **4.1c** 迷你 flow 圖顯示單一 Hermes 圖示 +「主導分析」標記
- [ ] **4.1d** Agent 卡片僅顯示 Hermes 一張

### 4.2 分解（decompose）
- [ ] **4.2a** 標題顯示「分解」，描述為「Orchestrator 將任務拆分為可執行的子目標」
- [ ] **4.2b** 參與 Agent 列表僅顯示 Hermes
- [ ] **4.2c** 迷你 flow 圖顯示單一 Hermes 圖示 +「主導拆解」標記
- [ ] **4.2d** Agent 卡片僅顯示 Hermes 一張

### 4.3 檢查（check）
- [ ] **4.3a** 標題顯示「檢查」，描述為「Orchestrator 提交計畫給 PM 進行可行性審核」
- [ ] **4.3b** 參與 Agent 列表顯示 Hermes + PM（🦊 Project Manager）
- [ ] **4.3c** 迷你 flow 圖顯示 Hermes → PM 單向箭頭
- [ ] **4.3d** Agent 卡片顯示 Hermes、PM 兩張

### 4.4 迭代（iterate）
- [ ] **4.4a** 標題顯示「迭代」，描述為「PM 與 SrEng 來回協作，實作核心功能」
- [ ] **4.4b** 參與 Agent 列表顯示 PM + SrEng（🐱 Sr Engineer）
- [ ] **4.4c** 迷你 flow 圖顯示 PM ↔ SrEng 雙向箭頭
- [ ] **4.4d** Agent 卡片顯示 PM、SrEng 兩張

### 4.5 審查（review）
- [ ] **4.5a** 標題顯示「審查」，描述為「SrEng 提交成果，Reviewer 進行最終審查」
- [ ] **4.5b** 參與 Agent 列表顯示 SrEng + Reviewer（🐰 Final Reviewer）
- [ ] **4.5c** 迷你 flow 圖顯示 SrEng → Reviewer 單向箭頭
- [ ] **4.5d** Agent 卡片顯示 SrEng、Reviewer 兩張

### 4.6 交付（deliver）
- [ ] **4.6a** 標題顯示「交付」，描述為「Orchestrator 整合最終產出並交付」
- [ ] **4.6b** 參與 Agent 列表僅顯示 Hermes
- [ ] **4.6c** 迷你 flow 圖顯示單一 Hermes 圖示 +「主導交付」標記
- [ ] **4.6d** Agent 卡片僅顯示 Hermes 一張

### 4.7 反思（reflect）
- [ ] **4.7a** 標題顯示「反思」，描述為「Orchestrator 進行事後分析與經驗總結」
- [ ] **4.7b** 參與 Agent 列表僅顯示 Hermes
- [ ] **4.7c** 迷你 flow 圖顯示單一 Hermes 圖示 +「事後分析」標記
- [ ] **4.7d** Agent 卡片僅顯示 Hermes 一張

## 5. Agent 卡片行為

- [ ] **5.1** Tab 內容區的 AgentCard 複用既有 `src/components/AgentCard.tsx`，不重複實作
- [ ] **5.2** AgentCard 的既有狀態顯示正常：idle/working/waiting/completed/error 五態
- [ ] **5.3** AgentCard 的既有動畫正常：呼吸光環（working）、旋轉光環（waiting）、勾選（completed）
- [ ] **5.4** WebSocket 推送的 agent 狀態更新即時反映在 tab 內容區的 AgentCard 上

## 6. 響應式

- [ ] **6.1** 桌面（≥ 640px）：Tab 水平排列，全部 7 個可見
- [ ] **6.2** 手機（< 640px）：Tab 改為 `<select>` 下拉選單
- [ ] **6.3** 下拉選單選項包含 phase 中文名稱，選中項對應 `selectedTabId`
- [ ] **6.4** 手機視圖下 Agent 卡片由水平 grid 改為垂直堆疊
- [ ] **6.5** 迷你 flow 圖在窄螢幕下不出現水平溢出

## 7. 既有功能不受影響

- [ ] **7.1** Header（標題列、連線狀態、計時器）正常運作
- [ ] **7.2** PhaseBar（7 節點進度條、勾選動畫、active 發光）正常運作
- [ ] **7.3** EventLog（事件日誌、收合/展開）正常運作
- [ ] **7.4** MessageFlow SVG（Agent 間貝茲連線 + 封包動畫）不報錯
- [ ] **7.5** WebSocket 連線、重連、斷線警示正常
- [ ] **7.6** REST 初始載入正常

## 8. 程式碼品質

- [ ] **8.1** `tsc -b` 無 TypeScript 錯誤
- [ ] **8.2** `npm run build` 成功
- [ ] **8.3** `npm run lint` 通過
- [ ] **8.4** 未引入新 npm dependency（`package.json` 無變更）
- [ ] **8.5** 所有使用者可見文字為繁體中文
- [ ] **8.6** 新元件有明確 TypeScript 型別（Props interface），不使用 `any`
- [ ] **8.7** 使用既有 Tailwind token（`accent`, `text-primary`, `text-muted` 等），不硬編碼顏色

## 9. 邊界案例

- [ ] **9.1** `agents` 為空陣列時不報錯，內容區顯示「尚無 Agent 資料」
- [ ] **9.2** `phases` 為空陣列時 tab 列不崩潰（不渲染任何 tab）
- [ ] **9.3** 選中的 tab 被後端移除時（phases 陣列變化），自動跳到第一個可用 tab
- [ ] **9.4** 元件卸載（React StrictMode double-mount）不殘留 event listener 或 timer

---

## 驗收前置條件

- 專案已可正常啟動（`npm run dev`）
- 後端 `localhost:4820` 可選 — 無後端時使用預設 agents/phases 仍可驗收靜態 UI
- 瀏覽器：Chrome / Firefox / Safari 最新版
