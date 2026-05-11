import { useMemo } from 'react';
import './Confetti.css';

// ── Colour palette — bright & cheerful ───────────────────────
const COLORS = [
  '#ff4757', '#ff6b81',  // reds / pinks
  '#ffa502', '#ffd32a',  // oranges / yellows
  '#2ed573', '#7bed9f',  // greens
  '#1e90ff', '#74b9ff',  // blues
  '#a29bfe', '#6c5ce7',  // purples
  '#fd79a8', '#e84393',  // hot pinks
  '#ff9f43', '#ee5a24',  // warm oranges
];

type Shape = 'square' | 'circle' | 'ribbon';

interface Piece {
  id:       number;
  x:        number;   // % from left (0–100)
  color:    string;
  w:        number;   // px
  h:        number;   // px
  delay:    number;   // s
  dur:      number;   // s
  sway:     number;   // px horizontal wobble amplitude
  shape:    Shape;
}

function createPieces(n: number): Piece[] {
  return Array.from({ length: n }, (_, id) => {
    const shape  = (['square', 'circle', 'ribbon'] as Shape[])[id % 3];
    const base   = 7 + Math.random() * 7;
    return {
      id,
      x:     Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      w:     shape === 'ribbon' ? base * 0.35 : base,
      h:     shape === 'ribbon' ? base * 3.5  : base,
      delay: Math.random() * 2.8,
      dur:   3.2 + Math.random() * 2.0,
      sway:  28 + Math.random() * 55,
      shape,
    };
  });
}

interface Props {
  active: boolean;
}

export function Confetti({ active }: Props) {
  // Pieces are fixed for the lifetime of the component
  const pieces = useMemo(() => createPieces(100), []);

  if (!active) return null;

  return (
    <div className="confetti-wrap" aria-hidden="true">
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left:            `${p.x}%`,
            width:           `${p.w}px`,
            height:          `${p.h}px`,
            background:      p.color,
            borderRadius:    p.shape === 'circle' ? '50%' : '2px',
            animationDelay:  `${p.delay}s`,
            animationDuration:`${p.dur}s`,
            '--sw':          `${p.sway}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
