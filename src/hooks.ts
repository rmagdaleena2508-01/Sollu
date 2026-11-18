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
/**
 * Gentle "settle" for the landing page, instead of hard CSS scroll snapping.
 *
 * Every section is one screen tall. While the person scrolls, nothing interferes: wheel, trackpad and
 * finger keep their own momentum. Once scrolling stops, if the edge of a section is close in the
 * direction they were going, the page glides the rest of the way (about 0.45 s, easing out).
 * It never pulls back against the direction of the scroll, never moves while someone is reading
 * inside a section taller than the screen, and stops the moment they touch, click, type or scroll again.
 * With "reduce motion" on, it does nothing.
 */
export function useSoftSnap(selector: string, navHeight = 68) {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const REACH = 0.5; // glide only if the target is within half a screen
    const SETTLE_MS = 140; // wait this long after the last scroll event
    const DURATION = 450;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    let lastY = scrollY;
    let dir = 0;
    let timer = 0;
    let raf = 0;
    let gliding = false;

    const stop = () => {
      cancelAnimationFrame(raf);
      gliding = false;
    };

    const glide = (to: number) => {
      const from = scrollY;
      const dist = to - from;
      if (Math.abs(dist) < 2) return;
      const start = performance.now();
      gliding = true;
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / DURATION);
        window.scrollTo({ top: from + dist * ease(t), behavior: 'instant' });
        if (t < 1 && gliding) raf = requestAnimationFrame(step);
        else {
          gliding = false;
          lastY = scrollY; // the glide's own movement doesn't count as the person's direction
        }
      };
      raf = requestAnimationFrame(step);
    };

    const settle = () => {
      if (gliding || !dir) return;
      const vh = innerHeight;
      const y = scrollY;
      const maxY = document.documentElement.scrollHeight - vh;
      const tops = [...document.querySelectorAll<HTMLElement>(selector)].map((el) => {
        const top = el.getBoundingClientRect().top + y - navHeight;
        return { top, bottom: top + el.offsetHeight };
      });
      // Reading inside a section taller than the screen: leave it alone.
      if (tops.some((s) => s.bottom - s.top > vh - navHeight + 2 && y > s.top + 2 && y < s.bottom - (vh - navHeight) - 2)) return;
      const stops = [...tops.map((s) => s.top), maxY].map((t) => Math.max(0, Math.min(maxY, t)));
      const reach = vh * REACH;
      const ahead = stops.filter((t) => (dir > 0 ? t > y + 1 : t < y - 1) && Math.abs(t - y) <= reach);
      if (!ahead.length) return;
      glide(dir > 0 ? Math.min(...ahead) : Math.max(...ahead));
    };

    const onScroll = () => {
      if (gliding) return;
      const y = scrollY;
      if (y !== lastY) dir = y > lastY ? 1 : -1;
      lastY = y;
      clearTimeout(timer);
      timer = window.setTimeout(settle, SETTLE_MS);
    };
    // Any new input from the person wins over a glide in progress.
    const interrupt = () => {
      if (gliding) {
        stop();
        lastY = scrollY;
      }
    };

    addEventListener('scroll', onScroll, { passive: true });
    for (const ev of ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const) addEventListener(ev, interrupt, { passive: true });
    return () => {
      stop();
      clearTimeout(timer);
      removeEventListener('scroll', onScroll);
      for (const ev of ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const) removeEventListener(ev, interrupt);
    };
  }, [selector, navHeight]);
}

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
