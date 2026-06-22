# MG1 技術方案：ai-office 專案腳手架

## 目標

建立單頁、純前端的 React 應用，承接 `hermes-agent-corp` 的 `/office` 核心功能，並連接既有後端：

- WebSocket：`ws://localhost:4820/ws`
- REST：`http://localhost:4820/api/hermes/state`
- 介面語言：繁體中文（`zh-Hant`）
- GitHub 儲存庫：`chung233/ai-office`

## 範圍

納入：

- Vite、React 18、TypeScript、Tailwind CSS v3 的最小專案設定
- Office 單頁畫面及必要元件
- 初始狀態的 REST 載入
- 後續狀態的 WebSocket 更新
- 載入中、斷線、錯誤與重連狀態
- 基本響應式版面及無障礙語意
- 建置、型別檢查及基本自動化驗證

不納入：

- Routing
- i18n 框架
- Redux、Zustand 等狀態管理套件
- 額外 WebSocket 套件
- 新後端、代理服務、登入或權限功能
- 未出現在原 `/office` 頁面的延伸功能

## 技術方案

### 1. 專案基礎

- 以 Vite 的 React + TypeScript 範本建立應用。
- 使用 React 18；依實際套件相容性鎖定版本，不升級至其他 major version。
- Tailwind CSS 固定使用 v3，僅配置掃描路徑與全域樣式入口。
- `index.html` 設定 `lang="zh-Hant"`、繁體中文標題及 viewport。
- 使用現有套件腳本完成開發、建置、型別檢查與 lint；不另外引入任務執行器。

### 2. 資料流

1. 應用啟動後以 REST 讀取完整初始狀態。
2. 建立原生 `WebSocket` 連線，接收後續事件。
3. 將 REST 回應及 WebSocket 訊息正規化為同一份 Office 頁面狀態。
4. WebSocket 非正常中斷時，以固定短延遲重連；元件卸載時清除連線與計時器。
5. 無有效資料時顯示明確的載入、空資料或錯誤狀態，不以假資料掩蓋問題。

資料型別及事件分支必須先依 `hermes-agent-corp` 的實際 `/office` 實作與後端 payload 確認；規劃階段不猜測欄位。

### 3. 後端位址

- 預設 REST base URL：`http://localhost:4820`
- 預設 WebSocket URL：`ws://localhost:4820/ws`
- 僅以 `VITE_API_BASE_URL`、`VITE_WS_URL` 提供建置時覆寫能力。
- 不加入設定管理層；由單一 API 模組讀取環境變數並套用預設值。
- 若瀏覽器直接跨來源連線，既有後端需允許前端開發來源的 CORS 與 WebSocket Origin。

### 4. UI 拆分原則

- `App` 只負責單頁組合與頁面級狀態。
- 僅把原 `/office` 中重複或具獨立語意的區塊拆成元件。
- 靜態繁體中文直接寫在元件中，不建立翻譯字典。
- 優先重用原專案可獨立移植的版面與資產；移除與原路由、全域 store 或其他頁面耦合的部分。
- 以 Tailwind utility class 完成樣式；只有確實需要的全域規則留在 `index.css`。

### 5. 錯誤處理

- REST 非成功回應、JSON 格式錯誤及網路失敗均轉成可見錯誤訊息。
- WebSocket 顯示「連線中／已連線／重新連線中」狀態。
- 收到不支援或格式錯誤的 WebSocket 訊息時忽略該訊息並保留目前可用畫面，不讓整頁崩潰。
- 不記錄敏感 payload；開發所需訊息使用瀏覽器 console 即可。

### 6. 驗證方式

- `npm run build`：驗證正式建置與 TypeScript。
- `npm run lint`：驗證基本靜態品質。
- 一個最小測試覆蓋資料轉換或 WebSocket 訊息處理的非平凡分支；若抽取後沒有非平凡邏輯，則不新增測試框架，改以人工連線驗收。
- 在瀏覽器以實際後端驗證首次載入、即時更新、斷線及重連。

## 預計檔案結構

```text
ai-office/
├── .ai-tasks/
│   ├── ACCEPTANCE.md
│   ├── MG1_PM_PROMPT.md
│   ├── PLAN.md
│   └── SUBGOALS.md
├── public/                    # 僅放原 office 頁面確實使用的靜態資產
├── src/
│   ├── components/           # office 頁面必要的可重用 UI 區塊
│   ├── lib/
│   │   └── office-api.ts     # REST、WebSocket、資料解析與位址設定
│   ├── types/
│   │   └── office.ts         # 依實際後端契約定義的型別
│   ├── App.tsx               # 唯一頁面與狀態組合
│   ├── index.css             # Tailwind directives 與少量全域樣式
│   └── main.tsx              # React 掛載入口
├── .env.example              # 可選後端位址，不含秘密
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

實際元件檔名待盤點原 `/office` 後決定；不為尚未確認的畫面區塊預建空元件。

## 依賴原則

執行期依賴只保留 `react` 與 `react-dom`。REST 使用 `fetch`，即時連線使用瀏覽器原生 `WebSocket`，樣式使用 Tailwind CSS v3。只有原頁面存在無法以少量程式取代的必要依賴時，才逐項評估移植。

## 已知風險與決策點

- 必須取得 `hermes-agent-corp` 的 `/office` 原始碼及實際 API/WebSocket payload，才能確定畫面、資產與型別。
- GitHub Pages 為 HTTPS 時，瀏覽器會封鎖 `http://`／`ws://` 混合內容；本 MG1 只確保專案可建置並推送至 GitHub，不宣稱 Pages 上可直接連到本機 HTTP 後端。
- 若需公開 HTTPS 部署並連接後端，後續需另行提供可公開存取的 HTTPS/WSS 後端或同源反向代理，這不屬於本腳手架目標。
