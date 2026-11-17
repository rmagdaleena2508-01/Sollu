import type { Verdict } from '../src/ask/types';
import type { Scheme } from './data';

/**
 * Facts about the person the question is about (the asker, or their mother, son and so on).
 * The model only reads these out of the question. Our code decides eligibility, never the model.
 */
export interface Person {
  age: number | null;
  gender: 'female' | 'male' | 'other' | null;
  annual_income_inr: number | null;
  community: 'SC' | 'ST' | 'BC' | 'MBC' | 'DNC' | 'OC' | null;
}

export type Fact = 'age' | 'gender' | 'income' | 'community';

export interface Check {
  verdict: Verdict;
  reasons: string[];
  missing: Fact[];
}

/** "Adi Dravidar (SC)" -> SC, "Tribal (ST)" -> ST, "MBC" -> MBC. */
function communityCode(label: string): Person['community'] {
  const l = label.toUpperCase();
  if (l.includes('(ST)') || l.startsWith('TRIBAL')) return 'ST';
  if (l.includes('(SC)') || l.includes('ADI DRAVIDAR')) return 'SC';
  if (l === 'MBC' || l === 'BC' || l === 'DNC' || l === 'OC') return l;
  return null;
}

const rupees = (n: number) => `Rs ${n.toLocaleString('en-IN')}`;

export function checkScheme(s: Scheme, p: Person): Check {
  const e = s.eligibility;
  const reasons: string[] = [];
  const missing: Fact[] = [];

  if (e.age_min != null || e.age_max != null) {
    if (p.age == null) missing.push('age');
    else if (e.age_min != null && p.age < e.age_min) reasons.push(`Age must be ${e.age_min} or more.`);
    else if (e.age_max != null && p.age > e.age_max) reasons.push(`Age must be ${e.age_max} or less.`);
  }

  // Unknown gender is not asked about: the answer says who the scheme is for. Only a known mismatch fails.
  if ((e.gender === 'female' || e.gender === 'male') && p.gender != null) {
    if (p.gender !== e.gender) reasons.push(`This scheme is only for ${e.gender === 'female' ? 'women and girls' : 'men and boys'}.`);
  }

  if (e.income_max_annual_inr != null) {
    if (p.annual_income_inr == null) missing.push('income');
    else if (p.annual_income_inr > e.income_max_annual_inr) {
      reasons.push(`Family income must be ${rupees(e.income_max_annual_inr)} a year or less.`);
    }
  }

  if (e.community && e.community.length) {
    const allowed = new Set(e.community.map(communityCode).filter(Boolean));
    if (p.community == null) missing.push('community');
    else if (!allowed.has(p.community)) reasons.push(`Only for these communities: ${e.community.join(', ')}.`);
  }

  const verdict: Verdict = reasons.length ? 'no' : missing.length ? 'need_info' : 'likely';
  return { verdict, reasons, missing };
}

/** The one follow-up question we ask when a fact is missing. Written by us, not the model. */
export const followUps: Record<Fact, { en: string; ta: string }> = {
  age: { en: 'How old is the person?', ta: 'அவங்களுக்கு எத்தனை வயசு?' },
  gender: { en: 'Is this for a woman or a man?', ta: 'இது பெண்ணுக்கா, ஆணுக்கா?' },
  income: {
    en: "What is the family's total income in a year, roughly?",
    ta: 'குடும்பத்தோட ஒரு வருஷ மொத்த வருமானம் சுமாரா எவ்வளவு?',
  },
  community: {
    en: 'Which community certificate do you have: SC, ST, BC, MBC or other?',
    ta: 'உங்க சாதிச் சான்றிதழ் எது: SC, ST, BC, MBC, இல்ல வேற?',
  },
};
