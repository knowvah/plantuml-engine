/**
 * `<style> state { Shadowing N }` and `skinparam arrowThickness` in the state engine (smc T4c). Jar values:
 * `scripts/oracle-render.sh` on the same sources (one `filter=` for the state box; arrow `stroke-width:3`).
 *
 * `EntityImageStateCommon.java:124` reads `getStyleState().getShadowing()` off the merged
 * `{root, element, stateDiagram, state}` style; `addConvert("arrowThickness", PName.LineThickness, SName.arrow)`
 * (`FromSkinparamToStyle.java:150`) beats a theme's earlier `root { LineThickness 1 }` by counter (`ValueImpl.java:51-55`).
 */
import { describe, expect, it } from 'vitest';

import { renderSync } from '../../../src/index.js';

const svgOf = (source: string): string => {
  const out = renderSync(source);
  return out;
};

describe('state shadowing from the merged state style', () => {
  it('draws the filter for state { Shadowing 4 } (jar: one per state box, 2)', () => {
    const svg = svgOf('@startuml\n<style>\nstate { Shadowing 4 }\n</style>\nstate S\nS --> T\n@enduml\n');
    expect(svg.match(/filter="url\(#/g)?.length).toBe(2);
  });

  it('a later skinparam shadowing false wins by counter (jar: 0)', () => {
    const svg = svgOf(
      '@startuml\n<style>\nstate { Shadowing 4 }\n</style>\nstate S\nS --> T\nskinparam shadowing false\n@enduml\n',
    );
    expect(svg.match(/filter="url\(#/g)).toBeNull();
  });

  it('keeps no shadow when none is declared', () => {
    expect(svgOf('@startuml\nstate S\nS --> T\n@enduml\n').match(/filter="url\(#/g)).toBeNull();
  });
});

describe('state arrow thickness after a theme', () => {
  it('skinparam arrow { Thickness 3 } beats the theme root LineThickness 1 (jar: 3.125 at dpi 100)', () => {
    const svg = svgOf('@startuml\n!theme cerulean\nstate S\nS --> T\n@enduml\n');
    expect(svg).toContain('stroke-width="3.125"');
  });
});
