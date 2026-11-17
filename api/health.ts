import { handleHealth } from '../server/handlers.js';

/** Vercel Function: GET /api/health (add ?deep=1 to test Gemini and Sarvam too) */
export function GET(request: Request): Promise<Response> {
  return handleHealth(request);
}
