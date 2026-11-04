// Every ratchet pin must read zero diffs in its bucket's census.
// Usage: node pins-vs-census.mjs [census-dir]   (default: the committed path)
// Exit 1 on any pinned row that is nonzero or absent.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const GOLDENS = 'oracle/goldens';
const NO_CENSUS_FAMILIES = new Set(['svg-skin', 'svg-conformance', 'svg-lengthadjust']);
const FAMILY_BUCKET = { 'svg-utility': 'unknown' };

const dir = process.argv[2] ?? 'tests/oracle/svg-conformance';

function censusOf(bucket) {
  const rows = JSON.parse(readFileSync(join(dir, `census-${bucket}.json`), 'utf8')).fixtures;
  return new Map(rows.map((r) => [r.slug, r]));
}

let bad = 0;
for (const family of readdirSync(GOLDENS).filter((f) => f.startsWith('svg-')).sort()) {
  const path = join(GOLDENS, family, 'ratchet.json');
  if (NO_CENSUS_FAMILIES.has(family) || !existsSync(path)) continue;
  const pins = JSON.parse(readFileSync(path, 'utf8')).fixtures;
  const buckets = new Map();
  for (const pin of pins) {
    const bucket = pin.type ?? FAMILY_BUCKET[family] ?? family.replace('svg-', '');
    buckets.set(bucket, [...(buckets.get(bucket) ?? []), pin.slug]);
  }
  for (const [bucket, slugs] of buckets) {
    const census = censusOf(bucket);
    const nonzero = slugs.filter((s) => census.get(s)?.bucket !== '0');
    bad += nonzero.length;
    const zero = [...census.values()].filter((r) => r.bucket === '0').length;
    const shown = nonzero.map((s) => `${s}:${census.get(s)?.diffCount ?? 'absent'}`).join(' ');
    console.log(`${family}/${bucket}: pins ${slugs.length}, census zero ${zero}, nonzero ${nonzero.length} ${shown}`);
  }
}
console.log(`pinned rows nonzero: ${bad}`);
process.exit(bad > 0 ? 1 : 0);
