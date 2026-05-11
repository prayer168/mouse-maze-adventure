# 🐭 老鼠迷宮大冒險 — 設計歷程記錄

> 本文件記錄整個 APP 從概念到完成的設計與開發過程，作為未來維護與迭代的參考依據。

---

## 一、專案起源

**目標使用者：** 台灣國小學生（約 8–12 歲）
**核心目標：** 透過互動迷宮遊戲，讓學生直觀地理解演算法概念（BFS、DFS、A★）
**開發環境：** Windows 11，`C:\Users\NNKIEH\mouse-maze-adventure`

專案原本已有基礎骨架（Vite + React + TypeScript），開發者在終端機意外關閉後重新接手，從現有程式碼繼續迭代。

---

## 二、視覺設計演進

### 2.1 第一階段：基礎佈局確認

原始版本為簡單的棕色系介面，功能正常但視覺較為單調。確認的現有功能：
- 5 個預設關卡（9×9 到 17×17）
- 三種 AI 演算法視覺化（BFS / DFS / A★）
- 鍵盤 + D-Pad 控制
- 過關評分系統（★★★）

### 2.2 第二階段：全面視覺重設計

**設計方向：** 可愛教育遊戲風格，適合國小生但不幼稚

**色彩系統：**
| 元素 | 顏色 | 設計意圖 |
|------|------|---------|
| 背景 | 天空藍 → 薄荷綠漸層 | 戶外草原感 |
| 迷宮牆壁 | 深森林綠 `#2d6a2d` | 樹籬/綠籬感 |
| 路徑 | 沙黃色 `#fef3e2` | 泥土小徑感 |
| 標題橫幅 | 鵝黃色配琥珀邊框 | 活潑温暖 |
| 按鈕 | 橙色（重置）/ 深藍（AI） | 明確功能區分 |

**關鍵 UI 決策：**
- **標題橫幅**：加入左右搖擺的 🌿 裝飾（CSS `@keyframes sway`），標題有彈跳進場動畫
- **關卡按鈕**：每個難度有獨立顏色陰影（綠 / 藍 / 橙 / 紅 / 紫）
- **過關視窗**：加入彩色紙屑圓點、🎉 慶祝 emoji，星星有彈跳動畫
- **D-Pad**：綠色立體按鈕，按壓有下沉效果

### 2.3 第三階段：老鼠平滑移動動畫

**設計問題：** 原本老鼠每次移動是瞬間跳格，體驗生硬

**解決方案：** 將 🐭 從格子內的 `<span>` 改為絕對定位的覆蓋層（overlay）
```
.mouse-overlay {
  position: absolute;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); /* 彈簧效果 */
}
```

**技術細節：**
- 每次移動時，`key` 屬性改變 → span 重新掛載 → 觸發 `mouse-arrive` 彈跳動畫
- 關卡切換時跳過 transition（偵測移動距離 > 3 格即視為「瞬移」）
- 後來發現需從 `useEffect` 改為 `useLayoutEffect`，在瀏覽器繪製前同步禁用 transition（Bug Fix #2）

---

## 三、功能迭代記錄

### 3.1 老師模式（Teacher Mode）

**需求來源：** 方便教師在課堂上展示，讓學生理解 AI 行為背後的數據

**設計決策：**
- 切換按鈕：🍎 老師模式（蘋果 emoji = 教師通用符號）
- 啟用時顯示深綠色「黑板風格」資料面板
- 文字內容集中於 `src/data/teachingNotes.ts`，方便老師自行修改

**顯示資訊：**
| 資訊項目 | 說明 |
|---------|------|
| 老鼠座標 | 第 N 列，第 N 行 |
| 已走步數 | 玩家實際移動次數 |
| 最短路徑 | 即時 BFS 計算結果 |
| AI 探索格數 | 執行 AI 後顯示 |

**學習角落：** 使用原生 `<details>/<summary>` 手風琴展開，無需 JavaScript 狀態管理，5 個問題卡片：
1. 什麼是迷宮？
2. 什麼是路徑？
3. 什麼是死路？
4. BFS 怎麼找最短路徑？
5. 顏色代表什麼意思？

### 3.2 隨機迷宮生成器

**演算法選擇：** 迭代式遞迴回溯法（Iterative Recursive Backtracker）

