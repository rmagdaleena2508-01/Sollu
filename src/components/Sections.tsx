import { faqs, features, roadmap, sourceRows } from '../content';
import { delay } from '../hooks';
import { Icon } from './Icon';

const featureDelays = ['0s', '.06s', '.12s'];

export function Features() {
  return (
    <section aria-labelledby="feat-h">
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

export function Trust() {

  return (
    <section id="trust" aria-labelledby="trust-h">
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
            <div className="trust-ctas">
              <a href="/ask" className="btn btn-dark">Ask Sollu</a>
              <a
                href="https://github.com/rmagdaleena2508-01/Sollu/blob/main/data/README.md"
                className="btn btn-ghost"
                target="_blank"
                rel="noreferrer"
              >
                See how we check
              </a>
            </div>
            <p className="fine">
              Today Sollu answers from 27 checked entries: 19 schemes, 5 rights and 3 notices. Every fact is quoted word
              for word from an official page.
            </p>
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
    <section id="roadmap" aria-labelledby="road-h">
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
    <section id="faq" aria-labelledby="faq-h">
      <div className="wrap">
        <div className="intro reveal">
          <span className="label">FAQs</span>
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
