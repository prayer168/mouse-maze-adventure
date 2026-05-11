import { useLayoutEffect, useRef, useState } from 'react';
import type { MazeGrid as MazeGridType, Position } from '../types';
import './MazeGrid.css';

interface Props {
  grid: MazeGridType;
  playerPos: Position;
  end: Position;
  cellSize: number;
  exploredCells?: ReadonlySet<string>;
  solvePath?: ReadonlySet<string>;
  pathColor?: string;
}

export function MazeGrid({ grid, playerPos, end, cellSize, exploredCells, solvePath, pathColor = '#3b82f6' }: Props) {
  const prevPosRef = useRef(playerPos);
  const [teleport, setTeleport] = useState(false);

  // useLayoutEffect fires synchronously after DOM mutations but BEFORE the
  // browser paints. This means when a level resets and playerPos jumps many
  // cells (dist > 3), we disable the CSS transition in the same frame,
  // so the mouse snaps instantly with no visible slide animation.
  // With useEffect (after paint) the mouse would briefly animate then snap.
  useLayoutEffect(() => {
    const prev = prevPosRef.current;
    const dist  = Math.abs(playerPos.row - prev.row) + Math.abs(playerPos.col - prev.col);
    setTeleport(dist > 3); // level reset / AI reset → skip slide transition
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

            const className = [
              'cell',
              isWall     ? 'wall'          : 'path',
              isExplored ? 'explored-cell' : '',
              isOnPath   ? 'path-trail'    : '',
              isGoal     ? 'goal-cell'     : '',
            ].filter(Boolean).join(' ');

            return (
              <div
                key={c}
                className={className}
                role="gridcell"
                aria-label={isGoal ? 'cheese goal' : undefined}
              >
                {isGoal && <span className="sprite cheese-sprite">🧀</span>}
              </div>
            );
          })}
        </div>
      ))}

      {/* Smooth-sliding mouse — absolutely positioned over the grid */}
      <div
        className="mouse-overlay"
        aria-label="mouse player"
        style={{
          width:     cellSize,
          height:    cellSize,
          fontSize:  cellSize * 0.68,
          transform: `translate(${playerPos.col * cellSize}px, ${playerPos.row * cellSize}px)`,
          transition: teleport ? 'none' : undefined,
        }}
      >
        {/* key forces remount → replays bounce-in animation on each move */}
        <span
          key={`${playerPos.row}-${playerPos.col}`}
          className="mouse-emoji"
        >
          🐭
        </span>
      </div>
    </div>
  );
}
