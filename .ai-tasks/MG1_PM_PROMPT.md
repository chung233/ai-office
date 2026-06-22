# MG1: Project Scaffolding Plan

你是 PM (Project Manager)。請為一個名為 **ai-office** 的新專案制定腳手架計劃。

## 背景
- 這是一個純前端 standalone React app
- 從 hermes-agent-corp 提取 /office 頁面功能
- 連到現有 hermes-agent-corp 後端 (localhost:4820) 的 WebSocket 和 REST API
- 部署到 GitHub: chung233/ai-office

## 技術棧
- Vite + React 18 + TypeScript
- Tailwind CSS v3
- 繁體中文 (zh-Hant) 界面
- WebSocket 連接 (ws://localhost:4820/ws)
- REST API (/api/hermes/state)

## 你的任務
請產出這個 Major Goal 的完整計劃：

1. **PLAN.md** — 檔案結構、技術方案
2. **ACCEPTANCE.md** — 驗收標準
3. **子目標清單** — 有序列表，含依賴關係

## 要求
- 最小化依賴，不要過度工程
- 專注於 office 頁面的核心功能
- 不需要 routing（只有一個頁面）
- 不需要 i18n 框架（只支援繁體中文）
- 輸出繁體中文
