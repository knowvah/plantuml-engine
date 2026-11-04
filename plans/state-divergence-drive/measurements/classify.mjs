// Sort each open state row into the families the brief's tasks own, from its source and its diffs.
// Usage: node plans/state-divergence-drive/measurements/classify.mjs <diffs.json> [out.md]
// A row may sit in several families: a family names a lead to read in the Java, never a proved cause.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const CACHE = 'test-results/dot-cache/state';
const UNASSIGNED = 'T6d';

const attrOf = (d) => d.p.split('/').pop();
const anyDiff = (test) => (_src, diffs) => diffs.some(test);
const srcHas = (re) => (src) => re.test(src);
const either = (...tests) => (src, diffs) => tests.some((t) => t(src, diffs));

const isZaent = (d) => attrOf(d) === '@id' && d.a.includes('__zaent_');
const isUniq = (d) => attrOf(d) === '@id' && d.e.startsWith(d.a) && /-\d+$/.test(d.e);
const isEntSwap = (d) => attrOf(d) === '@id' && /^ent\d+$/.test(d.a) && /^ent\d+$/.test(d.e);
const isClusterOrder = (d) => attrOf(d) === '@class' && d.a !== d.e;

const FAMILIES = [
  ['T1a', 'link id: `Entity#getName`, `uniq`', anyDiff((d) => isZaent(d) || isUniq(d))],
  ['T1b', 'border point: no entity group', srcHas(/<<\s*(entry|exit)point\s*>>|<<\s*(input|output)pin\s*>>|<<\s*expansion(in|out)put\s*>>/i)],
  ['T1c', 'draw order: clusters, nodes, lines', anyDiff(isClusterOrder)],
  ['T1d', 'entity uid and quark-made parents', either(anyDiff(isEntSwap), srcHas(/^\s*state\s+\S*\.\S/im))],
  ['T2a', 'link style and stereotype', either(srcHas(/-+[a-z]*\[[^\]]*\]-*>/i), srcHas(/^\s*\S+\s+-+>\s+\S+\s+<<\w+>>/im), srcHas(/arrow\s*\{/i))],
  ['T2b', 'inverted link: head, id, comment', srcHas(/<-+\s|-+(l|le|lef|left|u|up)-*>/i)],
  ['T2c', 'link label: `getWithNewlines`, wrap, visibility', anyDiff((d) => /\\n/.test(d.a) || (attrOf(d).startsWith('text()') && d.a.startsWith('+')))],
  ['T3a', 'state `Colors`: line colour and stroke', srcHas(/##|#line[.:]|;line[.:]/i)],
  ['T3b', 'LineThickness and `Stroke` reads', anyDiff((d) => attrOf(d) === '@stroke-width')],
  ['T3c', 'composite header: description, height, back colour', anyDiff((d) => /path\[1\]\/@d(\[\d+\])?$/.test(d.p) && /^svg\/g\[1\]\/(g\[\d+\]\/)*(path|line)\[1\]/.test(d.p))],
  ['T3d', 'small reads: font, bar colour, hyperlink, url, alpha', either(srcHas(/FontName|ActivityBarColor|hyperlink|\[\[|#[0-9a-f]{8}\b/i), anyDiff((d) => attrOf(d) === '@font-family' || attrOf(d) === '@text-decoration'))],
  ['T4a', 'scale and dpi at export', srcHas(/^\s*scale\s|skinparam\s+dpi/im)],
  ['T4b', 'text alignment and chrome text', either(srcHas(/wrapWidth|<sup>|<sub>|HorizontalAlignment|\|_/), anyDiff((d) => attrOf(d) === '@textLength' && d.a !== '' && d.e !== '' && Math.abs(Number(d.a) - Number(d.e)) < 10))],
  ['T5a', '`hide <<x>>`, `skin` files, json leaf, table note', srcHas(/hide\s+<<|^\s*skin\s|^\s*json\s|\|=/im)],
  ['T5b', 'note: endpoint, one-line `\\n`, `note on link` colour', srcHas(/note\s+on\s+link\s+#|^\s*note\s+.*\\n/im)],
  ['T5c', 'embedded or math label', srcHas(/\{\{|<math>|<latex>/i)],
  ['T6a', 'concurrent regions', srcHas(/^\s*(--|\|\|)\s*$/m)],
  ['T6b', 'history, qualified endpoint', srcHas(/\[H\*?\]|::/)],
];

const [diffsPath, outPath] = process.argv.slice(2);
if (diffsPath === undefined) throw new Error('usage: classify.mjs <diffs.json> [out.md]');

const rows = Object.entries(JSON.parse(readFileSync(diffsPath, 'utf8')));
const byFamily = new Map([...FAMILIES.map(([id]) => [id, []]), [UNASSIGNED, []]]);
const lines = [];
for (const [slug, row] of rows) {
  const src = readFileSync(join(CACHE, slug, 'in.puml'), 'utf8');
  const hits = FAMILIES.filter(([, , test]) => test(src, row.diffs)).map(([id]) => id);
  const families = hits.length > 0 ? hits : [UNASSIGNED];
  for (const id of families) byFamily.get(id).push(slug);
  lines.push({ slug, verdict: row.verdict, n: row.diffs.length, families });
}
lines.sort((a, b) => a.n - b.n);

const titleOf = new Map(FAMILIES.map(([id, title]) => [id, title]));
const md = [
  `# Open state rows, ${rows.length}`,
  '',
  'Written by `measurements/classify.mjs`. A family is a lead from source and diff patterns, not a proved cause.',
  '',
  '## Families',
  '',
  '| task | lead | rows |',
  '|---|---|---:|',
  ...[...byFamily].map(([id, slugs]) => `| ${id} | ${titleOf.get(id) ?? 'unassigned: layout-side, read first'} | ${slugs.length} |`),
  '',
  '## Rows',
  '',
  '| row | verdict | diffs | families |',
  '|---|---|---:|---|',
  ...lines.map((l) => `| \`${l.slug}\` | ${l.verdict} | ${l.n} | ${l.families.join(' ')} |`),
  '',
];
if (outPath !== undefined) writeFileSync(outPath, md.join('\n'));
for (const [id, slugs] of byFamily) console.log(`${id} ${slugs.length}`);
