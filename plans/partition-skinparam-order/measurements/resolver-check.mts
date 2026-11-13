// pso planning tool, valid on the base (71d02f38f) only: T2 moves the resolver onto graph.activity.compositeStyleOf.
// Usage: npx jiti plans/partition-skinparam-order/measurements/resolver-check.mts <probe.puml...> (from the repo root)
// Planning check: the existing hidden per-frame resolver's colours for a probe.
import { readFileSync } from 'node:fs';
const ROOT = process.cwd(); // run from the repo root
const { preprocess } = await import(`${ROOT}/src/core/preprocessor.ts`);
const { buildTheme } = await import(`${ROOT}/src/core/build-theme.ts`);
const { activityCompositeStyleOf } = await import(`${ROOT}/src/core/activity-box-style.ts`);
const { paintOf } = await import(`${ROOT}/src/core/activity-circle-style.ts`);
for (const file of process.argv.slice(2)) {
  const src = readFileSync(file, 'utf8');
  const pre = preprocess(src);
  const t = buildTheme(pre, undefined, 'activity');
  const theme = t.theme ?? t;
  const sym = /\n(rectangle|partition|card|package|group) F/.exec(src)?.[1];
  const pos = src.split('\n').findIndex((l) => /^(rectangle|partition|card|package|group) F/.test(l));
  const style = activityCompositeStyleOf(theme)?.(sym, undefined, pos);
  const show = (n) => { const p = style && paintOf(style, n, false); return p === undefined ? '-' : JSON.stringify(p); };
  console.log(file.split('/').pop(), sym, 'back', show('BackGroundColor'), 'line', show('LineColor'), 'font', show('FontColor'));
}
