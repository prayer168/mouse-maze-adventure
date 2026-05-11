# 🐭 老鼠迷宮大冒險

**Mouse Maze Adventure** — 一款為國小學生設計的互動式迷宮益智遊戲，內建 AI 演算法視覺化、老師模式與隨機迷宮生成器。

🔗 **線上遊玩**：`https://prayer168.github.io/mouse-maze-adventure/`

---

## ✨ 功能特色

| 功能 | 說明 |
|------|------|
| 🗺️ 5 個預設關卡 | 從入門到專家，難度循序漸進 |
| 🎲 隨機迷宮生成器 | 4 種大小 × 3 種難度，每次都不一樣 |
| 🤖 AI 演算法視覺化 | BFS、DFS、A★ 三種搜尋演算法動態展示 |
| 🍎 老師模式 | 即時座標、最短路徑、探索格數，附學習角落說明 |
| 📱 行動裝置支援 | 觸控方向鍵，響應式版面 |
| 🌏 繁體中文介面 | 適合台灣國小課堂使用 |

---

## 🛠️ 技術棧

- **React 18** + **TypeScript**
- **Vite 5** （開發伺服器 & 打包工具）
- 純 CSS（無外部 UI 函式庫）
- GitHub Actions 自動部署

---

## 💻 本地開發

### 環境需求

- Node.js **18+**
- npm **9+**

### 安裝與啟動

```bash
# 1. 複製專案
git clone https://github.com/prayer168/mouse-maze-adventure.git
cd mouse-maze-adventure

# 2. 安裝套件
npm install

# 3. 啟動開發伺服器（支援 Hot Module Replacement）
npm run dev
```

開發伺服器預設在 `http://localhost:5173` 開啟。

### 其他指令

```bash
# TypeScript 型別檢查 + 打包（輸出到 dist/）
npm run build

# 預覽打包結果（模擬正式環境）
npm run preview
```

---

## 🚀 部署到 GitHub Pages

### 前置作業（只需做一次）

**步驟 1 — 建立 GitHub 儲存庫**

在 GitHub 建立名為 `mouse-maze-adventure` 的 **公開** 儲存庫。

> ⚠️ 儲存庫名稱必須是 `mouse-maze-adventure`，否則需要同步修改 `vite.config.ts` 中的 `base` 路徑。

**步驟 2 — 推送程式碼**

```bash
git init
git add .
git commit -m "feat: initial commit"
git branch -M main
git remote add origin https://github.com/prayer168/mouse-maze-adventure.git
git push -u origin main
```

**步驟 3 — 開啟 GitHub Pages**

1. 進入儲存庫 → **Settings** → **Pages**
2. **Source** 選擇 `GitHub Actions`
3. 儲存設定

### 自動部署

每次推送到 `main` 分支時，GitHub Actions 會自動：

1. 安裝套件（`npm ci`）
2. 打包專案（`npm run build`，自動套用正確的 `base` 路徑）
3. 將 `dist/` 發布到 GitHub Pages

部署完成後，在 **Actions** 頁籤可查看進度，成功後即可在以下網址遊玩：

```
https://prayer168.github.io/mouse-maze-adventure/
```

### 修改儲存庫名稱？

若儲存庫名稱不是 `mouse-maze-adventure`，請修改 `vite.config.ts`：

```ts
// 將 'mouse-maze-adventure' 改為你的儲存庫名稱
const base = process.env.GITHUB_ACTIONS ? '/你的儲存庫名稱/' : './'
```

---

## 📁 專案結構

```
mouse-maze-adventure/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 自動部署流程
├── public/
│   └── favicon.svg
├── src/
│   ├── algorithms/
│   │   ├── bfs.ts              # 廣度優先搜尋
│   │   ├── dfs.ts              # 深度優先搜尋
│   │   ├── astar.ts            # A* 搜尋
│   │   ├── generateMaze.ts     # 隨機迷宮生成器
│   │   └── index.ts            # 演算法統一匯出
│   ├── components/             # React 元件
│   ├── data/
│   │   ├── mazes.ts            # 5 個預設迷宮關卡
│   │   └── teachingNotes.ts    # 學習角落文字（老師可直接修改）
│   ├── hooks/                  # 自訂 React Hooks
│   ├── utils/
│   │   └── scoring.ts          # 星星評分邏輯
│   └── types.ts                # TypeScript 型別定義
├── index.html
├── vite.config.ts
└── README.md
```

---

## 👩‍🏫 老師使用說明

### 修改學習角落文字

學習角落的所有文字集中在一個檔案，方便修改：

```
src/data/teachingNotes.ts
```

每個物件對應一張展開卡片，修改 `body` 欄位即可更新內容。

### 老師模式操作

1. 點擊頁面頂部的 **🍎 老師模式** 按鈕
2. 畫面出現深綠色即時資料面板（座標、步數、最短路徑、AI 探索格數）
3. 頁面底部出現 **📚 學習角落**，點擊各問題可展開說明

---

## 📄 授權

MIT License — 自由使用、修改與散佈。
