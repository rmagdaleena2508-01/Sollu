import { useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { personas } from '../content';
import type { Persona } from '../content';
import { useReducedMotion, useTimeout } from '../hooks';
import { Icon } from './Icon';

function Answer({ title, body, defaultOpen }: { title: string; body: string; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="ans" data-open={open}>
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {title}
        <Icon name="down" />
      </button>
      <div className="body"><div><p>{body}</p></div></div>
    </div>
  );
}

function PanelContent({ p }: { p: Persona }) {
  return (
    <>
      <span className="av" style={{ background: p.color }}><Icon name={p.icon} /></span>
      <div>
        <p className="ta" lang="ta">{p.ta}</p>
        <p className="en">{p.en}</p>
      </div>
    </>
  );
}

export function Personas() {
  const reduce = useReducedMotion();
  const later = useTimeout();
  const [selected, setSelected] = useState(0);
  const [shown, setShown] = useState(0);
  const [swapping, setSwapping] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (i: number, focus = false) => {
    setSelected(i);
    if (focus) tabRefs.current[i]?.focus();
    if (reduce) return setShown(i);
    setSwapping(true);
    later(() => {
      setShown(i);
      setSwapping(false);
    }, 160);
  };

  const onKey = (e: KeyboardEvent) => {
    const n = personas.length;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); select((selected + 1) % n, true); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); select((selected - 1 + n) % n, true); }
  };

  const p = personas[shown];

  return (
    <section id="people" aria-labelledby="people-h" style={{ paddingTop: 0 }}>
      <div className="wrap personas">
        <div className="reveal">
          <span className="label">For every person</span>
          <h2 id="people-h" style={{ marginTop: 16 }}>Made for the people the rules are for.</h2>
          <div className="tabs" role="tablist" aria-label="Who are you?" onKeyDown={onKey}>
            {personas.map((x, i) => (
              <button
                key={x.id}
                ref={(el) => { tabRefs.current[i] = el; }}
                type="button"
                role="tab"
                id={`tab-${x.id}`}
                aria-selected={i === selected}
                aria-controls="panel"
                tabIndex={i === selected ? 0 : -1}
                onClick={() => select(i)}
              >
                <Icon name={x.icon} />
                {x.label}
              </button>
            ))}
          </div>
        </div>
        <div className="panel reveal" role="tabpanel" id="panel" aria-live="polite" aria-labelledby={`tab-${p.id}`}>
          <div className={`q swap${swapping ? ' out' : ''}`}><PanelContent p={p} /></div>
          <div className={`answers swap${swapping ? ' out' : ''}`}>
            {p.answers.map(([t, b], j) => (
              <Answer key={`${p.id}-${j}`} title={t} body={b} defaultOpen={j === 0} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
