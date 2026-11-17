/** Sarvam speech APIs over plain REST (docs.sarvam.ai). */

const BASE = 'https://api.sarvam.ai';

function key(): string {
  const k = process.env.SARVAM_API_KEY;
  if (!k) throw new Error('SARVAM_API_KEY is not set');
  return k;
}

/** Speech to text. Auto-detects the language, so Tamil, English and mixed speech all work. Max 30 seconds. */
export async function transcribe(audio: Blob, filename: string): Promise<{ transcript: string; lang: string | null }> {
  const form = new FormData();
  form.append('file', audio, filename);
  form.append('model', 'saaras:v4');
  form.append('mode', 'transcribe');
  form.append('language_code', 'unknown');

  const res = await fetch(`${BASE}/speech-to-text`, {
    method: 'POST',
    headers: { 'api-subscription-key': key() },
    body: form,
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Sarvam speech-to-text ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const body = (await res.json()) as { transcript?: string; language_code?: string | null };
  return { transcript: (body.transcript ?? '').trim(), lang: body.language_code ?? null };
}

const VOICES = {
  ta: { language_code: 'ta-IN', speaker: 'gokul_ta_narration' },
  en: { language_code: 'en-IN', speaker: 'simran_en_customer' },
} as const;

/** Text to speech. Returns MP3 bytes. Max 2,500 characters. */
export async function speak(text: string, lang: 'ta' | 'en'): Promise<ArrayBuffer> {
  const res = await fetch(`${BASE}/text-to-speech`, {
    method: 'POST',
    headers: { 'api-subscription-key': key(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: text.slice(0, 2500),
      model: 'bulbul:v4-flash',
      ...VOICES[lang],
      output_audio_codec: 'mp3',
    }),
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Sarvam text-to-speech ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const body = (await res.json()) as { audios?: string[] };
  const b64 = (body.audios ?? []).join('');
  if (!b64) throw new Error('Sarvam text-to-speech returned no audio');
  const bytes = Buffer.from(b64, 'base64');
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

/**
 * Streaming text to speech. Sarvam starts sending MP3 in about 0.3 seconds, and the browser can
 * play MP3 while it downloads, so speech starts almost at once instead of after the whole file
 * (about 6 seconds for a 3-line Tamil answer). Max 3,500 characters.
 */
export async function speakStream(text: string, lang: 'ta' | 'en'): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch(`${BASE}/text-to-speech/stream`, {
    method: 'POST',
    headers: { 'api-subscription-key': key(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: text.slice(0, 3500),
      model: 'bulbul:v4-flash',
      ...VOICES[lang],
      output_audio_codec: 'mp3',
      output_audio_bitrate: '64k',
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok || !res.body) throw new Error(`Sarvam stream ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.body;
}
