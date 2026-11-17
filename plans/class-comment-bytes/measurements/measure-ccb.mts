/**
 * class-comment-bytes (ccb, #151): compares the `<!--...-->` comment sequence of
 * every class/object golden-ratchet pin, every probe and every gate fixture with
 * its jar oracle, through the ratchet's own render path (`renderClassFixture` +
 * `censusClassFixtureOptions` + ELK). `compareSvg` drops comments, so this is the
 * only measure of them.
 *
 * Usage: npx tsx plans/class-comment-bytes/measurements/measure-ccb.mts [out.json] [-v]
 *
 * Prints one line per differing row: bucket, name, the comments only ours has and
 * the comments only the jar has (multiset difference, first 3 each). Buckets are
 * shape heuristics, not mechanisms: A-hidden (jar has extra, the source hides
 * something), B-name (both sides have extras), C-ours-extra (only ours has extras),
 * X-jar-extra (jar has extras, nothing hidden), O-order (same multiset, other order).
 * Ends with `rows N equal E differ D` and the per-bucket counts.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { DeterministicMeasurer } = await import(`${REPO}/src/core/measurer-deterministic.ts`);
const { renderClassFixture, prepareElkOnce } = await import(
  `${REPO}/tests/oracle/svg-conformance/render-fixture-class.ts`
);
const { censusClassFixtureOptions } = await import(`${REPO}/scripts/svg-conformance-census.ts`);
await prepareElkOnce();

interface Row {
  name: string;
  puml: string;
  oracle: string;
}

function pinRows(): Row[] {
  const rows: Row[] = [];
  const cls = JSON.parse(readFileSync(join(REPO, 'oracle/goldens/svg-class/ratchet.json'), 'utf8'));
  for (const f of cls.fixtures as { slug: string; tree?: string }[]) {
    const tree = f.tree === undefined || f.tree === 'class' ? '' : `${f.tree}/`;
    const dir = join(REPO, 'oracle/goldens/svg-class', tree + f.slug);
    rows.push({ name: `class/${tree}${f.slug}`, puml: join(dir, 'in.puml'), oracle: join(dir, 'golden.svg') });
  }
  const obj = JSON.parse(readFileSync(join(REPO, 'oracle/goldens/svg-object/ratchet.json'), 'utf8'));
  for (const f of obj.fixtures as { slug: string }[]) {
    const dir = join(REPO, 'oracle/goldens/svg-object', f.slug);
    rows.push({ name: `object/${f.slug}`, puml: join(dir, 'in.puml'), oracle: join(dir, 'golden.svg') });
  }
  return rows;
}

/** `<dir>/<name>.puml` beside `<dir>/<name>.svg`, or `<dir>/oracle/<name>.svg`. */
function fixtureRows(label: string, dir: string): Row[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.puml'))
    .map((f) => {
      const base = f.slice(0, -'.puml'.length);
      const beside = join(dir, `${base}.svg`);
      const oracle = existsSync(beside) ? beside : join(dir, 'oracle', `${base}.svg`);
      return { name: `${label}/${base}`, puml: join(dir, f), oracle };
    })
    .filter((r) => existsSync(r.oracle));
}

const comments = (svg: string): string[] => [...svg.matchAll(/<!--([\s\S]*?)-->/g)].map((m) => m[1]);

function bucket(src: string, oursOnly: string[], jarOnly: string[]): string {
  if (oursOnly.length > 0 && jarOnly.length > 0) return 'B-name';
  if (oursOnly.length > 0) return 'C-ours-extra';
  if (jarOnly.length > 0) return /\bhide\b|\[hidden\]|hidden/i.test(src) ? 'A-hidden' : 'X-jar-extra';
  return 'O-order';
}

const args = process.argv.slice(2);
const verbose = args.includes('-v');
const outPath = args.find((a) => a.endsWith('.json'));
const rows = [
  ...pinRows(),
  ...fixtureRows('probe', join(REPO, 'plans/class-comment-bytes/measurements/probes')),
  ...fixtureRows('gate', join(REPO, 'tests/fixtures/class-comment-bytes')),
  ...fixtureRows('c4dd-T2c', join(REPO, 'tests/fixtures/c4dd-T2c')).filter((r) => r.name.endsWith('-comment')),
];
const result: Record<string, { bucket: string; oursOnly: string[]; jarOnly: string[] }> = {};
const counts: Record<string, number> = {};
let equal = 0;
for (const row of rows) {
  const src = readFileSync(row.puml, 'utf8');
  let ours: string[];
  try {
    ours = comments(renderClassFixture(src, new DeterministicMeasurer(), censusClassFixtureOptions()));
  } catch (err) {
    console.log(`ERROR ${row.name} ${String(err).split('\n')[0]}`);
    counts.ERROR = (counts.ERROR ?? 0) + 1;
    continue;
  }
  const jar = comments(readFileSync(row.oracle, 'utf8'));
  if (ours.length === jar.length && ours.every((c, i) => c === jar[i])) {
    equal++;
    continue;
  }
  const jarOnly = [...jar];
  const oursOnly: string[] = [];
  for (const c of ours) {
    const i = jarOnly.indexOf(c);
    if (i >= 0) jarOnly.splice(i, 1);
    else oursOnly.push(c);
  }
  const b = bucket(src, oursOnly, jarOnly);
  counts[b] = (counts[b] ?? 0) + 1;
  result[row.name] = { bucket: b, oursOnly, jarOnly };
  console.log(
    `${b} ${row.name} ours+[${oursOnly.slice(0, 3).join(' | ')}] jar+[${jarOnly.slice(0, 3).join(' | ')}]`,
  );
  if (verbose) {
    console.log(`  OURS ${ours.join(' ')}`);
    console.log(`  JAR  ${jar.join(' ')}`);
  }
}
const differ = Object.keys(result).length;
console.log(`rows ${rows.length} equal ${equal} differ ${differ} ${JSON.stringify(counts)}`);
if (outPath !== undefined) writeFileSync(outPath, JSON.stringify(result, null, 2));
