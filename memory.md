# 🐭 老鼠迷宮大冒險 — 完整設計與部署歷程記錄

> 本文件記錄整個 APP 從概念到上線的完整過程，作為未來維護與迭代的參考依據。

---

## 一、專案起源

**目標使用者：** 台灣國小學生（約 8–12 歲）  
**核心目標：** 透過互動迷宮遊戲，讓學生直觀地理解演算法概念（BFS、DFS、A★）  
**開發環境：** Windows 11，`C:\Users\NNKIEH\mouse-maze-adventure`  
**GitHub 帳號：** prayer168  
**線上網址：** https://prayer168.github.io/mouse-maze-adventure/

專案原本已有基礎骨架（Vite + React + TypeScript），開發者在終端機意外關閉後重新接手，從現有程式碼繼續迭代。

---

## 二、視覺設計演進

### 2.1 第一階段：確認現有功能

原始版本為簡單棕色系介面，功能正常但視覺單調。確認的現有功能：
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
| 迷宮牆壁 | 深森林綠 `#2d6a2d` | 樹籬 / 綠籬感 |
| 路徑 | 沙黃色 `#fef3e2` | 泥土小徑感 |
| 標題橫幅 | 鵝黃配琥珀邊框 | 活潑温暖 |
| 按鈕 | 橙色（重置）/ 深藍（AI）| 明確功能區分 |

**關鍵 UI 決策：**
- 標題橫幅左右搖擺 🌿（CSS `@keyframes sway`），標題有彈跳進場動畫
- 關卡按鈕：每個難度有獨立顏色陰影（綠 / 藍 / 橙 / 紅 / 紫）
- 過關視窗：彩色紙屑圓點、🎉 慶祝 emoji，星星有彈跳動畫
- D-Pad：綠色立體按鈕，按壓有下沉效果

### 2.3 第三階段：老鼠平滑移動動畫

**問題：** 原本老鼠每次移動是瞬間跳格，體驗生硬

**解決方案：** 將 🐭 從格子內的 `<span>` 改為絕對定位的覆蓋層（overlay）

```css
.mouse-overlay {
  position: absolute;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); /* 彈簧效果 */
}
```

**技術細節：**
- `key` 屬性改變 → span 重新掛載 → 觸發 `mouse-arrive` 彈跳動畫
- 關卡切換偵測移動距離 > 3 格視為「瞬移」，跳過 transition
- 後來發現需從 `useEffect` 改為 `useLayoutEffect`（見 Bug #2）

---

## 三、功能迭代記錄

### 3.1 老師模式（Teacher Mode）

**目的：** 方便教師課堂展示，讓學生理解 AI 行為背後的數據

**設計決策：**
- 切換按鈕：🍎 老師模式（蘋果 = 教師通用符號）
- 啟用時顯示深綠「黑板風格」資料面板
- 文字內容集中於 `src/data/teachingNotes.ts`，方便老師修改

**顯示資訊：**
| 資訊項目 | 說明 |
|---------|------|
| 老鼠座標 | 第 N 列，第 N 行（1-indexed）|
| 已走步數 | 玩家實際移動次數 |
| 最短路徑 | 即時 BFS 計算結果 |
| AI 探索格數 | 執行 AI 後顯示 |

**學習角落：** 原生 `<details>/<summary>` 手風琴，無需 JS 狀態管理，5 個問題卡片

### 3.2 隨機迷宮生成器

**演算法：** 迭代式遞迴回溯法（Iterative Recursive Backtracker）

**選擇原因：**
- 保證完全連通（必定有解）
- 生成品質佳（彎曲走廊、自然死路）
- 迴圈 DFS，無遞迴深度限制

**難度控制：**
| 難度 | 額外牆壁移除 | 效果 |
|------|------------|------|
| 簡單 | 28% | 多捷徑，容易完成 |
| 中等 | 12% | 少量捷徑，需要思考 |
| 困難 | 0%  | 純生成樹，最多死路 |

