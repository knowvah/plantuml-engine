// Pin Chen EER authored fixtures into the DOT-parity gate (ceep T4, D5), adapted by substitution from laep's pin-legacy-dot.mts;
// applied to tests/fixtures/cheneer/ (planning-rows.json is empty: the corpus has no @startchen row): a row is structurally EQUAL when we lay out as
// many graphs as the cached `svek-N.dot` files and `compareStructural` holds on each. Prints every row with its failing
// checks and its largest node-size delta. With --write, copies each EQUAL row's `in.puml` (as `input.puml`) and
// `svek-N.dot` files to oracle/goldens/cheneer/<slug>/ and writes `size-backlog.json` for EQUAL rows whose node
// sizes are not yet exact. `--authored <dir>` adds the authored fixtures of tests/fixtures/cheneer/ whose jar DOT
// T3c kept at <dir>/<slug>/svek-N.dot (journal 19); a fixture with none there (an error page, ELK, Smetana) is skipped.
// Usage: npx jiti plans/chen-eer-engine-port/measurements/pin-cheneer-dot.mts [--authored <dir>] [--write]
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { setLayoutInputObserver, type DotInputGraph } from '../../../src/core/graph-layout.js';
import { structuralFailures } from '../../../tests/oracle/dot-parity-backlogs.js';
import { renderFixtureCheneer } from '../../../tests/oracle/svg-conformance/render-fixture-cheneer.js';
import { compareStructural, dotInputToStructural, parseSvekDot } from '../../../tests/oracle/svek-dot.js';

const GOLDENS = 'oracle/goldens/cheneer';
const CACHE = 'test-results/dot-cache';
const ROWS = 'plans/chen-eer-engine-port/measurements/planning-rows.json';
const SIZE_EPSILON_IN = 1e-6;
const AUTHORED = 'tests/fixtures/cheneer';
const write = process.argv.includes('--write');
const authoredFlag = process.argv.indexOf('--authored');
const authoredDots = authoredFlag < 0 ? undefined : process.argv[authoredFlag + 1];

interface Row {
  readonly bucket: string;
  readonly slug: string;
}

/** One fixture to classify: its source, the directory holding its jar `svek-N.dot`, and its golden name. */
interface Candidate {
  readonly name: string;
  readonly puml: string;
  readonly dots: string;
}

/** Sorted `svek-N.dot` filenames in a fixture directory, in pass order. */
function svekFiles(dir: string): string[] {
  return readdirSync(dir)
    .filter((f) => /^svek-\d+\.dot$/.test(f))
    .sort((a, b) => Number(/\d+/.exec(a)![0]) - Number(/\d+/.exec(b)![0]));
}

/** The layout graphs one render hands the engine, in order. */
function captureGraphs(markup: string): DotInputGraph[] {
  const graphs: DotInputGraph[] = [];
  setLayoutInputObserver(({ graph }) => graphs.push(graph));
  try {
    renderFixtureCheneer(markup);
  } finally {
    setLayoutInputObserver(undefined);
  }
  return graphs;
}

const candidates: Candidate[] = (JSON.parse(readFileSync(ROWS, 'utf8')) as Row[]).map((row) => {
  const dir = join(CACHE, row.bucket, row.slug);
  return { name: row.slug, puml: join(dir, 'in.puml'), dots: dir };
});
if (authoredDots !== undefined) {
  for (const f of readdirSync(AUTHORED).filter((n) => n.endsWith('.puml')).sort()) {
    const slug = f.slice(0, -'.puml'.length);
    const dots = join(authoredDots, slug);
    if (existsSync(dots) && svekFiles(dots).length > 0) candidates.push({ name: slug, puml: join(AUTHORED, f), dots });
    else console.log(`skip    authored/${slug}: no jar svek DOT (an error page, or an ELK or Smetana layout)`);
  }
}

const sizeBacklog: Record<string, number> = {};
const equal: Candidate[] = [];
for (const c of candidates) {
  const files = svekFiles(c.dots);
  const graphs = captureGraphs(readFileSync(c.puml, 'utf8'));
  if (graphs.length !== files.length) {
    console.log(`UNEQUAL ${c.name} graphs ours=${graphs.length} jar=${files.length}`);
    continue;
  }
  const diffs = files.map((f, i) =>
    compareStructural(parseSvekDot(readFileSync(join(c.dots, f), 'utf8')), dotInputToStructural(graphs[i]!)),
  );
  const failures = [...new Set(diffs.flatMap(structuralFailures))].sort();
  const size = Math.max(0, ...diffs.map((d) => d.maxSizeDeltaIn));
  if (failures.length > 0) {
    console.log(`UNEQUAL ${c.name} ${failures.join(',')}`);
    continue;
  }
  console.log(`EQUAL   ${c.name} graphs=${files.length} maxSizeDeltaIn=${size}`);
  equal.push(c);
  if (size > SIZE_EPSILON_IN) sizeBacklog[c.name] = size;
}

if (write) {
  for (const c of equal) {
    const dst = join(GOLDENS, c.name);
    mkdirSync(dst, { recursive: true });
    copyFileSync(c.puml, join(dst, 'input.puml'));
    for (const f of svekFiles(c.dots)) copyFileSync(join(c.dots, f), join(dst, f));
  }
  writeFileSync(join(GOLDENS, 'size-backlog.json'), `${JSON.stringify(sizeBacklog, null, 2)}\n`);
}
console.log(`equal ${equal.length} size-backlog ${Object.keys(sizeBacklog).length}${write ? ' written' : ''}`);
