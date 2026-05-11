import type { AlgorithmResult, MazeGrid, Position } from '../types';

/**
 * A* Search
 *
 * Pure function — no side-effects, no external state.
 * Uses Manhattan distance as the admissible heuristic.
 *
 * Explores the most-promising cells first by combining:
 *   g — steps taken from the start
 *   h — estimated steps remaining to the goal (Manhattan distance)
 *   f = g + h  (lower is better)
 *
 * Guarantees the shortest path while typically exploring fewer
 * cells than BFS.
 *
 * Time:  O(R × C × log(R × C))   Space: O(R × C)
 */
export function astar(grid: MazeGrid, start: Position, end: Position): AlgorithmResult {
  const t0   = performance.now();
  const rows = grid.length;
  const cols = grid[0].length;

  const key = (r: number, c: number) => `${r},${c}`;
  const h   = (r: number, c: number) => Math.abs(r - end.row) + Math.abs(c - end.col);

  interface Node { f: number; g: number; row: number; col: number }

  const open:    Node[]              = [{ f: h(start.row, start.col), g: 0, row: start.row, col: start.col }];
  const closed   = new Set<string>();
  const parent   = new Map<string, string | null>();
  const gScore   = new Map<string, number>();
  const explored: Position[]         = [];

  const startKey = key(start.row, start.col);
  const endKey   = key(end.row, end.col);

  gScore.set(startKey, 0);
  parent.set(startKey, null);

  while (open.length > 0) {
    // Pick node with lowest f (simple linear scan — fast enough for small grids).
    let bestIdx = 0;
    for (let i = 1; i < open.length; i++) {
      if (open[i].f < open[bestIdx].f) bestIdx = i;
    }
    const cur = open.splice(bestIdx, 1)[0];
    const ck  = key(cur.row, cur.col);

    if (closed.has(ck)) continue;
    closed.add(ck);
    explored.push({ row: cur.row, col: cur.col });

    if (ck === endKey) {
      const path: Position[] = [];
      let c: string | null = endKey;
      while (c !== null) {
        const [pr, pc] = c.split(',').map(Number);
        path.unshift({ row: pr, col: pc });
        c = parent.get(c) ?? null;
      }
      return { path, explored, timeMs: performance.now() - t0 };
    }

    const g = gScore.get(ck) ?? Infinity;

    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) {
      const nr = cur.row + dr, nc = cur.col + dc, nk = key(nr, nc);
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || closed.has(nk) || grid[nr][nc] !== 0) continue;

      const tentativeG = g + 1;
      if (tentativeG < (gScore.get(nk) ?? Infinity)) {
        gScore.set(nk, tentativeG);
        parent.set(nk, ck);
        open.push({ f: tentativeG + h(nr, nc), g: tentativeG, row: nr, col: nc });
      }
    }
  }

  return { path: [], explored, timeMs: performance.now() - t0 };
}
