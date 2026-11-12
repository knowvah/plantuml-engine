// Render each .puml <runs> times through scripts/oracle-render.sh and classify the jar's output (flp D4; ceep D6 reuses it as a stability check):
//   stable       every run byte-identical (one box, or an error page)
//   order-only   bytes differ, the sorted tag multiset is identical (HashMap draw order)
//   geometry     the multiset differs too (TilesField#moveAllToEast resolves a shared position by hash order)
// Error pages differ only in their random quote line; they are reported as `error` and never counted.
// Usage: node plans/flow-engine-port/measurements/jar-variants.mjs <absolute-out-dir> <runs> <puml...>
// Writes <out-dir>/run<k>/<slug>.svg and <out-dir>/variants.json.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const FLOW_TYPE = 'data-diagram-type="CHEN_EER"';
const [outDir, runsArg, ...pumls] = process.argv.slice(2);
const runs = Number(runsArg);
if (outDir === undefined || !Number.isInteger(runs) || runs < 2 || pumls.length === 0)
  throw new Error('usage: jar-variants.mjs <absolute-out-dir> <runs>=2+ <puml...>');

const md5 = (s) => createHash('md5').update(s).digest('hex').slice(0, 8);
const sortedTags = (svg) => svg.slice(svg.indexOf('<g')).split('>').map((t) => t.trim()).sort().join('>');

for (let k = 1; k <= runs; k++) {
  const dir = join(outDir, `run${k}`);
  mkdirSync(dir, { recursive: true });
  // The jar exits non-zero on an error page; the SVG is still written, so the status is not a failure here.
  spawnSync('scripts/oracle-render.sh', [dir, ...pumls], { stdio: 'ignore' });
}

const report = {};
for (const puml of pumls) {
  const slug = basename(puml, '.puml');
  // ceep T3b fix: `@startchen movies` names the jar's output `movies.svg`, not `<slug>.svg`.
  const named = readFileSync(puml, 'utf8').match(/^@start\w+[ \t]+(\S+)/m)?.[1];
  const file = existsSync(join(outDir, 'run1', `${slug}.svg`)) || named === undefined ? slug : named;
  const svgs = [];
  for (let k = 1; k <= runs; k++) svgs.push(readFileSync(join(outDir, `run${k}`, `${file}.svg`), 'utf8'));
  const raw = new Set(svgs.map(md5));
  const sorted = new Set(svgs.map((s) => md5(sortedTags(s))));
  let kind;
  if (!svgs[0].includes(FLOW_TYPE)) kind = 'error';
  else if (raw.size === 1) kind = 'stable';
  else if (sorted.size === 1) kind = 'order-only';
  else kind = 'geometry';
  report[slug] = { kind, rawVariants: raw.size, layoutVariants: sorted.size };
  console.log(`${slug} ${kind} raw=${raw.size} layouts=${sorted.size}`);
}
writeFileSync(join(outDir, 'variants.json'), `${JSON.stringify(report, null, 1)}\n`);
