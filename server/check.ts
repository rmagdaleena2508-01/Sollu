import type { CheckRequest, CheckResponse, CheckResult, Occupation } from '../src/check/types';
import { entries, sourcesOf } from './data.js';
import type { Scheme } from './data.js';
import { checkScheme } from './eligibility.js';

/**
 * The Check feature: 5 answers in, every checked scheme that may fit out.
 * No AI here. Our own rules (server/eligibility.ts) decide, the same ones the Ask page uses.
 */

const OCCUPATION_AUDIENCE: Partial<Record<Occupation, string>> = {
  school: 'school_students',
  college: 'college_students',
  farmer: 'farmers',
  worker: 'workers',
};

/**
 * Schemes that only make sense for one situation, which the checked data can't express as a rule
 * (it has no age limit for maternity help, and no marital-status field). Shown only when that answer is picked.
 */
const ONLY_IF: Record<string, Occupation> = {
  'sw-maternity-benefit': 'mother',
  'sw-widow-pension': 'widow',
};

/** Groups that come from what the person does. "women" and "seniors" come from gender and age. */
const SPECIFIC = new Set(['school_students', 'college_students', 'farmers', 'workers']);

const schemes = entries.filter((e): e is Scheme => e.type === 'scheme');

/** How many of our rules a scheme has (age, income, community, gender, a picked situation). */
const strength = new Map(
  schemes.map((s) => {
    const e = s.eligibility;
    const n =
      2 * Number(e.age_min != null || e.age_max != null) + // an age match is the most specific
      Number(e.income_max_annual_inr != null) +
      Number(!!e.community?.length) +
      Number(e.gender === 'female' || e.gender === 'male') +
      Number(s.id in ONLY_IF) +
      Number(s.audiences.some((a) => SPECIFIC.has(a)));
    return [s.id, n];
  }),
);

/** Which groups the answers put this person in. */
function audiencesFor(req: CheckRequest): Set<string> {
  const a = new Set(req.occupations.map((o) => OCCUPATION_AUDIENCE[o]).filter((x): x is string => Boolean(x)));
  if (req.age != null && req.age >= 60) a.add('seniors');
  if (req.gender === 'female') a.add('women');
  return a;
}

const firstSentence = (s: string) => (s.match(/^.*?[.!?](\s|$)/)?.[0] ?? s).trim();

export function check(req: CheckRequest): CheckResponse {
  const groups = audiencesFor(req);
  const results: CheckResult[] = [];

  for (const s of schemes) {
    // Only schemes meant for at least one of this person's groups.
    // A scheme for students, farmers or workers needs that answer. Being a woman or 60+ alone isn't enough
    // (Pudhumai Penn is for women, but only those in college).
    const specific = s.audiences.filter((a) => SPECIFIC.has(a));
    if (specific.length ? !specific.some((a) => groups.has(a)) : !s.audiences.some((a) => groups.has(a))) continue;
    const only = ONLY_IF[s.id];
    if (only && !req.occupations.includes(only)) continue;
    const c = checkScheme(s, {
      age: req.age,
      gender: req.gender,
      annual_income_inr: req.income,
      community: req.community,
    });
    results.push({
      id: s.id,
      name: s.name_en,
      nameTa: s.name_ta,
      verdict: c.verdict,
      benefit: firstSentence(s.benefit),
      alsoNeeded: (s.eligibility.other ?? []).slice(0, 2),
      reasons: c.reasons,
      missing: c.missing,
      caution: s.review.demo_use === 'caution',
      source: sourcesOf(s)[0] ?? null,
    });
  }

  // Within each group, schemes that passed more of our rules come first: an age-checked pension is a
  // stronger match than a scheme open to every woman.
  const rank = { likely: 0, need_info: 1, no: 2 } as const;
  results.sort((a, b) => rank[a.verdict] - rank[b.verdict] || (strength.get(b.id) ?? 0) - (strength.get(a.id) ?? 0));
  return { results, checked: schemes.length };
}

/** Accept only the values the page can send. */
export function cleanCheck(body: unknown): CheckRequest | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;
  const age = typeof b.age === 'number' && Number.isFinite(b.age) && b.age >= 0 && b.age <= 120 ? Math.round(b.age) : null;
  const gender = b.gender === 'female' || b.gender === 'male' || b.gender === 'other' ? b.gender : null;
  const occupations = Array.isArray(b.occupations)
    ? (b.occupations.filter((o) => ['school', 'college', 'farmer', 'worker', 'mother', 'widow'].includes(o as string)) as Occupation[])
    : [];
  const income = typeof b.income === 'number' && Number.isFinite(b.income) && b.income >= 0 ? Math.round(b.income) : null;
  const communities = ['SC', 'ST', 'BC', 'MBC', 'DNC', 'OC'] as const;
  const community = communities.find((c) => c === b.community) ?? null;
  return { age, gender, occupations, income, community };
}
