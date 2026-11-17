import demo from '../data/sollu-demo.json' with { type: 'json' };
import links from '../data/source-links.json' with { type: 'json' };
import type { SourceLink } from '../src/ask/types';

/** Only checked entries live in sollu-demo.json; held-back ones are already left out. */

export interface Eligibility {
  age_min: number | null;
  age_max: number | null;
  gender: 'female' | 'male' | 'any' | null;
  income_max_annual_inr: number | null;
  occupation: string[] | null;
  community: string[] | null;
  other: string[] | null;
}

interface Base {
  id: string;
  sources: string[];
  evidence: { field: string; source: string; quote: string }[];
  gaps: string[];
  review: { demo_use: 'ready' | 'caution' | 'hold'; note: string; reviewed_on: string };
}

export interface Scheme extends Base {
  type: 'scheme';
  name_en: string;
  name_ta: string | null;
  level: 'state' | 'central';
  department: string;
  audiences: string[];
  benefit: string;
  eligibility: Eligibility;
  documents: string[] | null;
  how_to_apply: string | null;
  where_to_apply: string | null;
  helpline: string | null;
}

export interface Right extends Base {
  type: 'right';
  topic: string;
  title_en: string;
  law: string;
  rule_plain: string;
  what_you_can_do: string[];
  where_to_get_help: string | null;
}

export interface Notice extends Base {
  type: 'notice';
  title: string;
  issued_by: string;
  date: string | null;
  says: string;
  what_to_do: string | null;
  by_when: string | null;
  if_not: string | null;
  who_it_affects: string;
}

export type Entry = Scheme | Right | Notice;

const d = demo as unknown as { schemes: Scheme[]; rights: Right[]; notices: Notice[] };

export const entries: Entry[] = [...d.schemes, ...d.rights, ...d.notices];
export const byId = new Map(entries.map((e) => [e.id, e]));

export function titleOf(e: Entry): string {
  if (e.type === 'scheme') return e.name_en;
  if (e.type === 'right') return e.title_en;
  return e.title;
}

const sourceIndex = links as Record<string, { url: string; fetched_at: string }>;

export function sourcesOf(e: Entry): SourceLink[] {
  return e.sources
    .map((id) => sourceIndex[id])
    .filter(Boolean)
    .map((s) => ({ url: s.url, host: new URL(s.url).hostname.replace(/^www\./, ''), checked: s.fetched_at }));
}

/** One line per entry, so the model can pick which ones a question is about. */
export function catalogue(): string {
  return entries
    .map((e) => {
      if (e.type === 'scheme') {
        return `${e.id} | scheme | ${e.name_en}${e.name_ta ? ` (${e.name_ta})` : ''} | for: ${e.audiences.join(', ')} | ${e.benefit.slice(0, 160)}`;
      }
      if (e.type === 'right') return `${e.id} | right | ${e.title_en} | topic: ${e.topic}`;
      return `${e.id} | notice | ${e.title} | ${e.says.slice(0, 140)}`;
    })
    .join('\n');
}

/** What the model may use to write an answer: facts and their quotes, nothing else. */
export function factsFor(e: Entry) {
  const { review, ...rest } = e as Entry & { verification?: unknown };
  delete (rest as { verification?: unknown }).verification;
  return { ...rest, reviewer_note: review.demo_use === 'caution' ? review.note : undefined };
}
