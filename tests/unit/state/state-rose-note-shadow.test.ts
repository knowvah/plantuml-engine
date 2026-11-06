import { describe, it, expect } from 'vitest';
import { renderFixture } from '../../helpers/render.js';

// smc T4a: a state note casts its merged style's shadow on the outline and strokes at its `LineThickness`
// (`EntityImageNote.java:109,188-189,281,283-285`; `rose.skin:11,84`). Expected values: the jar's
// `tests/fixtures/diagram-style-scope/state__casc-control-rose.svg`: one `<filter>`, the note's outline filtered and
// both note paths at stroke-width 1.

const SOURCE =
  '@startuml\nskin rose\n<style>\nnote { FontSize 12 }\n</style>\nstate S\nS --> T\nnote right of S: n\n@enduml\n';

function noteTags(svg: string, fill = '#FBFB77'): string[] {
  return [...svg.matchAll(new RegExp(`<path [^>]*${fill}[^>]*>`, 'g'))].map((m) => m[0]);
}

describe('state rose note shadow', () => {
  it('filters the note outline only and strokes both note paths at 1', () => {
    const svg = renderFixture(SOURCE);
    const paths = noteTags(svg);
    expect(paths).toHaveLength(2);
    expect(paths[0]).toMatch(/filter="url\(#[^)]+\)"/);
    expect(paths[1]).not.toContain('filter=');
    expect(paths.map((p) => /stroke-width[=:]"?([0-9.]+)/.exec(p)?.[1])).toEqual(['1', '1']);
    expect(svg.match(/<filter /g)?.length).toBe(1);
  });

  it('keeps the unshadowed 0.5 note stroke without the skin', () => {
    const svg = renderFixture('@startuml\nstate S\nS --> T\nnote right of S: n\n@enduml\n');
    expect(svg).not.toContain('filter=');
    expect(noteTags(svg, '#FEFFDD').map((p) => /stroke-width[=:]"?([0-9.]+)/.exec(p)?.[1])).toEqual(['0.5', '0.5']);
  });
});
