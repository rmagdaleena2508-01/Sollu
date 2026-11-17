/**
 * Gemini through the Interactions API (plain fetch, no SDK).
 * The free tier is often busy, so each call tries models in order and gives up on one after a few seconds.
 */

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/interactions';

/** Fast models first. Flash-Lite answers in about 2 seconds; bigger models are often "high demand" on the free tier. */
const MODELS: { model: string; thinking: 'minimal' | 'low' }[] = [
  { model: 'gemini-3.5-flash-lite', thinking: 'minimal' },
  { model: 'gemini-3.1-flash-lite', thinking: 'minimal' },
  { model: 'gemini-3.8-flash', thinking: 'low' },
];

const PER_MODEL_TIMEOUT_MS = 9000;

export interface JsonCall {
  system: string;
  input: string;
  schema: Record<string, unknown>;
  maxOutputTokens?: number;
}

interface Step {
  type: string;
  content?: { type: string; text?: string }[];
}

export async function geminiJson<T>(call: JsonCall): Promise<T> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not set');

  let lastError = 'no model tried';
  for (const { model, thinking } of MODELS) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), PER_MODEL_TIMEOUT_MS);
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        signal: ctrl.signal,
        headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          // Don't keep people's questions on Google's side longer than needed.
          store: false,
          system_instruction: call.system,
          input: call.input,
          generation_config: { thinking_level: thinking, max_output_tokens: call.maxOutputTokens ?? 800 },
          response_format: { type: 'text', mime_type: 'application/json', schema: call.schema },
        }),
      });
      const body = (await res.json()) as { steps?: Step[]; error?: { message?: string } };
      if (!res.ok || body.error) {
        lastError = `${model}: ${res.status} ${body.error?.message ?? ''}`.trim();
        continue;
      }
      const text = (body.steps ?? [])
        .filter((s) => s.type === 'model_output')
        .flatMap((s) => s.content ?? [])
        .filter((c) => c.type === 'text')
        .map((c) => c.text ?? '')
        .join('');
      return JSON.parse(text) as T;
    } catch (err) {
      lastError = `${model}: ${err instanceof Error ? err.message : String(err)}`;
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error(`Gemini failed: ${lastError}`);
}
