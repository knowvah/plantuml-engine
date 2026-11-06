import { describe, it, expect } from 'vitest';
import { renderFixture } from '../../helpers/render.js';

// smc T4a: `skin rose` draws a shadow on the class box and the note body path
// (`EntityImageClass.java:197,210` `rect.setDeltaShadow(getStyle().getShadowing())`,
// `EntityImageNote.java:109,281` `polygon.setDeltaShadow(this.shadowing)`; rose.skin
// `element { Shadowing 4.0 }`). Expected values are the jar's own output:
// `tests/fixtures/diagram-style-scope/class__casc-control-rose.svg` (note body path filtered,
// fold not) and `class__d3-skin-rose-element.svg` (a lone class: its rect filtered).

const FILTER_ATTR = /filter="url\(#[^)]+\)"/;

function tagsOf(svg: string, tag: 'rect' | 'path'): string[] {
  return [...svg.matchAll(new RegExp(`<${tag} [^>]*>`, 'g'))].map((m) => m[0]);
}

describe('class shadow under skin rose', () => {
  it('a note draws its body path with the shadow filter and its fold without', () => {
    const svg = renderFixture(
      '@startuml\nskin rose\n<style>\nnote { FontSize 12 }\n</style>\nclass A\nnote right of A: n\n@enduml\n',
    );
    const paths = tagsOf(svg, 'path').filter((p) => p.includes('#FBFB77'));
    expect(paths).toHaveLength(2);
    expect(paths[0]).toMatch(FILTER_ATTR);
    expect(paths[1]).not.toMatch(FILTER_ATTR);
  });

  it('a lone class (the single-entity path) draws its rect with the shadow filter', () => {
    const svg = renderFixture(
      '@startuml\nskin rose\n<style>\nelement {\n  FontColor #0000BB\n}\n</style>\nclass A\n@enduml\n',
    );
    expect(tagsOf(svg, 'rect')[0]).toMatch(FILTER_ATTR);
  });

  it('without the skin no shape carries a filter', () => {
    const svg = renderFixture('@startuml\nclass A\nnote right of A: n\n@enduml\n');
    expect(svg).not.toContain('filter=');
  });
});
