import { handleRead } from '../server/handlers.js';

/** Vercel Function: POST /api/read?lang=en with a photo as the body. */
export function POST(request: Request): Promise<Response> {
  return handleRead(request);
}
