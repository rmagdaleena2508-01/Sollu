import { handleStt } from '../server/handlers.js';

/** Vercel Function: POST /api/stt */
export function POST(request: Request): Promise<Response> {
  return handleStt(request);
}
