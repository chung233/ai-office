# Phase Tab 技術方案

> 在 OfficeDashboard 加入 7 個 Phase Tab，點擊切換顯示各階段的 agent flow。
> 不引入新 dependency，沿用既有型別系統與 Tailwind token。

---

## 1. 範圍

### 納入
- 7 個 Phase Tab（理解 / 分解 / 檢查 / 迭代 / 審查 / 交付 / 反思）
- Tab 列與 PhaseBar 的 active phase 同步發光
- 每個 Tab 的內容區：Phase 描述、參與 Agent 列表、迷你 flow 圖、Agent 卡片
- 桌面水平 Tab，手機下拉選單
- 繁體中文

### 不納入
- 後端 API 變更
- 新 npm dependency
- PhaseBar 行為變更
- 現有 AgentCard / MessageFlow / EventLog 的內部邏輯變更
- Tab 狀態的 URL 同步（無 router）

---

## 2. 檔案變更範圍

| 動作 | 路徑 | 說明 |
|------|------|------|
| **新增** | `src/components/PhaseTabs.tsx` | Tab 列 + Tab 切換邏輯 |
| **新增** | `src/components/PhaseTabPanel.tsx` | 單一 Phase 的內容面板 |
| **新增** | `src/lib/phase-config.ts` | 7 個 Phase 的靜態描述與 agent 對應 |
| **修改** | `src/components/OfficeDashboard.tsx` | 插入 `<PhaseTabs>`、管理 `selectedTabId`、按 tab 調整主內容區 |
| **修改** | `src/index.css` | 新增 tab 相關 keyframes（tab 切換過渡、發光） |

### 不修改的檔案

- `src/App.tsx` — 無需新增 state，tab 選擇是純 UI 狀態
- `src/types/office.ts` — 既有型別已足夠
- `src/lib/office-api.ts` — 無後端變更
- `src/components/Header.tsx` — 不動
- `src/components/PhaseBar.tsx` — 不動（只讀取其 `phases` prop 的 active 狀態）
- `src/components/AgentCard.tsx` — 不動（直接複用）
- `src/components/MessageFlow.tsx` — 不動（僅在 tab panel 內選擇性使用）
- `src/components/EventLog.tsx` — 不動

---

## 3. 組件結構

```
OfficeDashboard  ← 新增 selectedTabId state
├─ Header           (不變)
├─ PhaseBar         (不變)
├─ PhaseTabs        ★ 新增 — Tab 列 + 切換
│  ├─ Tab 按鈕 ×7   (理解/分解/檢查/迭代/審查/交付/反思)
│  └─ PhaseTabPanel ★ 新增 — 目前選中 tab 的內容
│     ├─ Phase 標題 + 描述
│     ├─ Agent 參與列表
│     ├─ MiniFlowDiagram (CSS flex + 箭頭)
│     └─ AgentCard ×n  (僅顯示該 phase 參與的 agent)
├─ MessageFlow      (依 tab 決定顯示與否/過濾)
└─ EventLog         (不變)
```

**資料流方向：**

```
App (agents, phases, events)
  ↓ props
OfficeDashboard
  ├─ selectedTabId: string  ← useState (純 UI 狀態，初始 = active phase id)
  ├─ phases → PhaseBar, PhaseTabs
  ├─ agents → PhaseTabs → PhaseTabPanel → AgentCard
  └─ events  → MessageFlow, EventLog
```

---

## 4. 組件設計細節

### 4.1 `src/lib/phase-config.ts` — Phase 靜態設定

定義每個 Phase 的中文名稱、描述、參與 Agent、互動方向。

```ts
// 型別（不匯出到 office.ts，僅在此模組內使用）
interface PhaseTabConfig {
  id: string;          // 對應 PhaseData.id
  label: string;       // 繁體中文標籤
  description: string; // 簡短描述
  agentIds: string[];  // 參與的 agent id（依互動順序排列）
  flowLabel: string;   // flow 圖的文字說明
}

// 7 個 phase 設定
const PHASE_TAB_CONFIGS: Record<string, PhaseTabConfig> = {
  understand: {
    id: 'understand', label: '理解', description: 'Orchestrator 分析需求、確認範圍與限制條件',
    agentIds: ['hermes'], flowLabel: 'Orchestrator 獨立分析',
  },
  decompose: {
    id: 'decompose', label: '分解', description: 'Orchestrator 將任務拆分為可執行的子目標',
    agentIds: ['hermes'], flowLabel: 'Orchestrator 獨立拆解',
  },
  check: {
    id: 'check', label: '檢查', description: 'Orchestrator 提交計畫給 PM 進行可行性審核',
    agentIds: ['hermes', 'pm'], flowLabel: 'Orchestrator → PM',
  },
  iterate: {
    id: 'iterate', label: '迭代', description: 'PM 與 SrEng 來回協作，實作核心功能',
    agentIds: ['pm', 'sreng'], flowLabel: 'PM ↔ SrEng',
  },
  review: {
    id: 'review', label: '審查', description: 'SrEng 提交成果，Reviewer 進行最終審查',
    agentIds: ['sreng', 'reviewer'], flowLabel: 'SrEng → Reviewer',
  },
  deliver: {
    id: 'deliver', label: '交付', description: 'Orchestrator 整合最終產出並交付',
    agentIds: ['hermes'], flowLabel: 'Orchestrator 主導交付',
  },
  reflect: {
    id: 'reflect', label: '反思', description: 'Orchestrator 進行事後分析與經驗總結',
    agentIds: ['hermes'], flowLabel: 'Orchestrator 事後分析',
  },
};
```