**尺寸選項：**
| 選項 | 格子數 | 格線數 |
|------|--------|--------|
| 8×8  | 64  | 17×17 |
| 12×12 | 144 | 25×25 |
| 16×16 | 256 | 33×33 |
| 20×20 | 400 | 41×41 |

### 3.3 繁體中文介面

所有使用者文字全面中文化：
- 難度 `Difficulty` type 保留英文（型別安全）
- 新增 `DIFFICULTY_ZH` 對照表只改顯示層
- 演算法說明、學習角落均為完整中文

---

## 四、技術架構決策

### Ref vs State 使用原則

| 用途 | 方式 | 原因 |
|------|------|------|
| 玩家位置（同步讀取）| `positionRef` | 避免 StrictMode 雙重更新 |
| 計時器是否啟動 | `startedRef` | 供 interval callback 同步讀 |
| 是否已勝利 | `wonRef` | 供 interval callback 同步讀 |
| AI 探索集合 | `exploredSetRef` | 就地修改，靠 `incExplored` 觸發重渲 |
| 視窗寬度 | `windowWidth` (state) | 需觸發重渲染更新 cellSize |

### AI 動畫兩階段流程

```
solve() 呼叫
  → Phase 1: 探索格子逐一亮起（22ms / 格）
      ↓ 完成
  → Phase 2: 老鼠沿解答路徑行走（150ms / 步）
      ↓ 完成
  → status: 'done'，顯示統計數字
```

---

## 五、重大 Bug 修復記錄

### Bug #1 — StrictMode 步數雙重計算
- **現象：** 開發模式每按一次步數 +2
- **根因：** `setSteps()` 在 `setPosition()` updater 內，StrictMode 雙重呼叫
- **修復：** 引入 `positionRef`，改為直接讀 ref 後平行呼叫各 setState

### Bug #2 — 關卡切換老鼠短暫滑動
- **現象：** 切換關卡時老鼠從舊終點滑向新起點再瞬移
- **根因：** `useEffect` 在瀏覽器繪製後才執行，第一幀已顯示動畫
- **修復：** 改為 `useLayoutEffect`，繪製前同步設定 `teleport=true`

### Bug #3 — 鍵盤監聽器每次渲染重新註冊
- **現象：** AI 執行期間每次渲染都移除並重新綁定 keydown 事件
- **根因：** `aiActive ? () => {} : game.move`，AI 啟用時每次產生新函式參考
- **修復：** 改用 `useCallback` 的 `handleMove`，鍵盤和 D-Pad 共用

### Bug #4 — 視窗縮放後格子大小不更新
- **現象：** 手機轉向或調整視窗大小後，迷宮格子不重新計算
- **根因：** `computeCellSize` 直接讀 `window.innerWidth` 無響應式更新
- **修復：** 加入 `windowWidth` state + RAF 防抖的 resize 監聽器

---

## 六、部署設定與排錯記錄

### 6.1 設定架構

```
儲存庫：prayer168/mouse-maze-adventure
網址：https://prayer168.github.io/mouse-maze-adventure/
```

**Base Path 邏輯（vite.config.ts）：**
```ts
const base = process.env.GITHUB_ACTIONS ? '/mouse-maze-adventure/' : './'
```
- 本地：相對路徑，dev / preview 正常
- CI：自動套用正確子路徑，Assets 正確引用

### 6.2 首次部署排錯過程（重要記錄）

| 步驟 | 問題 | 原因 |
|------|------|------|
| 1 | 404 頁面 | GitHub 儲存庫尚未建立，push 失敗 |
| 2 | 白畫面（JS 指向 `/src/main.tsx`）| Pages source 設為 `legacy`（Jekyll 模式）|
| 3 | 自訂 workflow 失敗 | `configure-pages` 無法在 legacy 模式執行 |
| 4 | Jekyll 部署成功但錯誤 | 把未建置的原始碼直接上傳 |

