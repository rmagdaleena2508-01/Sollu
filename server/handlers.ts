import type { AskLang, AskRequest } from '../src/ask/types';
import { answer } from './ask.js';
import { check, cleanCheck } from './check.js';
import { geminiJson, GeminiBusyError } from './gemini.js';
import { speak, speakStream, transcribe } from './sarvam.js';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });

/**
 * A small per-address limit so a public demo can't burn through the free API keys.
 * It lives in memory, so it resets when the function restarts. Good enough for a demo, not for launch.
 */
const hits = new Map<string, number[]>();
function limited(req: Request, perMinute: number, bucket: string): boolean {
  const ip = (req.headers.get('x-forwarded-for') ?? 'local').split(',')[0].trim();
  const key = `${bucket}:${ip}`; // each endpoint counts on its own
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > perMinute;
}

const isLang = (l: unknown): l is AskLang => l === 'ta' || l === 'en';

export async function handleAsk(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'Use POST' }, 405);
  // Everyone on the same venue Wi-Fi shares one address, so this is set high enough for a room of judges.
  if (limited(req, 40, 'ask')) return json({ error: 'Too many questions. Please wait a minute.', code: 'busy' }, 429);

  let body: AskRequest & { fresh?: boolean };
  try {
    body = (await req.json()) as AskRequest;
  } catch {
    return json({ error: 'Bad request' }, 400);
  }
  if (typeof body.question !== 'string' || !body.question.trim()) return json({ error: 'Ask a question' }, 400);
  if (!isLang(body.lang)) body.lang = 'en';

  // Skipping the caches is only for making the saved answers on a developer's machine, never on Vercel.
  const fresh = body.fresh === true && !process.env.VERCEL;

  try {
    return json(await answer(body, { fresh }));
  } catch (err) {
    if (err instanceof GeminiBusyError) {
      console.warn('ask busy', err.message);
      return new Response(JSON.stringify({ error: 'busy', code: 'busy' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Retry-After': '30' },
      });
    }
    console.error('ask failed', err);
    return json({ error: 'Sollu could not answer right now. Please try again.' }, 502);
  }
}

const MAX_AUDIO_BYTES = 3 * 1024 * 1024;

export async function handleStt(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'Use POST' }, 405);
  if (limited(req, 20, 'stt')) return json({ error: 'Too many requests. Please wait a minute.' }, 429);

  const type = (req.headers.get('content-type') ?? 'audio/webm').split(';')[0];
  if (!type.startsWith('audio/') && type !== 'video/webm' && type !== 'video/mp4') {
    return json({ error: 'Send audio' }, 415);
  }
  const buf = await req.arrayBuffer();
  if (!buf.byteLength) return json({ error: 'No audio' }, 400);
  if (buf.byteLength > MAX_AUDIO_BYTES) return json({ error: 'Recording too long' }, 413);

  const ext = type.includes('mp4') || type.includes('m4a') ? 'm4a' : type.includes('ogg') ? 'ogg' : type.includes('wav') ? 'wav' : 'webm';
  try {
    return json(await transcribe(new Blob([buf], { type }), `question.${ext}`));
  } catch (err) {
    console.error('stt failed', err);
    return json({ error: 'Could not hear that' }, 502);
  }
}

/**
 * GET /api/tts?lang=ta&text=...: streams MP3 so an <audio> element can start playing in well under a second.
 * POST /api/tts {text, lang}: the whole MP3 at once (the backup if streaming fails).
 */
export async function handleTts(req: Request): Promise<Response> {
  if (req.method === 'GET') return handleTtsStream(req);
  if (req.method !== 'POST') return json({ error: 'Use GET or POST' }, 405);
  if (limited(req, 60, 'tts')) return json({ error: 'Too many requests. Please wait a minute.' }, 429);

  let body: { text?: unknown; lang?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return json({ error: 'Bad request' }, 400);
  }
  if (typeof body.text !== 'string' || !body.text.trim()) return json({ error: 'No text' }, 400);
  if (body.text.length > 1500) return json({ error: 'Text too long' }, 413);

  try {
    const mp3 = await speak(body.text, isLang(body.lang) ? body.lang : 'en');
    return new Response(mp3, { headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('tts failed', err);
    return json({ error: 'Could not make audio' }, 502);
  }
}

/**
 * GET /api/health: wakes the server up before a demo.
 * Plain call: confirms the server runs and both keys are set (no API calls, safe to hit often).
 * ?deep=1: also makes one tiny Gemini call and one tiny Sarvam call, and times them.
 */
export async function handleHealth(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const out: Record<string, unknown> = {
    ok: true,
    keys: { gemini: Boolean(process.env.GEMINI_API_KEY), sarvam: Boolean(process.env.SARVAM_API_KEY) },
  };
  if (url.searchParams.get('deep') === '1') {
    if (limited(req, 6, 'health')) return json({ error: 'Too many checks. Please wait a minute.' }, 429);
    const time = async (fn: () => Promise<unknown>) => {
      const t0 = Date.now();
      try {
        await fn();
        return { ok: true, ms: Date.now() - t0 };
      } catch (err) {
        return { ok: false, ms: Date.now() - t0, busy: err instanceof GeminiBusyError, error: err instanceof Error ? err.message.slice(0, 160) : 'error' };
      }
    };
    const [gemini, sarvam] = await Promise.all([
      time(() =>
        geminiJson({
          system: 'Reply with the JSON only.',
          input: 'Say ok.',
          schema: { type: 'object', properties: { ok: { type: 'boolean' } }, required: ['ok'] },
          maxOutputTokens: 200,
        }),
      ),
      time(() => speak('சரி', 'ta')),
    ]);
    out.gemini = gemini;
    out.sarvam = sarvam;
    out.ok = gemini.ok && sarvam.ok;
  }
  return json(out, out.ok ? 200 : 503);
}

async function handleTtsStream(req: Request): Promise<Response> {
  if (limited(req, 60, 'tts')) return json({ error: 'Too many requests. Please wait a minute.' }, 429);
  const url = new URL(req.url);
  const text = (url.searchParams.get('text') ?? '').trim();
  const lang = url.searchParams.get('lang');
  if (!text) return json({ error: 'No text' }, 400);
  if (text.length > 1500) return json({ error: 'Text too long' }, 413);
  try {
    const body = await speakStream(text, isLang(lang) ? lang : 'en');
    return new Response(body, {
      headers: {
        'Content-Type': 'audio/mpeg',
        // Answers can mention a person's age or family, so nothing is stored along the way.
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err) {
    console.error('tts stream failed', err);
    return json({ error: 'Could not make audio' }, 502);
  }
}

/** POST /api/check: the 5 answers from the Check page. Our rules only, no AI, so it's instant and free. */
export async function handleCheck(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'Use POST' }, 405);
  if (limited(req, 60, 'check')) return json({ error: 'Too many requests. Please wait a minute.' }, 429);
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Bad request' }, 400);
  }
  const clean = cleanCheck(body);
  if (!clean) return json({ error: 'Bad request' }, 400);
  return json(check(clean));
}