### 4.2 `src/components/PhaseTabs.tsx` — Tab 列

**Props:**

| Prop | 型別 | 說明 |
|------|------|------|
| `phases` | `PhaseData[]` | 判斷哪個 phase 是 active（同步發光） |
| `agents` | `Agent[]` | 傳給 PhaseTabPanel 顯示 agent 卡片 |
| `selectedTabId` | `string` | 目前選中的 tab |
| `onSelectTab` | `(id: string) => void` | 切換 tab 回呼 |

**內部結構：**

```
<div>  ← 容器，border-b border-subtle
  {/* 桌面：水平 tab 列 */}
  <div className="hidden sm:flex">  ← 桌面水平排列
    {phases.map(phase => (
      <TabButton
        key={phase.id}
        phase={phase}
        isSelected={phase.id === selectedTabId}
        isActivePhase={phase.status === 'active'}  ← 發光效果
        onClick={() => onSelectTab(phase.id)}
      />
    ))}
  </div>

  {/* 手機：下拉選單 */}
  <select className="sm:hidden" value={selectedTabId} onChange={...}>
    {phases.map(phase => (
      <option key={phase.id} value={phase.id}>{phase.label}</option>
    ))}
  </select>
</div>
```

**TabButton 子元件（內聯）：**

- 基礎樣式：`px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200`
- 選中：`border-accent text-accent`
- 未選中：`border-transparent text-text-muted hover:text-text-primary hover:border-subtle`
- Active phase（與 PhaseBar 同步）：選中的 tab 加上 `shadow-[0_0_12px_rgba(56,189,248,0.4)]` 發光效果
- Phase 狀態 icon：小圓點，done=st-done，active=accent+pulse，pending=text-dim

### 4.3 `src/components/PhaseTabPanel.tsx` — Tab 內容面板

**Props:**

| Prop | 型別 | 說明 |
|------|------|------|
| `phaseId` | `string` | 當前顯示的 phase id |
| `agents` | `Agent[]` | 全部 agent 資料 |

**內部結構：**

```
<div className="animate-[fade-up_200ms_ease-out]">  ← 切換動畫

  {/* 1. Phase 標題 + 描述 */}
  <PhaseHeader>
    <h2>理解</h2>             ← phase label，text-xl font-semibold
    <p>Orchestrator 分析需求…</p> ← description，text-text-muted
  </PhaseHeader>

  {/* 2. Agent 參與資訊 */}
  <AgentParticipation>
    <h3>參與 Agent</h3>
    <ul>  ← 列出參與的 agent name + role + emoji
      <li>🦉 Hermes — Orchestrator（主導）</li>
      ...
    </ul>
  </AgentParticipation>

  {/* 3. 迷你 Flow 圖 */}
  <MiniFlowDiagram phaseId={phaseId} agents={agents}>
    {/* CSS flexbox 水平排列 agent icon + 箭頭 */}
    [🦉] ──→ [🦊]          ← 單向箭頭
    或
    [🦊] ←─→ [🐱]          ← 雙向箭頭
  </MiniFlowDiagram>

  {/* 4. Agent 卡片 */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {participatingAgents.map(agent => (
      <AgentCard key={agent.id} agent={agent} />  ← 複用既有 AgentCard
    ))}
  </div>

</div>
```

**MiniFlowDiagram 實作策略：**

- 不使用 SVG（避免與既有 MessageFlow SVG 衝突）
- 純 CSS：`flex items-center justify-center gap-4`
- 每個 agent 節點：64px 圓角方塊，顯示 emoji + 簡稱
- 箭頭：CSS `border` 三角形或 Unicode → / ↔
- 單 agent 場景（理解/分解/交付/反思）：顯示單一 agent 圖示 +「主導」標記
- 雙 agent 場景：
  - 單向（檢查/審查）：來源 → 目標
  - 雙向（迭代）：來源 ↔ 目標

### 4.4 `OfficeDashboard.tsx` — 修改點

**新增 state：**

```ts
const [selectedTabId, setSelectedTabId] = useState<string>(
  () => phases.find(p => p.status === 'active')?.id ?? phases[0]?.id ?? 'understand'
);
```

**新增 useEffect：** 當 active phase 改變時自動切換 tab（可選，提升 UX）

```ts
useEffect(() => {
  const active = phases.find(p => p.status === 'active');
  if (active) setSelectedTabId(active.id);
}, [phases]);
```

