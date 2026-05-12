import { useLayoutEffect, useRef, useState } from 'react';
import type { MazeGrid as MazeGridType, Position } from '../types';
import { MouseSprite } from './MouseSprite';
import './MazeGrid.css';

/**
 * Cell-to-cell slide duration (ms).
 * Must be ≤ HOLD_INTERVAL_MS in useKeyboard.ts so each transition
 * completes before the next move fires → seamlessly chained running.
 */
const MOVE_MS = 72;

interface Props {
  grid: MazeGridType;
  playerPos: Position;
  end: Position;
  cellSize: number;
  exploredCells?: ReadonlySet<string>;
  solvePath?: ReadonlySet<string>;
  pathColor?: string;
}

export function MazeGrid({
  grid, playerPos, end, cellSize,
  exploredCells, solvePath, pathColor = '#3b82f6',
}: Props) {
  const prevPosRef  = useRef(playerPos);
  const [teleport,    setTeleport]    = useState(false);
  const [facingRight, setFacingRight] = useState(false);
  const [isRunning,   setIsRunning]   = useState(false);
  const runTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fires before paint → no visual flash on teleport
  useLayoutEffect(() => {
    const prev = prevPosRef.current;
    const dr   = playerPos.row - prev.row;
    const dc   = playerPos.col - prev.col;
    const dist = Math.abs(dr) + Math.abs(dc);

    setTeleport(dist > 3);

    if (dist === 1) {
      if (dc > 0) setFacingRight(true);
      if (dc < 0) setFacingRight(false);

      setIsRunning(true);
      if (runTimer.current !== null) clearTimeout(runTimer.current);
      runTimer.current = setTimeout(() => setIsRunning(false), MOVE_MS + 50);
    }

    prevPosRef.current = playerPos;
  }, [playerPos]);

  return (
    <div
      className="maze-grid"
      role="grid"
      aria-label="Maze"
      style={{
        '--cell-size': `${cellSize}px`,
        '--path-color': pathColor,
        '--move-ms':   `${MOVE_MS}ms`,
      } as React.CSSProperties}
    >
      {grid.map((row, r) => (
        <div key={r} className="maze-row" role="row">
          {row.map((cell, c) => {
            const key        = `${r},${c}`;
            const isGoal     = r === end.row && c === end.col;
            const isWall     = cell === 1;
            const isOnPath   = !isWall && solvePath?.has(key);
            const isExplored = !isWall && !isOnPath && exploredCells?.has(key);

            const cls = [
              'cell',
              isWall     ? 'wall'          : 'path',
              isExplored ? 'explored-cell' : '',
              isOnPath   ? 'path-trail'    : '',
              isGoal     ? 'goal-cell'     : '',
            ].filter(Boolean).join(' ');

            return (
              <div key={c} className={cls} role="gridcell"
                   aria-label={isGoal ? 'cheese goal' : undefined}>
                {isGoal && <span className="sprite cheese-sprite">🧀</span>}
              </div>
            );
          })}
        </div>
      ))}

      {/* ── Mouse overlay ───────────────────────────────────── */}
      <div
        className="mouse-overlay"
        aria-label="mouse player"
        style={{
          width:     cellSize,
          height:    cellSize,
          transform: `translate(${playerPos.col * cellSize}px, ${playerPos.row * cellSize}px)`,
          transition: teleport ? 'none' : `transform var(--move-ms) linear`,
        }}
      >
        <MouseSprite
          isRunning={isRunning}
          facingRight={facingRight}
          size={cellSize}
        />
      </div>
    </div>
  );
}
