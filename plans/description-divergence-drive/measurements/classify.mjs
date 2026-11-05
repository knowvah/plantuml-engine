// Sort each open row into the families the brief's tasks own, from its source and its diffs.
// Usage: node plans/description-divergence-drive/measurements/classify.mjs <diffs.json> [out.md]
// A row may sit in several families. A family names a lead to read in the Java, never a proved cause.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const CACHE = 'test-results/dot-cache';
const UNASSIGNED = 'T5d';

const attrOf = (d) => d.p.split('/').pop().replace(/\[\d+\]$/, '');
const anyDiff = (test) => (_src, diffs) => diffs.some(test);
const srcHas = (re) => (src) => re.test(src);
const either = (...tests) => (src, diffs) => tests.some((t) => t(src, diffs));
const both = (...tests) => (src, diffs) => tests.every((t) => t(src, diffs));
const refused = (_src, diffs) => diffs.some((d) => attrOf(d) === '@background' && d.a === '#000000');
const isCorner = (d) => attrOf(d) === '@rx' && d.a !== d.e;
const pathVsRect = (d) => d.a === 'rect' && d.e === 'path';
const isDash = (d) => attrOf(d) === '@stroke-dasharray';
const isLineStroke = (d) => ['@stroke', '@stroke-width'].includes(attrOf(d)) && /\/(rect|path|line|polygon)\[\d+\]\/@/.test(d.p);
const edgeEnd = (d) => /g\[\d+\]\/path\[1\]\/@d(\[\d+\])?$/.test(d.p) || /polygon\[1\]\/@points/.test(d.p);

