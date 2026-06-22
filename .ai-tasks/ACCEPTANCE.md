# MG1 驗收標準

## 專案與建置

- [ ] 專案使用 Vite、React 18、TypeScript 與 Tailwind CSS v3。
- [ ] 安裝依賴後可啟動本機開發伺服器。
- [ ] `npm run build` 成功，且沒有 TypeScript 錯誤。
- [ ] `npm run lint` 成功。
- [ ] 應用只有一個 Office 頁面，沒有 routing 或 i18n 框架。
- [ ] 執行期沒有加入狀態管理或 WebSocket 第三方套件。

## Office 核心功能

- [ ] 畫面內容與 `hermes-agent-corp` 的 `/office` 核心功能一致；非 Office 功能未被移入。
- [ ] 首次載入會呼叫 `GET http://localhost:4820/api/hermes/state`，並依實際回應顯示 Office 狀態。
- [ ] 應用會連接 `ws://localhost:4820/ws`，收到有效事件後畫面會更新，無需重新整理。
- [ ] REST 與 WebSocket 使用明確的 TypeScript 型別；沒有以 `any` 逃避已知資料契約。
- [ ] 空資料、REST 失敗及格式錯誤都有繁體中文可見狀態，頁面不崩潰。
- [ ] WebSocket 會顯示連線狀態，非正常中斷後會自動嘗試重連。
- [ ] 不支援或格式錯誤的 WebSocket 訊息不會破壞既有可用畫面。
- [ ] 元件卸載或開發模式重新掛載時，不殘留重複 WebSocket 連線或重連計時器。

## 設定與介面

- [ ] 未提供環境變數時使用指定的 localhost REST 與 WebSocket 位址。
- [ ] 可透過 `VITE_API_BASE_URL` 及 `VITE_WS_URL` 覆寫位址，且 `.env.example` 有說明。
- [ ] `index.html` 使用 `lang="zh-Hant"`，所有使用者可見文字均為繁體中文。
- [ ] 桌面及窄螢幕下核心內容可讀、可操作，沒有阻斷操作的水平溢出。
- [ ] 互動元素可使用鍵盤操作，並具有可辨識的文字或 accessible name。

## 範圍與交付

- [ ] 沒有空的預留模組、未使用依賴或為未確認需求建立的抽象層。
- [ ] Git 不包含建置產物、依賴目錄、秘密或本機專用設定。
- [ ] 專案可推送至 `chung233/ai-office`；README 或交付說明列出啟動方式與後端前置條件。
- [ ] 使用實際 `localhost:4820` 後端完成一次人工驗收：初始載入、即時更新、斷線、重連。

## 驗收前置條件

- 可讀取 `hermes-agent-corp` 的 `/office` 實作與所用資產。
- `localhost:4820` 後端可執行，並提供約定的 REST 與 WebSocket 端點。
- 後端允許開發前端來源進行 CORS 及 WebSocket 連線。

若前置條件未滿足，只能驗收腳手架與錯誤狀態，不能宣告 Office 資料整合完成。
