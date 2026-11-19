/**
 * Gemini through the Interactions API (plain fetch, no SDK).
 *
 * The free tier is often slow or busy, so calls are "hedged": the first model starts at once, and if it
 * hasn't answered within a few seconds the next model starts too. The first good answer wins and the
 * others are cancelled. A slow model costs a few seconds, not a failed question.
 */

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/interactions';

/** Fast models first. Bigger models are often "high demand" on the free tier. */
const MODELS: { model: string; thinking: 'minimal' | 'low' }[] = [
  { model: 'gemini-3.5-flash-lite', thinking: 'minimal' },
  { model: 'gemini-3.1-flash-lite', thinking: 'minimal' },
  { model: 'gemini-3.8-flash', thinking: 'low' },
];

/** Start the next model after this long without an answer. */
const HEDGE_AFTER_MS = 4000;
/** Give up on one model after this long. */
const PER_MODEL_TIMEOUT_MS = 12000;

/** Text, or a list of parts (for example a photo and a question). */
export type GeminiInput = string | ({ type: 'text'; text: string } | { type: 'image'; data: string; mime_type: string })[];

export interface JsonCall {
  system: string;
  input: GeminiInput;
  schema: Record<string, unknown>;
  maxOutputTokens?: number;
  /** Photos take longer to read than a question, so they get more time. */
  hedgeAfterMs?: number;
  perModelTimeoutMs?: number;
}

interface Step {
  type: string;
  content?: { type: string; text?: string }[];
}

/** Every model was busy, rate-limited or too slow. Not a bug: the right reply is "try again in a minute". */
export class GeminiBusyError extends Error {
  constructor(detail: string) {
    super(`Gemini busy: ${detail}`);
    this.name = 'GeminiBusyError';
  }
}

const BUSY_STATUS = new Set([429, 500, 503, 504]);

interface Attempt {
  model: string;
  /** Busy, rate-limited or timed out: worth telling the person "try again in a minute". */
  busy: boolean;
  error: string;
}

async function callModel<T>(
  key: string,
  call: JsonCall,
  m: (typeof MODELS)[number],
  outer: AbortSignal,
): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(new DOMException('timeout', 'TimeoutError')), call.perModelTimeoutMs ?? PER_MODEL_TIMEOUT_MS);
  const onOuter = () => ctrl.abort(new DOMException('cancelled', 'AbortError'));
  outer.addEventListener('abort', onOuter);
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: m.model,
        // Don't keep people's questions on Google's side longer than needed.
        store: false,
        system_instruction: call.system,
        input: call.input,
        generation_config: { thinking_level: m.thinking, max_output_tokens: call.maxOutputTokens ?? 800 },
        response_format: { type: 'text', mime_type: 'application/json', schema: call.schema },
      }),
    });
    const body = (await res.json()) as { steps?: Step[]; error?: { message?: string } };
    if (!res.ok || body.error) {
      throw { model: m.model, busy: BUSY_STATUS.has(res.status), error: `${res.status} ${body.error?.message ?? ''}`.trim() } satisfies Attempt;
    }
    const text = (body.steps ?? [])
      .filter((s) => s.type === 'model_output')
      .flatMap((s) => s.content ?? [])
      .filter((c) => c.type === 'text')
      .map((c) => c.text ?? '')
      .join('');
    try {
      return JSON.parse(text) as T;
    } catch {
      throw { model: m.model, busy: false, error: 'answer was not complete JSON' } satisfies Attempt;
    }
  } catch (err) {
    if (err && typeof err === 'object' && 'model' in err) throw err;
    const timedOut = ctrl.signal.aborted;
    throw { model: m.model, busy: timedOut, error: err instanceof Error ? err.message : String(err) } satisfies Attempt;
  } finally {
    clearTimeout(timer);
    outer.removeEventListener('abort', onOuter);
  }
}

export async function geminiJson<T>(call: JsonCall): Promise<T> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not set');

  const done = new AbortController();
  const failures: Attempt[] = [];

  return new Promise<T>((resolve, reject) => {
    let started = 0;
    let settled = false;
    let hedge: ReturnType<typeof setTimeout> | undefined;

    const finish = () => {
      clearTimeout(hedge);
      done.abort();
    };

    const startNext = () => {
      if (settled || started >= MODELS.length) return;
      const m = MODELS[started++];
      // If this one is slow, start the next one too.
      clearTimeout(hedge);
      hedge = setTimeout(startNext, call.hedgeAfterMs ?? HEDGE_AFTER_MS);
      callModel<T>(key, call, m, done.signal).then(
        (value) => {
          if (settled) return;
          settled = true;
          finish();
          resolve(value);
        },
        (attempt: Attempt) => {
          if (settled) return;
          failures.push(attempt);
          if (started < MODELS.length) return startNext(); // failed fast: try the next one now
          if (failures.length === MODELS.length) {
            settled = true;
            finish();
            const detail = failures.map((f) => `${f.model}: ${f.error}`).join(' | ');
            reject(failures.every((f) => f.busy) ? new GeminiBusyError(detail) : new Error(`Gemini failed: ${detail}`));
          }
        },
      );
    };

    startNext();
  });
}
