import { useEffect } from 'react';

const MOVEMENT_KEYS = new Set([
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'w', 'a', 's', 'd', 'W', 'A', 'S', 'D',
]);

/**
 * Minimum milliseconds between repeated moves while a key is held.
 * Using requestAnimationFrame instead of setInterval means this fires
 * in sync with the browser's paint loop → no timing drift, no stutter.
 */
const HOLD_INTERVAL_MS = 75;

export function useKeyboard(onKey: (key: string) => void) {
  useEffect(() => {
    let heldKey:  string | null = null;
    let rafId:    number        = 0;
    let lastFire: number        = 0;

    function clearHold() {
      cancelAnimationFrame(rafId);
      rafId    = 0;
      heldKey  = null;
      lastFire = 0;
    }

    // rAF loop — fires onKey only when HOLD_INTERVAL_MS has elapsed.
    // Because it runs inside requestAnimationFrame it is naturally
    // synchronised with CSS transitions → no gap, no stutter.
    function loop(now: number) {
      if (!heldKey) return;
      if (now - lastFire >= HOLD_INTERVAL_MS) {
        onKey(heldKey);
        lastFire = now;
      }
      rafId = requestAnimationFrame(loop);
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (!MOVEMENT_KEYS.has(e.key)) return;
      e.preventDefault();
      if (e.repeat) return;          // suppress browser auto-repeat

      clearHold();
      heldKey = e.key;
      onKey(e.key);                  // immediate first move
      lastFire = performance.now();
      rafId = requestAnimationFrame(loop);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === heldKey) clearHold();
    };

    const onBlur = () => clearHold(); // no stuck keys when tab loses focus

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
