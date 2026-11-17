import { renderToString } from 'react-dom/server';
import { App } from './App';
import { AskPage } from './ask/AskPage';

export { faqs } from './content';

/**
 * Build-time only (scripts/prerender.mjs). Renders each page to HTML so search engines and
 * link previews see the real text without running JavaScript. In the browser, main.tsx takes over.
 */
export function render(path: '/' | '/ask'): string {
  return renderToString(path === '/ask' ? <AskPage /> : <App />);
}
