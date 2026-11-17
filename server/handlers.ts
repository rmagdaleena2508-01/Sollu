import type { AskLang, AskRequest } from '../src/ask/types';
import { answer } from './ask.js';
import { speak, transcribe } from './sarvam.js';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });

/**
 * A small per-address limit so a public demo can't burn through the free API keys.
 * It lives in memory, so it resets when the function restarts. Good enough for a demo, not for launch.
 */
const hits = new Map<string, number[]>();
function limited(req: Request, perMinute: number): boolean {
  const ip = (req.headers.get('x-forwarded-for') ?? 'local').split(',')[0].trim();
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > perMinute;
}

const isLang = (l: unknown): l is AskLang => l === 'ta' || l === 'en';

export async function handleAsk(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'Use POST' }, 405);
  if (limited(req, 20)) return json({ error: 'Too many questions. Please wait a minute.' }, 429);

  let body: AskRequest;
  try {
    body = (await req.json()) as AskRequest;
  } catch {
    return json({ error: 'Bad request' }, 400);
  }
  if (typeof body.question !== 'string' || !body.question.trim()) return json({ error: 'Ask a question' }, 400);
  if (!isLang(body.lang)) body.lang = 'en';

  try {
    return json(await answer(body));
  } catch (err) {
    console.error('ask failed', err);
    return json({ error: 'Sollu could not answer right now. Please try again.' }, 502);
  }
}

const MAX_AUDIO_BYTES = 3 * 1024 * 1024;

export async function handleStt(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'Use POST' }, 405);
  if (limited(req, 20)) return json({ error: 'Too many requests. Please wait a minute.' }, 429);

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

export async function handleTts(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'Use POST' }, 405);
  if (limited(req, 30)) return json({ error: 'Too many requests. Please wait a minute.' }, 429);

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
