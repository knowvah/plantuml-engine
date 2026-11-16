// The structural DOT comparison the survey's `dotEqual` reduces to a boolean, printed in full for one cached fixture.
// Usage: npx tsx plans/description-entity-images/measurements/dot-diff.mts <dot-cache dir>
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { renderSync, combineAssetStores } from '../../../src/index.js';
import { setLayoutInputObserver, type LayoutInputEvent } from '../../../src/core/graph-layout.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { withJarCompatibleStyleInput } from '../../../src/core/internal-render-options.js';
import { fixtureIncludeStore } from '../../../tests/helpers/fixture-include-store.js';
import { parseSvekDot, dotInputToStructural, compareStructural } from '../../../tests/oracle/svek-dot.js';

const dir = process.argv[2]!;
const dots = readdirSync(dir)
  .filter((f) => /^svek-\d+\.dot$/.test(f))
  .sort()
  .map((f) => readFileSync(join(dir, f), 'utf8'));
const events: LayoutInputEvent[] = [];
setLayoutInputObserver((e) => events.push(e));
renderSync(
  readFileSync(join(dir, 'in.puml'), 'utf8'),
  withJarCompatibleStyleInput({ measurer: new DeterministicMeasurer(), includeStore: fixtureIncludeStore() }),
);
setLayoutInputObserver(undefined);
const outer = events.filter((e) => e.nestedDepth === 0);
console.log(`oracle dumps ${dots.length}, our outer graphs ${outer.length}`);
for (const [i, e] of outer.entries()) {
  const ours = dotInputToStructural(e.graph);
  const oracle = parseSvekDot(dots[i] ?? '');
  console.log(JSON.stringify(compareStructural(oracle, ours), null, 1));
  console.log('ours nodes', JSON.stringify(ours.nodes));
  console.log('oracle nodes', JSON.stringify(oracle.nodes));
}
void combineAssetStores;
