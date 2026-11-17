// Turns dist/index.html into two real pages with their own text and tags:
//   dist/index.html  (the landing page)
//   dist/ask.html    (the Ask page; served at /ask because vercel.json sets cleanUrls)
// Run after `vite build` and the server build (see "build" in package.json).
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const SITE = 'https://sollu-ai.vercel.app';

const { render, faqs } = await import(pathToFileURL(join(root, 'dist-ssr', 'entry-server.js')).href);

let template = readFileSync(join(dist, 'index.html'), 'utf8');

// Put the stylesheet inside the HTML. The page can then draw as soon as the HTML arrives, without
// waiting for a second request (about one round trip, roughly 0.3 s on slow 4G).
const cssLink = template.match(/<link rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/);
if (cssLink) {
  const css = readFileSync(join(dist, cssLink[1]), 'utf8');
  template = template.replace(cssLink[0], () => `<style>${css}</style>`);
}
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const pages = [
  {
    path: '/',
    file: 'index.html',
    title: "Sollu — Know what's yours, in your own words",
    description:
      'Sollu explains Tamil Nadu government schemes, notices and your rights in plain Tamil or English. Ask by voice, see what you may get, and see the official source.',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Sollu',
        url: `${SITE}/`,
        inLanguage: ['en', 'ta'],
        description: 'Explains government schemes, notices and rights in plain Tamil or English.',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      },
    ],
  },
  {
    path: '/ask',
    file: 'ask.html',
    title: 'Ask Sollu — government schemes and rights, by voice, in Tamil or English',
    description:
      'Speak or type a question about a Tamil Nadu scheme, notice or right. Sollu answers in 3 short lines from checked official pages, and reads it aloud.',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Sollu', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Ask', item: `${SITE}/ask` },
        ],
      },
    ],
  },
];

for (const p of pages) {
  const url = `${SITE}${p.path === '/' ? '/' : p.path}`;
  const head = [
    `<title>${esc(p.title)}</title>`,
    `<meta name="description" content="${esc(p.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Sollu" />`,
    `<meta property="og:title" content="${esc(p.title)}" />`,
    `<meta property="og:description" content="${esc(p.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${SITE}/og.jpg" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    ...p.jsonLd.map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`),
  ].join('\n    ');

  let html = template
    .replace(/<title>[\s\S]*?<\/title>\s*/, '')
    .replace(/<meta name="description"[^>]*>\s*/, '')
    .replace('</head>', `    ${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${render(p.path)}</div>`);
  writeFileSync(join(dist, p.file), html);
  console.log(`prerendered ${p.path} -> dist/${p.file} (${Math.round(html.length / 1024)} KB)`);
}

rmSync(join(root, 'dist-ssr'), { recursive: true, force: true });
