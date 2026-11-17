import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

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

const onAsk = location.pathname.replace(/\/+$/, '') === '/ask';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {onAsk ? <AskPage /> : <App />}
  </StrictMode>,
);
