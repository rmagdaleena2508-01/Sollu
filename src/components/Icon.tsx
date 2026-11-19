import type { CSSProperties } from 'react';

/** One SVG sprite for the whole page; icons recolour with `currentColor`. */
const stroke = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const symbols = {
  camera: <g {...stroke} strokeWidth={2}><path d="M4 8.5a2 2 0 0 1 2-2h2l1.5-2h5L16 6.5h2a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" /><circle cx="12" cy="13" r="3.5" /></g>,
  mic: <g {...stroke} strokeWidth={2}><rect x="9" y="2.5" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3.5" /></g>,
  doc: <g {...stroke} strokeWidth={2}><path d="M14 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8z" /><path d="M14 2.5V8h5.5M8.5 13h7M8.5 17h5" /></g>,
  chat: <g {...stroke} strokeWidth={2.2}><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.6A8 8 0 1 1 21 12z" /></g>,
  check: <g {...stroke} strokeWidth={2}><path d="m5 12.5 4.5 4.5L19 7.5" /></g>,
  'circle-check': <g {...stroke} strokeWidth={1.75}><circle cx="12" cy="12" r="9" /><path d="m8.5 12.3 2.4 2.4 4.6-4.9" /></g>,
  scale: <g {...stroke} strokeWidth={2}><path d="M12 3v18M7 21h10M5 7h14M5 7l-3 6a3 3 0 0 0 6 0zM19 7l-3 6a3 3 0 0 0 6 0z" /></g>,
  list: <g {...stroke} strokeWidth={2}><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" /></g>,
  pin: <g {...stroke} strokeWidth={2}><path d="M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></g>,
  play: <path fill="currentColor" d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z" />,
  down: <g {...stroke} strokeWidth={2}><path d="m6 9 6 6 6-6" /></g>,
  plus: <g {...stroke} strokeWidth={2}><path d="M12 5v14M5 12h14" /></g>,
  arrow: <g {...stroke} strokeWidth={2}><path d="M5 12h14M13 6l6 6-6 6" /></g>,
  left: <g {...stroke} strokeWidth={2}><path d="m15 6-6 6 6 6" /></g>,
  right: <g {...stroke} strokeWidth={2}><path d="m9 6 6 6-6 6" /></g>,
  copy: <g {...stroke} strokeWidth={2}><rect x="8" y="8" width="12" height="12" rx="2.5" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></g>,
  user: <g {...stroke} strokeWidth={2}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></g>,
  leaf: <g {...stroke} strokeWidth={2}><path d="M5 21c0-9 5-15 15-16-1 10-7 15-15 16zM5 21l7-7" /></g>,
  cap: <g {...stroke} strokeWidth={2}><path d="m2 9 10-5 10 5-10 5zM6 11v5c3 2.5 9 2.5 12 0v-5" /></g>,
  tool: <g {...stroke} strokeWidth={2}><path d="M14.7 6.3a4 4 0 0 0 5 5L21 13l-8 8-3-3 8-8M9.5 3.5l-6 6 3 3 6-6" /></g>,
  heart: <g {...stroke} strokeWidth={2}><path d="M12 20s-8-4.6-8-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 15.4 12 20 12 20z" /></g>,
  home: <g {...stroke} strokeWidth={2}><path d="M3 11 12 4l9 7M5 10v10h14V10" /></g>,
  'plus-cross': <g {...stroke} strokeWidth={2}><rect x="3.5" y="3.5" width="17" height="17" rx="4" /><path d="M12 8v8M8 12h8" /></g>,
  rupee: <g {...stroke} strokeWidth={2}><path d="M7 4h11M7 9h11M7 4c6 0 6 10 0 10h-1l8 7" /></g>,
  stop: <rect fill="currentColor" x="6" y="6" width="12" height="12" rx="2.5" />,
  send: <g {...stroke} strokeWidth={2.2}><path d="M12 19V5M6 11l6-6 6 6" /></g>,
  volume: <g {...stroke} strokeWidth={2}><path d="M11 5 6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /></g>,
  external: <g {...stroke} strokeWidth={2}><path d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" /></g>,
  info: <g {...stroke} strokeWidth={2}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></g>,
} as const;

export type IconName = keyof typeof symbols;

export function IconSprite() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        {(Object.keys(symbols) as IconName[]).map((name) => (
          <symbol key={name} id={`i-${name}`} viewBox="0 0 24 24">
            {symbols[name]}
          </symbol>
        ))}
      </defs>
    </svg>
  );
}

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
}

export function Icon({ name, size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} className={className} style={style} aria-hidden="true">
      <use href={`#i-${name}`} />
    </svg>
  );
}
