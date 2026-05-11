import './DPad.css';

interface Props {
  onMove: (key: string) => void;
}

export function DPad({ onMove }: Props) {
  const press = (key: string) => (e: React.PointerEvent) => {
    e.preventDefault();
    onMove(key);
  };

  return (
    <div className="dpad" aria-label="方向控制">
      <button className="dpad-btn dpad-up"    onPointerDown={press('ArrowUp')}    aria-label="向上移動">▲</button>
      <div    className="dpad-middle">
        <button className="dpad-btn dpad-left"  onPointerDown={press('ArrowLeft')}  aria-label="向左移動">◀</button>
        <div    className="dpad-center" />
        <button className="dpad-btn dpad-right" onPointerDown={press('ArrowRight')} aria-label="向右移動">▶</button>
      </div>
      <button className="dpad-btn dpad-down"  onPointerDown={press('ArrowDown')}  aria-label="向下移動">▼</button>
    </div>
  );
}
