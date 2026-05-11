import { useEffect } from 'react';

const MOVEMENT_KEYS = new Set([
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'w', 'a', 's', 'd', 'W', 'A', 'S', 'D',
]);

export function useKeyboard(onKey: (key: string) => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!MOVEMENT_KEYS.has(e.key)) return;
      e.preventDefault(); // prevent page scroll on arrow keys
      onKey(e.key);
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onKey]);
}
