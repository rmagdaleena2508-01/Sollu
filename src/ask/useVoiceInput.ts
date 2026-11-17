import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type { Lang } from '../content';

/**
 * Voice in.
 *
 * Main path: record with MediaRecorder, watch the mic level with an AnalyserNode, stop by itself
 * when the person goes quiet, then send the audio to the server (Sarvam speech-to-text).
 * Backup: the browser's own speech recognition, only when the browser can't record at all.
 * Last resort: the caller shows the text box (it's always on screen).
 */

export type MicState = 'idle' | 'recording' | 'unavailable';
export type VoiceError = 'blocked' | 'not_heard' | 'no_voice';

const MAX_MS = 28_000; // Sarvam's quick endpoint takes up to 30 seconds.
const SILENCE_MS = 1_600; // stop this long after the person stops talking
const NO_SPEECH_MS = 8_000; // give up if nothing was said at all
const CALIBRATE_MS = 250; // measure the room's background noise first

interface BrowserRecognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal?: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}

function browserRecognition(): (new () => BrowserRecognition) | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as (new () => BrowserRecognition) | null;
}

function pickMime(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined;
  const options = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
  return options.find((m) => MediaRecorder.isTypeSupported(m));
}

interface Options {
  lang: Lang;
  /** Element that gets a live `--level` (0 to 1) CSS variable while recording. */
  meterRef: RefObject<HTMLElement | null>;
  /** Recorded audio for the server to transcribe. */
  onAudio: (audio: Blob, cutShort: boolean) => void;
  /** Words from the browser's own recognition (backup path). Interim words come with final = false. */
  onText: (text: string, final: boolean) => void;
  onError: (kind: VoiceError) => void;
}

interface Session {
  stream: MediaStream;
  recorder: MediaRecorder;
  ctx: AudioContext | null;
  raf: number;
  timer: number;
}

