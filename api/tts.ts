import { handleTts } from '../server/handlers';

/** Vercel Function: POST /api/tts */
export function POST(request: Request): Promise<Response> {
  return handleTts(request);
}
