import { useEffect } from 'react';

const MOVEMENT_KEYS = new Set([
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'w', 'a', 's', 'd', 'W', 'A', 'S', 'D',
]);

/**
 * How frequently to repeat movement while a direction key is held (ms).
 * Must be slightly LONGER than MOVE_TRANSITION_MS in MazeGrid.css so
 * each CSS transition finishes before the next move fires.
 */
const HOLD_INTERVAL_MS = 80;

export function useKeyboard(onKey: (key: string) => void) {
  useEffect(() => {
    let heldKey: string | null = null;
    let holdTimer: ReturnType<typeof setInterval> | null = null;

    function clearHold() {
      if (holdTimer !== null) { clearInterval(holdTimer); holdTimer = null; }
      heldKey = null;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (!MOVEMENT_KEYS.has(e.key)) return;
      e.preventDefault();
      // Ignore the browser's built-in key-repeat; we run our own interval
      // so we can control the exact repeat rate.
      if (e.repeat) return;

      // If a different key was already held, stop it first
      clearHold();
      heldKey = e.key;
      onKey(e.key); // immediate first move
      holdTimer = setInterval(() => {
        if (heldKey) onKey(heldKey);
      }, HOLD_INTERVAL_MS);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === heldKey) clearHold();
    };

    // Stop movement if window loses focus (prevents stuck keys)
    const onBlur = () => clearHold();

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup',   onKeyUp);
    window.addEventListener('blur',    onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup',   onKeyUp);
      window.removeEventListener('blur',    onBlur);
      clearHold();
    };
  }, [onKey]);
}
