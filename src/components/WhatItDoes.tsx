import { useMemo, useState } from 'react';
import audienceIndex from '../../data/audience-index.json';
import { fitTags, noticeAsk, noticeLines, schemeCircles } from '../content';
import type { FitKey } from '../content';
import { delay, useTimeout } from '../hooks';
import { Icon } from './Icon';

function CheckCard() {
  const [picked, setPicked] = useState<Set<FitKey>>(new Set());
  // Real counts from the checked data. A scheme for two picked groups counts once.
  const matches = useMemo(() => {
    const index = audienceIndex.audiences as Record<string, { id: string; name: string }[]>;
    const seen = new Map<string, string>();
    for (const t of fitTags) if (picked.has(t.key)) for (const a of t.audiences) for (const s of index[a] ?? []) seen.set(s.id, s.name);
    return [...seen.values()];
  }, [picked]);

  const toggle = (k: FitKey) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  return (
    <article className="card b1 reveal" id="ask">
      <span className="ico coral"><Icon name="check" /></span>
      <h3>Check what you can get.</h3>
      <p>Tell us a little about you. See every scheme you may fit, and why.</p>
      <div className="b1-tags" role="group" aria-label="Pick what fits you">
        {fitTags.map((t) => (
          <button key={t.key} type="button" aria-pressed={picked.has(t.key)} onClick={() => toggle(t.key)}>
            {t.label}
          </button>
        ))}
      </div>
      <p className="fit tnum" aria-live="polite">
        {picked.size ? (
          <><b>{matches.length} checked {matches.length === 1 ? 'scheme' : 'schemes'}</b> are for people like you. Ask Sollu which ones fit you.</>
        ) : (
          'Tap what fits you.'
        )}
      </p>
      <a href="/ask" className="btn btn-dark">Check now</a>
      <div className="circles" aria-hidden="true">
        {schemeCircles.map((c) => (
          <span key={c.icon} style={{ color: c.color }}><Icon name={c.icon} /></span>
        ))}
      </div>
    </article>
  );
}

function NoticeCard() {
  return (
    <article className="card reveal" style={delay('.08s')}>
      <span className="ico sky"><Icon name="doc" /></span>
      <h3>Explain a notice.</h3>
      <p>Pick a real government notice. Get it in 3 short lines.</p>
      <div className="notice">
        <div className="doc">
          <i aria-hidden="true" />
          <div style={{ flex: 1, display: 'grid', gap: 6 }}>
            <span>Gazette notice · Census of India 2027 · 6 Nov 2026</span>
            <div className="skel" style={{ width: '80%' }} />
          </div>
        </div>
        {noticeLines.map((l) => (
          <div className="line" key={l.tag}>
            <span className={`tag ${l.tone}`}>{l.tag}</span>
            <span>{l.text}</span>
          </div>
        ))}
      </div>
      <a href={`/ask?q=${encodeURIComponent(noticeAsk)}`} className="btn btn-dark" style={{ marginTop: 16 }}>
        Explain this notice
      </a>
    </article>
  );
}

/** 28 bars with fixed, varied heights so the waveform looks like speech. */
const bars = Array.from({ length: 28 }, (_, i) => ({
  height: `${20 + Math.abs(Math.sin(i * 1.7)) * 70}%`,
  animationDelay: `${(i * 37) % 400}ms`,
}));

function VoiceCard() {
  const [playing, setPlaying] = useState(false);
  const later = useTimeout();

  return (
    <article className={`card reveal${playing ? ' playing' : ''}`} style={delay('.16s')}>
      <span className="ico green"><Icon name="mic" /></span>
      <h3>Ask out loud.</h3>
      <p>Speak in Tamil or English. Hear the answer back.</p>
      <div className="voice">
        <button
          type="button"
          className="mic"
          aria-label="Play a sample voice question"
          onClick={() => {
            setPlaying(true);
            later(() => setPlaying(false), 2400);
          }}
        >
          <Icon name="mic" />
        </button>
        <div className="wave" aria-hidden="true">
          {bars.map((b, i) => <i key={i} style={b} />)}
        </div>
      </div>
      <p className="bubble" lang="ta">ரெண்டு மாசமா சம்பளம் வரல. என்ன பண்ணலாம்?</p>
      <span className="sample">Sample</span>
    </article>
  );
}

export function WhatItDoes() {
  return (
    <section id="what" aria-labelledby="what-h" style={{ paddingTop: 40 }}>
      <div className="wrap">
        <div className="intro reveal">
          <span className="label">What Sollu does</span>
          <h2 id="what-h">Government rules, said simply. In the words you use.</h2>
        </div>
        <div className="bento">
          <CheckCard />
          <NoticeCard />
          <VoiceCard />
        </div>
      </div>
    </section>
  );
}
