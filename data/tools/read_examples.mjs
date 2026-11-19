#!/usr/bin/env node
// Make the saved answers for the example photos on the Ask page: data/read-examples.json
// and their read-aloud audio in public/demo-audio/.
//
// Each photo goes through the real pipeline (the local dev server, saved answers skipped),
// so a saved answer is exactly what Sollu would say live.
//
// Usage (with `npm run dev` running on port 8940):
//   node data/tools/read_examples.mjs
//   node data/tools/read_examples.mjs --base http://localhost:8950
//   node data/tools/read_examples.mjs --only census/en,rice/ta   # redo some, keep the rest
//
// Read every answer it prints before you commit the result.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const arg = process.argv.indexOf('--base');
const BASE = arg > 0 ? process.argv[arg + 1] : 'http://localhost:8940';
const onlyArg = process.argv.indexOf('--only');
const ONLY = onlyArg > 0 ? new Set(process.argv[onlyArg + 1].split(',')) : null;
const outPath = join(root, 'data', 'read-examples.json');
const old = JSON.parse(readFileSync(outPath, 'utf8')).examples ?? [];

// Keep in step with photoExamples in src/ask/copy.ts.
const PHOTOS = ['census', 'rice', 'salem'];
const LANGS = ['en', 'ta'];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const spoken = (res) => [...res.lines, res.followUp].filter(Boolean).join(' ');

const out = [];
const problems = [];
for (const name of PHOTOS) {
  const img = readFileSync(join(root, 'public', 'notice-photos', `${name}.jpg`));
  const sha256 = createHash('sha256').update(img).digest('hex');
  for (const lang of LANGS) {
    const kept = old.find((e) => e.photo === name && e.lang === lang && e.sha256 === sha256);
    if (ONLY && !ONLY.has(`${name}/${lang}`) && kept) {
      out.push(kept);
      continue;
    }
    let res;
    for (let attempt = 0; attempt < 4 && !res; attempt++) {
      const r = await fetch(`${BASE}/api/read?lang=${lang}&fresh=1`, { method: 'POST', headers: { 'Content-Type': 'image/jpeg' }, body: img });
      if (r.ok) res = await r.json();
      else {
        console.log(`  ${name}/${lang}: HTTP ${r.status}, retrying in 20s`);
        await sleep(20000);
      }
    }
    if (!res) {
      problems.push(`${name}/${lang}: no answer`);
      continue;
    }
    if (res.kind !== 'answer') problems.push(`${name}/${lang}: expected an answer, got ${res.kind}`);
    if (!res.photo?.checked) problems.push(`${name}/${lang}: not matched to its checked notice`);
    if (res.photo?.numbersOff) problems.push(`${name}/${lang}: numbers don't match the photo; run again`);

    const mp3 = await fetch(`${BASE}/api/tts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: spoken(res), lang: res.lang }) });
    if (mp3.ok) {
      const file = `photo-${name}-${lang}-${sha256.slice(0, 8)}.mp3`;
      writeFileSync(join(root, 'public', 'demo-audio', file), Buffer.from(await mp3.arrayBuffer()));
      res.audioUrl = `/demo-audio/${file}`;
    } else problems.push(`${name}/${lang}: no audio (HTTP ${mp3.status})`);

    out.push({ photo: name, sha256, lang, response: res });
    console.log(`\n[${name} ${lang}] ${res.photo?.title ?? ''}`);
    for (const l of res.lines) console.log(`   > ${l}`);
    console.log(`   items: ${res.items.map((i) => i.id).join(', ')}`);
    await sleep(3000); // stay under the free tier's requests per minute
  }
}

writeFileSync(
  outPath,
  JSON.stringify(
    {
      note: 'Saved answers for the example photos on the Ask page. Made by data/tools/read_examples.mjs from the live pipeline. Do not edit by hand; run the script again.',
      made_at: new Date().toISOString(),
      examples: out,
    },
    null,
    2,
  ) + '\n',
);
console.log(`\nSaved ${out.length} answers.`);
if (problems.length) {
  console.log('PROBLEMS:\n  ' + problems.join('\n  '));
  process.exit(1);
}
