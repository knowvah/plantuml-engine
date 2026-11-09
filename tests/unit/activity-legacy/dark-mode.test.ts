/**
 * laep T3c: under `skinparam mode dark` an edge and a partition keep their colour's `@media dark` partner, so
 * `ColorMapper.DARK_MODE` draws it (`ColorMapper.java:68-73`, `HColorSimple#darkSchemeTheme`). `asPaint()` carried the
 * light colour only, so arrows stayed `#181818` and the partition border `#000`. Jar values: the oracles of
 * `tests/fixtures/activity-legacy/dark-mode.svg` and `dark-partition.svg`.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { compareSvg } from '../../oracle/svg-conformance/compare.js';
import { renderLegacy } from '../../helpers/legacy-activity-render.js';

const DIR = join(import.meta.dirname, '../../fixtures/activity-legacy');
const DARK_ARROW = 'stroke:#E7E7E7;stroke-width:0.5';
const DARK_PARTITION_BORDER = 'stroke:#FFF;';

const puml = (slug: string): string => readFileSync(join(DIR, `${slug}.puml`), 'utf8');
const oracle = (slug: string): string => readFileSync(join(DIR, `${slug}.svg`), 'utf8');

describe('dark mode partners on legacy activity edges and clusters', () => {
  it('dark-mode: the arrow strokes use the dark partner #E7E7E7', () => {
    expect(renderLegacy(puml('dark-mode'))).toContain(DARK_ARROW);
  });

  it('dark-partition: the partition border uses the dark partner #FFF', () => {
    expect(renderLegacy(puml('dark-partition'))).toContain(DARK_PARTITION_BORDER);
  });

  for (const slug of ['dark-mode', 'dark-partition', 'dark-reversecolor'])
    it(`${slug}: no SVG diff`, () => {
      expect(compareSvg(renderLegacy(puml(slug)), oracle(slug), 'deterministic').diffs).toEqual([]);
    });
});
