/**
 * The state NAME font reads the merged `{root, element, stateDiagram, state, name}` style (smc T4e).
 * `EntityImageStateCommon.java:74-76` builds it with `getStyleStateName(...).getFontConfiguration(...)`
 * (`:91-94`). Jar values: `scripts/oracle-render.sh` on the same sources (fixtures `state__casc-fontsize-*`).
 */
import { describe, expect, it } from 'vitest';

import { renderSync } from '../../../src/index.js';

const nameFontSizes = (source: string): string[] =>
  [...renderSync(source).matchAll(/<text [^>]*font-size="([\d.]+)"/g)].map((m) => m[1] ?? '');

describe('state name font size from the merged state style', () => {
  it('skin rose + state { FontSize 18 }: jar draws the name at 18 and the divider at y 35', () => {
    const svg = renderSync(
      '@startuml\nskin rose\n<style>\nstate { FontSize 18 }\n</style>\nstate S\nS --> T\n@enduml\n',
    );
    expect(svg).toContain('font-size="18"');
    expect(svg).toContain('y1="35"');
  });

  it('plain skinparam stateFontSize 16 reaches the name (jar: 16)', () => {
    expect(nameFontSizes('@startuml\nskinparam stateFontSize 16\nstate S\nS --> T\n@enduml\n')[0]).toBe('16');
  });

  it('a theme state { FontSize 18 } scales under cerulean dpi (jar: 18.75)', () => {
    const sizes = nameFontSizes(
      '@startuml\n!theme cerulean\n<style>\nstate { FontSize 18 }\n</style>\nstate S\n@enduml\n',
    );
    expect(sizes[0]).toBe('18.75');
  });

  it('keeps 14 when nothing sets it', () => {
    expect(nameFontSizes('@startuml\nstate S\nS --> T\n@enduml\n')[0]).toBe('14');
  });
});
