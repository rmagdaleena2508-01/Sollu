import { handleTts } from '../server/handlers.js';

/** Vercel Function: GET /api/tts streams MP3; POST /api/tts returns the whole MP3 */
export function GET(request: Request): Promise<Response> {
  return handleTts(request);
}

export function POST(request: Request): Promise<Response> {
  return handleTts(request);
}
