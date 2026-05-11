import type { Position } from '../types';
import './TeacherHUD.css';

interface Props {
  playerPos: Position;
  steps: number;
  shortestPathLength: number;
  exploredCount: number | null;
  algorithmName: string;
}

export function TeacherHUD({
  playerPos,
  steps,
  shortestPathLength,
  exploredCount,
  algorithmName,
}: Props) {
  const extraSteps = steps > 0 && steps > shortestPathLength
    ? steps - shortestPathLength
    : 0;

  return (
    <div className="teacher-hud" role="region" aria-label="老師模式即時資料">
      <div className="hud-header">
        <span className="hud-badge">🍎 老師模式</span>
        <span className="hud-subtitle">即時遊戲資料 — 教師專用，學生一起觀察！</span>
      </div>

      <div className="hud-grid">
        {/* 老鼠位置 */}
        <div className="hud-card">
          <span className="hud-icon">📍</span>
          <span className="hud-value hud-mono">
            第 {playerPos.row} 列，第 {playerPos.col} 行
          </span>
          <span className="hud-label">老鼠座標</span>
        </div>

        {/* 已走步數 */}
        <div className="hud-card">
          <span className="hud-icon">👣</span>
          <span className="hud-value">{steps}</span>
          <span className="hud-label">已走步數</span>
        </div>

        {/* 最短路徑 */}
        <div className="hud-card">
          <span className="hud-icon">🎯</span>
          <span className="hud-value">{shortestPathLength}</span>
          <span className="hud-label">最短路徑</span>
        </div>

        {/* AI 探索格子數 */}
        <div className="hud-card">
          <span className="hud-icon">🔍</span>
          <span className="hud-value">
            {exploredCount !== null ? exploredCount : '—'}
          </span>
          <span className="hud-label">AI 探索格子數</span>
        </div>
      </div>

      {/* 情境教學提示 */}
      {extraSteps > 0 && (
        <p className="hud-hint">
          💡 老鼠比最短路徑多走了 <strong>{extraSteps}</strong> 步（最短為
          {' '}<strong>{shortestPathLength}</strong> 步）。你的學生能找到更短的路嗎？
        </p>
      )}

      {steps === 0 && (
        <p className="hud-hint">
          💡 問問學生：<em>「老鼠從哪裡出發？它的座標是什麼？」</em>
        </p>
      )}

      {exploredCount === null && (
        <p className="hud-hint">
          💡 點擊「<strong>執行 {algorithmName}</strong>」，看看演算法在找到起司之前探索了幾個格子！
        </p>
      )}

      {exploredCount !== null && shortestPathLength > 0 && (
        <p className="hud-hint">
          💡 {algorithmName} 探索了 <strong>{exploredCount}</strong> 個格子，
          找到了長度 <strong>{shortestPathLength}</strong> 步的路徑，
          比路徑長度多檢查了 {exploredCount - shortestPathLength} 個格子！
        </p>
      )}
    </div>
  );
}
