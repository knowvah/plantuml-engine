// Rows whose verdict moved between two survey files of one bucket (board's board-moves.mjs, any bucket).
// Usage: node plans/nwdiag-engine-port/measurements/survey-moves.mjs <before.json> <after.json>
// Prints each moved row as `slug before -> after`, then counts. Exit 1 when a row leaves conformant (a loss).
import { readFileSync } from 'node:fs';

const CONFORMANT = 'conformant';
const [beforePath, afterPath] = process.argv.slice(2);
if (beforePath === undefined || afterPath === undefined) throw new Error('usage: survey-moves.mjs <before> <after>');
const read = (p) => new Map(JSON.parse(readFileSync(p, 'utf8')).fixtures.map((r) => [r.slug, r.verdict]));
const before = read(beforePath);
const after = read(afterPath);

let gained = 0;
let lost = 0;
for (const [slug, was] of before) {
  const now = after.get(slug) ?? 'missing';
  if (now === was) continue;
  console.log(`${slug} ${was} -> ${now}`);
  if (now === CONFORMANT) gained++;
  if (was === CONFORMANT) lost++;
}
for (const slug of after.keys()) if (!before.has(slug)) console.log(`${slug} new ${after.get(slug)}`);
console.log(`gained ${gained} lost ${lost}`);
process.exitCode = lost > 0 ? 1 : 0;
