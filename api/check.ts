import { handleCheck } from '../server/handlers.js';

/** Vercel Function: POST /api/check */
export function POST(request: Request): Promise<Response> {
  return handleCheck(request);
}
