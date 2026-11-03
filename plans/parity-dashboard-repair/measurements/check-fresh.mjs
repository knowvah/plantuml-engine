// Every survey, census and DOT artifact must be newer than the mission start,
// and every bucket must have both a survey and a census.
// Usage: node check-fresh.mjs <mission-start-iso> [dir]
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DEFAULT_DIR = 'tests/oracle/svg-conformance';
const CACHE_DIR = 'test-results/dot-cache';
const MEASURED = /^(parity|census)(-[a-z0-9]+)?\.json$|^dot-parity\.json$/;

const [start, dir = DEFAULT_DIR] = process.argv.slice(2);
if (start === undefined || Number.isNaN(Date.parse(start))) throw new Error('usage: check-fresh.mjs <iso> [dir]');

const files = readdirSync(dir).filter((f) => MEASURED.test(f));
const stale = files.filter((f) => {
  const { generatedAt } = JSON.parse(readFileSync(join(dir, f), 'utf8'));
  return Date.parse(generatedAt) < Date.parse(start);
});
const buckets = readdirSync(CACHE_DIR);
const missing = buckets.flatMap((b) =>
  [`parity-${b}.json`, `census-${b}.json`].filter((f) => !files.includes(f)),
);
console.log(`checked ${files.length} files over ${buckets.length} buckets`);
console.log(`stale: ${stale.join(' ') || 'none'}`);
console.log(`missing: ${missing.join(' ') || 'none'}`);
process.exit(stale.length + missing.length > 0 ? 1 : 0);
