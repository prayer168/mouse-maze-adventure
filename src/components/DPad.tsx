import './DPad.css';

interface Props {
  onMove: (key: string) => void;
}

/** Same repeat rate as useKeyboard so D-Pad running feels identical. */
const HOLD_MS = 80;

export function DPad({ onMove }: Props) {
  const makeHandlers = (key: string) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      onMove(key); // immediate first step

      // Hold to run — start repeating while pointer is down
      const id = setInterval(() => onMove(key), HOLD_MS);
      const stop = () => {
        clearInterval(id);
        window.removeEventListener('pointerup',     stop);
        window.removeEventListener('pointercancel', stop);
      };
      window.addEventListener('pointerup',     stop, { once: true });
      window.addEventListener('pointercancel', stop, { once: true });
    },
  });

  return (
    <div className="dpad" aria-label="方向控制">
      <button className="dpad-btn dpad-up"    {...makeHandlers('ArrowUp')}    aria-label="向上移動">▲</button>
      <div    className="dpad-middle">
        <button className="dpad-btn dpad-left"  {...makeHandlers('ArrowLeft')}  aria-label="向左移動">◀</button>
        <div    className="dpad-center" />
        <button className="dpad-btn dpad-right" {...makeHandlers('ArrowRight')} aria-label="向右移動">▶</button>
      </div>
      <button className="dpad-btn dpad-down"  {...makeHandlers('ArrowDown')}  aria-label="向下移動">▼</button>
    </div>
  );
}