**選擇原因：**
- 保證完全連通（必定有解）
- 生成品質佳（彎曲走廊、自然死路）
- 迭代堆疊實作，無遞迴深度限制

**難度控制邏輯：**
| 難度 | 額外牆壁移除比例 | 效果 |
|------|----------------|------|
| 簡單 | 28% | 多條捷徑，容易完成 |
| 中等 | 12% | 少量捷徑，需要思考 |
| 困難 | 0%  | 純生成樹，最多死路 |

**尺寸選項：**
| 選項 | 格子數 | 實際格線數 | 備註 |
|------|--------|-----------|------|
| 8×8  | 64 格  | 17×17     | 等同專家關卡 |
| 12×12 | 144 格 | 25×25    | 預設選項 |
| 16×16 | 256 格 | 33×33    | 挑戰尺寸 |
| 20×20 | 400 格 | 41×41    | 最大，cellSize 縮至 17px |

**UI 整合：**
- 面板位於預設關卡選擇器下方
- 生成中顯示 `⏳ 生成中…`（yield 一幀後才執行）
- 使用中顯示橘色邊框 + "使用中" 徽章
- 選回預設關卡時自動清除生成迷宮

### 3.3 繁體中文介面

所有使用者可見文字全面中文化：
- 標題：老鼠迷宮大冒險
- 難度：入門 / 簡單 / 中等 / 進階 / 專家
- 演算法說明：BFS / DFS / A★ 完整中文解說
- `DIFFICULTY_ZH` 對照表加入 `GameStatus.tsx`
- `DIFFICULTY_MAP` 保留英文內部型別（`Difficulty` type 不變），只改顯示層

---

## 四、技術架構決策

### 4.1 狀態管理策略

選擇**不使用** Redux / Zustand，原因：
- 規模小，所有狀態可由 React 原生 Hooks 管理
- `useGameState`、`useAiSolver` 清楚分離關注點
- 傳遞給子元件的資料流向直觀

### 4.2 Ref vs State 使用原則

| 用途 | 使用方式 | 原因 |
|------|---------|------|
| 玩家位置（同步讀取） | `positionRef` (useRef) | 避免 StrictMode 雙重更新 |
| 計時器是否啟動 | `startedRef` (useRef) | 供 interval callback 同步讀取 |
| 是否已勝利 | `wonRef` (useRef) | 供 interval callback 同步讀取 |
| AI 探索集合 | `exploredSetRef` (useRef) | 就地修改，觸發重渲染靠 `incExplored` |
| 視窗寬度 | `windowWidth` (useState) | 需觸發重渲染更新 cellSize |

### 4.3 動畫架構

```
AI 解題動畫（兩階段）:
  Phase 1: 探索格子逐一亮起（22ms / 格）
    ↓ 完成後
  Phase 2: 老鼠沿解答路徑行走（150ms / 步）
    ↓ 完成後
  Status: 'done' → 顯示統計
```

---

## 五、重大 Bug 修復紀錄

### Bug #1 — StrictMode 步數雙重計算
**現象：** 開發模式每按一次方向鍵步數 +2
**根因：** `setSteps()` 寫在 `setPosition()` 的 updater function 內，StrictMode 會雙重呼叫
**修復：** 引入 `positionRef`，改為直接讀取 ref 值後平行呼叫各 setState

### Bug #2 — 關卡切換時老鼠短暫滑動
**現象：** 切換關卡時老鼠從舊終點滑向新起點再瞬移
**根因：** `useEffect` 在瀏覽器繪製後才執行，第一幀已顯示動畫
**修復：** 改為 `useLayoutEffect`，在繪製前同步設定 `teleport=true`

### Bug #3 — 鍵盤監聽器每次渲染重新註冊
**現象：** AI 執行期間每次渲染都移除並重新綁定 `keydown` 事件
**根因：** `aiActive ? () => {} : game.move` 在 AI 啟用時每次渲染都產生新函式參考
**修復：** 改用 `useCallback` 的 `handleMove`，同時供鍵盤和 D-Pad 使用

### Bug #4 — 視窗縮放後格子大小不更新
**現象：** 手機轉向或調整瀏覽器大小後，迷宮格子不重新計算
**根因：** `computeCellSize` 直接讀取 `window.innerWidth` 無響應式更新
**修復：** 加入 `windowWidth` state + RAF 防抖的 `resize` 監聽器

