/**
 * `Activity`: `addRelease`'s climb and guard, the lazily built grid, and the
 * cell order the jar draws, read from its renders.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/board/Activity.java
 */
import { describe, expect, it } from 'vitest';
import { Activity } from '../../../src/diagrams/board/Activity.js';
import { BOARD_CACHE, bodyLines, boardOf, boardSkinParam, emptyBoardDiagram } from './helpers/board-diagram.js';

/** Card origin of each cell, as the jar draws it at margin 10: `(10 + x × 170, 10 + stage × 90)`. */
function origins(activity: Activity): string[] {
  return activity.getCells().map((n) => `${String(10 + n.getX() * 170)},${String(10 + n.getStage() * 90)}`);
}

function activityOf(name: string): Activity {
  return new Activity(emptyBoardDiagram(), name, boardSkinParam());
}

describe('Activity#addRelease', () => {
  it('refuses a stage of 0 or less (java:66-68)', () => {
    const activity = activityOf('A');
    expect(() => activity.addRelease(0, 'x')).toThrow('IllegalArgumentException');
    expect(() => activity.addRelease(-1, 'x')).toThrow('IllegalArgumentException');
  });

  it('climbs to the first card with a smaller stage; stages may skip (cov-grid-deep-stage)', () => {
    const activity = activityOf('A');
    activity.addRelease(7, 'B');
    activity.addRelease(2, 'C');
    activity.addRelease(1, 'D');
    // The jar's rects after the header card: 10,10 180,190 350,100 10,640.
    expect(origins(activity)).toEqual(['10,10', '180,190', '350,100', '10,640']);
    expect(activity.getCells().map((n) => n.getParent()?.getName())).toEqual([undefined, 'A', 'A', 'A']);
    expect([activity.getFullWidth(), activity.getMaxStage()]).toEqual([510, 7]);
  });

  it('builds the grid once: a release added after the first read is not placed', () => {
    const activity = activityOf('A');
    activity.addRelease(1, 'B');
    expect(activity.getFullWidth()).toBe(170);
    activity.addRelease(1, 'C');
    expect([activity.getFullWidth(), activity.getCells().length]).toEqual([170, 2]);
  });
});

describe('Activity cell order', () => {
  it("draws gasaxu-65-cipo396's cells in the jar's HashMap order, 1530 wide", () => {
    const diagram = boardOf(bodyLines(`${BOARD_CACHE}/gasaxu-65-cipo396/in.puml`));
    const [world] = diagram.getActivities();
    // in.svg's 150-wide rects after the header card: America (860,100) sits between Barcelone and Pamplune.
    expect(origins(world!)).toEqual([
      '10,10',
      '10,100',
      '10,190',
      '10,280',
      '180,280',
      '350,190',
      '350,280',
      '520,280',
      '860,100',
      '690,280',
      '860,280',
      '1030,190',
      '1200,190',
      '1200,280',
      '1370,280',
    ]);
    expect(world!.getFullWidth()).toBe(1530);
    expect(world!.getMaxStage()).toBe(3);
  });

  it('replays the resize at 13 keys (cov-grid-hashmap-resize, 29 cells)', () => {
    const lines = ['R', '+a1', '++b1', '++b2', '++b3', '++b4', '+a2', '++c1', '++c2', '++c3', '+a3'];
    lines.push('++d1', '++d2', '++d3', '++d4', '++d5', '+a4');
    for (let i = 1; i <= 11; i++) lines.push(`++e${String(i)}`);
    const [root] = boardOf(lines).getActivities();
    // The oracle's rects after the header card (`oracle-render.sh`, 2026-11-05).
    expect(origins(root!)).toEqual(
      (
        '3750,190 3580,190 3410,190 10,10 10,100 10,190 180,190 350,190 520,190 690,100 690,190 860,190 ' +
        '1030,190 1200,100 1200,190 1370,190 1540,190 1880,190 2050,100 1710,190 3240,190 3070,190 2900,190 ' +
        '2730,190 2560,190 2390,190 2220,190 2050,190'
      ).split(' '),
    );
    expect(root!.getFullWidth()).toBe(3910);
  });
});
