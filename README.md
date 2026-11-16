# Sollu

Sollu (சொல்லு, "say it") reads government schemes, notices and local laws. Then it explains them in plain Tamil or English. You can ask by voice, check what you can get, and learn your rights.

- **Version 1:** Tamil Nadu. 38 districts. Tamil and English.
- **Version 2:** All of India. 22 languages.

**Live site:** https://sollu-ai.vercel.app

This repo is the landing page. The product flow, word rules and copy for every page are in [FLOW.md](FLOW.md).

## Run it

```bash
npm install
npm run dev        # http://localhost:5173 (or the port Vite prints)
npm run build      # type check + production build into dist/
```

## How it's built

- **TypeScript + React 19 + Vite.** No UI library. Plain CSS in `src/styles.css`.
- **All copy** lives in `src/content.ts`, typed. Change words there, not in components.
- **Sections** live in `src/components/`: `Nav`, `Hero`, `WhatItDoes`, `Sections` (features, trust, roadmap, FAQ), `Personas`, `SampleFan`, `Footer` (final CTA, footer, draggable stickers).
- **Icons** are one inline SVG sprite (`src/components/Icon.tsx`) and recolour with `currentColor`.
- **Stickers** are hand-drawn SVGs in `Footer.tsx`. Drag them around the footer.
- **"Hear it"** uses the browser's own speech voice (Web Speech API). There's no audio file.
- `prototype/index.html` is the first single-file HTML version. The React app matches it pixel for pixel.

## Open-source credits

| What | Source | License |
|---|---|---|
| Instrument Sans | Fontsource (`@fontsource/instrument-sans`) | SIL OFL 1.1 |
| Noto Sans Tamil | Fontsource (`@fontsource/noto-sans-tamil`) | SIL OFL 1.1 |
| Source Serif 4 | Fontsource (`@fontsource-variable/source-serif-4`) | SIL OFL 1.1 |
| Geist Mono | Fontsource (`@fontsource/geist-mono`) | SIL OFL 1.1 |
| React, Vite, TypeScript | npm | MIT / Apache-2.0 |

Design references: a FluentAI landing page shot on Dribbble (layout ideas) and stickitupx.com (footer idea). No art or code was copied from either.

## Honest-content rules

- No fake users, ratings or testimonials. Every demo card says "Sample".
- No scheme amounts or rules on the page until they're checked against the source G.O.
- Sollu explains rules. It is not legal advice.
