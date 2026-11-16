import { useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { footerCols, starterQuestion } from '../content';
import { delay, useTimeout } from '../hooks';
import { Icon } from './Icon';

const W = '#fff';

/** Hand-drawn SVG stickers, each with a white die-cut edge. */
const stickers: { x: number; y: number; w: number; r: number; art: ReactNode }[] = [
  {
    x: 4, y: 18, w: 120, r: -14,
    art: (
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="44" fill="#FF4B3A" stroke={W} strokeWidth="5" />
        <rect x="40" y="24" width="20" height="34" rx="10" fill={W} />
        <path d="M31 48a19 19 0 0 0 38 0M50 67v9" stroke={W} strokeWidth="5" fill="none" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    x: 27, y: 62, w: 96, r: 10,
    art: (
      <svg viewBox="0 0 100 100">
        <rect x="8" y="8" width="84" height="84" rx="22" fill="#FFC226" stroke={W} strokeWidth="5" />
        <text x="50" y="68" textAnchor="middle" fontFamily="Noto Sans Tamil, sans-serif" fontSize="50" fontWeight="600" fill="#3d2a00">அ</text>
      </svg>
    ),
  },
  {
    x: 48, y: 6, w: 104, r: 6,
    art: (
      <svg viewBox="0 0 100 110">
        <path d="M22 6h40l22 22v70a6 6 0 0 1-6 6H22a6 6 0 0 1-6-6V12a6 6 0 0 1 6-6z" fill={W} stroke="#2BA4F5" strokeWidth="5" />
        <path d="M30 40h40M30 54h40M30 68h24" stroke="#2BA4F5" strokeWidth="5" strokeLinecap="round" />
        <circle cx="74" cy="84" r="18" fill="#22B45A" stroke={W} strokeWidth="4" />
        <path d="m66 84 6 6 10-11" stroke={W} strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    x: 69, y: 56, w: 112, r: -8,
    art: (
      <svg viewBox="0 0 110 100">
        <path d="M55 6c27 0 48 17 48 39S82 84 55 84c-6 0-11-.8-16-2.3L14 94l6-20C11 66 7 56 7 45 7 23 28 6 55 6z" fill="#8A4FFF" stroke={W} strokeWidth="5" />
        <text x="55" y="60" textAnchor="middle" fontFamily="Instrument Sans, sans-serif" fontSize="42" fontWeight="700" fill={W}>?</text>
      </svg>
    ),
  },
  {
    x: 86, y: 10, w: 110, r: 14,
    art: (
      <svg viewBox="0 0 100 100">
        <path d="M50 4l11 9 14-2 4 14 13 7-5 13 5 13-13 7-4 14-14-2-11 9-11-9-14 2-4-14-13-7 5-13-5-13 13-7 4-14 14 2z" fill="#F2479B" stroke={W} strokeWidth="4" />
        <text x="50" y="58" textAnchor="middle" fontFamily="Instrument Sans, sans-serif" fontSize="21" fontWeight="700" fill={W}>FREE</text>
      </svg>
    ),
  },
];

function Sticker({ x, y, w, r, art }: (typeof stickers)[number]) {
  const [pos, setPos] = useState({ dx: 0, dy: 0 });
  const [lifted, setLifted] = useState(false);
  const drag = useRef<{ id: number; sx: number; sy: number; ox: number; oy: number } | null>(null);

  const down = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (drag.current) return; // ignore a second finger mid-drag
    try {
      e.currentTarget.setPointerCapture(e.pointerId); // keep dragging even if the pointer leaves the sticker
    } catch {
      /* pointer already gone (e.g. synthetic events): drag still works without capture */
    }
    drag.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: pos.dx, oy: pos.dy };
    setLifted(true);
  };
  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    setPos({ dx: d.ox + e.clientX - d.sx, dy: d.oy + e.clientY - d.sy });
  };
  const up = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (drag.current?.id !== e.pointerId) return;
    drag.current = null;
    setLifted(false);
  };

  return (
    <div
      className="stk"
      style={{
        width: `clamp(${w * 0.55}px, ${w / 14}vw, ${w}px)`,
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(${pos.dx}px,${pos.dy}px) rotate(${r}deg)`,
        zIndex: lifted ? 5 : 2,
      }}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
    >
      {art}
    </div>
  );
}

function CopyChip() {
  const [done, setDone] = useState(false);
  const later = useTimeout();
  return (
    <button
      type="button"
      className={`copy${done ? ' done' : ''}`}
      aria-label="Copy a starter question"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(starterQuestion);
        } catch {
          /* clipboard blocked: still show the tick so the click feels heard */
        }
        setDone(true);
        later(() => setDone(false), 1600);
      }}
    >
      "{starterQuestion}"
      <span className="ic" aria-hidden="true">
        <Icon name="copy" className="cp" />
        <Icon name="check" className="ok" />
      </span>
    </button>
  );
}

export function FinalCta() {
  return (
    <section className="final" aria-labelledby="final-h">
      <svg className="deco l" viewBox="0 0 80 80" aria-hidden="true">
        <path d="M40 6c19 0 34 13 34 30S59 66 40 66c-4 0-8-.6-11.6-1.7L12 74l4-15C10 53 6 45 6 36 6 19 21 6 40 6z" fill="#FF4B3A" stroke="#fff" strokeWidth="4" />
        <circle cx="29" cy="36" r="4" fill="#fff" />
        <circle cx="51" cy="36" r="4" fill="#fff" />
        <path d="M31 47c5 4 13 4 18 0" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      </svg>
      <svg className="deco r" viewBox="0 0 80 80" aria-hidden="true">
        <circle cx="40" cy="40" r="32" fill="#C9F27A" stroke="#fff" strokeWidth="4" />
        <path d="m25 41 10 10 21-22" stroke="#1d3a0a" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="wrap">
        <h2 id="final-h" className="reveal">Ready to know what's yours?</h2>
        <div className="ctas reveal" style={delay('.1s')}>
          <a href="#ask" className="btn btn-dark btn-lg">Ask Sollu<Icon name="arrow" size={18} /></a>
          <CopyChip />
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer>
      <div className="wrap f-top">
        <div className="f-brand">
          <h3>
            Ask it.<br />Know it.
            <svg viewBox="0 0 80 80" aria-hidden="true">
              <circle cx="40" cy="40" r="32" fill="#C9F27A" stroke="#1d3a0a" strokeWidth="4" />
              <path d="m25 41 10 10 21-22" stroke="#1d3a0a" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </h3>
          <small>© 2026 Sollu. Made in Tamil Nadu.<br />Sollu explains rules. It is not legal advice.</small>
        </div>
        <div className="f-cols">
          {footerCols.map((c) => (
            <div key={c.title}>
              <h4>{c.title}</h4>
              {c.links.map(([label, href]) => <a key={label} href={href}>{label}</a>)}
            </div>
          ))}
        </div>
      </div>
      <div className="wordmark">
        <span className="drag-hint" aria-hidden="true">Drag the stickers</span>
        <span className="word" aria-hidden="true">Sollu</span>
        {stickers.map((s, i) => <Sticker key={i} {...s} />)}
      </div>
    </footer>
  );
}
