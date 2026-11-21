/**
 * Upstream 443598c29ce ("improve warning display"): the activity commands that
 * still parse a leading `#color:` now warn that it is ignored, `CommandActivity3`
 * takes a single-line `#color:label;`, and `CommandIf4`/`CommandElseIf3` colour
 * their diamond from the stereogroup's inner BACK colour instead of the leading
 * colour. Each fixture under `tests/fixtures/activity/repin-443598c/` is upstream's
 * own nonreg source (`src/test/resources/vega/nonreg/activity-color-prefix/`,
 * `.../activity-deprecated-color/`, front matter removed) with its jar oracle
 * (`scripts/oracle-render.sh`, deterministic text) beside it.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/command/CommandActivity3.java:136-144
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/command/CommandIf4.java:122-128
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/command/CommandElseIf3.java:156-162
 */
import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderFixtureActivity } from '../../oracle/svg-conformance/render-fixture-activity.js';
import { fixtureIncludeStore } from '../../helpers/fixture-include-store.js';
import { compareSvg } from '../../oracle/svg-conformance/compare.js';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '../../fixtures/activity/repin-443598c');
const NAMES = readdirSync(DIR)
  .filter((f) => f.endsWith('.puml'))
  .map((f) => f.slice(0, -'.puml'.length));

function diffPaths(name: string): string[] {
  const markup = readFileSync(join(DIR, `${name}.puml`), 'utf8');
  const golden = readFileSync(join(DIR, `${name}.svg`), 'utf8');
  const ours = renderFixtureActivity(markup, new DeterministicMeasurer(), { includeStore: fixtureIncludeStore() });
  return compareSvg(ours, golden, 'deterministic').diffs.map((d) => d.path);
}

describe('443598c29ce activity colour-prefix fixtures (jar oracles)', () => {
  it.each(NAMES)('%s matches the jar', (name) => {
    expect(diffPaths(name)).toEqual([]);
  });
});