**佈局變更（插入 PhaseTabs）：**

```
Header
PhaseBar
PhaseTabs  ← ★ 新增（tab 列）
  └─ PhaseTabPanel  ← ★ 新增（tab 內容，取代原主舞台）
       ├─ Phase header + description
       ├─ Agent participation
       ├─ Mini flow diagram
       └─ Agent cards
MessageFlow  ← 保留但依 tab 過濾（僅顯示參與 agent 間的連線）
EventLog
```

**MessageFlow 調整：** 維持既有 SVG 層，但僅繪製當前 tab 參與 agent 之間的 ROUTES。若 tab 僅有單一 agent（理解/分解/交付/反思），MessageFlow 不繪製連線。

**Agent 卡片過濾：** PhaseTabPanel 只傳入 `phase-config` 中定義的 `agentIds` 對應的 agent 給 AgentCard。既有 `agents` prop 保持完整不會被 filter 修改。

---

## 5. 型別系統

**不新增型別**到 `src/types/office.ts`。`PhaseData`、`Agent`、`AgentStatus` 等既有型別完全足夠。

`phase-config.ts` 內的 `PhaseTabConfig` 為模組私有型別（`interface`），不匯出。

---

## 6. Tailwind / CSS 變更

### 6.1 `src/index.css` 新增 keyframes

```css
@keyframes tab-glow {
  0%, 100% { box-shadow: 0 0 8px rgba(56, 189, 248, 0.3); }
  50%      { box-shadow: 0 0 16px rgba(56, 189, 248, 0.6); }
}

@keyframes tab-slide-in {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

### 6.2 使用的 Tailwind utility（全部來自既有 config）

- 顏色：`accent`, `text-primary`, `text-muted`, `text-dim`, `border-subtle`, `bg-surface`, `st-done`, `st-err`
- 動畫：`transition-all duration-200`, `animate-pulse`
- 佈局：`flex`, `grid`, `gap-*`, `px-*`, `py-*`
- 響應式：`hidden sm:flex`, `sm:hidden`

無需修改 `tailwind.config.js`。

---

## 7. 響應式策略

| 斷點 | Tab 列 | Tab 內容 |
|------|--------|---------|
| ≥ 640px (`sm`) | 水平排列，`flex` | 橫向排列 flow 圖 + grid 卡片 |
| < 640px | 下拉 `<select>` | 垂直堆疊，flow 圖改直排 |

**手機下拉：**
- 使用原生 `<select>` 元素，樣式適配深色主題
- `value={selectedTabId}` 雙向綁定
- 保持與 PhaseBar 的 active 同步（option 旁加圓點標記）

---

## 8. 與現有功能的互動

### 8.1 PhaseBar 同步

- PhaseBar 的 `active` phase = 後端推送的進行中階段
- PhaseTabs 讀取同一個 `phases` prop
- Active phase 的 tab 按鈕顯示發光效果（`tab-glow` animation）
- 可選：active phase 改變時自動切換 tab（UX 提升）

### 8.2 WebSocket 更新

- 無影響。Tab 切換是純前端 UI 狀態，不觸發任何 API 呼叫
- Agent 狀態更新（透過 WebSocket）會即時反映在 AgentCard 中（既有行為）

### 8.3 MessageFlow SVG 連線

- Tab 面板內可選性顯示簡化的 flow 圖（CSS 箭頭）
- 既有 MessageFlow SVG 仍保留，但僅繪製當前 tab 參與 agent 之間的 route
- 單 agent tab 不繪製連線

---

## 9. 實作順序（建議）

1. **建立 `phase-config.ts`** — 定義 7 個 phase 的靜態資料
2. **建立 `PhaseTabPanel.tsx`** — Tab 內容面板（phase 描述 + agent 列表 + flow 圖 + agent 卡片）
3. **建立 `PhaseTabs.tsx`** — Tab 列 + 切換邏輯（桌面水平 / 手機下拉）
4. **修改 `OfficeDashboard.tsx`** — 加入 `selectedTabId` state、插入 PhaseTabs、調整佈局
5. **新增 CSS keyframes** — `tab-glow`、`tab-slide-in`
6. **驗證** — 桌面 + 手機響應式、Tab 切換、PhaseBar 同步

---

## 10. 已知風險

- **MessageFlow SVG 定位**：原 MessageFlow 依賴 `stageRef` 和 `cardRefs` 計算 Agent 卡片中心位置。Tab 內容區的 Agent 卡片位置不同，需確保 ref 仍正確註冊。
  - 緩解：PhaseTabPanel 內的 AgentCard 同樣透過 `registerCardRef` 註冊 ref；MessageFlow 僅繪製 `phase-config` 中有定義的 agent 之間的 route。
- **Tab 切換動畫流暢度**：使用 `fade-up` 現有 keyframe 處理內容切換，不引入 Framer Motion。
- **手機下拉與深色主題適配**：原生 `<select>` 在不同 OS 上的樣式不一致。可接受 — 僅作為窄螢幕退化方案。
