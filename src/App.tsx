import { useState, useMemo, useCallback, useEffect } from 'react';
import type { AlgorithmId, MazeLevel } from './types';
import { MAZES } from './data/mazes';
import { ALGORITHM_MAP } from './algorithms/index';
import { useGameState } from './hooks/useGameState';
import { useKeyboard } from './hooks/useKeyboard';
import { useAiSolver } from './hooks/useAiSolver';
import { scoreLevel } from './utils/scoring';
import { LevelSelector } from './components/LevelSelector';
import { GameStatus } from './components/GameStatus';
import { AlgoPanel } from './components/AlgoPanel';
import { MazeGrid } from './components/MazeGrid';
import { DPad } from './components/DPad';
import { WinModal } from './components/WinModal';
import { TeacherHUD } from './components/TeacherHUD';
import { TeacherPanel } from './components/TeacherPanel';
import { GeneratorPanel } from './components/GeneratorPanel';
import './App.css';

/**
 * Map grid column count → a comfortable cell pixel size.
 * Accepts the current viewport width so the result stays correct after
 * window resize or device orientation change.
 */
function computeCellSize(cols: number, viewportWidth: number): number {
  const available = Math.min(viewportWidth, 800) - 48;
  const fromViewport = Math.floor(available / cols);
  const preferred =
    cols <= 9  ? 54 :
    cols <= 13 ? 44 :
    cols <= 17 ? 36 :
    cols <= 25 ? 28 :
    cols <= 33 ? 22 :
                 17;
  return Math.max(Math.min(fromViewport, preferred), 12);
}

