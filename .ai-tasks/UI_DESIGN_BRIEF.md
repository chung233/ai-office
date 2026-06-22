# UI Design Brief for ai-office

你是頂級 UI 設計師，運行在 Claude Opus 4.8。請為 **ai-office** 設計一個全新的 Office 視覺化頁面。

## 背景
- 這是 multi-agent AI 系統的即時監控儀表板
- 4 個 agent 角色：Hermes (🦉 Orchestrator)、PM (🦊 Project Manager)、SrEng (🐱 Sr Engineer)、Reviewer (🐰 Final Reviewer)
- 7 個 Phase：UNDERSTAND → DECOMPOSE → CHECK PM → ITERATE → FINAL REVIEW → DELIVER → REFLECT
- 每個 agent 有 5 種狀態：idle / working / waiting / completed / error
- 後端透過 WebSocket 推送即時事件更新

## 設計要求
- 深色主題（dark theme），科技感
- 全新設計，不需要參考現有 Office.tsx 的 SVG 方案
- 現代、簡潔、有質感
- 需要包含：
  1. 標題區：顯示 "AI Office" 及即時狀態
  2. Phase 進度條：7 個 phase 的視覺化進度
  3. Agent 卡片/面板：4 個 agent 的狀態顯示（含動畫效果）
  4. 連接/訊息流視覺化：agent 之間的互動
- 繁體中文界面
- 響應式設計（桌面 + 平板）

## 輸出格式
請產出一份 **UI 設計規格**，包含：
1. 整體佈局描述（layout structure）
2. 配色方案（顏色代碼）
3. 每個區塊的設計描述（含尺寸、間距、動畫效果）
4. CSS/Tailwind 關鍵樣式建議
5. 組件樹結構（component tree）

不要寫完整的 React code，只產出設計規格。用繁體中文輸出。

將結果寫入 `.ai-tasks/UI_DESIGN.md`。
