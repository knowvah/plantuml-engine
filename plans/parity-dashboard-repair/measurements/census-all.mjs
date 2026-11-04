// Census every bucket in test-results/dot-cache, one file per bucket.
// Usage: node census-all.mjs [out-dir]   (default: the committed path)
// Node, not bash: the autonomous allowlist permits `node`, and no bash script here.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const CACHE_DIR = 'test-results/dot-cache';
const CENSUS = 'scripts/svg-conformance-census.ts';
const out = process.argv[2] ?? 'tests/oracle/svg-conformance';
const MAX_OUTPUT_BYTES = 1 << 28;

mkdirSync(out, { recursive: true });
for (const type of readdirSync(CACHE_DIR).sort()) {
  if (!statSync(join(CACHE_DIR, type)).isDirectory()) continue;
  execFileSync('npx', ['tsx', CENSUS, type, '--json', join(out, `census-${type}.json`)], {
    stdio: ['ignore', 'ignore', 'inherit'],
    maxBuffer: MAX_OUTPUT_BYTES,
  });
  console.log(`census ${type}`);
}
