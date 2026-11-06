/**
 * ubt-T2a: a group whose title is an SVG sprite. `FtileGroup` sizes the frame
 * by its title `TextBlock` (`name.calculateDimension`, `FtileGroup.java:
 * 104-108,140-143,160-167`), and every `USymbol#asBig` draws that title on the
 * `ug` `Fashion#apply` gave the frame (`USymbolRectangle.java:110,133`,
 * `USymbolFrame`, `USymbolCard`, `USymbolFolder`), so a sprite shape with no
 * `stroke-width` of its own (`SvgNanoParser.java:187-195`) takes the frame's.
 *
 * Each `tests/fixtures/ubt-T2a/<name>/in.svg` is the jar's render: the five
 * corpus rows, or `scripts/oracle-render.sh` for every other name. The render
 * path is the survey's (`plans/unknown-bucket-triage/measurements/row-diffs.mts`).
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg } from '../../oracle/svg-conformance/compare.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURE_ROOT = join(HERE, '../../fixtures/ubt-T2a');

type RenderOptions = NonNullable<Parameters<typeof renderSync>[1]>;

function renderFixture(name: string): { ours: string; jar: string } {
  const dir = join(FIXTURE_ROOT, name);
  const options = { jarCompatibleStyleInput: true, measurer: new DeterministicMeasurer() } as RenderOptions;
  return {
    ours: renderSync(readFileSync(join(dir, 'in.puml'), 'utf8'), options),
    jar: readFileSync(join(dir, 'in.svg'), 'utf8'),
  };
}

/** The frame: the first `<rect>` after the bracket warning's own. */
function frameSize(svg: string): string {
  const rects = [...svg.matchAll(/<rect\b[^>]*?\bwidth="([^"]*)" height="([^"]*)"/g)];
  return `${rects[1]![1]}x${rects[1]![2]}`;
}

describe('ubt-T2a corpus rows', () => {
  // A 230 viewBox sprite at `scale=N`: the frame is the title's box plus `+20` wide (`suppWidth`, `:160-167`).
  const FRAMES: Record<string, string> = {
    'bezogu-47-vevu307': '267.692x287.692',
    'jutesi-96-jemo224': '490.615x510.615',
  };
  for (const [name, size] of Object.entries(FRAMES)) {
    it(`${name}: the frame is the sprite title's size`, () => {
      const { ours, jar } = renderFixture(name);
      expect(frameSize(jar)).toBe(size);
      expect(frameSize(ours)).toBe(size);
    });
  }
});

describe('ubt-T2a every fixture equals its oracle', () => {
  for (const name of readdirSync(FIXTURE_ROOT).sort()) {
    it(`${name}: 0 compareSvg diffs`, () => {
      const { ours, jar } = renderFixture(name);
      expect(compareSvg(ours, jar, 'deterministic').diffs).toEqual([]);
    });
  }
});
