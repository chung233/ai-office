# AI Office

**AI 代理人辦公室** — 即時視覺化看板，透過 WebSocket 連線監控 Hermes Agent Corp 多代理人協作流程。

## 快速啟動

```bash
npm install
npm run dev
```

開發伺服器預設執行於 `http://localhost:5173`。

## 後端前置條件

專案依賴 **hermes-agent-corp** 後端服務，需於 `localhost:4820` 運行，並允許 CORS（跨來源資源共享）。後端負責推送代理人狀態、階段進度與事件記錄。

## 環境變數

複製 `.env.example` 為 `.env` 後依需求調整：

| 變數 | 說明 | 預設值 |
|---|---|---|
| `VITE_API_BASE_URL` | REST API 基礎 URL（初始狀態載入） | `http://localhost:4820` |
| `VITE_WS_URL` | WebSocket 連線 URL（即時更新） | `ws://localhost:4820/ws` |

## 指令

| 指令 | 說明 |
|---|---|
| `npm run dev` | 啟動 Vite 開發伺服器 |
| `npm run build` | TypeScript 編譯 + Vite 生產建置 |
| `npm run preview` | 預覽生產建置結果 |
| `npm run lint` | ESLint 靜態分析 |
