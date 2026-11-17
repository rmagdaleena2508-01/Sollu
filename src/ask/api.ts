import type { AskRequest, AskResponse, SttResponse } from './types';

/** A failed API call. `busy` means "try again in a minute", not a bug. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly busy: boolean,
  ) {
    super(message);
  }
}

async function fail(res: Response): Promise<ApiError> {
  let b: { error?: string; code?: string } = {};
  try {
    b = (await res.json()) as typeof b;
  } catch {
    /* not JSON */
  }
  return new ApiError(b.error ?? `HTTP ${res.status}`, res.status, b.code === 'busy' || res.status === 429 || res.status === 503);
}

/** Wakes the server up when the page opens, so the first question isn't slow. Errors are ignored. */
export function warmUp(): void {
  void fetch('/api/health', { cache: 'no-store' }).catch(() => undefined);
}

export async function ask(req: AskRequest, signal?: AbortSignal): Promise<AskResponse> {
  const res = await fetch('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
    signal,
  });
  if (!res.ok) throw await fail(res);
  return (await res.json()) as AskResponse;
}

export async function transcribe(audio: Blob, signal?: AbortSignal): Promise<SttResponse> {
  const res = await fetch('/api/stt', {
    method: 'POST',
    headers: { 'Content-Type': audio.type || 'audio/webm' },
    body: audio,
    signal,
  });
  if (!res.ok) throw await fail(res);
  return (await res.json()) as SttResponse;
}

/** Sarvam voice as an MP3 blob. */
export async function speech(text: string, lang: 'ta' | 'en', signal?: AbortSignal): Promise<Blob> {
  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, lang }),
    signal,
  });
  if (!res.ok) throw await fail(res);
  return res.blob();
}
