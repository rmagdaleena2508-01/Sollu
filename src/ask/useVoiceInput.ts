import { useCallback, useEffect, useRef, useState } from 'react';
import type { Lang } from '../content';

/**
 * Voice in, with a fallback ladder:
 *   1. Record audio and send it to Sarvam (best for Tamil and mixed Tamil-English).
 *   2. If that fails or recording isn't possible, the browser's own speech recognition.
 *   3. If neither works, the caller shows the text box.
 */

export type MicState = 'idle' | 'recording' | 'unavailable';

const MAX_SECONDS = 28; // Sarvam's quick endpoint takes up to 30 seconds.

interface BrowserRecognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}

function browserRecognition(): (new () => BrowserRecognition) | null {
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as (new () => BrowserRecognition) | null;
}

function pickMime(): string | undefined {
  const options = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
  return options.find((m) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m));
}

interface Options {
  lang: Lang;
  /** Recorded audio for the server to transcribe. */
  onAudio: (audio: Blob, cutShort: boolean) => void;
  /** Text from the browser's own recognition (fallback). */
  onText: (text: string) => void;
  onError: (kind: 'blocked' | 'not_heard') => void;
}

export function useVoiceInput({ lang, onAudio, onText, onError }: Options) {
  const [state, setState] = useState<MicState>('idle');
  const [seconds, setSeconds] = useState(0);
  const [useBrowser, setUseBrowser] = useState(false);

  const recorder = useRef<MediaRecorder | null>(null);
  const recog = useRef<BrowserRecognition | null>(null);
  const tick = useRef<number | undefined>(undefined);
  const cb = useRef({ onAudio, onText, onError });
  cb.current = { onAudio, onText, onError };

  const canRecord = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && !!pickMime();
  const Recognition = typeof window !== 'undefined' ? browserRecognition() : null;
  const available = canRecord || !!Recognition;

  const clearTick = () => {
    window.clearInterval(tick.current);
    tick.current = undefined;
  };

  const stop = useCallback(() => {
    clearTick();
    if (recorder.current && recorder.current.state !== 'inactive') recorder.current.stop();
    recog.current?.stop();
  }, []);

  const startBrowser = useCallback(() => {
    if (!Recognition) {
      setState('unavailable');
      cb.current.onError('blocked');
      return;
    }
    const r = new Recognition();
    r.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
    r.interimResults = false;
    r.maxAlternatives = 1;
    let heard = false;
    r.onresult = (e) => {
      const text = Array.from(e.results).map((x) => x[0].transcript).join(' ').trim();
      if (text) {
        heard = true;
        cb.current.onText(text);
      }
    };
    r.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        heard = true; // reported below, not as "not heard"
        setState('unavailable');
        cb.current.onError('blocked');
      }
    };
    r.onend = () => {
      clearTick();
      recog.current = null;
      setState((s) => (s === 'unavailable' ? s : 'idle'));
      if (!heard) cb.current.onError('not_heard');
    };
    recog.current = r;
    setSeconds(0);
    setState('recording');
    tick.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    r.start();
  }, [Recognition, lang]);

  const start = useCallback(async () => {
    if (state === 'recording') return;
    if (useBrowser || !canRecord) return startBrowser();

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } });
    } catch {
      setState('unavailable');
      cb.current.onError('blocked');
      return;
    }
    const mimeType = pickMime();
    const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    const chunks: Blob[] = [];
    let cutShort = false;
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    rec.onstop = () => {
      clearTick();
      stream.getTracks().forEach((t) => t.stop());
      recorder.current = null;
      setState('idle');
      const blob = new Blob(chunks, { type: (rec.mimeType || mimeType || 'audio/webm').split(';')[0] });
      if (blob.size < 1200) cb.current.onError('not_heard');
      else cb.current.onAudio(blob, cutShort);
    };
    recorder.current = rec;
    setSeconds(0);
    setState('recording');
    rec.start();
    let elapsed = 0;
    tick.current = window.setInterval(() => {
      elapsed += 1;
      setSeconds(elapsed);
      if (elapsed >= MAX_SECONDS) {
        cutShort = true;
        stop();
      }
    }, 1000);
  }, [state, useBrowser, canRecord, startBrowser, stop]);

  // Stop the mic if the page goes away mid-recording.
  useEffect(() => () => {
    clearTick();
    recorder.current?.stream.getTracks().forEach((t) => t.stop());
    recog.current?.abort();
  }, []);

  return {
    state: available ? state : ('unavailable' as const),
    seconds,
    start,
    stop,
    /** After a server failure, use the browser's recognition next time (if it has one). */
    fallBackToBrowser: () => Recognition && setUseBrowser(true),
  };
}
