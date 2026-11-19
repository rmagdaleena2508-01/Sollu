import { createHash } from 'node:crypto';
import saved from '../data/read-examples.json' with { type: 'json' };
import type { AnswerItem, AskLang, AskResponse, PhotoKind } from '../src/ask/types';
import { entries, sourcesOf, titleOf } from './data.js';
import type { Notice } from './data.js';
import { geminiJson } from './gemini.js';

/**
 * "Explain a notice from a photo".
 *
 * Gemini reads the photo and writes it out as text, then explains it in 3 short lines: what it says,
 * what to do, and by when. The explanation is only as good as the photo, so the page labels it
 * "read from your photo, not checked by Sollu". Two checks keep it honest:
 * - every number in the 3 lines must also appear in the text read from the photo;
 * - if the photo is one of the notices Sollu has already checked, we show that checked entry and its source.
 *
 * The photo is not saved anywhere. The Gemini call uses store:false.
 */

const notices = entries.filter((e): e is Notice => e.type === 'notice');

const READ_SCHEMA = {
  type: 'object',
  properties: {
    readable: { type: 'boolean' },
    kind: { type: 'string', enum: ['government', 'legal', 'other', 'not_a_notice'] },
    text: { type: 'string' },
    title: { type: 'string' },
    issued_by: { type: 'string' },
    date: { type: 'string' },
    lines: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 3 },
    match: { type: 'string', enum: [...notices.map((n) => n.id), 'none'] },
  },
  required: ['readable', 'kind', 'text', 'title', 'issued_by', 'date', 'lines', 'match'],
};

interface Read {
  readable: boolean;
  kind: PhotoKind | 'not_a_notice';
  text: string;
  title: string;
  issued_by: string;
  date: string;
  lines: string[];
  match: string;
}

function readSystem(lang: AskLang) {
  const language =
    lang === 'ta'
      ? 'Tamil. Use simple, polite, spoken Tamil (the way people talk in Tamil Nadu), not formal written Tamil. Write month names in Tamil (ஜனவரி, டிசம்பர்).'
      : 'simple English for someone who did not finish school.';
  return `You are Sollu. A person took a photo of a paper they got, such as a government notice, an order, a circular or a letter. You read it for them and explain it so it can be read aloud.

Return JSON:
- readable: false if the photo is too blurry, cut off or dark to read the main text. Then keep lines to one line asking for a clearer photo.
- kind: "government" (from a government office, court, police or public body), "legal" (a letter from a lawyer or a company, such as a legal notice), "other" (any other paper with text), or "not_a_notice" (a photo of something that is not a paper or document).
- text: the main text of the paper, written out as it is, in its own language. Up to 2500 characters. Copy numbers, dates and amounts exactly. Leave out signatures, stamps and decorations.
- title: a short name for the paper (under 12 words, in English). Empty if unknown.
- issued_by: who sent it, as printed. Empty if not printed.
- date: the date printed on it, as printed. Empty if none.
- lines: at most 3 short lines in ${language}
  1. What it says, in one or two short sentences.
  2. What the reader must do, if anything.
  3. By when: the dates or time limit that matter for what the reader must do. If there is none, say there is no date on it.
- match: the id from KNOWN NOTICES if the photo is clearly one of them (the same order, same number and date), else "none".

Rules for lines:
- Use ONLY what is printed on the paper. Never add facts, laws or advice from your own knowledge.
- Write every number in digits, never in words, and copy it exactly as printed ("Rs 5,000", "15 days"). Write dates with the month name ("31 January 2027", not "31.01.2027").
- Never repeat Aadhaar, phone, bank account, PAN or other ID numbers, or a private person's home address.
- Never take a side and never say who is right. Say what the paper claims ("The letter says...").
- No markdown, no bullets, no emoji.

KNOWN NOTICES (id | title | reference):
${notices.map((n) => `${n.id} | ${n.title} | ${(n as Notice & { reference_number?: string }).reference_number ?? ''}`).join('\n')}`;
}

const MESSAGES: Record<'unreadable' | 'notNotice' | 'legal', Record<AskLang, string>> = {
  unreadable: {
    en: "I couldn't read this photo clearly. Please take it again in good light, with the whole page flat and in the frame.",
    ta: 'இந்த போட்டோவ தெளிவா படிக்க முடியல. நல்ல வெளிச்சத்துல, முழு பக்கமும் தெரியற மாதிரி மறுபடியும் எடுங்க.',
  },
  notNotice: {
    en: "This doesn't look like a notice or a letter. Take a photo of the paper you want explained.",
    ta: 'இது ஒரு அறிவிப்பு அல்லது கடிதம் மாதிரி தெரியல. விளக்கணும்னு நினைக்கற காகிதத்தை போட்டோ எடுங்க.',
  },
  legal: {
    en: 'This is a letter from a lawyer or a company, not a government order. Sollu is not a lawyer. For advice, talk to a lawyer or the free legal aid office at your district court.',
    ta: 'இது வக்கீல் அல்லது ஒரு நிறுவனத்தோட கடிதம், அரசு உத்தரவு இல்ல. சொல்லு வக்கீல் இல்ல. ஆலோசனைக்கு ஒரு வக்கீல்கிட்ட, இல்லன்னா மாவட்ட நீதிமன்றத்துல இருக்கற இலவச சட்ட உதவி மையத்துல பேசுங்க.',
  },
};

