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

/** Longest side of a photo we send. Enough to read small print, and keeps uploads to a few hundred KB. */
const PHOTO_MAX_SIDE = 1600;

/**
 * Shrinks a phone photo before it is sent: turned the right way up, at most 1600 px on its longest side,
 * as a JPEG. A 4 MB camera photo becomes about 300 KB, which matters on a slow phone connection.
 */
export async function shrinkPhoto(file: Blob): Promise<Blob> {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, PHOTO_MAX_SIDE / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('no canvas');
  ctx.fillStyle = '#fff'; // a PNG with see-through parts would turn black as a JPEG
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bmp, 0, 0, w, h);
  bmp.close();
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode failed'))), 'image/jpeg', 0.85));
}

/** Sends a photo of a notice; Sollu reads it and explains it. */
export async function readPhoto(photo: Blob, lang: 'ta' | 'en', signal?: AbortSignal): Promise<AskResponse> {
  const res = await fetch(`/api/read?lang=${lang}`, {
    method: 'POST',
    headers: { 'Content-Type': photo.type || 'image/jpeg' },
    body: photo,
    signal,
  });
  if (!res.ok) throw await fail(res);
  return (await res.json()) as AskResponse;
}
