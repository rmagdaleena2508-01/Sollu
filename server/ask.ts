import type { AnswerItem, AskLang, AskRequest, AskResponse, Turn } from '../src/ask/types';
import { byId, catalogue, entries, factsFor, sourcesOf, titleOf } from './data.js';
import type { Entry } from './data.js';
import { checkScheme, followUps } from './eligibility.js';
import type { Check, Person } from './eligibility.js';
import { geminiJson } from './gemini.js';

const ids = entries.map((e) => e.id);

const nullable = (schema: Record<string, unknown>) => ({ anyOf: [schema, { type: 'null' }] });

const UNDERSTAND_SCHEMA = {
  type: 'object',
  properties: {
    lang: { type: 'string', enum: ['ta', 'en'] },
    ids: { type: 'array', items: { type: 'string', enum: ids }, maxItems: 3 },
    person: {
      type: 'object',
      properties: {
        age: nullable({ type: 'integer' }),
        gender: nullable({ type: 'string', enum: ['female', 'male', 'other'] }),
        annual_income_inr: nullable({ type: 'integer' }),
        community: nullable({ type: 'string', enum: ['SC', 'ST', 'BC', 'MBC', 'DNC', 'OC'] }),
      },
      required: ['age', 'gender', 'annual_income_inr', 'community'],
    },
  },
  required: ['lang', 'ids', 'person'],
};

const UNDERSTAND_SYSTEM = `You route questions for Sollu, a free helper that explains Tamil Nadu government schemes, rights and notices.

Read the conversation and the LATEST question. Return:
- lang: "ta" if the latest question is in Tamil (Tamil script, or Tamil written in English letters), else "en".
- ids: up to 3 catalogue ids the question is clearly about, best first. Use the earlier turns to understand short replies like "67" or "1 lakh". If no entry clearly fits, return an empty list. Never pick an entry just because it is close.
- person: facts about the person the question is about (the asker, or the person they ask for, such as their mother). Use only facts that were said. Never guess. Use null when not said.
  - gender: mother, wife, daughter, sister, widow, girl, woman = female. father, husband, son, boy, man = male.
  - annual_income_inr: whole rupees per year. Monthly income x 12. 1 lakh = 100000.
  - community: only if a caste category was said (Adi Dravidar = SC, tribal = ST).

CATALOGUE (id | type | name | details):
${catalogue()}`;

interface Understood {
  lang: AskLang;
  ids: string[];
  person: Person;
}

const EXPLAIN_SCHEMA = {
  type: 'object',
  properties: {
    lines: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 3 },
    used_ids: { type: 'array', items: { type: 'string', enum: ids } },
  },
  required: ['lines', 'used_ids'],
};

function explainSystem(lang: AskLang) {
  const language =
    lang === 'ta'
      ? 'Tamil. Use simple, polite, spoken Tamil (the way people talk in Tamil Nadu), not formal written Tamil. Keep scheme names as they are known.'
      : 'simple English for someone who did not finish school.';
  return `You are Sollu. You explain government schemes, rights and notices so that anyone can understand them when read aloud.

Write the answer in ${language}
Rules:
- At most 3 short lines. Each line is one or two short sentences. No markdown, no bullets, no emoji.
- Use ONLY the facts in ENTRIES. Do not add anything from your own knowledge.
- Write every number in digits, never in words: "Rs 1,000", "60", "15 December 2026". Copy every amount, age and date exactly from ENTRIES. If ENTRIES do not give a number, do not give one.
- Talk to the person asking as "you". Only if they ask for someone else (for example their mother) talk about that person ("your mother").
- Keep office and place names as ENTRIES give them (for example "Common Service Centre (CSC)").
- Follow each entry's VERDICT, which our rules decided:
  - "likely": say they may be able to get it, what they get, and the main condition still to check.
  - "need_info": say what it depends on. Do not ask a question; Sollu asks it separately.
  - "no": say kindly that it does not fit, and why (use the reasons given).
- If an entry says where or how to apply, say it briefly.
- Never promise. Say "may", not "will".
- used_ids: the ids you actually used.`;
}

