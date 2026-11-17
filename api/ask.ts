import { handleAsk } from '../server/handlers';

/** Vercel Function: POST /api/ask */
export function POST(request: Request): Promise<Response> {
  return handleAsk(request);
}
