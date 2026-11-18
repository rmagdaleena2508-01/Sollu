import { useEffect, useRef, useState } from 'react';
import { hero, heroAudio, heroSpeech, stats } from '../content';
import type { Lang } from '../content';
import { delay, useSpeech } from '../hooks';
import { Icon } from './Icon';

/** "Kn◉w what's y◉urs." — icon blobs stand in for the o's, a hidden "o" keeps it readable. */
function HeadlineEn() {
  return (
    <span>
      <span className="nw">
        Kn<span className="blob pink" aria-hidden="true"><Icon name="mic" /></span><span className="sr">o</span>w
      </span>{' '}
      <span className="nw">what's</span>{' '}
      <span className="nw">
        y<span className="blob blue" aria-hidden="true"><Icon name="doc" /></span><span className="sr">o</span>urs.
      </span>
      <br />
      <em>
        In your{' '}
        <span className="nw">
          own<span className="chip-ico" aria-hidden="true"><Icon name="chat" /></span>words.
        </span>
      </em>
    </span>
  );
}

function HeadlineTa() {
  return (
    <span>
      <span className="ta" style={{ display: 'block' }}>
        உங்களுக்கு உரியதை தெரிஞ்சுக்கோங்க. <em>உங்க சொந்த வார்த்தையில.</em>
      </span>
    </span>
  );
}

/** The three-face sticker next to the pill. Drawn here as SVG, each face with a white die-cut edge. */
function FacesSticker() {
  const ink = '#1f1a17';
  const line = { fill: 'none', stroke: ink, strokeWidth: 4.5, strokeLinecap: 'round' } as const;
  return (
    <svg className="faces" viewBox="0 0 126 50" aria-hidden="true">
      {/* winking, like the Sollu icon */}
      <circle cx="25" cy="25" r="22" fill="#FF4B3A" stroke="#fff" strokeWidth="4" />
      <ellipse cx="17" cy="21" rx="3" ry="4.2" fill={ink} />
      <path {...line} d="M27 21.5q4.5-4 9 0" />
      <path {...line} d="M15 31q9 7 18 0" />
      {/* big smile */}
      <circle cx="63" cy="25" r="22" fill="#FFC226" stroke="#fff" strokeWidth="4" />
      <path {...line} d="M53 21q3.5-4 7 0M66 21q3.5-4 7 0" />
      <path {...line} d="M53 28q10 10 20 0" />
      {/* talking */}
      <circle cx="101" cy="25" r="22" fill="#2BA4F5" stroke="#fff" strokeWidth="4" />
      <circle cx="93" cy="21" r="3" fill={ink} />
      <circle cx="109" cy="21" r="3" fill={ink} />
      <ellipse cx="101" cy="32" rx="5" ry="4" fill={ink} />
    </svg>
  );
}

/** Plays Sollu's own recorded intro (Sarvam voice). Falls back to the phone's voice if the file can't play. */
function useIntro(lang: Lang) {
  const { speak, speaking: phoneSpeaking } = useSpeech();
  const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => () => audio.current?.pause(), []);

  const toggle = async () => {
    const el = (audio.current ??= new Audio());
    if (playing) {
      el.pause();
      el.currentTime = 0;
      setPlaying(false);
      return;
    }
    el.src = heroAudio[lang];
    el.onended = el.onpause = () => setPlaying(false);
    try {
      setPlaying(true);
      await el.play();
    } catch {
      setPlaying(false);
      speak(heroSpeech[lang], lang);
    }
  };

  return { toggle, speaking: playing || phoneSpeaking };
}

export function Hero({ lang }: { lang: Lang }) {
  const t = hero[lang];
  const { toggle, speaking } = useIntro(lang);

  return (
    <section className="hero" aria-labelledby="h1">
      <div className={`sticker${speaking ? ' speaking' : ''}`}>
        <span className="rings" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
        <button
          type="button"
          aria-label={speaking ? 'Stop' : 'Hear Sollu introduce itself'}
          aria-pressed={speaking}
          onClick={() => void toggle()}
        >
          Hear it
          <span className="play" aria-hidden="true"><Icon name="play" /></span>
        </button>
      </div>
      <div className="wrap">
        <div className="stats rise" style={delay('0s')}>
          {stats.map((s) => (
            <div className="stat" key={s.label}>
              <b className="tnum">{s.value}</b>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
        <div className="joined rise" style={delay('.04s')}>
          <FacesSticker />
          <span>{t.pill}</span>
        </div>
        <h1 id="h1" className="rise" style={delay('.08s')}>
          {lang === 'en' ? <HeadlineEn /> : <HeadlineTa />}
        </h1>
        <p className="hero-sub rise" style={delay('.12s')} lang={lang}>{t.sub}</p>
        <div className="ctas rise" style={delay('.16s')}>
          <a href="/ask" className="btn btn-dark btn-lg">
            <Icon name="mic" size={18} />
            <span>{t.cta1}</span>
          </a>
          <a href="/check" className="btn btn-ghost btn-lg">{t.cta2}</a>
        </div>
        <p className="micro rise" style={delay('.2s')}>{t.micro}</p>
      </div>
    </section>
  );
}
