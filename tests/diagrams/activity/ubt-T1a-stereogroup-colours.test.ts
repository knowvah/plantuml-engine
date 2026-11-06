/**
 * ubt-T1a: `<<#color>>` colours the shape the command builds, at every command
 * upstream reads `Stereogroup#getInnerColors` on (`activitydiagram3/command/`:
 * `CommandIf2`, `CommandElseIf2`, `CommandEndif3`, `CommandRepeat3`,
 * `CommandRepeatWhile3`, `CommandWhile3`, `CommandSwitch`, `CommandEndSwitch`,
 * `CommandStart3`, `CommandStop3`, `CommandEnd3`, `CommandFork3`).
 *
 * Each `tests/fixtures/ubt-T1a/<name>/in.svg` is the jar's own render, from the
 * corpus (`cubixe-14-gaze754`, `lacifo-03-taka068`, `mazuxi-71-xipu561`) or
 * `scripts/oracle-render.sh` (every other name); the render path is the
 * survey's (`plans/unknown-bucket-triage/measurements/row-diffs.mts`).
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { UNKNOWN_COLOR_NEUTRAL } from '../../../src/core/klimt/color/HColorSet.js';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg } from '../../oracle/svg-conformance/compare.js';
import { fixtureIncludeStore } from '../../helpers/fixture-include-store.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURE_ROOT = join(HERE, '../../fixtures/ubt-T1a');

type RenderOptions = NonNullable<Parameters<typeof renderSync>[1]>;

function renderFixture(name: string): { ours: string; jar: string } {
  const dir = join(FIXTURE_ROOT, name);
  const options = {
    jarCompatibleStyleInput: true,
    measurer: new DeterministicMeasurer(),
    includeStore: fixtureIncludeStore(),
    filename: 'in.puml',
  } as RenderOptions;
  return {
    ours: renderSync(readFileSync(join(dir, 'in.puml'), 'utf8'), options),
    jar: readFileSync(join(dir, 'in.svg'), 'utf8'),
  };
}

/** ARROWHEAD_FILL: the `<polygon>`s that are not diamonds (`ArrowsRegular`'s arrowhead, the activity `arrow` ink). */
const ARROWHEAD_FILL = '#181818';

/** The `fill` of every diamond `<polygon>`, in document order. */
function diamondFills(svg: string): string[] {
  return [...svg.matchAll(/<polygon\b[^>]*?\bfill="([^"]*)"/g)].map((m) => m[1]!).filter((f) => f !== ARROWHEAD_FILL);
}

const CORPUS_ROWS: Record<string, string[]> = {
  // `if(foo) <<#green>>` twice, `endif <<#blue>>` once: the endif diamond inherits the if's colour.
  'cubixe-14-gaze754': ['#008000', '#00F', '#008000', '#008000'],
  // `repeat <<#green>>`: the entry diamond, and the condition diamond by `FtileFactoryDelegatorRepeat.java:99-100`.
  'lacifo-03-taka068': ['#008000', '#008000'],
  // `elseif(bar) <<#red>>`: each elseif diamond takes its own colour, the `if` and `else` the diamond style's.
  'mazuxi-71-xipu561': ['#008000', '#F00', '#F1F1F1', '#F00'],
};

describe('ubt-T1a corpus rows', () => {
  for (const [name, fills] of Object.entries(CORPUS_ROWS)) {
    it(`${name}: shape fills equal the jar's`, () => {
      const { ours, jar } = renderFixture(name);
      expect(diamondFills(jar)).toEqual(fills);
      expect(diamondFills(ours)).toEqual(fills);
    });
  }
});

describe('ubt-T1a every fixture equals its oracle', () => {
  for (const name of readdirSync(FIXTURE_ROOT).sort()) {
    it(`${name}: 0 compareSvg diffs`, () => {
      const { ours, jar } = renderFixture(name);
      expect(compareSvg(ours, jar, 'deterministic').diffs).toEqual([]);
    });
  }
});

describe('ubt-T1a an unknown colour', () => {
  it('draws the diagram with the neutral fill, as `colorOrNeutral` rules (never a throw)', () => {
    const options = {
      jarCompatibleStyleInput: true,
      measurer: new DeterministicMeasurer(),
      filename: 'in.puml',
    } as RenderOptions;
    const svg = renderSync('@startuml\nstart\nwhile (x) <<#nosuchcolour>>\n  :a;\nendwhile\nstop\n@enduml\n', options);
    expect(diamondFills(svg)).toEqual([UNKNOWN_COLOR_NEUTRAL]);
  });
});