**診斷方法：**
```bash
# 確認 Pages 設定
gh api repos/prayer168/mouse-maze-adventure/pages

# 回傳 "build_type": "legacy" → 就是問題所在
```

**修復步驟：**
```bash
# 1. 透過 API 切換為 GitHub Actions 模式
gh api --method PUT repos/prayer168/mouse-maze-adventure/pages \
  --field build_type=workflow

# 2. 手動觸發 workflow
gh workflow run deploy.yml --repo prayer168/mouse-maze-adventure
```

**同時更新 deploy.yml 加入：**
```yaml
- name: Setup Pages
  uses: actions/configure-pages@v5
  with:
    enablement: true  # 自動啟用 Pages，避免 legacy 模式問題
```

**驗證部署成功：**
```bash
# 確認 index.html 內容正確（有 /assets/ 路徑）
curl -s "https://prayer168.github.io/mouse-maze-adventure/" | grep script

# 確認 JS / CSS 資產存在（200 OK）
curl -sI "https://prayer168.github.io/mouse-maze-adventure/assets/index-z0qjSnE8.js"
```

### 6.3 CDN 快取說明

GitHub Pages CDN（Fastly）設定 `Cache-Control: max-age=600`（10 分鐘）。

部署後若看到舊版本：
1. **無痕視窗**（最快）：Ctrl+Shift+N → 開啟網址
2. **強制重新整理**：F12 → 右鍵重新整理 → 清除快取並強制重新載入
3. **等待**：最多 10 分鐘 CDN 自動更新

---

## 七、Git 提交記錄

| commit | 說明 |
|--------|------|
| `486cce4` | feat: initial release（47 個檔案，5678 行）|
| `221c927` | docs: add memory.md |
| `687ec32` | fix: configure-pages enablement:true |
| 最新 | docs: update memory.md（加入部署排錯完整記錄）|

---

## 八、檔案結構

```
mouse-maze-adventure/
├── .github/workflows/deploy.yml   # GitHub Actions（含 enablement:true）
├── .gitattributes                  # LF 行尾統一
├── .gitignore                      # 排除 node_modules/, dist/
├── README.md                       # 專案說明 + 部署步驟
├── skill.md                        # 技能說明文件
├── memory.md                       # 本文件
├── index.html                      # lang="zh-TW"
├── vite.config.ts                  # 動態 base path
└── src/
    ├── App.tsx                     # 主元件
    ├── algorithms/
    │   ├── bfs.ts / dfs.ts / astar.ts
    │   └── generateMaze.ts         # 遞迴回溯迷宮生成器
    ├── components/
    │   ├── MazeGrid.tsx            # 老鼠 overlay 動畫（useLayoutEffect）
    │   ├── GeneratorPanel.tsx      # 隨機迷宮 UI
    │   ├── TeacherHUD.tsx          # 老師即時資料
    │   ├── TeacherPanel.tsx        # 學習角落手風琴
    │   └── WinModal.tsx            # 過關視窗（★★★）
    ├── hooks/
    │   ├── useGameState.ts         # positionRef 避免 StrictMode bug
    │   ├── useAiSolver.ts          # 兩階段動畫狀態機
    │   └── useKeyboard.ts          # 穩定 handleMove callback
    └── data/
        └── teachingNotes.ts        # 老師可直接修改的文字
```

---

## 九、未來可能的迭代方向

| 功能 | 優先度 | 說明 |
|------|--------|------|
| 列印迷宮 | 高 | 匯出 PDF，學生紙上作答 |
| 音效 | 中 | 移動聲、過關音效 |
| 動畫速度調整 | 中 | AI 探索速度滑桿 |
| 更多演算法 | 中 | Dijkstra、Greedy Best-First |
| 排行榜 | 低 | localStorage 儲存最佳步數 |
| 迷宮編輯器 | 低 | 讓老師自行設計關卡 |

---

*最後更新：2026-05-11*  
*開發者：prayer168*  
*協作工具：Claude Sonnet 4.6*
