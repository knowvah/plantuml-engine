/**
 * aar-T6b: a group frame's title style is the `<symbol>,composite` signature, with the group's stereotype.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/vcompact/FtileGroup.java:89-92,95-107
 */
import { describe, it, expect } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderFixtureActivity } from '../../oracle/svg-conformance/render-fixture-activity.js';

const render = (src: string): string => renderFixtureActivity(src, new DeterministicMeasurer());

describe('FtileGroup title style', () => {
  it('nokixe-72: `group <<test>>` takes `.test { FontSize 11 }` for its title and its frame height', () => {
    const svg = render(
      '@startuml\n<style>\n.test {\n  FontName Arial Narrow\n  FontSize 11\n  LineThickness 3.0\n}\n</style>\n:a;\ngroup Group <<test>>\n  :Activity;\nend group\n@enduml',
    );
    expect(svg).toMatch(/<text [^>]*font-size="11"[^>]*font-family="Arial Narrow"[^>]*>Group<\/text>/);
  });

  it('xicopo-62: `rectangle { FontSize 11 }` styles a `rectangle` group title, not a `card`', () => {
    const svg = render(
      '@startuml\n<style>\nrectangle {\n  FontName Arial Narrow\n  FontSize 11\n}\n</style>\nrectangle R {\n:a;\n}\ncard C {\n:b;\n}\n@enduml',
    );
    expect(svg).toMatch(/<text [^>]*font-size="11"[^>]*>R<\/text>/);
    expect(svg).toMatch(/<text [^>]*font-size="14"[^>]*>C<\/text>/);
  });
});

describe('Fission#blank', () => {
  it('ponija-89: a wrapped `* item` continues under the item text, not under the bullet', () => {
    const svg = render(
      '@startuml\n<style>\nactivityDiagram {\n  note {\n    MaximumWidth 200\n  }\n}\n</style>\nstart\n:a;\nnote right\n  * Calling the method ""foo()"" is prohibited and so is every other thing here\nend note\n@enduml',
    );
    const bullet = /<ellipse cx="([\d.]+)"[^>]*rx="2.5"/.exec(svg);
    const xs = [...svg.matchAll(/<text x="([\d.]+)"[^>]*>(?:Calling|prohibited|thing)<\/text>/g)].map((m) => m[1]);
    expect(bullet?.[1]).toBe('74.175');
    expect(xs).toEqual(['80.675', '80.675', '80.675']);
  });
});

describe('FtileNoteAlone with a null swimlane', () => {
  it('tinupo-67: a note opening a fork branch in swimlanes reserves its box and is never drawn', () => {
    const svg = render(
      '@startuml\n|laneA|\n|laneB|\n\n|laneA|\nstart\n|laneB|\n\n-> Before fork;\nfork\n :foo1;\nfork again\nnote left\nabcd efgh 1234\nendnote\n :foo2;\nend fork\n|laneA|\n:fin;\n@enduml',
    );
    expect(svg).not.toContain('abcd');
    expect(svg).toMatch(/<rect x="167.45" y="171.556" width="43.325" height="32"/);
    expect(svg).toMatch(/height="302px"/);
  });

  it('draws that note when there is one lane or none: only drawWhenSwimlanes filters (Swimlanes.java:252-259)', () => {
    const src = 'start\nfork\n :foo1;\nfork again\nnote left\nabcd efgh 1234\nendnote\n :foo2;\nend fork\n:fin;\n';
    expect(render(`@startuml\n${src}@enduml`)).toContain('abcd');
    expect(render(`@startuml\n|laneA|\n${src}@enduml`)).toContain('abcd');
  });
});

describe('back-colour filter in a note', () => {
  it('vemeno-50: `<back:red>` in a note keeps its filter def and id', () => {
    const svg = render('@startuml\nstart\nnote right\n<back:red>x</back>\nend note\n@enduml');
    const id = /filter="url\(#([^)]+)\)"/.exec(svg)?.[1];
    expect(id).toBeDefined();
    expect(svg).toContain(`<filter id="${id}"`);
  });
});
