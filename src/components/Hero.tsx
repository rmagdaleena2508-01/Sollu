import { hero, heroSpeech, stats } from '../content';
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

export function Hero({ lang }: { lang: Lang }) {
  const t = hero[lang];
  const { speak, speaking } = useSpeech();

  return (
    <section className="hero" aria-labelledby="h1">
      <div className={`sticker${speaking ? ' speaking' : ''}`}>
        <span className="rings" aria-hidden="true" />
        <button type="button" aria-label="Hear a sample answer read aloud" onClick={() => speak(heroSpeech[lang], lang)}>
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
        <div className="joined rise" style={delay('.08s')}>
          <span className="dots" aria-hidden="true">
            <i style={{ background: 'var(--pink)' }}>அ</i>
            <i style={{ background: 'var(--sky)' }}>A</i>
            <i style={{ background: 'var(--green)' }}><Icon name="check" size={10} /></i>
          </span>
          <span>{t.pill}</span>
        </div>
        <h1 id="h1" className="rise" style={delay('.16s')}>
          {lang === 'en' ? <HeadlineEn /> : <HeadlineTa />}
        </h1>
        <p className="hero-sub rise" style={delay('.26s')} lang={lang}>{t.sub}</p>
        <div className="ctas rise" style={delay('.36s')}>
          <a href="#ask" className="btn btn-dark btn-lg">
            <Icon name="mic" size={18} />
            <span>{t.cta1}</span>
          </a>
          <a href="#what" className="btn btn-ghost btn-lg">{t.cta2}</a>
        </div>
        <p className="micro rise" style={delay('.44s')}>{t.micro}</p>
      </div>
    </section>
  );
}
