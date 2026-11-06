import { describe, it, expect } from 'vitest';
import { renderFixture } from '../../helpers/render.js';

// smc T4a: `skin rose` casts a shadow on the activity's start/stop circles, action box and note body, and strokes the
// note at 1 (`rose.skin:11,84` `root { LineThickness 1.0 }`, `element { Shadowing 4.0 }`; `CircleStart.java:79-81`,
// `CircleEnd.java:83-85`, `FtileBox.java:173`, `Opale.java:122`, `FtileWithNoteOpale.java:137-143`; the canvas margin `LimitFinder.java:206-210` is pinned by the
// dss ratchet's row at the jar's height 155). Expected values:
// the jar's `tests/fixtures/diagram-style-scope/activity__casc-control-rose.svg`: four `filter` references to one `<filter>`, note paths at stroke-width 1.

const SOURCE =
  '@startuml\nskin rose\n<style>\nnote { FontSize 12 }\n</style>\nstart\n:a;\nnote right: n\nstop\n@enduml\n';
const FILTER_ATTR = /filter="url\(#[^)]+\)"/;

function tagsOf(svg: string, tag: string): string[] {
  return [...svg.matchAll(new RegExp(`<${tag} [^>]*>`, 'g'))].map((m) => m[0]);
}

describe('activity rose shadow', () => {
  const svg = renderFixture(SOURCE);

  it('filters the start ellipse, the box, the note body and the stop ring, not the stop disc or the note fold', () => {
    const ellipses = tagsOf(svg, 'ellipse');
    expect(ellipses).toHaveLength(3);
    expect(ellipses[0]).toMatch(FILTER_ATTR);
    expect(ellipses[1]).toMatch(FILTER_ATTR);
    expect(ellipses[2]).not.toMatch(FILTER_ATTR);
    expect(tagsOf(svg, 'rect')[0]).toMatch(FILTER_ATTR);
    const notePaths = tagsOf(svg, 'path').filter((p) => p.includes('#FBFB77'));
    expect(notePaths[0]).toMatch(FILTER_ATTR);
    expect(notePaths[1]).not.toMatch(FILTER_ATTR);
    expect(svg.match(/<filter /g)).toHaveLength(1);
  });

  it('strokes both note paths at 1', () => {
    const notePaths = tagsOf(svg, 'path').filter((p) => p.includes('#FBFB77'));
    expect(notePaths.map((p) => /stroke-width="([^"]+)"/.exec(p)?.[1])).toEqual(['1', '1']);
  });

  it('draws no shadow and the 0.5 note stroke without the skin', () => {
    const plain = renderFixture('@startuml\nstart\n:a;\nnote right: n\nstop\n@enduml\n');
    expect(plain).not.toContain('filter=');
    const notePaths = tagsOf(plain, 'path').filter((p) => p.includes('#FEFFDD'));
    expect(notePaths.map((p) => /stroke-width="([^"]+)"/.exec(p)?.[1])).toEqual(['0.5', '0.5']);
  });
});
