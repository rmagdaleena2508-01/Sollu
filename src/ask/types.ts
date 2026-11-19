/** Shapes shared by the Ask page and the /api functions. */

export type AskLang = 'ta' | 'en';

export interface Turn {
  role: 'user' | 'sollu';
  text: string;
}

export interface AskRequest {
  question: string;
  lang: AskLang;
  /** Earlier turns, oldest first. The server keeps only the last few. */
  history?: Turn[];
}

/** likely: every rule we can check passes. need_info: we need one more fact. no: a rule fails. */
export type Verdict = 'likely' | 'need_info' | 'no';

export interface SourceLink {
  url: string;
  host: string;
  /** Date the page was saved and checked, YYYY-MM-DD. */
  checked: string;
}

export interface AnswerItem {
  id: string;
  type: 'scheme' | 'right' | 'notice' | 'service';
  title: string;
  verdict?: Verdict;
  /** Plain reasons for "no", in English, from our rules. */
  reasons?: string[];
  /** Set when a reviewer marked this entry "caution". */
  caution?: boolean;
  sources: SourceLink[];
}

export interface AskResponse {
  kind: 'answer' | 'not_sure';
  lang: AskLang;
  /** One to three short lines to show and read aloud. */
  lines: string[];
  /** One follow-up question when a fact is missing. */
  followUp?: string;
  /** Shown when an entry used may be out of date. */
  cautionNote?: string;
  items: AnswerItem[];
  /** True when the AI text failed our number check and we showed plain facts instead. */
  fallback?: boolean;
  /** Read-aloud audio made in advance (saved demo answers). Played instead of calling /api/tts. */
  audioUrl?: string;
  /** Where the answer came from when it wasn't made just now. */
  cached?: 'saved' | 'recent';
  /** Set when the answer explains a photo the person sent, not our checked data. */
  photo?: PhotoInfo;
}

/** government: from a public office. legal: a lawyer's or company's letter. other: any other paper. */
export type PhotoKind = 'government' | 'legal' | 'other';

export interface PhotoInfo {
  kind: PhotoKind;
  /** As read from the photo. */
  title?: string;
  from?: string;
  date?: string;
  /** True when the photo is a notice Sollu has already checked (its entry is in items). */
  checked?: boolean;
  /** True when a number in the lines was not found in the text read from the photo. */
  numbersOff?: boolean;
}

export interface SttResponse {
  transcript: string;
  lang: string | null;
}

export interface ApiError {
  error: string;
}
