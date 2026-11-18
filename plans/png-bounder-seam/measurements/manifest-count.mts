/**
 * Count recapture-oracles.ts targets per --only chunk, and check that a chunk
 * list covers the whole manifest exactly once (T1b: the re-capture runs in
 * foreground chunks under the headless session's time cap).
 *
 * Usage:
 *   npx jiti plans/png-bounder-seam/measurements/manifest-count.mts '<glob>' ['<glob>' ...]
 * Prints `<count> <glob>` per chunk, then `manifest=<n> covered=<n> uncovered=<n> overlapping=<n>`,
 * and lists up to 20 uncovered target ids. Exit 1 unless every target is in exactly one chunk.
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildManifest, filterTargets, listRepoFiles, targetId } from '../../../scripts/lib/recapture-manifest.js';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const UNCOVERED_SHOWN = 20;

const globs = process.argv.slice(2);
const manifest = buildManifest(listRepoFiles(REPO));
const hits = new Map<string, number>();
for (const glob of globs) {
  const chunk = filterTargets(manifest, [glob]);
  console.log(`${chunk.length} ${glob}`);
  for (const t of chunk) hits.set(targetId(t), (hits.get(targetId(t)) ?? 0) + 1);
}
const ids = manifest.map(targetId);
const uncovered = ids.filter((id) => !hits.has(id));
const overlapping = [...hits.values()].filter((n) => n > 1).length;
console.log(
  `manifest=${ids.length} covered=${ids.length - uncovered.length} uncovered=${uncovered.length} overlapping=${overlapping}`,
);
for (const id of uncovered.slice(0, UNCOVERED_SHOWN)) console.log(`uncovered ${id}`);
process.exitCode = uncovered.length === 0 && overlapping === 0 ? 0 : 1;
