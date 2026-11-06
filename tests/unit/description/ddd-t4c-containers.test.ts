/**
 * ddd-T4c: fixtures in `tests/fixtures/ddd-T4c/`, jar values from `scripts/oracle-render.sh`. Raw
 * `skinparam StereotypeAlignment` on a group (`Cluster.java:374`, `SkinParam.java:741-747`), a cloud group's seed from
 * its moved rectangle (`USymbolCloud.java:75`, `RectangleArea.java:60-66`), and a package name's floor at the title
 * style's `MinimumWidth` (`BodyEnhanced1.java:182-184`).
 */
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

const render = (name: string): string =>
  renderSync(readFileSync(`tests/fixtures/ddd-T4c/${name}.puml`, 'utf8'), { measurer: new DeterministicMeasurer() });

describe('containers', () => {
  it('right-aligns a group stereotype from the raw skinparam', () => {
    expect(render('cluster-stereotype-right')).toContain('<text x="170.912" y="29.889"');
  });

  it('seeds a cloud group from the size after moveDelta, the canvas from the size before it', () => {
    const svg = render('cloud-moved-seed');
    expect(svg).toContain('<path d="M324.191,32.177 ');
    expect(svg).toContain(' width="810px"');
    expect(svg).toContain(' height="228px"');
  });

  it('floors a package name at the style minimum width', () => {
    expect(render('package-minimum-width')).toContain('<text x="125.394" y="102.889" fill="#00F"');
  });
});
