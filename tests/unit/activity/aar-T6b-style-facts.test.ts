/**
 * aar-T6b: style facts the activity rows read off a merged `Style`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/CircleStart.java:72-82
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/vertical/FtileCircleEndCross.java:98-107
 */
import { describe, it, expect } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderFixtureActivity } from '../../oracle/svg-conformance/render-fixture-activity.js';

const render = (src: string): string => renderFixtureActivity(src, new DeterministicMeasurer());
const widths = (svg: string): string[] => [...svg.matchAll(/<ellipse[^>]* stroke-width="([^"]+)"/g)].map((m) => m[1]!);

describe('circle { start, stop, end { LineThickness } }', () => {
  const style = '<style>\nstart { LineThickness 5 }\nstop { LineThickness 5 }\nend { LineThickness 5 }\n</style>\n';
  it('tocoxa-40: start and the stop ring take 5, the stop inner disc stays 1', () => {
    expect(widths(render(`@startuml\n${style}start\nstop\nend\n@enduml`))).toEqual(['5', '5', '1', '5']);
  });
});

describe('note stereotype style LineThickness', () => {
  it('vikexo-00: `.s2n { LineThickness 2 }` strokes both notes at 2', () => {
    const src = '@startuml\n<style>\n.s2n {\n LineThickness 2\n}\n</style>\n:a;\nnote right <<s2n>>: n\n:b;\n@enduml';
    const widths = [...render(src).matchAll(/<path[^>]* stroke-width="([^"]+)"/g)].map((m) => m[1]);
    expect(widths).toEqual(['2', '2']);
  });
});

describe('InstructionList#createFtile of an empty list', () => {
  it('nutuzi-66: the arrow ending an empty fork branch decorates its ENTRY link, which the merged snake keeps', () => {
    const svg = render('@startuml\nstart\nfork\n-[#blue]->\nfork again\n-[#green]->\n:a;\nend merge\n@enduml');
    // jar: the branch drop `23,61 -> 23,135` and its arrival are both `#00F`.
    expect(svg).toMatch(/<line x1="23" y1="61" x2="23" y2="135" stroke="#00F"/);
    expect(svg).toMatch(/<polygon points="28,131,38,135,28,139,32,135" fill="#00F"/);
  });
});

describe('diamond { HorizontalAlignment }', () => {
  it('mebake-09: the condition test is centred, as the jar draws it', () => {
    const src =
      '@startuml\n<style>\nactivityDiagram {\n diamond {\n  HorizontalAlignment center\n }\n}\n</style>\nif (a\\na a\\na a a?) is (red) then\n:print red;\nelse\n:print not red;\n@enduml';
    const xs = [...render(src).matchAll(/<text x="([^"]+)"[^>]*>(a|a a|a a a\?)</g)].map((m) => m[1]);
    // jar (`in.svg`): text x of the three rows 91.878 / 87.306 / 79.675.
    expect(xs).toEqual(['91.878', '87.306', '79.675']);
  });
});

describe('Stereogroup#getInnerColors `#back;line:c;text:c` on an action box', () => {
  it('gefuni-32: the box strokes blue and its text is red', () => {
    const svg = render('@startuml\nstart\n:start2 on; <<#AAAAAA;line:blue;text:red>>\n@enduml');
    expect(svg).toMatch(/<rect[^>]* fill="#AAA"[^>]* stroke="#00F"/);
    expect(svg).toMatch(/<text [^>]*fill="#F00"[^>]*>start2/);
  });
});
