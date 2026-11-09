/**
 * aar-T3b: `-[#a;#b;...]->` is drawn as one offset worm copy per colour.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/Snake.java:200-224
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/WormMutation.java
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/Worm.java:186-242
 */
import { describe, it, expect } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderFixtureActivity } from '../../oracle/svg-conformance/render-fixture-activity.js';
import { createWormMutation, moveFirstPoint, moveLastPoint } from '../../../src/diagrams/activity/worm-mutation.js';

const render = (src: string): string => renderFixtureActivity(src, new DeterministicMeasurer());

const RAINBOW = ':do a;\n-[#red;#blue;#green;#orange]-> label;\n:do b;';

/** `[x, stroke colour]` of every `<line>` whose stroke is not the default arrow colour. */
function colouredLines(svg: string): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  for (const m of svg.matchAll(/<line x1="([\d.]+)"[^>]*stroke="(#[0-9A-F]+)"/g)) {
    if (m[2] !== '#181818') out.push([m[1]!, m[2]!]);
  }
  return out;
}

describe('rainbow arrow', () => {
  it('temeku-00-noga270: four lines 2px apart, one head each, label shifted by 3*2', () => {
    const svg = render(`@startuml\nstart\n${RAINBOW}\n@enduml`);
    expect(colouredLines(svg)).toEqual([
      ['34.663', '#F00'],
      ['36.663', '#00F'],
      ['38.663', '#008000'],
      ['40.663', '#FFA500'],
    ]);
    expect(svg).toContain('<polygon points="30.663,116.444,34.663,126.444,38.663,116.444,34.663,120.444" fill="#F00"');
    expect(svg).toContain(
      '<polygon points="36.663,116.444,40.663,126.444,44.663,116.444,40.663,120.444" fill="#FFA500"',
    );
    expect(svg).toContain('<text x="47.663" y="106.5"');
  });

  it('pegimu-03-duli081: colorArrowSeparationSpace 3 spaces the copies by 5', () => {
    const svg = render(`@startuml\nskinparam colorArrowSeparationSpace 3\nstart\n${RAINBOW}\n@enduml`);
    expect(colouredLines(svg)).toEqual([
      ['30.163', '#F00'],
      ['35.163', '#00F'],
      ['40.163', '#008000'],
      ['45.163', '#FFA500'],
    ]);
    expect(svg).toContain('<text x="56.663" y="106.5"');
  });

  it('a single colour is unchanged: one line, no label shift', () => {
    const svg = render('@startuml\nstart\n:do a;\n-[#red]-> label;\n:do b;\n@enduml');
    expect(colouredLines(svg)).toEqual([['37.663', '#F00']]);
    expect(svg).toContain('<text x="41.663" y="106.5"');
  });
});

describe('WormMutation', () => {
  const down = [
    { x: 0, y: 0 },
    { x: 0, y: 10 },
  ];

  it('D is "33": both points move by dx = delta', () => {
    const m = createWormMutation(down, 2)!;
    expect(m.size).toBe(2);
    expect(m.isDxNegative).toBe(false);
    expect(m.mute(down)).toEqual([
      { x: 2, y: 0 },
      { x: 2, y: 10 },
    ]);
  });

  it('RD is "123": up, diagonal, right', () => {
    const rd = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ];
    expect(createWormMutation(rd, 2)!.mute(rd)).toEqual([
      { x: 0, y: -2 },
      { x: 12, y: -2 },
      { x: 12, y: 10 },
    ]);
  });

  it('a long signature joins pair definitions (DRD)', () => {
    const drd = [
      { x: 0, y: 0 },
      { x: 0, y: 5 },
      { x: 8, y: 5 },
      { x: 8, y: 10 },
    ];
    expect(createWormMutation(drd, 2)!.size).toBe(4);
  });

  it('LD is "187": isDxNegative and the text translate is the extreme dx', () => {
    const m = createWormMutation(
      [
        { x: 10, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 10 },
      ],
      2,
    )!;
    expect(m.isDxNegative).toBe(false);
    expect(m.textTranslateDx(3)).toBe(-4);
  });

  it('a diagonal segment has no definition', () => {
    expect(
      createWormMutation(
        [
          { x: 0, y: 0 },
          { x: 3, y: 4 },
        ],
        2,
      ),
    ).toBeUndefined();
  });

  it('moveFirstPoint/moveLastPoint carry the neighbour along a shared axis only', () => {
    expect(moveFirstPoint(down, { dx: 1, dy: 0 })).toEqual([
      { x: 1, y: 0 },
      { x: 1, y: 10 },
    ]);
    expect(moveFirstPoint(down, { dx: 0, dy: 1 })).toEqual([
      { x: 0, y: 1 },
      { x: 0, y: 10 },
    ]);
    expect(moveLastPoint(down, { dx: 0, dy: -1 })).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 9 },
    ]);
    expect(() => moveFirstPoint(down, { dx: 1, dy: 1 })).toThrow();
  });
});
