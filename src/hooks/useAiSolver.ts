import { useState, useEffect, useRef, useCallback } from 'react';
import type { AlgorithmId, MazeLevel, Position } from '../types';
import { ALGORITHM_MAP } from '../algorithms/index';

/** ms between each explored-cell reveal during the search animation */
const EXPLORE_MS = 22;
/** ms between each step during the path-walk animation */
const PATH_MS = 150;

export type AiStatus = 'idle' | 'exploring' | 'pathing' | 'done';

export interface AiStats {
  exploredCount: number;
  pathLength: number;   // number of moves (path.length - 1)
  timeMs: number;
}

export interface AiSolverState {
  status: AiStatus;
  /** Current mouse position during the animation */
  position: Position;
  /** Every cell the algorithm has revealed so far (grows during explore phase) */
  exploredCells: ReadonlySet<string>;
  /** Full solution path cells, shown once the explore phase finishes */
  solvePath: ReadonlySet<string>;
  /** Steps taken in the path animation so far */
  stepIndex: number;
  totalSteps: number;
  /** Final stats — set when status becomes 'done' */
  stats: AiStats | null;
  solve: () => void;
  cancel: () => void;
}

export function useAiSolver(level: MazeLevel, algorithmId: AlgorithmId): AiSolverState {
  const [status,    setStatus]    = useState<AiStatus>('idle');
  const [position,  setPosition]  = useState<Position>(level.start);
  const [solvePath, setSolvePath] = useState<ReadonlySet<string>>(new Set());
  const [stepIndex, setStepIndex] = useState(0);
  const [totalSteps,setTotalSteps]= useState(0);
  const [stats,     setStats]     = useState<AiStats | null>(null);

  // The explored set is mutated in-place; exploredRev is incremented to
  // trigger re-renders so MazeGrid picks up the new entries.
  const exploredSetRef = useRef(new Set<string>());
  const [, incExplored] = useState(0);

  // Timeout handle for the recursive animation ticks.
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Snapshot refs — the animation closure reads these, never stale state.
  const exploredSnapRef = useRef<Position[]>([]);
  const pathSnapRef     = useRef<Position[]>([]);
  const exploreIdxRef   = useRef(0);
  const pathIdxRef      = useRef(1); // start at 1; mouse is already at path[0]
  const statsRef        = useRef<AiStats | null>(null);

  function clearTimer() {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  function resetState(newStart: Position) {
    clearTimer();
    exploredSetRef.current = new Set();
    incExplored(0);
    exploredSnapRef.current = [];
    pathSnapRef.current     = [];
    exploreIdxRef.current   = 0;
    pathIdxRef.current      = 1;
    statsRef.current        = null;
    setStatus('idle');
    setPosition(newStart);
    setSolvePath(new Set());
    setStepIndex(0);
    setTotalSteps(0);
    setStats(null);
  }

  // Reset everything when level or algorithm changes.
  useEffect(() => { resetState(level.start); }, [level, algorithmId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount.
  useEffect(() => () => clearTimer(), []);

  // ── Phase 2: mouse walks the path ──────────────────────────────────────────
  function startPathPhase() {
    pathIdxRef.current = 1;
    setStatus('pathing');

    function pathTick() {
      const idx  = pathIdxRef.current;
      const snap = pathSnapRef.current;

      if (idx >= snap.length) {
        setStatus('done');
        if (statsRef.current) setStats(statsRef.current);
        return;
      }

      setPosition(snap[idx]);
      setStepIndex(idx);
      pathIdxRef.current = idx + 1;
      timeoutRef.current = setTimeout(pathTick, PATH_MS);
    }

    pathTick();
  }

  // ── Phase 1: explored cells light up one by one ───────────────────────────
  function startExplorePhase() {
    exploreIdxRef.current = 0;
    setStatus('exploring');

    function exploreTick() {
      const idx      = exploreIdxRef.current;
      const explored = exploredSnapRef.current;

      if (idx >= explored.length) {
        // Exploration complete — reveal the solution path and switch phase.
        setSolvePath(new Set(pathSnapRef.current.map(p => `${p.row},${p.col}`)));
        setPosition(level.start);  // rewind mouse to start before path walk
        startPathPhase();
        return;
      }

      const cell = explored[idx];
      exploredSetRef.current.add(`${cell.row},${cell.col}`);
      incExplored(r => r + 1);
      exploreIdxRef.current = idx + 1;
      timeoutRef.current = setTimeout(exploreTick, EXPLORE_MS);
    }

    exploreTick();
  }

  const solve = useCallback(() => {
    clearTimer();
    exploredSetRef.current = new Set();

    const algo   = ALGORITHM_MAP[algorithmId];
    const result = algo.run(level.grid, level.start, level.end);

    if (result.path.length === 0) return; // no solution

    exploredSnapRef.current = result.explored;
    pathSnapRef.current     = result.path;
    exploreIdxRef.current   = 0;
    pathIdxRef.current      = 1;

    const aiStats: AiStats = {
      exploredCount: result.explored.length,
      pathLength:    result.path.length - 1,
      timeMs:        result.timeMs,
    };
    statsRef.current = aiStats;

    setPosition(level.start);
    setSolvePath(new Set());
    setStepIndex(0);
    setTotalSteps(result.path.length - 1);
    setStats(null);
    incExplored(0);

    startExplorePhase();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, algorithmId]);

  const cancel = useCallback(() => {
    resetState(level.start);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  return {
    status,
    position,
    exploredCells: exploredSetRef.current as ReadonlySet<string>,
    solvePath,
    stepIndex,
    totalSteps,
    stats,
    solve,
    cancel,
  };
}
