// Every non-conformant `unknown` row, with the issue or ledger that owns it, read from the jar's own SVG.
// Usage: node plans/unknown-bucket-triage/measurements/scope.mjs <parity-unknown.json> [--ubt]
// --ubt prints only the rows this mission owns (D1). Exit 0 always: this is a reading, not a gate.
// The owner table is D1's; a row it cannot place prints `??`, which T4 must explain.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const CACHE = 'test-results/dot-cache/unknown';
const LEDGER = 'oracle/accepted-divergences.json';
const CONFORMANT = 'conformant';
const OWNER_BY_JAR_TYPE = {
  NWDIAG: '#124',
  TIMING: '#127',
  BPM: '#130',
  GIT: '#131',
  FLOW: '#132',
  HELP: '#129',
  DESCRIPTION: '#113/#147',
};
const FACTORY_TAGS = new Set(['@startcreole', '@startdef', '@startmath', '@startlatex']);
// D1: rows the jar types as one of our engines but another issue owns.
const MOVED = {
  'bitabu-34-lota947': '#123 (legacy (*) syntax)',
  'coruvi-63-vuzu133': '#123 (legacy factory takes a lone note)',
  'nezaxe-99-mumo948': '#123 (legacy factory takes a lone note)',
  'tiseze-53-gace410': '#123 (legacy factory takes a lone note)',
  'dijapi-54-jiza111': '#121 (item 15, positional style blocks)',
};

const [surveyPath, flag] = process.argv.slice(2);
if (surveyPath === undefined) throw new Error('usage: scope.mjs <parity-unknown.json> [--ubt]');
const ledger = readFileSync(LEDGER, 'utf8');

function ownerOf(slug) {
  if (MOVED[slug] !== undefined) return MOVED[slug];
  if (ledger.includes(`"svg-unknown/${slug}"`)) return 'ledger';
  const dir = join(CACHE, slug);
  if (!existsSync(join(dir, 'in.svg'))) return '?? no cached oracle';
  const svg = readFileSync(join(dir, 'in.svg'), 'utf8');
  const jarType = /data-diagram-type="([A-Z_0-9]+)"/.exec(svg)?.[1];
  const tag = /^\s*(@start[a-z]+)/m.exec(readFileSync(join(dir, 'in.puml'), 'utf8'))?.[1];
  if (jarType !== undefined && OWNER_BY_JAR_TYPE[jarType] !== undefined) return OWNER_BY_JAR_TYPE[jarType];
  if (tag !== undefined && FACTORY_TAGS.has(tag)) return '#129';
  if (svg.includes('Fonts available')) return '#135';
  if (svg.includes('Seed ') && svg.includes('Difficulty')) return 'ubt SUDOKU';
  if (jarType !== undefined) return `ubt ${jarType}`;
  return `?? ${tag ?? 'no @start'}`;
}

const counts = new Map();
for (const row of JSON.parse(readFileSync(surveyPath, 'utf8')).fixtures) {
  if (row.verdict === CONFORMANT) continue;
  const owner = ownerOf(row.slug);
  counts.set(owner, (counts.get(owner) ?? 0) + 1);
  if (flag === '--ubt' && !owner.startsWith('ubt') && !owner.startsWith('??')) continue;
  if (flag === '--ubt') console.log(`${owner}\t${row.slug}\t${row.verdict}\t${row.firstDiff ?? '-'}`);
}
for (const [owner, n] of [...counts].sort()) console.log(`${n}\t${owner}`);
