import { handleAsk } from '../server/handlers.js';

/** Vercel Function: POST /api/ask */
export function POST(request: Request): Promise<Response> {
  return handleAsk(request);
}
