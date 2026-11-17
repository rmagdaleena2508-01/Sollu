import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';

// Open-source fonts, self-hosted through Fontsource (OFL licensed).
import '@fontsource/instrument-sans/400.css';
import '@fontsource/instrument-sans/500.css';
import '@fontsource/instrument-sans/600.css';
import '@fontsource/instrument-sans/700.css';
import '@fontsource/noto-sans-tamil/400.css';
import '@fontsource/noto-sans-tamil/500.css';
import '@fontsource/noto-sans-tamil/600.css';
import '@fontsource-variable/source-serif-4/opsz.css';
import '@fontsource-variable/source-serif-4/opsz-italic.css';
import '@fontsource/geist-mono/400.css';
import '@fontsource/geist-mono/500.css';

import './styles.css';
import { App } from './App';
import { AskPage } from './ask/AskPage';

// /ask in production (vercel.json cleanUrls); /ask.html when the built files are served as they are.
const onAsk = /^\/ask(\.html)?\/?$/.test(location.pathname);

const root = document.getElementById('root')!;
const app = <StrictMode>{onAsk ? <AskPage /> : <App />}</StrictMode>;

// Built pages arrive already rendered (scripts/prerender.mjs), so React takes over that HTML in place.
// The dev server sends an empty page, so it renders from scratch.
if (root.firstElementChild) hydrateRoot(root, app);
else createRoot(root).render(app);