interface Explained {
  lines: string[];
  used_ids: string[];
}

const NOT_SURE: Record<AskLang, string[]> = {
  en: [
    "I'm not sure about this one. I only answer from government pages we have checked.",
    'For help, visit your nearest e-Sevai centre, or the free legal aid office at your district court.',
  ],
  ta: [
    'இதைப் பத்தி எனக்கு உறுதியா தெரியல. நாங்க சரிபார்த்த அரசு தகவல்ல இருந்து மட்டும் தான் சொல்வேன்.',
    'உதவிக்கு பக்கத்துல இருக்கற இ-சேவை மையத்துக்கு போங்க, இல்லன்னா மாவட்ட நீதிமன்றத்துல இருக்கற இலவச சட்ட உதவி மையத்துக்கு போங்க.',
  ],
};

const CAUTION: Record<AskLang, string> = {
  en: 'Some of this may have changed. Please confirm at an e-Sevai centre or the office before you apply.',
  ta: 'இதுல சில தகவல் மாறியிருக்கலாம். விண்ணப்பிக்கறதுக்கு முன்னாடி இ-சேவை மையத்துல இல்ல அலுவலகத்துல ஒரு தடவை உறுதி பண்ணிக்கோங்க.',
};

/** Every number in the answer must appear in the facts we gave, or in what the person said. */
const numberTokens = (s: string) =>
  (s.match(/\d[\d,]*(?:\.\d+)?/g) ?? []).map((n) => n.replace(/,/g, '').replace(/\.0+$/, ''));

export function numbersCheck(lines: string[], allowedText: string): string[] {
  const allowed = new Set(numberTokens(allowedText));
  return lines.flatMap(numberTokens).filter((n) => Number(n) > 10 && !allowed.has(n));
}

/** Big numbers spelled as words slip past the number check, so we reject them unless the facts use that word too. */
const NUMBER_WORDS = /ஆயிரம்|லட்ச|நூறு|கோடி|\b(?:hundred|thousand|lakhs?|crores?)\b/gi;
/** A Latin letter glued inside a Tamil word means the model garbled the text. */
const GARBLED = /[஀-௿][A-Za-z]|[A-Za-z][஀-௿]/;

export function qualityProblems(lines: string[], allowedText: string): string[] {
  const p: string[] = [];
  const bad = numbersCheck(lines, allowedText);
  if (bad.length) p.push(`numbers not in the facts: ${bad.join(', ')}`);
  const facts = allowedText.toLowerCase();
  const words = lines.flatMap((l) => l.match(NUMBER_WORDS) ?? []).filter((w) => !facts.includes(w.toLowerCase()));
  if (words.length) p.push(`numbers written in words (${words.join(', ')}); use digits`);
  if (lines.some((l) => GARBLED.test(l))) p.push('garbled text');
  return p;
}

/** Plain facts, used when the AI text fails the number check. English only, straight from the checked entries. */
function plainLines(es: Entry[]): string[] {
  const first = (s: string | null | undefined) => (s ?? '').split(/(?<=\.)\s/)[0];
  return es.slice(0, 3).map((e) => {
    if (e.type === 'scheme') return `${e.name_en}: ${first(e.benefit)}`;
    if (e.type === 'right') return `${e.title_en}. ${first(e.rule_plain)}`;
    return `${e.title}. ${first(e.says)}`;
  });
}

function clean(history: Turn[] | undefined): Turn[] {
  return (history ?? [])
    .filter((t) => (t.role === 'user' || t.role === 'sollu') && typeof t.text === 'string')
    .slice(-6)
    .map((t) => ({ role: t.role, text: t.text.slice(0, 600) }));
}

