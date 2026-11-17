import demo from '../data/demo-answers.json' with { type: 'json' };
import type { AskRequest, AskResponse, Turn } from '../src/ask/types';

/**
 * Two caches so a busy free tier can't break a demo.
 *
 * 1. Saved demo answers (data/demo-answers.json): real answers made earlier by the same pipeline,
 *    for the questions in the demo script and the sample chips. They can't fail and come back instantly,
 *    with their read-aloud audio already made (public/demo-audio/).
 * 2. A small in-memory cache of live answers, so the same question asked twice in a row is instant.
 *    It resets when the server restarts.
 *
 * A saved answer is only used when the question is nearly the same AND has exactly the same numbers,
 * so "my mother is 67" never gets the answer meant for "my mother is 72".
 */

export interface SavedAnswer {
  /** The earlier question in the conversation, for follow-up answers like "67". Empty for a first question. */
  prev: string;
  question: string;
  response: AskResponse;
}

const saved = (demo as { answers: SavedAnswer[] }).answers;

/** Lowercase, no punctuation, single spaces. Works for Tamil and English. */
export function normalize(s: string): string {
  return s
    .normalize('NFC')
    .toLowerCase()
    .replace(/[\p{P}\p{S}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const digits = (s: string) => (s.match(/\d+/g) ?? []).join(',');

/** How alike two strings are, from 0 to 1 (Dice score over pairs of characters). */
function similarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;
  const pairs = (s: string) => {
    const m = new Map<string, number>();
    for (let i = 0; i < s.length - 1; i++) {
      const p = s.slice(i, i + 2);
      m.set(p, (m.get(p) ?? 0) + 1);
    }
    return m;
  };
  const pa = pairs(a);
  const pb = pairs(b);
  let overlap = 0;
  for (const [p, n] of pa) overlap += Math.min(n, pb.get(p) ?? 0);
  return (2 * overlap) / (a.length - 1 + (b.length - 1));
}

/** Words that don't change the meaning of a question, so they may differ between two matching questions. */
const FILLER = new Set(
  (
    'a an the my i im i\'m is am are can could will would please tell me do does any what which how get got ' +
    'she he her his they them their it old years year age aged now so and' +
    ' நான் எனக்கு என் என்னோட அவங்க அவங்களுக்கு அவருக்கு வயசு வயது வயசாகுது ஆகுது சொல்லுங்க ப்ளீஸ் ஆமா இருக்கு இருக்கா'
  ).split(' '),
);

const words = (s: string) => new Set(s.split(' ').filter(Boolean));

/**
 * Every word that is in one question but not the other must be filler, or a near spelling of a word
 * in the other question ("pension" / "pention"). "mother" vs "father" fails, so the answers never mix.
 */
function sameMeaning(a: string, b: string): boolean {
  const wa = words(a);
  const wb = words(b);
  const ok = (w: string, other: Set<string>) =>
    FILLER.has(w) || /^\d+$/.test(w) || [...other].some((o) => o.length > 3 && w.length > 3 && similarity(w, o) >= 0.8);
  for (const w of wa) if (!wb.has(w) && !ok(w, wb)) return false;
  for (const w of wb) if (!wa.has(w) && !ok(w, wa)) return false;
  return true;
}

function lastUserTurn(history: Turn[] | undefined): string {
  const users = (history ?? []).filter((t) => t.role === 'user');
  return users.length ? users[users.length - 1].text : '';
}

const FIRST_MATCH = 0.82;
const FOLLOW_PREV_MATCH = 0.82;

export function findSaved(req: AskRequest): AskResponse | null {
  const q = normalize(req.question);
  const prev = normalize(lastUserTurn(req.history));
  let best: { score: number; a: SavedAnswer } | null = null;

  for (const a of saved) {
    if (digits(normalize(a.question)) !== digits(q)) continue;
    const aPrev = normalize(a.prev);
    let score: number;
    if (!aPrev) {
      // A first question: only when there's no conversation before it.
      if (prev) continue;
      score = similarity(q, normalize(a.question));
      if (score < FIRST_MATCH || !sameMeaning(q, normalize(a.question))) continue;
    } else {
      // A follow-up: the earlier question must match closely; the reply can be short ("67", "she is 67").
      if (!prev || digits(aPrev) !== digits(prev) || similarity(prev, aPrev) < FOLLOW_PREV_MATCH || !sameMeaning(prev, aPrev)) continue;
      score = similarity(q, normalize(a.question));
      if (!sameMeaning(q, normalize(a.question))) continue;
    }
    if (!best || score > best.score) best = { score, a };
  }
  return best ? { ...best.a.response, cached: 'saved' } : null;
}

// ---------- live answer cache ----------

const MAX_LIVE = 200;
const live = new Map<string, AskResponse>();

function liveKey(req: AskRequest): string {
  return `${normalize(lastUserTurn(req.history))}||${normalize(req.question)}`;
}

export function findLive(req: AskRequest): AskResponse | null {
  const hit = live.get(liveKey(req));
  return hit ? { ...hit, cached: 'recent' } : null;
}

export function remember(req: AskRequest, res: AskResponse): void {
  // Only keep answers that passed every check. Plain-fact fallbacks may be a one-off.
  if (res.fallback) return;
  const k = liveKey(req);
  live.delete(k);
  live.set(k, res);
  if (live.size > MAX_LIVE) live.delete(live.keys().next().value as string);
}
