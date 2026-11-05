/**
 * ddd-T2a: corners from the merged entity style (`EntityImageDescription.java:168-169`, `Cluster.java:321,326`).
 * Jar values: dot-cache unknown bavezi-52-bive782, manama-22-joxi528.
 */
import { describe, expect, it } from 'vitest';

import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

const render = (...lines: string[]): string =>
  renderSync(['@startuml', ...lines, '@enduml'].join('\n'), { measurer: new DeterministicMeasurer() });

describe('corners', () => {
  it('bavezi-52: DiagonalCorner draws the jar path, not a rect', () => {
    const svg = render('skinparam rectangle {', 'DiagonalCorner 10', 'BorderColor Red', '}', 'rectangle rec');
    expect(svg).toContain('d="M17,7 L36.425,7 L46.425,17 L46.425,31 L36.425,41 L17,41 L7,31 L7,17 L17,7"');
    expect(svg).not.toContain('<rect x="7"');
  });

  it('manama-22: roundCorner per stereotype, on the group and on the leaf', () => {
    const svg = render(
      'skinparam rectangle {',
      'roundCorner<<Concept>> 25',
      'roundCorner<<Foo>> 45',
      'backgroundColor<<Concept>> White',
      '}',
      'rectangle "Concept Model" <<Foo>> {',
      'rectangle "e" <<Concept>> as e',
      'rectangle "F"',
      '}',
    );
    const rx = [...svg.matchAll(/<rect [^>]*rx="([\d.]+)"/g)].map((m) => m[1]);
    expect(rx).toEqual(['22.5', '12.5', '2.5']);
  });

  it('a source with no style keeps the 2.5 corner', () => {
    expect(render('rectangle rec')).toContain('rx="2.5"');
  });
});
