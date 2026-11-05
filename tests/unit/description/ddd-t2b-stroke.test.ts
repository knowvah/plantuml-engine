/**
 * ddd-T2b: strokes from the merged style (`EntityImageDescription.java:171`, `Cluster.java:402-407`). Jar values:
 * dot-cache unknown nuzada-73-goke308, component pafefo-52-zeli644, nuxebu-15-sixe797, unknown bujigu-81-nima035.
 */
import { describe, expect, it } from 'vitest';

import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

const render = (...lines: string[]): string =>
  renderSync(['@startuml', ...lines, '@enduml'].join('\n'), { measurer: new DeterministicMeasurer() });

const clusterPath = (svg: string): string => /<g class="cluster"[^>]*>(<path [^>]*>)/.exec(svg)?.[1] ?? '';

describe('strokes', () => {
  it('a package border colour reaches the path (pafefo-52)', () => {
    const svg = render('skinparam packageBorderColor #FF0000', 'package P {', 'component c', '}');
    expect(clusterPath(svg)).toContain('stroke:#F00;stroke-width:1.5');
  });

  it('a package border style dashes the path (nuzada-73)', () => {
    const svg = render('skinparam packageBorderStyle dashed', 'package P {', 'component c', '}');
    expect(clusterPath(svg)).toContain('stroke-dasharray:7,7');
  });

  it('equal border and fill, in two spellings, drop the stroke (nuxebu-15)', () => {
    const svg = render('skinparam packageBorderColor #FF0000', 'package P #FF0000 {', 'component c', '}');
    const path = clusterPath(svg);
    expect(path).toContain('fill="#F00"');
    expect(path).not.toContain('stroke');
  });

  it('BorderThickness 0 per stereotype draws no stroke (bujigu-81)', () => {
    const svg = render(
      'skinparam card<<srv>> {',
      'BorderThickness 0',
      'BackgroundColor transparent',
      '}',
      'card foo2 <<srv>>',
    );
    expect(svg).toContain('fill="none" rx="2.5" ry="2.5"');
  });
});
