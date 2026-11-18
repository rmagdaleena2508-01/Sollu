import { useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode, RefObject } from 'react';
import { IconSprite, Icon } from '../components/Icon';
import { LangToggle } from '../components/Nav';
import { useLang } from '../hooks';
import { shortDate } from '../ask/copy';
import { checkCopy, communities, incomeValues, occupationOrder } from './copy';
import type { CheckRequest, CheckResponse, CheckResult, Occupation } from './types';
import './check.css';

const EMPTY: CheckRequest = { age: null, gender: null, occupations: [], income: null, community: null };
const STEPS = 5;

async function runCheck(req: CheckRequest): Promise<CheckResponse> {
  const res = await fetch('/api/check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(req) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as CheckResponse;
}

/** Which question asks for a missing fact, so "Answer: family income" can jump back to it. */
const STEP_FOR: Record<CheckResult['missing'][number], number> = { age: 0, gender: 1, income: 3, community: 4 };

export function CheckPage() {
  const [lang, setLang] = useLang();
  const t = checkCopy[lang];

  const [step, setStep] = useState(0); // 0..4 = questions, 5 = results
  const [answers, setAnswers] = useState<CheckRequest>(EMPTY);
  const [ageText, setAgeText] = useState('');
  const [result, setResult] = useState<CheckResponse | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const advance = useRef<number | undefined>(undefined);
  const firstRender = useRef(true);
  /** True when the person came back from the results to answer one missing question. */
  const [fromResults, setFromResults] = useState(false);

  useEffect(() => {
    document.title = lang === 'ta' ? 'சொல்லு — என்ன கிடைக்கும்னு பாருங்க' : 'Check what you can get — Sollu';
  }, [lang]);

  // Move keyboard and screen-reader focus to the new question, but not on first load.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
    window.scrollTo({ top: 0 });
  }, [step]);

  useEffect(() => () => window.clearTimeout(advance.current), []);

  const go = (n: number) => {
    window.clearTimeout(advance.current);
    setStep(n);
  };

  const finish = async (final: CheckRequest) => {
    setFromResults(false);
    setStep(5);
    setLoading(true);
    setError(false);
    try {
      setResult(await runCheck(final));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  /** Single-choice answers move on by themselves after a short pause, so a tap is enough. */
  const pick = (patch: Partial<CheckRequest>) => {
    const next = { ...answers, ...patch };
    setAnswers(next);
    window.clearTimeout(advance.current);
    advance.current = window.setTimeout(() => (step === 4 || fromResults ? void finish(next) : setStep(step + 1)), 260);
  };

  const toggleOcc = (o: Occupation) =>
    setAnswers((a) => ({ ...a, occupations: a.occupations.includes(o) ? a.occupations.filter((x) => x !== o) : [...a.occupations, o] }));

  const submitAge = (e: FormEvent) => {
    e.preventDefault();
    const n = Number(ageText);
    const next = { ...answers, age: ageText.trim() && Number.isFinite(n) && n >= 0 && n <= 120 ? Math.round(n) : null };
    setAnswers(next);
    if (fromResults) void finish(next);
    else go(1);
  };

  const restart = () => {
    setFromResults(false);
    setAnswers(EMPTY);
    setAgeText('');
    setResult(null);
    go(0);
  };

  const questionTitles = [t.q.age, t.q.gender, t.q.occ, t.q.income, t.q.community];

  return (
    <div className="check" lang={lang}>
      <IconSprite />
      <header className="ask-top">
        <a href="/" className="logo" aria-label="Sollu home">
          <img className="logo-mark" src="/sollu-icon-56.webp" width={28} height={28} alt="" />
          Sollu
        </a>
        <div className="ask-top-right">
          <a href="/ask" className="btn btn-ghost check-ask-link">
            <Icon name="mic" size={16} />
            <span>{t.askSollu}</span>
          </a>
          <LangToggle lang={lang} onLang={setLang} />
        </div>
      </header>

      <main className="check-main">
        {step < 5 ? (
          <section className="check-card" aria-labelledby="check-q">
            {step === 0 && (
              <div className="check-intro">
                <h1>{t.title}</h1>
                <p>{t.sub}</p>
              </div>
            )}
            <div className="check-progress" aria-hidden="true">
              <span style={{ transform: `scaleX(${(step + 1) / STEPS})` }} />
            </div>
            <p className="check-step tnum">{t.step(step + 1)}</p>
            <h2 id="check-q" ref={headingRef} tabIndex={-1}>{questionTitles[step]}</h2>

            {step === 0 && (
              <form className="check-age" onSubmit={submitAge}>
                <label className="sr" htmlFor="age">{t.q.age}</label>
                <input
                  id="age"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={3}
                  value={ageText}
                  onChange={(e) => setAgeText(e.target.value.replace(/\D/g, ''))}
                  placeholder={t.agePlaceholder}
                  aria-describedby="age-hint"
                  autoComplete="off"
                />
                <p id="age-hint" className="check-hint">{t.ageHint}</p>
                <div className="check-nav">
                  <button type="button" className="btn btn-ghost" onClick={() => { setAgeText(''); setAnswers((a) => ({ ...a, age: null })); go(1); }}>
                    {t.skip}
                  </button>
                  <button type="submit" className="btn btn-dark" disabled={!ageText.trim()}>{t.next}</button>
                </div>
              </form>
            )}

            {step === 1 && (
              <Choices
                name="gender"
                legend={t.q.gender}
                options={(['female', 'male', 'other'] as const).map((g) => ({ value: g, label: t.gender[g] }))}
                value={answers.gender}
                onPick={(g) => pick({ gender: g })}
                skip={{ label: t.skip, onSkip: () => pick({ gender: null }) }}
                back={{ label: t.back, onBack: () => go(0) }}
              />
            )}

            {step === 2 && (
              <fieldset className="check-options">
                <legend className="sr">{t.q.occ}</legend>
                {occupationOrder.map((o) => (
                  <label key={o} className={`check-opt multi${answers.occupations.includes(o) ? ' on' : ''}`}>
                    <input type="checkbox" checked={answers.occupations.includes(o)} onChange={() => toggleOcc(o)} />
                    <span className="check-tick" aria-hidden="true"><Icon name="check" size={14} /></span>
                    {t.occ[o]}
                  </label>
                ))}
                <div className="check-nav">
                  <button type="button" className="btn btn-ghost" onClick={() => go(1)}>{t.back}</button>
                  <button type="button" className="btn btn-dark" onClick={() => go(3)}>
                    {answers.occupations.length ? t.next : t.none}
                  </button>
                </div>
              </fieldset>
            )}

            {step === 3 && (
              <Choices
                name="income"
                legend={t.q.income}
                options={incomeValues.map((v, i) => ({ value: v, label: t.income[i] }))}
                value={answers.income}
                onPick={(v) => pick({ income: v })}
                skip={{ label: t.dontKnow, onSkip: () => pick({ income: null }) }}
                back={{ label: t.back, onBack: () => go(2) }}
              />
            )}

            {step === 4 && (
              <Choices
                name="community"
                legend={t.q.community}
                options={communities.map((c) => ({ value: c, label: t.community[c] }))}
                value={answers.community}
                onPick={(c) => pick({ community: c })}
                skip={{ label: t.dontKnow, onSkip: () => pick({ community: null }) }}
                back={{ label: t.back, onBack: () => go(3) }}
              />
            )}
          </section>
        ) : (
          <Results
            lang={lang}
            loading={loading}
            error={error}
            result={result}
            headingRef={headingRef}
            onRetry={() => void finish(answers)}
            onAnswer={(missing) => {
              setFromResults(true);
              go(STEP_FOR[missing]);
            }}
            onRestart={restart}
          />
        )}
      </main>
    </div>
  );
}

function Choices<V extends string | number>({
  name,
  legend,
  options,
  value,
  onPick,
  skip,
  back,
}: {
  name: string;
  legend: string;
  options: { value: V; label: string }[];
  value: V | null;
  onPick: (v: V) => void;
  skip: { label: string; onSkip: () => void };
  back: { label: string; onBack: () => void };
}) {
  return (
    <fieldset className="check-options">
      <legend className="sr">{legend}</legend>
      {options.map((o) => (
        <label key={String(o.value)} className={`check-opt${value === o.value ? ' on' : ''}`}>
          <input
            type="radio"
            name={name}
            checked={value === o.value}
            onChange={() => onPick(o.value)}
            // Tapping the answer that's already picked (after Back) fires no "change", so move on here too.
            onClick={() => value === o.value && onPick(o.value)}
          />
          {o.label}
        </label>
      ))}
      <div className="check-nav">
        <button type="button" className="btn btn-ghost" onClick={back.onBack}>{back.label}</button>
        <button type="button" className="btn btn-ghost" onClick={skip.onSkip}>{skip.label}</button>
      </div>
    </fieldset>
  );
}

function Results({
  lang,
  loading,
  error,
  result,
  headingRef,
  onRetry,
  onAnswer,
  onRestart,
}: {
  lang: 'en' | 'ta';
  loading: boolean;
  error: boolean;
  result: CheckResponse | null;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onRetry: () => void;
  onAnswer: (m: CheckResult['missing'][number]) => void;
  onRestart: () => void;
}) {
  const t = checkCopy[lang];
  const likely = result?.results.filter((r) => r.verdict === 'likely') ?? [];
  const need = result?.results.filter((r) => r.verdict === 'need_info') ?? [];
  const no = result?.results.filter((r) => r.verdict === 'no') ?? [];

  return (
    <section className="check-results" aria-labelledby="check-r" aria-busy={loading}>
      <h1 id="check-r" ref={headingRef} tabIndex={-1}>
        {loading ? '…' : error ? t.failed : likely.length ? t.resultsTitle(likely.length) : t.resultsNone}
      </h1>
      {result && <p className="check-results-sub">{t.resultsSub(result.checked)}</p>}
      {error && <button type="button" className="btn btn-dark" onClick={onRetry}>{t.next}</button>}

      {result && !likely.length && !need.length && (
        <p className="check-empty">
          {t.noneHint} <a href="/ask">{t.askSollu}</a>
        </p>
      )}

      {likely.length > 0 && (
        <>
          <h2 className="check-group">{t.likely}</h2>
          <ul className="check-list">{likely.map((r) => <ResultCard key={r.id} r={r} lang={lang} />)}</ul>
        </>
      )}

      {need.length > 0 && (
        <>
          <h2 className="check-group">{t.needInfo}</h2>
          <ul className="check-list">
            {need.map((r) => (
              <ResultCard key={r.id} r={r} lang={lang}>
                {r.missing.map((m) => (
                  <button key={m} type="button" className="check-answer" onClick={() => onAnswer(m)}>
                    {t.answer(t.missing[m])}
                    <Icon name="arrow" size={14} />
                  </button>
                ))}
              </ResultCard>
            ))}
          </ul>
        </>
      )}

      {no.length > 0 && (
        <details className="check-no">
          <summary>{t.noShow(no.length)}</summary>
          <ul className="check-list">
            {no.map((r) => (
              <ResultCard key={r.id} r={r} lang={lang} compact>
                <ul className="check-reasons" lang="en">{r.reasons.map((x) => <li key={x}>{x}</li>)}</ul>
              </ResultCard>
            ))}
          </ul>
        </details>
      )}

      {result && (
        <div className="check-nav end">
          <button type="button" className="btn btn-ghost" onClick={onRestart}>{t.again}</button>
          <a href="/ask" className="btn btn-dark"><Icon name="mic" size={16} />{t.askSollu}</a>
        </div>
      )}
    </section>
  );
}

function ResultCard({ r, lang, compact, children }: { r: CheckResult; lang: 'en' | 'ta'; compact?: boolean; children?: ReactNode }) {
  const t = checkCopy[lang];
  const pill = r.verdict === 'likely' ? t.likely : r.verdict === 'need_info' ? t.needInfo : t.no;
  return (
    <li className={`check-result is-${r.verdict}`}>
      <div className="check-result-head">
        <span className={`verdict v-${r.verdict}`}>{pill}</span>
      </div>
      <h3 lang={lang === 'ta' && r.nameTa ? 'ta' : 'en'}>{lang === 'ta' && r.nameTa ? r.nameTa : r.name}</h3>
      {!compact && <p className="check-benefit" lang="en">{r.benefit}</p>}
      {children}
      {!compact && r.alsoNeeded.length > 0 && (
        <div className="check-needs">
          <p>{t.needs}</p>
          <ul lang="en">{r.alsoNeeded.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
      )}
      {!compact && r.caution && <p className="check-caution"><Icon name="info" size={15} />{t.caution}</p>}
      {!compact && (
        <div className="check-result-foot">
          {r.source && (
            <a className="answer-source" href={r.source.url} target="_blank" rel="noreferrer">
              <span>{t.source}: {r.source.host}</span>
              <span className="tnum">· {shortDate(r.source.checked)}</span>
              <Icon name="external" size={13} />
            </a>
          )}
          <a className="check-ask" href={`/ask?q=${encodeURIComponent(t.askQuestion(r.name))}`}>
            {t.askAbout}
            <Icon name="arrow" size={14} />
          </a>
        </div>
      )}
    </li>
  );
}