export function useVoiceInput({ lang, meterRef, onAudio, onText, onError }: Options) {
  const [state, setState] = useState<MicState>('idle');
  const [seconds, setSeconds] = useState(0);
  const [browserBroken, setBrowserBroken] = useState(false);

  const session = useRef<Session | null>(null);
  const recog = useRef<BrowserRecognition | null>(null);
  const cb = useRef({ onAudio, onText, onError });
  cb.current = { onAudio, onText, onError };

  const canRecord = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && !!pickMime();
  const Recognition = browserRecognition();
  const available = canRecord || (!!Recognition && !browserBroken);

  const setLevel = (v: number) => meterRef.current?.style.setProperty('--level', v.toFixed(3));

  const stop = useCallback(() => {
    const s = session.current;
    if (s && s.recorder.state !== 'inactive') s.recorder.stop();
    recog.current?.stop();
  }, []);

  // ---------- backup: the browser's own recognition ----------
  const startBrowser = useCallback(() => {
    if (!Recognition || browserBroken) {
      setState('unavailable');
      cb.current.onError('no_voice');
      return;
    }
    const r = new Recognition();
    r.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
    r.interimResults = true;
    r.maxAlternatives = 1;
    let finalText = '';
    let failed: VoiceError | null = null;
    r.onresult = (e) => {
      let interim = '';
      finalText = '';
      for (const res of Array.from(e.results)) {
        if (res.isFinal) finalText += res[0].transcript;
        else interim += res[0].transcript;
      }
      cb.current.onText((finalText + interim).trim(), false);
    };
    r.onerror = (e) => {
      // Brave and some phones have the API but no service behind it: "network" / "service-not-allowed".
      if (e.error === 'not-allowed') failed = 'blocked';
      else if (e.error === 'no-speech' || e.error === 'aborted') failed = 'not_heard';
      else {
        failed = 'no_voice';
        setBrowserBroken(true);
      }
    };
    r.onend = () => {
      window.clearInterval(session.current?.timer);
      recog.current = null;
      setState('idle');
      if (finalText.trim()) cb.current.onText(finalText.trim(), true);
      else cb.current.onError(failed ?? 'not_heard');
    };
    recog.current = r;
    setSeconds(0);
    setState('recording');
    r.start();
  }, [Recognition, browserBroken, lang]);

  // ---------- main path: record, watch the level, stop on silence ----------
  const start = useCallback(async () => {
    if (state === 'recording') return;
    if (!canRecord) return startBrowser();

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
    } catch (err) {
      const name = err instanceof DOMException ? err.name : '';
      setState(name === 'NotAllowedError' || name === 'SecurityError' ? 'unavailable' : 'idle');
      cb.current.onError(name === 'NotFoundError' ? 'no_voice' : 'blocked');
      return;
    }

    const mimeType = pickMime();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType, audioBitsPerSecond: 32_000 } : undefined);
    const chunks: Blob[] = [];
    const startedAt = performance.now();
    let heardSpeech = false;
    let lastLoud = startedAt;
    let noiseFloor = 0.004;
    let cutShort = false;
    const sess: Session = { stream, recorder, ctx: null, raf: 0, timer: 0 };
    session.current = sess;

    // The level meter and silence check. If AudioContext isn't available, recording still works;
    // the person taps again to stop.
    try {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AC) {
        const ctx = new AC();
        sess.ctx = ctx;
        void ctx.resume();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        ctx.createMediaStreamSource(stream).connect(analyser);
        const buf = new Float32Array(analyser.fftSize);
        let calib: number[] = [];
        const loop = () => {
          analyser.getFloatTimeDomainData(buf);
          let sum = 0;
          for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
          const rms = Math.sqrt(sum / buf.length);
          const now = performance.now();
          if (now - startedAt < CALIBRATE_MS) {
            calib.push(rms);
          } else if (calib.length) {
            noiseFloor = Math.max(0.004, calib.reduce((a, b) => a + b, 0) / calib.length);
            calib = [];
          }
          const threshold = Math.max(0.015, noiseFloor * 3);
          if (rms > threshold) {
            heardSpeech = true;
            lastLoud = now;
          }
          setLevel(Math.min(1, rms / 0.12));
          const elapsed = now - startedAt;
          if (heardSpeech && now - lastLoud > SILENCE_MS) return stop();
          if (!heardSpeech && elapsed > NO_SPEECH_MS) return stop();
          sess.raf = requestAnimationFrame(loop);
        };
        sess.raf = requestAnimationFrame(loop);
      } else {
        heardSpeech = true; // can't measure, so trust the recording
      }
    } catch {
      heardSpeech = true;
    }

    recorder.ondataavailable = (e) => {
      if (e.data.size) chunks.push(e.data);
    };
    recorder.onstop = () => {
      cancelAnimationFrame(sess.raf);
      window.clearInterval(sess.timer);
      void sess.ctx?.close();
      stream.getTracks().forEach((t) => t.stop());
      session.current = null;
      setLevel(0);
      setState('idle');
      const blob = new Blob(chunks, { type: (recorder.mimeType || mimeType || 'audio/webm').split(';')[0] });
      // Nothing was said: don't spend an API call on silence.
      if (!heardSpeech || blob.size < 1500) cb.current.onError('not_heard');
      else cb.current.onAudio(blob, cutShort);
    };

    sess.timer = window.setInterval(() => {
      const elapsed = performance.now() - startedAt;
      setSeconds(Math.floor(elapsed / 1000));
      if (elapsed >= MAX_MS) {
        cutShort = true;
        stop();
      }
    }, 250);

    setSeconds(0);
    setState('recording');
    recorder.start(250);
  }, [state, canRecord, startBrowser, stop]);

  // Let go of the mic if the page goes away mid-recording.
  useEffect(
    () => () => {
      const s = session.current;
      if (s) {
        cancelAnimationFrame(s.raf);
        window.clearInterval(s.timer);
        s.stream.getTracks().forEach((t) => t.stop());
        void s.ctx?.close();
        session.current = null;
      }
      recog.current?.abort();
    },
    [],
  );

  return {
    state: available ? state : ('unavailable' as const),
    seconds,
    start,
    stop,
  };
}
