/**
 * auc-T2a (#189): an arrow colour the jar cannot resolve paints the #143 neutral.
 *
 * `HtmlColorAndStyle.build` calls the throwing `set.getColor(s)` on every comma token that is not a `LinkStyle`
 * keyword (`HtmlColorAndStyle.java:95-104`), so the jar errors with `No such color`; by the 2026-11-04 ruling we draw
 * and paint `UNKNOWN_COLOR_NEUTRAL` there. The head colour is `null` upstream, so it is the arrow colour (`:66`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/decoration/HtmlColorAndStyle.java:86-106
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/decoration/Rainbow.java:109-118
 */
import { describe, it, expect } from 'vitest';
import { defaultTheme } from '../../../src/core/theme.js';
import { UNKNOWN_COLOR_NEUTRAL } from '../../../src/core/klimt/color/HColorSet.js';
import { planEdgeDraw } from '../../../src/diagrams/activity/activity-rainbow.js';
import type { ActivityEdgeGeo } from '../../../src/diagrams/activity/activity-geometry.types.js';

/** `red` and `blue` as `toSvgHex` writes them (`XColor#toSvg`); `#181818` is the default arrow `LineColor`. */
const RED = '#FF0000';
const BLUE = '#0000FF';
const DEFAULT_LINE = '#181818';
/** `Snake.java:193`'s single-copy stroke, and `LinkStyle.DASHED`'s `7,7` at that thickness (`Worm.java:128-131`). */
const DASHED = { width: 1.5, dash: '7,7' };

function edge(color: string): ActivityEdgeGeo {
  return {
    points: [
      { x: 10, y: 10 },
      { x: 10, y: 60 },
    ],
    color,
  };
}

function looks(color: string): Array<{ line: unknown; head: unknown }> {
  return planEdgeDraw(edge(color), defaultTheme).copies.map((c) => ({ line: c.look.line, head: c.look.head }));
}

describe('auc-T2a: an unresolved activity arrow colour paints the neutral', () => {
  it('-[#zzblue]->: line and head are the neutral', () => {
    expect(looks('#zzblue')).toEqual([{ line: UNKNOWN_COLOR_NEUTRAL, head: UNKNOWN_COLOR_NEUTRAL }]);
  });

  it('-[#red;#zzblue]->: one copy red, the other the neutral', () => {
    expect(looks('#red;#zzblue')).toEqual([
      { line: RED, head: RED },
      { line: UNKNOWN_COLOR_NEUTRAL, head: UNKNOWN_COLOR_NEUTRAL },
    ]);
  });

  it('-[#zzblue,dashed]->: the neutral, dashed', () => {
    const [copy] = planEdgeDraw(edge('#zzblue,dashed'), defaultTheme).copies;
    expect(copy!.look.line).toBe(UNKNOWN_COLOR_NEUTRAL);
    expect(copy!.look.stroke).toEqual(DASHED);
  });

  it('an empty member is getColor("") and throws upstream: the neutral (unreachable from the parser)', () => {
    // `parseSimpleColor("")` -> `ColorTrieNode.getColor("")` returns the root's null value (`ColorTrieNode.java:241-250`).
    expect(looks('')).toEqual([{ line: UNKNOWN_COLOR_NEUTRAL, head: UNKNOWN_COLOR_NEUTRAL }]);
  });

  it('a resolvable colour is unchanged', () => {
    expect(looks('#blue')).toEqual([{ line: BLUE, head: BLUE }]);
  });

  it('a style keyword alone keeps the default line colour', () => {
    expect(looks('bold')).toEqual([{ line: DEFAULT_LINE, head: DEFAULT_LINE }]);
  });
});