const FAMILIES = [
  ['T1a', '`CommandCreateElementFull` DISPLAY2 and CODE1 forms', srcHas(/^\s*:[^:\n]+:\/?\s+(as\b|<<)|^\s*\([^()\n]+\)\/\s+as\b/m)],
  ['T1b', 'class factory refuses, description answers', srcHas(/^\s*package\s+(#\w+\s*)?\{|^\s*(person|actor)\s+"\d+"\s+[*o-]/im)],
  ['T1c', 'missing commands: domain, `[` body, nested json/map, note url, unicode title', either(refused, srcHas(/^\s*domain\s/m))],
  ['T2a', 'corners: `DiagonalCorner`, stereotype `RoundCorner`', either(anyDiff(isCorner), anyDiff(pathVsRect), srcHas(/DiagonalCorner/i))],
  ['T2b', 'stroke: `LineStyle`, `BorderStyle`, `BorderThickness`, cluster border', either(both(anyDiff(isDash), srcHas(/border\s*style|linestyle/i)), both(anyDiff(isLineStroke), srcHas(/border(color|thickness)|linethickness/i)))],
  ['T2c', 'fonts: `FontName`, stereotype style, `HorizontalAlignment`', either(anyDiff((d) => attrOf(d) === '@font-family'), srcHas(/^\s*stereotype\s*\{|HorizontalAlignment|fontname/im))],
  ['T2d', 'positional `<style>`: `Entity#getCurrentStyleBuilder`', (src) => (src.match(/<style>/g) ?? []).length > 1],
  ['T2e', 'colour specs: `text:`, `line.`, `#?a:b`', srcHas(/#\?\w+:\w+|Color(<<[^>]+>>)?\s+[^\n]*(text:|line\.)/i)],
  ['T3a', 'middle decor: `-0)-`, `-(0)-`', srcHas(/-+(le|ri|up|do|left|right|down)?\(?0\)?-+|\.+up\(0\)|~up\(0\)|\)-0-\(|0\)-\(0/)],
  ['T3b', 'magnetic border: folder, cluster, note', both(anyDiff(edgeEnd), srcHas(/^\s*(package|folder|cloud|node|frame|rectangle)\b/im))],
  ['T3c', 'quantifier and role text', srcHas(/"\*"|"\d"\s*[-.~]|[-.~#]+\s*"[^"]+"\s+\w+\s*:/)],
  ['T3d', 'arrow style: `<<tag>>`, `arrow {}`, rainbow, transparent', srcHas(/^\s*arrow\s*\{|skinparam\s+arrow|-\[#[^\]]*;|-\[#transparent\]|->\s*\S+\s*<<\w+>>/im)],
  ['T3e', 'link labels: magic arrow, `maxMessageSize`, atoms', srcHas(/:\s*[<>]\s|\s:\s.*\s[<>]$|maxMessageSize|-->?\s*\S+\s*:\s*.*<\$/im)],
  ['T4a', 'degenerate and leaf sizing', anyDiff((d) => /^svg\/@height$/.test(d.p))],
  ['T4b', '`skinparam guillemet`', srcHas(/skinparam\s+guillemet/i)],
  ['T4c', 'empty and anonymous containers', srcHas(/^\s*(cloud|package|node|frame|folder)(\s+\S+)?\s*\{\s*\n\s*\}/im)],
  ['T4d', 'sprites in a stereotype and in a body', srcHas(/<<\$|sprite\s+\S+\s+<svg|sprite\s+\$?\S+\s+\[|sprite\s+\S+\s+jar:/i)],
  ['T4e', 'notes: colour, stereotype, on link', srcHas(/^\s*note\b[^\n]*(#|<<)|skinparam\s+note|note\s+on\s+link/im)],
  ['T4f', 'archimate', srcHas(/archimate/i)],
  ['T4g', 'creole rules and underline stroke', either(srcHas(/__\w+__|^\s*(--|==|\.\.)[^\n]*$/m), anyDiff((d) => attrOf(d) === '@stroke-width' && /line\[\d+\]/.test(d.p) && d.e === '0.5'))],
  ['T5a', '`skinparam handwritten`', srcHas(/handwritten/i)],
  ['T5b', '`!theme`, `skin`, monochrome', srcHas(/^\s*!theme\s|^\s*skin\s|monochrome/im)],
  ['T5c', 'inline gradient, shadow, interactive defs, transparent root', either(srcHas(/\|\w+;line|svginteractive|shadowing<<|backgroundcolor\s+transparent/i), anyDiff((d) => d.p === 'svg/@height' && d.e === ''))],
  ['T5e', 'named end: LaTeX, Smetana, oracle error', srcHas(/<latex>|<math>|pragma\s+layout\s+smetana/i)],
];

const [diffsPath, outPath] = process.argv.slice(2);
if (diffsPath === undefined) throw new Error('usage: classify.mjs <diffs.json> [out.md]');

const rows = Object.entries(JSON.parse(readFileSync(diffsPath, 'utf8')));
const byFamily = new Map([...FAMILIES.map(([id]) => [id, []]), [UNASSIGNED, []]]);
const lines = [];
for (const [key, row] of rows) {
  const src = readFileSync(join(CACHE, key, 'in.puml'), 'utf8');
  const hits = FAMILIES.filter(([, , test]) => test(src, row.diffs)).map(([id]) => id);
  const families = hits.length > 0 ? hits : [UNASSIGNED];
  for (const id of families) byFamily.get(id).push(key);
  const first = row.diffs[0];
  const lead = first === undefined ? '' : `\`${first.p.replace('svg/g[1]/', '').slice(-34)}\` ${first.a.slice(0, 18)} / ${first.e.slice(0, 18)}`;
  lines.push({ key, verdict: row.verdict, n: row.diffs.length, families, dot: row.dotEqual, lead });
}
lines.sort((a, b) => a.n - b.n);

const titleOf = new Map(FAMILIES.map(([id, title]) => [id, title]));
const md = [
  `# Open description rows, ${rows.length}`,
  '',
  'Written by `measurements/classify.mjs`. A family is a lead from source and diff patterns, not a proved cause.',
  '',
  '## Families',
  '',
  '| task | lead | rows |',
  '|---|---|---:|',
  ...[...byFamily].map(([id, keys]) => `| ${id} | ${titleOf.get(id) ?? 'unassigned: read first'} | ${keys.length} |`),
  '',
  '## Rows',
  '',
  '| row | verdict | diffs | dotEqual | families | first diff (ours / jar) |',
  '|---|---|---:|---|---|---|',
  ...lines.map((l) => `| \`${l.key}\` | ${l.verdict} | ${l.n} | ${l.dot} | ${l.families.join(' ')} | ${l.lead.replaceAll('|', '\\|')} |`),
  '',
];
if (outPath !== undefined) writeFileSync(outPath, md.join('\n'));
for (const [id, keys] of byFamily) console.log(`${id} ${keys.length}${id === UNASSIGNED ? ` ${keys.join(' ')}` : ''}`);
