import type { Direction } from './MazeGrid';
import './MouseSprite.css';

interface Props {
  isRunning: boolean;
  direction: Direction;
  size:      number;
}

/**
 * 4-direction rotation map.
 * The SVG is drawn facing LEFT (the mouse's natural profile).
 *
 *   left  → no rotation (default)
 *   right → horizontal flip (scaleX -1)
 *   up    → rotate -90 °  (head points up, tail down)
 *   down  → rotate  90 °  (head points down, tail up)
 *
 * All rotations happen around the SVG's centre-point via
 * transform-origin: 50% 50% so the sprite stays inside its cell.
 */
const DIR_STYLE: Record<Direction, React.CSSProperties> = {
  left:  { transform: 'none'            },
  right: { transform: 'scaleX(-1)'      },
  up:    { transform: 'rotate(90deg)'   }, // tail points up   → head points down (running up head-first toward viewer)
  down:  { transform: 'rotate(-90deg)'  }, // tail points down → head points up   (mouse descends tail-first)
};

export function MouseSprite({ isRunning, direction, size }: Props) {
  const cls = ['mouse-svg', isRunning ? 'mouse-svg--run' : ''].filter(Boolean).join(' ');

  return (
    <svg
      className={cls}
      viewBox="-6 0 86 62"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{
        ...DIR_STYLE[direction],
        transformOrigin: '50% 50%',
        overflow: 'visible',
      }}
    >
      {/* ── Tail ───────────────────────────────────────────────── */}
      <path
        className="ms-tail"
        d="M 63 30 C 73 22, 78 14, 74 6"
        stroke="#b0a8c8" strokeWidth="3" fill="none"
        strokeLinecap="round"
      />

      {/* ── Drop shadow ────────────────────────────────────────── */}
      <ellipse cx="38" cy="55" rx="24" ry="3.5" fill="rgba(0,0,0,0.13)" />

      {/* ── Back legs ──────────────────────────────────────────── */}
      <g className="ms-legs-back">
        <ellipse cx="56" cy="44" rx="5.5" ry="8"   fill="#8888a8" />
        <ellipse cx="63" cy="43" rx="4.5" ry="7"   fill="#7878a0" />
        <ellipse cx="56" cy="52" rx="7.5" ry="3"   fill="#7070a0" />
        <ellipse cx="63" cy="51" rx="6.5" ry="2.8" fill="#6868a0" />
      </g>

      {/* ── Body ───────────────────────────────────────────────── */}
      <g className="ms-body">
        <ellipse cx="42" cy="30" rx="23" ry="15" fill="#b8b8d4" />
        <ellipse cx="36" cy="23" rx="11" ry="6.5" fill="rgba(255,255,255,0.20)" />
      </g>

      {/* ── Front legs ─────────────────────────────────────────── */}
      <g className="ms-legs-front">
        <ellipse cx="25" cy="44" rx="5"   ry="7.5" fill="#9898b8" />
        <ellipse cx="33" cy="45" rx="4.5" ry="6.5" fill="#8888a8" />
        <ellipse cx="24" cy="52" rx="7"   ry="2.8" fill="#8080b0" />
        <ellipse cx="32" cy="52" rx="6.5" ry="2.8" fill="#7878a8" />
      </g>

      {/* ── Head ───────────────────────────────────────────────── */}
      <circle cx="15" cy="24" r="15" fill="#c4c4e0" />
      <ellipse cx="11" cy="18" rx="6" ry="4" fill="rgba(255,255,255,0.22)" />

      {/* ── Ears ───────────────────────────────────────────────── */}
      <circle cx="8"  cy="10" r="9"   fill="#bcbcdc" />
      <circle cx="8"  cy="10" r="5.5" fill="#ffaac4" />
      <circle cx="19" cy="8"  r="7.5" fill="#bcbcdc" />
      <circle cx="19" cy="8"  r="4.5" fill="#ffaac4" />

      {/* ── Eye ────────────────────────────────────────────────── */}
      <circle cx="7"   cy="21" r="3.8" fill="#1a1a2e" />
      <circle cx="5.8" cy="19.8" r="1.4" fill="rgba(255,255,255,0.90)" />

      {/* ── Nose ───────────────────────────────────────────────── */}
      <ellipse cx="2" cy="27" rx="2.6" ry="2.1" fill="#ff9eb5" />

      {/* ── Whiskers ───────────────────────────────────────────── */}
      <line x1="-5" y1="24"   x2="2" y2="25.5" stroke="rgba(140,140,170,0.75)" strokeWidth="0.9" />
      <line x1="-5" y1="27"   x2="2" y2="27"   stroke="rgba(140,140,170,0.75)" strokeWidth="0.9" />
      <line x1="-5" y1="30"   x2="2" y2="28.5" stroke="rgba(140,140,170,0.75)" strokeWidth="0.9" />
    </svg>
  );
}
