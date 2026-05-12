import { useMemo } from 'react';
import './Confetti.css';

const COLORS = [
  '#ff4757', '#ff6b81',  // reds / pinks
  '#ffa502', '#ffd32a',  // oranges / yellows
  '#2ed573', '#7bed9f',  // greens
  '#1e90ff', '#74b9ff',  // blues
  '#a29bfe', '#6c5ce7',  // purples
  '#fd79a8', '#e84393',  // hot pinks
  '#ff9f43', '#ee5a24',  // warm oranges
];

// Three strip types — all elongated to look like real confetti paper
const STRIP_TYPES = [
  { wRange: [4,  7],  hRange: [28, 50] },  // long thin strips
  { wRange: [6,  10], hRange: [18, 35] },  // medium strips
  { wRange: [9,  14], hRange: [14, 24] },  // wider short strips
] as const;

interface Piece {
  id:         number;
  x:          number;   // left %
  color:      string;
  w:          number;   // px
  h:          number;   // px
  fallDelay:  number;   // s — when the piece starts falling
  fallDur:    number;   // s — how long it takes to reach the bottom
  sway:       number;   // px — horizontal wobble amplitude
  flipDur:    number;   // s — how fast the strip flips edge-on
  startRot:   number;   // deg — initial tilt angle
}

function rand(min: number, max: number) { return min + Math.random() * (max - min); }

function createPieces(n: number): Piece[] {
  return Array.from({ length: n }, (_, id) => {
    const t = STRIP_TYPES[id % STRIP_TYPES.length];
    return {
      id,
      x:         rand(0, 100),
      color:     COLORS[Math.floor(Math.random() * COLORS.length)],
      w:         rand(t.wRange[0], t.wRange[1]),
      h:         rand(t.hRange[0], t.hRange[1]),
      fallDelay: rand(0, 1.8),        // shorter delay → appear sooner
      fallDur:   rand(6.5, 11.0),   // slow fall → visible for longer
      sway:      rand(30, 70),
      flipDur:   rand(0.25, 0.65),  // fast flutter
      startRot:  rand(0, 180),
    };
  });
}

interface Props { active: boolean }

export function Confetti({ active }: Props) {
  const pieces = useMemo(() => createPieces(120), []);
  if (!active) return null;

  return (
    <div className="confetti-wrap" aria-hidden="true">
      {pieces.map(p => (
        // Outer div: controls position + falling path
        <div
          key={p.id}
          className="confetti-outer"
          style={{
            left:              `${p.x}%`,
            animationDelay:    `${p.fallDelay}s`,
            animationDuration: `${p.fallDur}s`,
            '--sw': `${p.sway}px`,
          } as React.CSSProperties}
        >
          {/* Inner div: the visible strip — flutters like a falling leaf */}
          <div
            className="confetti-inner"
            style={{
              width:             `${p.w}px`,
              height:            `${p.h}px`,
              background:        p.color,
              animationDuration: `${p.flipDur}s`,
              '--r0': `${p.startRot}deg`,
              '--r1': `${p.startRot + 160}deg`,
            } as React.CSSProperties}
          />
        </div>
      ))}
    </div>
  );
}