export async function answer(req: AskRequest): Promise<AskResponse> {
  const question = req.question.trim().slice(0, 500);
  const history = clean(req.history);
  const convo = [...history, { role: 'user' as const, text: question }]
    .map((t) => `${t.role === 'user' ? 'PERSON' : 'SOLLU'}: ${t.text}`)
    .join('\n');

  const u = await geminiJson<Understood>({
    system: UNDERSTAND_SYSTEM,
    input: `CONVERSATION:\n${convo}\n\nReturn the JSON for the LATEST question.`,
    schema: UNDERSTAND_SCHEMA,
    maxOutputTokens: 300,
  });

  const lang: AskLang = u.lang === 'ta' || u.lang === 'en' ? u.lang : req.lang;
  const picked = [...new Set(u.ids)].map((id) => byId.get(id)).filter((e): e is Entry => Boolean(e)).slice(0, 3);

  if (!picked.length) return { kind: 'not_sure', lang, lines: NOT_SURE[lang], items: [] };

  // Our rules decide eligibility.
  const checks = new Map<string, Check>();
  for (const e of picked) if (e.type === 'scheme') checks.set(e.id, checkScheme(e, u.person));

  const rank = { likely: 0, need_info: 1, no: 2 } as const;
  picked.sort((a, b) => rank[checks.get(a.id)?.verdict ?? 'likely'] - rank[checks.get(b.id)?.verdict ?? 'likely']);

  const entriesBlock = picked.map((e) => {
    const c = checks.get(e.id);
    return { VERDICT: c ? c.verdict : 'not a scheme', reasons: c?.reasons, ...factsFor(e) };
  });

  const userSaid = [...history.filter((t) => t.role === 'user').map((t) => t.text), question].join(' ');
  const allowedText = JSON.stringify(picked.map(factsFor)) + ' ' + userSaid;

  let lines: string[] = [];
  let used: string[] = [];
  let fallback = true;
  let note = '';
  // Two tries. If both fail our checks, show the plain checked facts instead.
  for (let attempt = 0; attempt < 2 && fallback; attempt++) {
    try {
      const x = await geminiJson<Explained>({
        system: explainSystem(lang),
        input:
          `CONVERSATION:\n${convo}\n\nWHAT WE KNOW ABOUT THE PERSON: ${JSON.stringify(u.person)}\n\nENTRIES:\n${JSON.stringify(entriesBlock)}` +
          (note ? `\n\nYour last answer was rejected (${note}). Write it again and follow the rules.` : ''),
        schema: EXPLAIN_SCHEMA,
        maxOutputTokens: 700,
      });
      lines = (x.lines ?? []).map((l) => l.trim()).filter(Boolean).slice(0, 3);
      used = x.used_ids ?? [];
      const problems = lines.length ? qualityProblems(lines, allowedText) : ['empty answer'];
      if (problems.length) {
        note = problems.join('; ');
        console.warn('answer rejected:', note);
      } else fallback = false;
    } catch (err) {
      note = 'error';
      console.warn('explain failed:', err instanceof Error ? err.message : err);
    }
  }
  if (fallback) {
    lines = plainLines(picked);
    used = picked.map((e) => e.id);
  }

  const usedSet = new Set(used.filter((id) => byId.has(id)));
  const shown = picked.filter((e) => usedSet.has(e.id) || fallback);
  const final = shown.length ? shown : picked;

  const items: AnswerItem[] = final.map((e) => {
    const c = checks.get(e.id);
    return {
      id: e.id,
      type: e.type,
      title: titleOf(e),
      verdict: c?.verdict,
      reasons: c?.reasons.length ? c.reasons : undefined,
      caution: e.review.demo_use === 'caution' || undefined,
      sources: sourcesOf(e),
    };
  });

  // Ask for one missing fact, but only when nothing already fits.
  const anyLikely = items.some((i) => i.verdict === 'likely');
  const missing = anyLikely ? undefined : final.map((e) => checks.get(e.id)?.missing[0]).find(Boolean);

  return {
    kind: 'answer',
    lang,
    lines,
    followUp: missing ? followUps[missing][lang] : undefined,
    cautionNote: items.some((i) => i.caution) ? CAUTION[lang] : undefined,
    items,
    fallback: fallback || undefined,
  };
}
