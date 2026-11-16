import { useState } from 'react';
import type { FormEvent } from 'react';
import { faqs, features, roadmap, sourceRows } from '../content';
import { delay } from '../hooks';
import { Icon } from './Icon';

const featureDelays = ['0s', '.06s', '.12s'];

export function Features() {
  return (
    <section aria-labelledby="feat-h" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <h2 id="feat-h" className="h2-left feat-head reveal">
          Read <span className="inline-chip">3 lines</span> instead
          <br />
          <span className="muted">of 30 pages.</span>
        </h2>
        <div className="grid6">
          {features.map((f, i) => (
            <div className="feat reveal" key={f.title} style={i % 3 ? delay(featureDelays[i % 3]) : undefined}>
              <span className={`ico ${f.tone}`}><Icon name={f.icon} /></span>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const DEFAULT_FINE = 'Get a message when a new scheme fits you. We only send scheme alerts. Reply STOP any time.';

export function Trust() {
  const [phone, setPhone] = useState('');
  const [msg, setMsg] = useState(DEFAULT_FINE);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    setMsg(digits.length >= 10 ? 'Thanks. This is a preview, so nothing was sent or saved.' : 'Enter a 10-digit phone number.');
  };

  return (
    <section id="trust" aria-labelledby="trust-h" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="trust reveal">
          <div>
            <span className="label">Sources</span>
            <h2 id="trust-h" style={{ marginTop: 16 }}>Every answer shows where it came from.</h2>
            <p className="body">
              Sollu only answers from official sources: government orders, gazettes, scheme rules and Acts. Each answer
              names the document and the date we last checked it. When Sollu isn't sure, it says so and sends you to a
              real person.
            </p>
            <form className="alert-form" noValidate onSubmit={submit}>
              <label htmlFor="phone" className="sr">Phone number for scheme alerts</label>
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="Your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <button className="btn btn-dark" type="submit">Get alerts</button>
            </form>
            <p className="fine" aria-live="polite">{msg}</p>
          </div>
          <div style={{ position: 'relative', alignSelf: 'center' }}>
            <div className="src">
              {sourceRows.map(([k, v]) => (
                <div className="src-row" key={k}><span>{k}</span><b>{v}</b></div>
              ))}
              <div className="src-row">
                <span>Not sure?</span>
                <b style={{ color: 'var(--accent)' }}>Talk to a real office →</b>
              </div>
            </div>
          </div>
          <span className="tilt" aria-hidden="true">Source shown</span>
        </div>
      </div>
    </section>
  );
}

export function Roadmap() {
  return (
    <section aria-labelledby="road-h" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="intro reveal" style={{ marginBottom: 0 }}>
          <span className="label">Roadmap</span>
          <h2 id="road-h">Tamil Nadu first. All of India next.</h2>
          <p>We start where we can check every answer by hand. Then we grow one state at a time.</p>
        </div>
        <div className="road">
          {roadmap.map((r, i) => (
            <article key={r.title} className={`step${r.now ? ' now' : ''} reveal`} style={i ? delay('.08s') : undefined}>
              <span className="when"><i />{r.when}</span>
              <h3>{r.title}</h3>
              <ul>
                {r.items.map((it) => (
                  <li key={it}><Icon name="circle-check" />{it}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section aria-labelledby="faq-h" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="intro reveal">
          <span className="label">Questions</span>
          <h2 id="faq-h">Before you ask.</h2>
        </div>
        <div className="faq reveal">
          {faqs.map(([q, a]) => (
            <details key={q}>
              <summary>{q}<Icon name="plus" /></summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
