import { describe, it, expect } from 'vitest';
import { renderFixture } from '../../helpers/render.js';

// smc T4a: a description note casts its style's shadow on the outline path only
// (`EntityImageNote.java:109,281` `polygon.setDeltaShadow(this.shadowing)`; rose.skin `element { Shadowing 4.0 }`).
// Expected values: the jar's `tests/fixtures/diagram-style-scope/component__casc-control-rose.svg`
// (outline `filter="url(#…)"`, fold none, one `<filter>` in the defs).

const FILTER_ATTR = /filter="url\(#[^)]+\)"/;
const SOURCE = '@startuml\nskin rose\n<style>\nnote { FontSize 12 }\n</style>\n[C]\nnote left of C: n\n@enduml\n';

function notePaths(svg: string): string[] {
  return [...svg.matchAll(/<path [^>]*#FBFB77[^>]*>/g)].map((m) => m[0]);
}

describe('description note shadow', () => {
  it('skin rose + a note style block: outline filtered, fold not, one filter def', () => {
    const svg = renderFixture(SOURCE);
    const paths = notePaths(svg);
    expect(paths).toHaveLength(2);
    expect(paths[0]).toMatch(FILTER_ATTR);
    expect(paths[1]).not.toMatch(FILTER_ATTR);
    expect(svg.match(/<filter /g)).toHaveLength(1);
  });

  it('without the skin the note has no filter', () => {
    const svg = renderFixture('@startuml\n[C]\nnote left of C: n\n@enduml\n');
    expect(svg).not.toContain('filter=');
  });
});
