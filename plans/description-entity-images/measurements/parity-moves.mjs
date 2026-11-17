// Every verdict/dotEqual move between two parity-*.json files.
// Usage: node plans/description-entity-images/measurements/parity-moves.mjs <base.json> <new.json>
import { readFileSync } from 'node:fs';

const [basePath, newPath] = process.argv.slice(2);
const load = (p) => new Map(JSON.parse(readFileSync(p, 'utf8')).fixtures.map((f) => [f.slug, f]));
const base = load(basePath);
const next = load(newPath);
let moved = 0;
for (const [slug, f] of next) {
  const b = base.get(slug);
  if (b === undefined) {
    console.log(`new  ${slug} ${f.verdict} dotEqual=${f.dotEqual}`);
    continue;
  }
  if (b.verdict !== f.verdict || b.dotEqual !== f.dotEqual) {
    moved++;
    console.log(`move ${slug} ${b.verdict}/${b.dotEqual} -> ${f.verdict}/${f.dotEqual}`);
  }
}
for (const slug of base.keys()) if (!next.has(slug)) console.log(`gone ${slug}`);
console.log(`moved ${moved}`);
