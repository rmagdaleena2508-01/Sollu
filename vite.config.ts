import { defineConfig, loadEnv } from 'vite';
import type { Plugin, ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';
import react from '@vitejs/plugin-react';

/**
 * In development, serve /api/* from the same handlers Vercel runs in production,
 * so `npm run dev` works end to end. Keys come from .env.local and stay on the server.
 */
function devApi(): Plugin {
  const routes: Record<string, string> = { '/api/ask': 'handleAsk', '/api/stt': 'handleStt', '/api/tts': 'handleTts', '/api/health': 'handleHealth' };
  return {
    name: 'sollu-dev-api',
    apply: 'serve',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const path = (req.url ?? '').split('?')[0];
        const name = routes[path];
        if (!name) return next();
        try {
          const chunks: Buffer[] = [];
          for await (const c of req) chunks.push(c as Buffer);
          const body = chunks.length ? Buffer.concat(chunks) : undefined;
          const request = new Request(`http://localhost${req.url}`, {
            method: req.method,
            headers: req.headers as Record<string, string>,
            body: req.method === 'GET' || req.method === 'HEAD' ? undefined : body,
          });
          const mod = await server.ssrLoadModule('/server/handlers.ts');
          const response: Response = await mod[name](request);
          res.statusCode = response.status;
          response.headers.forEach((v, k) => res.setHeader(k, v));
          // Pass the body through as it arrives, so streamed audio streams in development too.
          if (response.body) {
            for await (const chunk of response.body as unknown as AsyncIterable<Uint8Array>) res.write(chunk);
            res.end();
          } else res.end();
        } catch (err) {
          console.error(err);
          res.statusCode = 500;
          res.end('dev api error');
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Load every variable from .env files (not only VITE_ ones) into the dev server process only.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));
  return {
    plugins: [react(), devApi()],
    server: { port: 8950, strictPort: false },
  };
});
