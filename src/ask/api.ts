import type { AskRequest, AskResponse, SttResponse } from './types';

async function errorText(res: Response): Promise<string> {
  try {
    const b = (await res.json()) as { error?: string };
    return b.error ?? `HTTP ${res.status}`;
  } catch {
    return `HTTP ${res.status}`;
  }
}

export async function ask(req: AskRequest, signal?: AbortSignal): Promise<AskResponse> {
  const res = await fetch('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
    signal,
  });
  if (!res.ok) throw new Error(await errorText(res));
  return (await res.json()) as AskResponse;
}

export async function transcribe(audio: Blob, signal?: AbortSignal): Promise<SttResponse> {
  const res = await fetch('/api/stt', {
    method: 'POST',
    headers: { 'Content-Type': audio.type || 'audio/webm' },
    body: audio,
    signal,
  });
  if (!res.ok) throw new Error(await errorText(res));
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
  if (!res.ok) throw new Error(await errorText(res));
  return res.blob();
}
