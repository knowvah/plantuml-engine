/**
 * Oracle DOT-parity ratchet for legacy activity diagrams (laep D5, T4).
 *
 * Legacy activity reaches real graphviz upstream (`svek-N.dot` in every row's
 * cache), so its DOT is a target, as state's is (`state-dot-parity.test.ts`,
 * whose shape this mirrors). An autarkic group is laid out in a child svek
 * pass first (`CucaDiagramSimplifierActivity.java`), so a golden may carry
 * svek-1..svek-N and the captured layout graphs pair 1:1 in order. Fixtures
 * under `oracle/goldens/activity-legacy/<slug>/` are `input.puml` + the jar's
 * `svek-N.dot`, pinned by `plans/legacy-activity-engine-port/measurements/
 * pin-legacy-dot.mts` when every graph is structurally EQUAL.
 *
 * Node SIZES are asserted too: `maxSizeDeltaIn` must be 0 for every fixture
 * not in `size-backlog.json`; a backlog fixture asserts delta <= its pinned
 * value, so a size gap can only shrink.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { setLayoutInputObserver } from '../../src/core/graph-layout.js';
import type { DotInputGraph } from '../../src/core/graph-layout.js';
import { parseSvekDot, dotInputToStructural, compareStructural } from './svek-dot.js';
import { structuralFailures } from './dot-parity-backlogs.js';
import { renderFixtureActivityLegacy } from './svg-conformance/render-fixture-activity-legacy.js';

const GOLDENS = join(dirname(fileURLToPath(import.meta.url)), '../../oracle/goldens/activity-legacy');

/** Slug → allowed maxSizeDeltaIn (inches) for not-yet-size-exact fixtures. */
const sizeBacklog: Record<string, number> = existsSync(join(GOLDENS, 'size-backlog.json'))
  ? (JSON.parse(readFileSync(join(GOLDENS, 'size-backlog.json'), 'utf8')) as Record<string, number>)
  : {};

const ratchetFixtures = readdirSync(GOLDENS, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(GOLDENS, d.name, 'input.puml')))
  .map((d) => d.name)
  .sort();

/** Sorted `svek-N.dot` filenames for a golden, in pass order. */
function svekFiles(name: string): string[] {
  return readdirSync(join(GOLDENS, name))
    .filter((f) => /^svek-\d+\.dot$/.test(f))
    .sort((a, b) => Number(/\d+/.exec(a)![0]) - Number(/\d+/.exec(b)![0]));
}

let captured: DotInputGraph[] = [];
beforeAll(() => setLayoutInputObserver(({ graph: g }) => captured.push(g)));
afterAll(() => setLayoutInputObserver(undefined));

describe('oracle DOT-parity ratchet — legacy activity diagrams', () => {
  it('has goldens to compare', () => {
    expect(ratchetFixtures.length).toBeGreaterThan(0);
  });

  it('size backlog names only pinned fixtures', () => {
    expect(Object.keys(sizeBacklog).filter((slug) => !ratchetFixtures.includes(slug))).toEqual([]);
  });

  for (const name of ratchetFixtures) {
    it(`${name}: stays structurally EQUAL to the pinned oracle DOT`, () => {
      const files = svekFiles(name);
      captured = [];
      renderFixtureActivityLegacy(readFileSync(join(GOLDENS, name, 'input.puml'), 'utf8'));
      expect(captured.length, `${name}: expected ${files.length} captured layout graph(s)`).toBe(files.length);

      for (let i = 0; i < files.length; i++) {
        const file = files[i]!;
        const diff = compareStructural(
          parseSvekDot(readFileSync(join(GOLDENS, name, file), 'utf8')),
          dotInputToStructural(captured[i]!),
        );
        expect(structuralFailures(diff), `${name}/${file}: structural checks`).toEqual([]);
        // The +1e-6 band is the 6dp inches quantization (`state-dot-parity.test.ts` explains the epsilon slack).
        const bound = (sizeBacklog[name] ?? 0) + 1e-6;
        const slack = Number.EPSILON * Math.max(diff.maxSizeDeltaIn, bound, 1);
        expect(
          diff.maxSizeDeltaIn - bound,
          `${name}/${file}: node size drift — maxSizeDeltaIn=${diff.maxSizeDeltaIn} > allowed ${bound}`,
        ).toBeLessThanOrEqual(slack);
      }
    });
  }
});
