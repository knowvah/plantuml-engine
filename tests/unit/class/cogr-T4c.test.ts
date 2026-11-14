/**
 * cogr T4c: `scale` over a USymbol leaf. `SvgGraphics#format` (`SvgGraphics.java:466-472`) multiplies every emitted
 * numeric, so the literals inside a symbol (`USymbolNode`'s 10-unit corner, the `+4` of a `= ` heading) scale too.
 * Oracle: `test-results/dot-cache/class/gazizi-80-fula677/in.svg` (`scale 0.5`, node with a sprite stereotype).
 */
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

const render = (source: string): string => renderSync(source, { measurer: new DeterministicMeasurer() });
const NODE = 'node K [\n  = Kubernetes\n  Description of k8s\n]';
const scaled = render(`@startuml\nscale 0.5\n${NODE}\n@enduml`);

describe('scale over a USymbol leaf (cogr T4c)', () => {
  it('scales the node corner with the geometry (jar: 5, not 10)', () => {
    // jar for this source (`scripts/oracle-render.sh`)
    expect(/<polygon points="([^"]*)"/.exec(scaled)?.[1]).toBe(
      '3.5,8.5,8.5,3.5,79.106,3.5,79.106,29.5,74.106,34.5,3.5,34.5,3.5,8.5',
    );
  });

  it('draws the heading at 18 * scale, not (14 * scale) + 4', () => {
    expect(/<text [^>]*font-size="(\d+)"[^>]*font-weight="700">Kubernetes/.exec(scaled)?.[1]).toBe('9');
  });

  it('matches the jar page for the gazizi row (85 x 65)', () => {
    const svg = render(readFileSync('test-results/dot-cache/class/gazizi-80-fula677/in.puml', 'utf8'));
    expect(/viewBox="0 0 (\d+) (\d+)"/.exec(svg)?.slice(1, 3)).toEqual(['85', '65']);
  });
});
