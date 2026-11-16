import { useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Lang } from '../content';
import { Icon } from './Icon';

interface NavProps {
  lang: Lang;
  onLang: (l: Lang) => void;
}

const langs: { id: Lang; label: string; style?: CSSProperties }[] = [
  { id: 'en', label: 'EN' },
  { id: 'ta', label: 'தமிழ்', style: { fontFamily: "'Noto Sans Tamil',sans-serif" } },
];

export function Nav({ lang, onLang }: NavProps) {
  const btns = useRef<Record<Lang, HTMLButtonElement | null>>({ en: null, ta: null });
  const [thumb, setThumb] = useState<CSSProperties>({});

  useLayoutEffect(() => {
    const place = () => {
      const b = btns.current[lang];
      if (b) setThumb({ width: b.offsetWidth, transform: `translateX(${b.offsetLeft - 3}px)` });
    };
    place();
    document.fonts.ready.then(place);
    addEventListener('resize', place);
    return () => removeEventListener('resize', place);
  }, [lang]);

  return (
    <header className="nav">
      <div className="wrap">
        <a href="#top" className="logo" aria-label="Sollu home">
          <span className="logo-mark"><Icon name="chat" size={16} /></span>
          Sollu
        </a>
        <nav className="nav-links" aria-label="Main">
          <a href="#what">Schemes</a>
          <a href="#what">Notices</a>
          <a href="#people">Rights</a>
          <a href="#trust">How it works</a>
        </nav>
        <div className="nav-right">
          <div className="lang" role="group" aria-label="Language">
            <span className="thumb" aria-hidden="true" style={thumb} />
            {langs.map((l) => (
              <button
                key={l.id}
                ref={(el) => { btns.current[l.id] = el; }}
                type="button"
                aria-pressed={lang === l.id}
                style={l.style}
                onClick={() => onLang(l.id)}
              >
                {l.label}
              </button>
            ))}
          </div>
          <a href="#ask" className="btn btn-dark">Ask Sollu</a>
        </div>
      </div>
    </header>
  );
}
