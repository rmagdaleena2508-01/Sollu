/** Shapes shared by the Check page and /api/check. */
import type { SourceLink, Verdict } from '../ask/types';

/** What fits the person (more than one can). */
export type Occupation = 'school' | 'college' | 'farmer' | 'worker' | 'mother' | 'widow';

export interface CheckRequest {
  age: number | null;
  gender: 'female' | 'male' | 'other' | null;
  occupations: Occupation[];
  /** Family income for a whole year, in rupees. null = "I don't know". */
  income: number | null;
  community: 'SC' | 'ST' | 'BC' | 'MBC' | 'DNC' | 'OC' | null;
}

export interface CheckResult {
  id: string;
  name: string;
  nameTa: string | null;
  verdict: Verdict;
  /** What you get, from the checked entry. */
  benefit: string;
  /** Other lines from the official page that 5 answers can't check (for example "studied in a government school"). */
  alsoNeeded: string[];
  /** Why it doesn't fit, when verdict is "no". */
  reasons: string[];
  /** Answers we still need to decide, when verdict is "need_info". */
  missing: ('age' | 'gender' | 'income' | 'community')[];
  caution: boolean;
  source: SourceLink | null;
}

export interface CheckResponse {
  results: CheckResult[];
  /** How many checked schemes Sollu looked at in total. */
  checked: number;
}