export default function App() {
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [algorithmId,    setAlgorithmId]    = useState<AlgorithmId>('bfs');
  const [teacherMode,    setTeacherMode]    = useState(false);
  const [generatedMaze,  setGeneratedMaze]  = useState<MazeLevel | null>(null);

  // Track viewport width so cellSize updates on resize / orientation change.
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    // requestAnimationFrame batches rapid resize events to one render per frame.
    let rafId = 0;
    const onResize = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => setWindowWidth(window.innerWidth));
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Resolve active level: generated maze takes priority over preset.
  const currentLevel = useMemo(
    () => generatedMaze ?? (MAZES.find(l => l.id === currentLevelId) ?? MAZES[0]),
    [currentLevelId, generatedMaze],
  );

  const game = useGameState(currentLevel);
  const ai   = useAiSolver(currentLevel, algorithmId);

  const aiActive  = ai.status !== 'idle';
  const aiRunning = ai.status === 'exploring' || ai.status === 'pathing';

  // Single stable callback for both keyboard and D-Pad.
  // Previously `aiActive ? () => {} : game.move` created a new function on
  // every render when AI was active, causing useKeyboard's effect to
  // remove/re-add the event listener on every render (risking missed keys).
  const handleMove = useCallback(
    (key: string) => { if (!aiActive) game.move(key); },
    [aiActive, game.move],
  );
  useKeyboard(handleMove);

  const cellSize = computeCellSize(currentLevel.grid[0].length, windowWidth);
  const hasNext  = !generatedMaze && currentLevelId < MAZES.length;
  const algo     = ALGORITHM_MAP[algorithmId];

  const score = useMemo(
    () => (game.won ? scoreLevel(currentLevel, game.steps) : null),
    [game.won, currentLevel, game.steps],
  );

  // Shortest path via BFS — recomputed only when the level changes (< 1 ms).
  const shortestPathLength = useMemo(() => {
    const result = ALGORITHM_MAP['bfs'].run(
      currentLevel.grid,
      currentLevel.start,
      currentLevel.end,
    );
    return result.path.length > 0 ? result.path.length - 1 : 0;
  }, [currentLevel]);

  const exploredCount =
    ai.stats?.exploredCount ??
    (ai.exploredCells.size > 0 ? ai.exploredCells.size : null);

  const displayPos   = aiActive ? ai.position    : game.position;
  const displayPath  = aiActive ? ai.solvePath   : undefined;
  const displayExplo = aiActive ? ai.exploredCells : undefined;

  // ── Handlers ──────────────────────────────────────────────────
  function handleAiSolve() { game.reset(); ai.solve(); }
  function handleReset()   { ai.cancel(); game.reset(); }

  function handleSelectLevel(id: number) {
    setCurrentLevelId(id);
    setGeneratedMaze(null);
  }

  function handleGenerate(maze: MazeLevel) {
    setGeneratedMaze(maze);
  }

  function handleNext() {
    if (hasNext) setCurrentLevelId(id => id + 1);
  }

  return (
    <div className="app">
      {/* ── 標題橫幅 ─────────────────────────────────────────── */}
      <header className="header">
        <h1 className="title">🐭 老鼠迷宮大冒險</h1>
        <p className="subtitle">帶領老鼠找到起司！</p>
      </header>

      {/* ── 老師模式切換 ──────────────────────────────────────── */}
      <button
        className={`btn-teacher${teacherMode ? ' btn-teacher--on' : ''}`}
        onClick={() => setTeacherMode(t => !t)}
        aria-pressed={teacherMode}
        title={teacherMode ? '關閉老師模式' : '開啟老師模式'}
      >
        🍎 老師模式{teacherMode ? ' 開啟中' : ''}
      </button>

      {/* ── 預設關卡選擇 ──────────────────────────────────────── */}
      {/* currentId=0 when generated maze active → no preset button highlighted */}
      <LevelSelector
        levels={MAZES}
        currentId={generatedMaze ? 0 : currentLevelId}
        onSelect={l => handleSelectLevel(l.id)}
      />

      {/* ── 隨機迷宮生成器 ────────────────────────────────────── */}
      <GeneratorPanel
        onGenerate={handleGenerate}
        isActive={generatedMaze !== null}
      />

      {/* ── 分數 / 計時列 ─────────────────────────────────────── */}
      <GameStatus
        levelName={currentLevel.name}
        difficulty={currentLevel.difficulty}
        steps={game.steps}
        elapsed={game.elapsed}
        started={game.started}
      />

      {/* ── 老師 HUD（即時資料）──────────────────────────────── */}
      {teacherMode && (
        <TeacherHUD
          playerPos={displayPos}
          steps={game.steps}
          shortestPathLength={shortestPathLength}
          exploredCount={exploredCount}
          algorithmName={algo.name}
        />
      )}

      {/* ── 鍵盤提示 ──────────────────────────────────────────── */}
      <p className="keyboard-hint">
        使用 <kbd>↑</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd> 或&nbsp;
        <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> 移動
      </p>

      {/* ── 演算法選擇器 + 說明 + 統計 ───────────────────────── */}
      <AlgoPanel
        selectedId={algorithmId}
        onSelect={id => { setAlgorithmId(id); ai.cancel(); }}
        stats={ai.stats}
        isRunning={aiRunning}
      />

      {/* ── 迷宮 ──────────────────────────────────────────────── */}
      <main className="game-area">
        <MazeGrid
          grid={currentLevel.grid}
          playerPos={displayPos}
          end={currentLevel.end}
          cellSize={cellSize}
          exploredCells={displayExplo}
          solvePath={displayPath}
          pathColor={algo.color}
        />
      </main>

      {/* ── AI 狀態橫幅 ───────────────────────────────────────── */}
      {aiActive && (
        <div className="ai-status" aria-live="polite">
          {ai.status === 'exploring' && (
            <>
              <span className="ai-label">🔍 探索中…</span>
              <span className="ai-steps">探索格子中（{algo.name}）</span>
            </>
          )}
          {ai.status === 'pathing' && (
            <>
              <span className="ai-label">🐭 行走路徑…</span>
              <span className="ai-steps">第 {ai.stepIndex} / {ai.totalSteps} 步</span>
            </>
          )}
          {ai.status === 'done' && (
            <>
              <span className="ai-label">✅ 完成！</span>
              <span className="ai-steps">
                {algo.name}：探索 {ai.stats?.exploredCount} 格 → {ai.totalSteps} 步
              </span>
            </>
          )}
        </div>
      )}

      {/* ── 方向鍵（行動裝置）────────────────────────────────── */}
      <DPad onMove={handleMove} />

      {/* ── 工具列 ────────────────────────────────────────────── */}
      <div className="toolbar">
        <button className="btn-reset" onClick={handleReset} aria-label="重置">
          🔄 重置
        </button>
        <button
          className={`btn-ai${aiRunning ? ' btn-ai--stop' : ''}`}
          onClick={aiRunning ? ai.cancel : handleAiSolve}
          aria-label={aiRunning ? '停止 AI' : '執行 AI 解題'}
          disabled={game.won}
        >
          {aiRunning ? '⏹ 停止' : `${algo.icon} 執行 ${algo.name}`}
        </button>
      </div>

      {/* ── 學習角落（老師模式專用）──────────────────────────── */}
      {teacherMode && <TeacherPanel />}

      {/* ── 過關視窗 ──────────────────────────────────────────── */}
      {game.won && score && (
        <WinModal
          score={score}
          steps={game.steps}
          elapsed={game.elapsed}
          hasNext={hasNext}
          onReset={handleReset}
          onNext={handleNext}
        />
      )}
    </div>
  );
}