const NUMBERS_NOTE: Record<AskLang, string> = {
  en: "Some numbers in this answer don't match what I read from the photo. Please check them on the paper.",
  ta: 'இந்த பதில்ல இருக்கற சில எண்கள் போட்டோவுல படிச்சதோட பொருந்தல. காகிதத்துல ஒரு தடவை பாருங்க.',
};

/** Numbers as plain digit groups: "Rs 1,000" → 1000, "31.01.2027" → 31, 1, 2027, "05" → 5. */
const numberSet = (s: string) => new Set((s.replace(/(\d),(?=\d)/g, '$1').match(/\d+/g) ?? []).map((n) => String(Number(n))));

/** Numbers in the explanation that were not read from the photo. Small counts like "3" or "1" are ignored. */
export function unreadNumbers(lines: string[], photoText: string): string[] {
  const read = numberSet(photoText);
  return [...numberSet(lines.join(' '))].filter((n) => Number(n) > 10 && !read.has(n));
}

const words = (s: string) => s.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];

/**
 * The model's "match" is only trusted when the photo text really contains the checked notice's own words:
 * at least 2 of its quoted lines must be mostly (70%) there.
 */
function confirmMatch(id: string, photoText: string): Notice | undefined {
  const n = notices.find((x) => x.id === id);
  if (!n) return undefined;
  const have = new Set(words(photoText));
  const found = n.evidence.filter((e) => {
    const w = words(e.quote);
    return w.length >= 3 && w.filter((x) => have.has(x)).length / w.length >= 0.7;
  });
  return found.length >= 2 ? n : undefined;
}

const hash = (img: Uint8Array) => createHash('sha256').update(img).digest('hex');

/** Saved answers for the example photos on the Ask page (made by data/tools/read_examples.py). */
const examples = (saved as { examples: { sha256: string; lang: AskLang; response: AskResponse }[] }).examples;

export async function readPhoto(img: Uint8Array, mime: string, lang: AskLang, opts: { fresh?: boolean } = {}): Promise<AskResponse> {
  if (!opts.fresh) {
    const h = hash(img);
    const hit = examples.find((e) => e.sha256 === h && e.lang === lang);
    if (hit) return { ...hit.response, cached: 'saved' };
  }

  const r = await geminiJson<Read>({
    system: readSystem(lang),
    input: [
      { type: 'image', data: Buffer.from(img).toString('base64'), mime_type: mime },
      { type: 'text', text: 'Read this paper and return the JSON.' },
    ],
    schema: READ_SCHEMA,
    maxOutputTokens: 2500,
    hedgeAfterMs: 9000,
    perModelTimeoutMs: 30000,
  });

  if (!r.readable) return { kind: 'not_sure', lang, lines: [MESSAGES.unreadable[lang]], items: [], photo: { kind: 'other' } };
  if (r.kind === 'not_a_notice') return { kind: 'not_sure', lang, lines: [MESSAGES.notNotice[lang]], items: [], photo: { kind: 'other' } };

  const lines = (r.lines ?? []).map((l) => l.trim()).filter(Boolean).slice(0, 3);
  const text = r.text ?? '';
  const off = unreadNumbers(lines, text);
  if (off.length) console.warn('photo answer numbers not in the photo text:', off.join(', '));

  const match = r.match && r.match !== 'none' ? confirmMatch(r.match, text) : undefined;
  const items: AnswerItem[] = match ? [{ id: match.id, type: 'notice', title: titleOf(match), sources: sourcesOf(match) }] : [];

  return {
    kind: 'answer',
    lang,
    lines,
    items,
    cautionNote: [r.kind === 'legal' ? MESSAGES.legal[lang] : '', off.length ? NUMBERS_NOTE[lang] : ''].filter(Boolean).join(' ') || undefined,
    photo: {
      kind: r.kind,
      title: r.title?.trim() || undefined,
      from: r.issued_by?.trim() || undefined,
      date: r.date?.trim() || undefined,
      checked: Boolean(match),
      numbersOff: off.length > 0 || undefined,
    },
  };
}
