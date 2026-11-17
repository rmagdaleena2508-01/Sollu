import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { IconSprite, Icon } from '../components/Icon';
import { LangToggle } from '../components/Nav';
import { useLang, useReducedMotion } from '../hooks';
import { ask, speech, transcribe } from './api';
import { AnswerCard } from './AnswerCard';
import { askSamples, copy } from './copy';
import type { AskResponse, Turn } from './types';
import { useVoiceInput } from './useVoiceInput';
import './ask.css';

type Entry =
  | { id: number; kind: 'user'; text: string }
  | { id: number; kind: 'answer'; res: AskResponse }
  | { id: number; kind: 'error'; text: string };

type Phase = 'idle' | 'hearing' | 'thinking';

let nextId = 1;

/** What Sollu said, as plain text, for history and for reading aloud. */
const spoken = (r: AskResponse) => [...r.lines, r.followUp].filter(Boolean).join(' ');

export function AskPage() {
  const [lang, setLang] = useLang();
  const t = copy[lang];
  const reduce = useReducedMotion();

  const [entries, setEntries] = useState<Entry[]>([]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [notice, setNotice] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [playing, setPlaying] = useState<number | null>(null);
  const [loadingAudio, setLoadingAudio] = useState<number | null>(null);
  /** True for a moment after voice fills the text box: it sends itself unless the person edits it. */
  const [autoSend, setAutoSend] = useState(false);

  const inFlight = useRef<AbortController | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const audioCache = useRef(new Map<number, string>());
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const micRef = useRef<HTMLButtonElement | null>(null);
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const entriesRef = useRef(entries);
  entriesRef.current = entries;

  const busy = phase !== 'idle';

  // ---------- audio out ----------
  const stopAudio = useCallback(() => {
    audio.current?.pause();
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    setPlaying(null);
  }, []);

  const browserSpeak = useCallback((id: number, text: string, l: 'ta' | 'en') => {
    if (!('speechSynthesis' in window)) return setPlaying(null);
    const u = new SpeechSynthesisUtterance(text);
    const v = speechSynthesis.getVoices().find((x) => x.lang.startsWith(l === 'ta' ? 'ta' : 'en-IN'));
    if (v) u.voice = v;
    u.lang = v?.lang ?? (l === 'ta' ? 'ta-IN' : 'en-IN');
    u.onend = u.onerror = () => setPlaying((p) => (p === id ? null : p));
    setPlaying(id);
    speechSynthesis.speak(u);
  }, []);

  const play = useCallback(
    async (id: number, res: AskResponse) => {
      if (playing === id) return stopAudio();
      stopAudio();
      const l = res.fallback ? 'en' : res.lang;
      const text = res.fallback ? res.lines.join(' ') : spoken(res);
      if (!audio.current) audio.current = new Audio();
      const el = audio.current;
      try {
        let url = audioCache.current.get(id);
        if (!url) {
          setLoadingAudio(id);
          url = URL.createObjectURL(await speech(text, l));
          audioCache.current.set(id, url);
        }
        el.src = url;
        el.onended = () => setPlaying((p) => (p === id ? null : p));
        setPlaying(id);
        await el.play();
      } catch {
        // Sarvam voice failed or autoplay was blocked: use the phone's own voice.
        browserSpeak(id, text, l);
      } finally {
        setLoadingAudio((x) => (x === id ? null : x));
      }
    },
    [playing, stopAudio, browserSpeak],
  );

  // ---------- asking ----------
  const send = useCallback(
    async (question: string) => {
      const q = question.trim();
      if (!q || busy) return;
      stopAudio();
      setNotice(null);
      setDraft('');
      setAutoSend(false);
      const history: Turn[] = entriesRef.current.flatMap((e): Turn[] =>
        e.kind === 'user' ? [{ role: 'user', text: e.text }] : e.kind === 'answer' ? [{ role: 'sollu', text: spoken(e.res) }] : [],
      );
      setEntries((x) => [...x, { id: nextId++, kind: 'user', text: q }]);
      setPhase('thinking');
      const ctrl = new AbortController();
      inFlight.current = ctrl;
      try {
        const res = await ask({ question: q, lang, history }, ctrl.signal);
        const id = nextId++;
        setEntries((x) => [...x, { id, kind: 'answer', res }]);
        setPhase('idle');
        void play(id, res);
      } catch (err) {
        if (ctrl.signal.aborted) return;
        setEntries((x) => [...x, { id: nextId++, kind: 'error', text: err instanceof Error && /Too many/.test(err.message) ? err.message : t.failed }]);
        setPhase('idle');
      }
    },
    [busy, lang, play, stopAudio, t.failed],
  );

  // ---------- voice in ----------
  // Spoken words go into the text box first, so people can see (and fix) what Sollu heard.
  // Then they send by themselves after a short pause, unless the person starts editing.
  const fillFromVoice = useCallback((text: string) => {
    setDraft(text);
    setAutoSend(true);
  }, []);

  const voice = useVoiceInput({
    lang,
    meterRef: micRef,
    onAudio: async (blob, cutShort) => {
      setPhase('hearing');
      setNotice(cutShort ? t.tooLong : null);
      try {
        const { transcript } = await transcribe(blob);
        setPhase('idle');
        if (transcript) fillFromVoice(transcript);
        else setNotice(t.notHeard);
      } catch {
        // The speech service itself failed (not the person): say so, and point to the text box.
        setPhase('idle');
        setNotice(t.voiceDown);
        inputRef.current?.focus();
      }
    },
    onText: (text, final) => {
      if (final) fillFromVoice(text);
      else setDraft(text);
    },
    onError: (kind) => {
      setNotice(kind === 'blocked' ? t.micBlocked : kind === 'no_voice' ? t.voiceDown : t.notHeard);
      if (kind !== 'not_heard') inputRef.current?.focus();
    },
  });

  useEffect(() => {
    if (!autoSend) return;
    const id = window.setTimeout(() => {
      setAutoSend(false);
      void send(draftRef.current);
    }, 2600);
    return () => window.clearTimeout(id);
  }, [autoSend, send]);

  const onMic = () => {
    if (voice.state === 'recording') return voice.stop();
    if (busy) return;
    stopAudio();
    setNotice(null);
    setAutoSend(false);
    void voice.start();
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(draft);
  };

  const reset = () => {
    inFlight.current?.abort();
    stopAudio();
    voice.stop();
    audioCache.current.forEach((u) => URL.revokeObjectURL(u));
    audioCache.current.clear();
    setEntries([]);
    setPhase('idle');
    setNotice(null);
    setAutoSend(false);
    setDraft('');
  };

  useEffect(() => {
    document.title = lang === 'ta' ? 'சொல்லு கிட்ட கேளுங்க' : 'Ask Sollu';
  }, [lang]);

  // Bring the newest turn into view. A long answer starts at its top, so people read it from the beginning.
  useEffect(() => {
    if (!entries.length) return;
    const last = entries[entries.length - 1];
    const behavior = reduce ? 'auto' : 'smooth';
    if (last.kind === 'answer') document.getElementById(`turn-${last.id}`)?.scrollIntoView({ behavior, block: 'start' });
    else endRef.current?.scrollIntoView({ behavior, block: 'end' });
  }, [entries, phase, reduce]);

  useEffect(() => () => {
    audio.current?.pause();
    audioCache.current.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  const recording = voice.state === 'recording';
  const micUnavailable = voice.state === 'unavailable';
  const status = recording
    ? `${t.listening} 0:${String(voice.seconds).padStart(2, '0')}`
    : phase === 'hearing'
      ? t.hearing
      : phase === 'thinking'
        ? t.thinking
        : t.tapToSpeak;

  const empty = entries.length === 0;

  const micButton = (
    <button
      ref={micRef}
      type="button"
      className={`mic${recording ? ' rec' : ''}${busy ? ' busy' : ''}`}
      onClick={onMic}
      disabled={micUnavailable || (busy && !recording)}
      aria-label={recording ? t.stop : t.tapToSpeak}
      aria-pressed={recording}
    >
      <span className="mic-ring" aria-hidden="true" />
      <Icon name={recording ? 'stop' : 'mic'} />
    </button>
  );

  return (
    <div className={`ask${empty ? ' is-empty' : ''}`} lang={lang}>
      <IconSprite />
      <header className="ask-top">
        <a href="/" className="logo" aria-label={`Sollu ${t.back}`}>
          <img className="logo-mark" src="/sollu-icon.png" width={28} height={28} alt="" />
          Sollu
        </a>
        <div className="ask-top-right">
          {!empty && (
            <button type="button" className="btn btn-ghost ask-new" onClick={reset}>
              <Icon name="plus" size={16} />
              <span>{t.newChat}</span>
            </button>
          )}
          <LangToggle lang={lang} onLang={setLang} />
        </div>
      </header>

      <main className="ask-main">
        {empty ? (
          <section className="ask-hero" aria-labelledby="ask-h">
            <h1 id="ask-h">{t.title}</h1>
            <p className="ask-sub">{t.sub}</p>
            <div className="ask-hero-mic">
              {micButton}
              <p className="mic-status" aria-live="polite">{micUnavailable ? t.micBlocked : status}</p>
            </div>
            <div className="ask-samples">
              <p className="ask-samples-label">{t.tryThese}</p>
              <div className="ask-chips">
                {askSamples.map((s) => (
                  <button key={s.en} type="button" className="ask-chip" onClick={() => void send(s[lang])} disabled={busy}>
                    {s[lang]}
                  </button>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <ol className="ask-thread">
            {entries.map((e) => (
              <li key={e.id} id={`turn-${e.id}`} className={`turn turn-${e.kind}`}>
                {e.kind === 'user' && <p className="bubble">{e.text}</p>}
                {e.kind === 'answer' && (
                  <AnswerCard
                    res={e.res}
                    uiLang={lang}
                    playing={playing === e.id}
                    loadingAudio={loadingAudio === e.id}
                    onPlay={() => void play(e.id, e.res)}
                  />
                )}
                {e.kind === 'error' && <p className="turn-error" role="alert">{e.text}</p>}
              </li>
            ))}
            {busy && (
              <li className="turn turn-wait" aria-live="polite">
                <span className="dots-wait" aria-hidden="true"><i /><i /><i /></span>
                {phase === 'hearing' ? t.hearing : t.thinking}
              </li>
            )}
            <div ref={endRef} />
          </ol>
        )}
      </main>

      <footer className="ask-dock">
        {!empty && recording && <p className="ask-notice live tnum" aria-live="polite">{status}</p>}
        {notice && <p className="ask-notice" role="status">{notice}</p>}
        {autoSend && (
          <div className="ask-autosend" role="status">
            <span className="ask-autosend-bar" aria-hidden="true" />
            <span>{t.autoSending}</span>
            <button type="button" onClick={() => { setAutoSend(false); inputRef.current?.focus(); }}>{t.edit}</button>
          </div>
        )}
        <div className="ask-dock-row">
          {!empty && micButton}
          <form className={`ask-form${autoSend ? ' heard' : ''}`} onSubmit={onSubmit}>
            <label className="sr" htmlFor="ask-input">{t.typeHere}</label>
            <textarea
              id="ask-input"
              ref={inputRef}
              rows={1}
              value={draft}
              onChange={(e) => { setAutoSend(false); setDraft(e.target.value); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  void send(draft);
                }
              }}
              placeholder={recording ? t.listening : t.typeHere}
              maxLength={500}
              autoComplete="off"
              enterKeyHint="send"
            />
            <button type="submit" className="ask-send" disabled={!draft.trim() || busy} aria-label={t.send}>
              <Icon name="send" size={18} />
            </button>
          </form>
        </div>
        <p className="ask-privacy">{t.privacy}</p>
      </footer>
    </div>
  );
}
