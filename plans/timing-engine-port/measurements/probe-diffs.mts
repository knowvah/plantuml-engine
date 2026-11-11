// Compare our full SVG with the jar oracle for named probes (T4a). Usage: npx jiti .../probe-diffs.mts slug ...
import { readFileSync } from 'node:fs';

import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { withClock, withJarCompatibleStyleInput } from '../../../src/core/internal-render-options.js';
import { compareSvg } from '../../../tests/oracle/svg-conformance/compare.js';
import { ORACLE_ZONE } from '../../../tests/unit/timing/helpers/factory.js';

const FIELD_LIMIT = 100;
for (const slug of process.argv.slice(2)) {
  const markup = readFileSync(`plans/timing-engine-port/probes/${slug}.puml`, 'utf8');
  const oracle = readFileSync(`/tmp/tdp-plan/oracle/${slug}.svg`, 'utf8');
  const options = withJarCompatibleStyleInput({ measurer: new DeterministicMeasurer(), filename: 'in.puml' });
  const ours = renderSync(markup, withClock(options, { nowMillis: () => 0, zone: ORACLE_ZONE }));
  const { diffs } = compareSvg(ours, oracle, 'deterministic');
  for (const d of diffs.slice(0, 3)) console.log(`${slug}\t${diffs.length}\t${d.path} | ${String(d.actual).slice(0, FIELD_LIMIT)} | ${String(d.expected).slice(0, FIELD_LIMIT)}`);
  if (diffs.length === 0) console.log(`${slug}\t0`);
}
