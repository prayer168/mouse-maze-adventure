import { useState, useCallback, useEffect, useRef } from 'react';
import type { MazeLevel, Position } from '../types';

const KEY_TO_DELTA: Record<string, [number, number]> = {
  ArrowUp:    [-1,  0], ArrowDown:  [ 1,  0],
  ArrowLeft:  [ 0, -1], ArrowRight: [ 0,  1],
  w: [-1, 0], W: [-1, 0],
  s: [ 1, 0], S: [ 1, 0],
  a: [ 0,-1], A: [ 0,-1],
  d: [ 0, 1], D: [ 0, 1],
};

export function useGameState(level: MazeLevel) {
  const [position, setPosition] = useState<Position>(level.start);
  const [won,      setWon]      = useState(false);
  const [started,  setStarted]  = useState(false);
  const [steps,    setSteps]    = useState(0);
  const [elapsed,  setElapsed]  = useState(0);

  // positionRef tracks the current cell synchronously so `move` can read it
  // without needing the functional-updater form of setPosition.
  // This avoids nesting setState calls inside a setState updater, which
  // React StrictMode double-invokes in development (causing step counts to
  // double and win conditions to fire twice).
  const positionRef = useRef<Position>(level.start);
  const wonRef      = useRef(false);
  const startedRef  = useRef(false);

  // Reset everything when the level changes.
  useEffect(() => {
    positionRef.current = level.start;
    setPosition(level.start);
    setWon(false);     wonRef.current     = false;
    setStarted(false); startedRef.current = false;
    setSteps(0);
    setElapsed(0);
  }, [level]);

  // Timer ticks only after the first move and before winning.
  useEffect(() => {
    const id = setInterval(() => {
      if (startedRef.current && !wonRef.current) setElapsed(e => e + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [level]);

  const move = useCallback((key: string) => {
    if (wonRef.current) return;
    const delta = KEY_TO_DELTA[key];
    if (!delta) return;

    const { row, col } = positionRef.current;
    const nextRow = row + delta[0];
    const nextCol = col + delta[1];

    // Wall / boundary check — optional chaining handles out-of-bounds rows.
    // grid[-1] is undefined in JS so OOB access is naturally blocked.
    if (level.grid[nextRow]?.[nextCol] !== 0) return;

    // Start the timer on the very first move.
    if (!startedRef.current) {
      startedRef.current = true;
      setStarted(true);
    }

    // Update the ref first so the next synchronous call to move() sees the
    // correct position, then schedule the React state update.
    positionRef.current = { row: nextRow, col: nextCol };
    setPosition(positionRef.current);
    setSteps(s => s + 1);

    // Win condition — check after confirming the cell is walkable above.
    if (nextRow === level.end.row && nextCol === level.end.col) {
      wonRef.current = true;
      setWon(true);
    }
  }, [level]);

  const reset = useCallback(() => {
    positionRef.current = level.start;
    setPosition(level.start);
    setWon(false);     wonRef.current     = false;
    setStarted(false); startedRef.current = false;
    setSteps(0);
    setElapsed(0);
  }, [level]);

  return { position, won, started, steps, elapsed, move, reset };
}
