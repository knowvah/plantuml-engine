/**
 * ubt-T2b: a leaf state's creole table rules take the state's own stroke.
 * `EntityImageState#drawU` applies `style.getStroke(lineConfig.getColors())`
 * to the `ug` (`EntityImageState.java:130-132`) and draws the fields with it
 * (`:162`); `AtomTable#drawU` draws its grid on that ambient `ug`
 * (`AtomTable.java:146-155`). An empty `state X { }` is such a leaf in the jar.
 * A composite with a child draws its description through `Cluster#drawUState`
 * on the root `ug` (`SvekResult.java:72-74`), so its rules stay 1.
 *
 * Each `tests/fixtures/ubt-T2b/<name>/in.svg` is the jar's render: the corpus
 * row `lofabo-38-tefo040`, or `scripts/oracle-render.sh` for every other name.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg } from '../../oracle/svg-conformance/compare.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURE_ROOT = join(HERE, '../../fixtures/ubt-T2b');

type RenderOptions = NonNullable<Parameters<typeof renderSync>[1]>;

function renderFixture(name: string): { ours: string; jar: string } {
  const dir = join(FIXTURE_ROOT, name);
  const options = { jarCompatibleStyleInput: true, measurer: new DeterministicMeasurer() } as RenderOptions;
  return {
    ours: renderSync(readFileSync(join(dir, 'in.puml'), 'utf8'), options),
    jar: readFileSync(join(dir, 'in.svg'), 'utf8'),
  };
}

/** The stroke width of every `<line>`, in document order: the jar writes it in `style`, ours as an attribute. */
function lineWidths(svg: string): string[] {
  return [...svg.matchAll(/<line\b[^>]*>/g)].map((m) => /stroke-width[:=]"?([0-9.]+)/.exec(m[0])?.[1] ?? '');
}

describe('ubt-T2b lofabo-38-tefo040', () => {
  it("draws the table's 8 rules at the state's 0.5, as the jar does", () => {
    const { ours, jar } = renderFixture('lofabo-38-tefo040');
    expect(lineWidths(jar)).toEqual(Array<string>(9).fill('0.5'));
    expect(lineWidths(ours)).toEqual(lineWidths(jar));
  });
});

describe('ubt-T2b every fixture equals its oracle', () => {
  for (const name of readdirSync(FIXTURE_ROOT).sort()) {
    it(`${name}: 0 compareSvg diffs`, () => {
      const { ours, jar } = renderFixture(name);
      expect(compareSvg(ours, jar, 'deterministic').diffs).toEqual([]);
    });
  }
});