---

## 六、部署設定

### GitHub Pages 設定
```
儲存庫：prayer168/mouse-maze-adventure
網址：https://prayer168.github.io/mouse-maze-adventure/
```

**Base Path 邏輯：**
```ts
// vite.config.ts
const base = process.env.GITHUB_ACTIONS ? '/mouse-maze-adventure/' : './'
```
- 本地開發：相對路徑，`vite dev` / `vite preview` 正常運作
- CI 建置：自動套用正確子路徑，Assets 正確引用

**自動部署流程：**
```
push to main
  → tsc --noEmit (型別檢查)
  → vite build (打包)
  → upload-pages-artifact (上傳 dist/)
  → deploy-pages (發布)
```

---

## 七、檔案結構最終版

```
mouse-maze-adventure/
├── .github/workflows/deploy.yml   # GitHub Actions 自動部署
├── .gitattributes                  # LF 行尾統一
├── .gitignore                      # 排除 node_modules/, dist/
├── README.md                       # 專案說明 + 部署步驟
├── skill.md                        # 技能說明（學生/教師/開發者）
├── memory.md                       # 本文件：設計歷程記錄
├── index.html                      # lang="zh-TW", 中文 meta
├── vite.config.ts                  # 動態 base path
├── package.json                    # React 18 + Vite 5
├── tsconfig.json                   # strict: true, noUnusedLocals
└── src/
    ├── App.tsx                     # 主元件（狀態 + 佈局）
    ├── App.css                     # 全域樣式 + 設計 tokens
    ├── types.ts                    # TypeScript 型別定義
    ├── algorithms/
    │   ├── bfs.ts                  # 廣度優先搜尋（最短路徑）
    │   ├── dfs.ts                  # 深度優先搜尋（不保證最短）
    │   ├── astar.ts                # A★（啟發式，最短路徑）
    │   ├── generateMaze.ts         # 迷宮生成（遞迴回溯法）
    │   └── index.ts                # 演算法 metadata + 匯出
    ├── components/
    │   ├── MazeGrid.tsx/css        # 迷宮渲染 + 老鼠 overlay 動畫
    │   ├── GeneratorPanel.tsx/css  # 隨機迷宮生成器 UI
    │   ├── TeacherHUD.tsx/css      # 老師模式即時資料面板
    │   ├── TeacherPanel.tsx/css    # 學習角落手風琴
    │   ├── AlgoPanel.tsx/css       # 演算法選擇 + 說明 + 統計
    │   ├── LevelSelector.tsx/css   # 預設關卡選擇
    │   ├── GameStatus.tsx/css      # 步數 / 時間 / 難度徽章
    │   ├── WinModal.tsx/css        # 過關視窗（★★★ 評分）
    │   └── DPad.tsx/css            # 行動裝置方向鍵
    ├── hooks/
    │   ├── useGameState.ts         # 玩家移動、計步、勝利判定
    │   ├── useAiSolver.ts          # AI 兩階段動畫狀態機
    │   └── useKeyboard.ts          # 鍵盤事件綁定
    ├── data/
    │   ├── mazes.ts                # 5 個預設迷宮（格線陣列）
    │   ├── maze.ts                 # 舊版單一迷宮（保留相容）
    │   └── teachingNotes.ts        # 學習角落文字（老師可修改）
    └── utils/
        └── scoring.ts              # 星星評分（BFS 最短步數比較）
```

---

## 八、未來可能的迭代方向

| 功能 | 優先度 | 說明 |
|------|--------|------|
| 音效 | 中 | 移動聲、過關音效、背景音樂（音量可調） |
| 排行榜 | 低 | localStorage 儲存最佳步數 |
| 迷宮編輯器 | 低 | 讓老師自行設計迷宮關卡 |
| 多人對戰 | 低 | 兩人同台比賽（WebSocket） |
| 動畫速度調整 | 中 | AI 探索速度滑桿 |
| 列印功能 | 高 | 將迷宮匯出為 PDF，讓學生紙上作答 |
| 更多演算法 | 中 | Dijkstra、Greedy Best-First |
| 無障礙優化 | 中 | 焦點陷阱、螢幕閱讀器完整支援 |

---

*最後更新：2026-05-11*
*開發者：prayer168*
*協作工具：Claude Sonnet 4.6 (claude-sonnet-4-6)*
