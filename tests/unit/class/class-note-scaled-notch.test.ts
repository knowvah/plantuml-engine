/**
 * The linked rounded note's notch under `skinparam dpi` (smc T4c). Jar value: `class__casc-control-theme.svg`
 * (`!theme cerulean`, dpi 100): the notch spans 37.5 .. 45.833 around the pointer's 41.667, a half-depth of 4.167.
 *
 * `Opale#delta` is 4 (`Opale.java:173`) in the unscaled geometry; the jar draws it through a `UGraphic` scaled by
 * dpi / 96, so the notch scales as the box and the corner do.
 */
import { describe, expect, it } from 'vitest';

import { renderSync } from '../../../src/index.js';

const NOTE_PATH = /<path d="M[\d.]+,[\d.]+ L[\d.]+,([\d.]+) L[\d.]+,([\d.]+) L[\d.]+,([\d.]+)/;

describe('class note notch under a scaled UGraphic', () => {
  it('draws the notch half-depth at 4 * dpi / 96', () => {
    const src = '@startuml\nskinparam dpi 100\nskinparam roundcorner 8\nclass A\nnote right of A: n\n@enduml\n';
    const out = renderSync(src);
    const svg = out;
    const m = NOTE_PATH.exec(svg);
    expect(m).not.toBeNull();
    const [, top, tip, bottom] = m!.map(Number);
    expect(((bottom ?? 0) - (top ?? 0)) / 2).toBeCloseTo(4.1667, 3);
    expect(tip).toBeDefined();
  });
});

describe('class shadow filter and class { Shadowing } style', () => {
  const SRC =
    '@startuml\nskinparam dpi 100\nskinparam shadowing false\n<style>\nclass { Shadowing 4 }\n</style>\nclass A\n@enduml\n';
  const svgOf = (source: string): string => {
    const out = renderSync(source);
    return out;
  };

  it('a class { Shadowing } declared after skinparam shadowing false shadows the box (EntityImageClass.java:197)', () => {
    expect(svgOf(SRC)).toMatch(/<rect [^>]*filter="url\(#f[a-z0-9]+\)"/);
  });

  it('scales the filter by dpi / 96 (SvgGraphics.java:1081,1084): stdDeviation 2.083, dx 4.167', () => {
    const svg = svgOf(SRC);
    expect(svg).toContain('stdDeviation="2.083"');
    expect(svg).toContain('dx="4.167"');
  });
});

describe('class { LineThickness } after skinparam classBorderThickness', () => {
  it('the later <style> value wins (jar: stroke-width 3.125 at dpi 100)', () => {
    const src =
      '@startuml\nskinparam dpi 100\nskinparam class {\nBorderThickness 1\n}\n<style>\nclass { LineThickness 3 }\n</style>\nclass A\n@enduml\n';
    const out = renderSync(src);
    expect(/<rect [^>]*stroke-width="3.125"/.test(out)).toBe(true);
  });
});
