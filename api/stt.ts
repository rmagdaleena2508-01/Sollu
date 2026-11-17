import { handleStt } from '../server/handlers';

/** Vercel Function: POST /api/stt */
export function POST(request: Request): Promise<Response> {
  return handleStt(request);
}
