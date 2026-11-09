// node plans/activity-authored-rows/measurements/census-away.mjs <git-ref>
//
// For the activity style/text/swimlane census pins, lists every attribute whose
// `ours` histogram moved AWAY from the jar's between <git-ref> and the working
// tree (.claude/memory/census-away-from-jar-catches-hidden-regressions.md).
// Distance per attribute = sum over keys of |ours[k] - jar[k]| (numbers compared
// directly). Exit 1 when any attribute moved away.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const ref = process.argv[2];
if (!ref) {
  console.error('usage: census-away.mjs <git-ref>');
  process.exit(2);
}
const FILES = ['style-baseline.json', 'text-baseline.json', 'swimlane-baseline.json'].map(
  (f) => `oracle/goldens/svg-activity/${f}`,
);

const NUMERIC = /^-?\d+(\.\d+)?$/;

function distance(ours, jar) {
  // `width`/`height` are pinned as strings: compare them as numbers, not as digit maps.
  if (NUMERIC.test(String(ours)) && NUMERIC.test(String(jar))) return Math.abs(Number(ours) - Number(jar));
  if (typeof ours === 'number' || typeof jar === 'number') return Math.abs((ours ?? 0) - (jar ?? 0));
  const keys = new Set([...Object.keys(ours ?? {}), ...Object.keys(jar ?? {})]);
  let d = 0;
  for (const k of keys) d += Math.abs((ours?.[k] ?? 0) - (jar?.[k] ?? 0));
  return d;
}

let away = 0;
for (const file of FILES) {
  const before = new Map(
    JSON.parse(execFileSync('git', ['show', `${ref}:${file}`], { encoding: 'utf8', maxBuffer: 1 << 28 })).fixtures.map(
      (f) => [f.slug, f],
    ),
  );
  for (const now of JSON.parse(readFileSync(file, 'utf8')).fixtures) {
    const was = before.get(now.slug);
    if (was?.ours === undefined || now.ours === undefined || now.jar === undefined) continue;
    for (const attr of new Set([...Object.keys(now.ours), ...Object.keys(now.jar)])) {
      const d0 = distance(was.ours[attr], was.jar?.[attr] ?? now.jar[attr]);
      const d1 = distance(now.ours[attr], now.jar[attr]);
      if (d1 > d0) {
        away++;
        console.log(`AWAY ${file.split('/').pop()} ${now.slug} ${attr}: ${d0} -> ${d1}`);
      }
    }
  }
}
console.log(`away ${away}`);
if (away > 0) process.exit(1);
