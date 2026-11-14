/**
 * cogr T4b: the ink of a rounded `file` leaf. `USymbolFile.java:62-86` draws a `UPolygon` only when `roundCorner == 0`
 * and a `UPath` otherwise; `LimitFinder#drawUPolygon` widens a polygon by `HACK_X_FOR_POLYGON`, a path is exact.
 * Oracle: `test-results/dot-cache/class/gimumo-81-fuce233/in.svg` (node + file `[ ]` bodies: width 399, the title
 * centred at x 138.806).
 */
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

const render = (source: string): string => renderSync(source, { measurer: new DeterministicMeasurer() });
const pageWidth = (svg: string): number => Number(/<svg[^>]* width="(\d+)px"/.exec(svg)?.[1]);

describe('ink of a rounded file leaf (cogr T4b)', () => {
  it('does not widen the page by the polygon hack (node [ ] beside file [ ])', () => {
    // jar: 171 (node ink 0..w, file ink x..x+w, no polygon hack on the file)
    expect(pageWidth(render('@startuml\nnode n [\nabc\n]\nfile f [\nabc\n]\n@enduml'))).toBe(171);
  });

  it('keeps the node polygon hack (node [ ] beside node [ ])', () => {
    expect(pageWidth(render('@startuml\nnode n [\nabc\n]\nnode f [\nabc\n]\n@enduml'))).toBe(201);
  });

  it('centres the title over the jar page (gimumo)', () => {
    const src = readFileSync('test-results/dot-cache/class/gimumo-81-fuce233/in.puml', 'utf8');
    const svg = render(src);
    expect(pageWidth(svg)).toBe(399);
    expect(/<text x="([\d.]+)"[^>]*font-weight="700">KO</.exec(svg)?.[1]).toBe('138.806');
  });
});
