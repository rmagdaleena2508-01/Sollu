import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { sampleQuestions } from '../content';
import { useBrowserLayoutEffect, useReducedMotion } from '../hooks';
import { Icon } from './Icon';

const n = sampleQuestions.length;

function cardStyle(offset: number, step: number): CSSProperties {
  const ab = Math.abs(offset);
  return {
    transform: `translateX(${offset * step}px) translateY(${ab * 14}px) rotate(${offset * 5}deg) scale(${1 - ab * 0.06})`,
    zIndex: 10 - ab,
    opacity: ab > 2 ? 0 : 1,
  };
}

export function SampleFan() {
  const reduce = useReducedMotion();
  const [front, setFront] = useState(2);
  const [auto, setAuto] = useState(!reduce);
  const [step, setStep] = useState(150);

  useBrowserLayoutEffect(() => {
    const onResize = () => setStep(Math.min(innerWidth, 1180) < 640 ? 46 : 150);
    onResize();
    addEventListener('resize', onResize);
    return () => removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!auto || reduce) return;
    const id = setInterval(() => setFront((f) => (f + 1) % n), 3800);
    return () => clearInterval(id);
  }, [auto, reduce]);

  const go = (d: number) => setFront((f) => (f + d + n) % n);

  return (
    <section className="see" aria-labelledby="see-h" style={{ paddingTop: 0, overflow: 'hidden' }}>
      <div className="wrap">
        <h2 id="see-h" className="reveal">See what <span className="inline-chip">Tamil Nadu</span> asks.</h2>
        <p className="see-sub reveal">Sample questions. Real ones come after the pilot.</p>
        <div className="fan" onPointerEnter={() => setAuto(false)}>
          {sampleQuestions.map((q, i) => {
            let o = i - front;
            if (o > n / 2) o -= n;
            if (o < -n / 2) o += n;
            return (
              <article key={q.en} className={o === 0 ? 'front' : undefined} style={cardStyle(o, step)} aria-hidden={o !== 0}>
                <div className="stars"><span><b>{q.tag}</b></span></div>
                <p className="qt">"{q.en}"</p>
                <p className="qta" lang="ta">{q.ta}</p>
                <div className="who">
                  <i style={{ background: q.color }}><Icon name={q.icon} /></i>
                  {q.topic} · Sample
                </div>
              </article>
            );
          })}
        </div>
        <div className="fan-ctrl">
          <button type="button" aria-label="Previous question" onClick={() => go(-1)}><Icon name="left" /></button>
          <button type="button" aria-label="Next question" onClick={() => go(1)}><Icon name="right" /></button>
        </div>
      </div>
    </section>
  );
}
