import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Lang } from './content';

/**
 * The pages are pre-rendered to HTML at build time, and the browser's first render must match that
 * HTML exactly. So anything that depends on the browser (saved language, motion setting, screen
 * width) starts from the build-time value and is corrected in a layout effect, before the first paint.
 */
export const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** Stagger delay for `.rise` / `.reveal` entrances: style={delay('.1s')} */
export const delay = (d: string) => ({ '--d': d }) as CSSProperties;

export function useReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useBrowserLayoutEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduce(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduce;
}

/**
 * Marks every `.reveal` element with `data-revealed` once it scrolls into view.
 * It's an attribute, not a class: React rewrites `className` whenever a component re-renders with a
 * different class (the "Ask out loud" card adds `playing` when its mic is tapped), and that wiped out a
 * class added from here, so the card faded back out. React leaves attributes it didn't set alone.
 */
export function useRevealAll() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.setAttribute('data-revealed', '');
            io.unobserve(e.target);
          }
        }),
      { rootMargin: '0px 0px -80px 0px' },
    );
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

const LANG_KEY = 'sollu-lang';

export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLangState] = useState<Lang>('en');
  useBrowserLayoutEffect(() => {
    try {
      if (localStorage.getItem(LANG_KEY) === 'ta') setLangState('ta');
    } catch {
      /* storage blocked: stay in English */
    }
  }, []);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {
      /* storage blocked: the language still switches for this visit */
    }
  }, []);
  return [lang, setLang];
}

/** Reads text aloud with the browser's own voice (Web Speech API). */
export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const speak = useCallback(
    (text: string, lang: Lang) => {
      if (!supported) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const voices = speechSynthesis.getVoices();
      const v =
        voices.find((x) => x.lang.startsWith(lang === 'ta' ? 'ta' : 'en-IN')) ??
        voices.find((x) => x.lang.startsWith('en'));
      if (v) {
        u.voice = v;
        u.lang = v.lang;
      }
      u.rate = 0.95;
      u.onstart = () => setSpeaking(true);
      u.onend = u.onerror = () => setSpeaking(false);
      speechSynthesis.speak(u);
    },
    [supported],
  );

  useEffect(() => () => {
    if (supported) speechSynthesis.cancel();
  }, [supported]);

  return { speak, speaking };
}

/** Clears a pending timeout on unmount. */
export function useTimeout() {
  const t = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(t.current), []);
  return useCallback((fn: () => void, ms: number) => {
    window.clearTimeout(t.current);
    t.current = window.setTimeout(fn, ms);
  }, []);
}
