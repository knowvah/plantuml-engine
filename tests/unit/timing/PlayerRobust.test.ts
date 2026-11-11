import { describe, expect, it } from 'vitest';

import { ColorType } from '../../../src/core/abel/ColorType.js';
import { Colors } from '../../../src/core/abel/Colors.js';
import { HColorSet } from '../../../src/core/klimt/color/HColorSet.js';
import type { ArrowConfiguration } from '../../../src/diagrams/sequence/sequence-arrowhead.js';
import { PanelsRobust } from '../../../src/diagrams/timing/graphic/PanelsRobust.js';
import { ChangeState } from '../../../src/diagrams/timing/ChangeState.js';
import { TimingRuler } from '../../../src/diagrams/timing/TimingRuler.js';
import { timingStyle } from '../../../src/diagrams/timing/timing-klimt.js';
import type { PlayerRobust } from '../../../src/diagrams/timing/PlayerRobust.js';
import { stringBounder, svgGraphic } from '../mindmap/helpers/mindmap-skin.js';
import {
  AT_PLAYER_WB_LEFT,
  AT_PLAYER_WB_RIGHT,
  COLORS_ROBUST_LEFT,
  COLORS_ROBUST_RIGHT,
  CONSTRAINT_WB_LEFT,
  CONSTRAINT_WB_RIGHT,
  DEFINE_STATES_LEFT,
  DEFINE_STATES_RIGHT,
  ROBUST_BASIC_LEFT,
  ROBUST_BASIC_RIGHT,
  ROBUST_EDGES_LEFT,
  ROBUST_EDGES_RIGHT,
  SPECIAL_ROBUST_LEFT,
  SPECIAL_ROBUST_RIGHT,
} from './helpers/oracle.js';
import { drawLeft, drawRight, leftWidthOf } from './helpers/draw.js';
import { robustPlayer, statePlayer } from './helpers/players.js';
import { svgElements, tick, timingSkinParam } from './helpers/timing.js';

const set = HColorSet.instance();
const NO_COLORS = Colors.empty();
const CONFIG: ArrowConfiguration = {
  dressing1: { head: 'NORMAL', part: 'FULL' },
  dressing2: { head: 'NORMAL', part: 'FULL' },
  decoration1: 'NONE',
  decoration2: 'NONE',
  dashed: false,
};

const leftWidth = leftWidthOf;

function robustBasic(): PlayerRobust {
  const p = robustPlayer({ title: 'Web Browser', ticks: ['0', '100', '300', '500'] });
  p.setState(tick('0'), undefined, NO_COLORS, 'Idle');
  p.setState(tick('100'), undefined, NO_COLORS, 'Processing');
  p.setState(tick('300'), undefined, NO_COLORS, 'Waiting');
  p.setState(tick('500'), undefined, NO_COLORS, 'Idle');
  return p;
}

describe('PlayerRobust (jar fragments)', () => {
  it('draws cov-robust-basic: states listed in first-appearance order, the step waveform, the joints', () => {
    const p = robustBasic();
    expect(leftWidth(p)).toBeCloseTo(59.4, 5);
    expect(drawLeft(p, 25, 35, 59.4)).toEqual(ROBUST_BASIC_LEFT);
    expect(drawRight(p, 84.4, 35)).toEqual(ROBUST_BASIC_RIGHT);
  });

  it('draws cov-define-states: declared `has` states first (reversed), then new ones; a label replaces its code', () => {
    const p = robustPlayer({ title: 'R', ticks: ['0', '10', '20'] });
    p.defineState('Idle', 'Idle');
    p.defineState('Busy', 'Busy');
    p.defineState('Off', 'Off');
    p.defineState('LL', 'Long Label');
    p.setState(tick('0'), undefined, NO_COLORS, 'Idle');
    p.setState(tick('10'), undefined, NO_COLORS, 'LL');
    p.setState(tick('20'), undefined, NO_COLORS, 'Off');
    expect(drawLeft(p, 25, 35, 59.4)).toEqual(DEFINE_STATES_LEFT);
    expect(drawRight(p, 84.4, 35)).toEqual(DEFINE_STATES_RIGHT);
  });

  it('draws cov-special-states: {...} and {?} are rows, {Idle,Busy} is a hatched block between two rows', () => {
    const p = robustPlayer({ title: 'R', ticks: ['0', '10', '20', '30'] });
    p.setState(tick('0'), undefined, NO_COLORS, '{...}');
    p.setState(tick('10'), undefined, NO_COLORS, '{?}');
    p.setState(tick('20'), undefined, NO_COLORS, 'Idle', 'Busy');
    expect(drawLeft(p, 25, 89, 26.7)).toEqual(SPECIAL_ROBUST_LEFT);
    expect(drawRight(p, 51.7, 89)).toEqual(SPECIAL_ROBUST_RIGHT);
  });

  it('draws cov-state-colors: a change colour is read only for a two-state block, so a plain step stays unfilled', () => {
    const p = robustPlayer({ title: 'R', ticks: ['0', '10'] });
    p.setState(tick('0'), undefined, Colors.parse('#lightblue', set, ColorType.BACK), 'X');
    p.setState(tick('10'), undefined, NO_COLORS, 'Y');
    const x = 25 + leftWidth(p);
    expect(drawLeft(p, 25, 101, leftWidth(p))).toEqual(COLORS_ROBUST_LEFT);
    expect(drawRight(p, x, 101)).toEqual(COLORS_ROBUST_RIGHT);
  });

  it('fills a two-state block with the change colour, between the rows of A (y 20) and B (0) under the 10 px band', () => {
    const p = robustPlayer({ ticks: ['0', '10'] });
    p.setState(tick('0'), undefined, NO_COLORS, 'A', 'B');
    p.setState(tick('10'), undefined, Colors.parse('#lightblue', set, ColorType.BACK), 'A', 'B');
    const rects = drawRight(p, 0, 0).filter((e) => e.startsWith('<rect'));
    expect(rects).toEqual([
      '<rect x="0" y="10" width="50" height="20" fill="#E2E2F0" style="stroke:#006400;stroke-width:2;"/>',
      '<rect x="50" y="10" width="50" height="20" fill="#ADD8E6" style="stroke:#006400;stroke-width:2;"/>',
    ]);
  });

  it('draws cov-at-player: a relative tick is the previous one plus the delta', () => {
    const p = robustPlayer({ title: 'Web Browser', ticks: ['0', '200', '300', '500'] });
    p.setState(tick('0'), undefined, NO_COLORS, 'idle');
    p.setState(tick('200'), undefined, NO_COLORS, 'Proc.');
    p.setState(tick('300'), undefined, NO_COLORS, 'Waiting');
    expect(drawLeft(p, 25, 35, 40.05)).toEqual(AT_PLAYER_WB_LEFT);
    expect(drawRight(p, 65.05, 35)).toEqual(AT_PLAYER_WB_RIGHT);
  });

  it('draws cov-constraint: the initial state joins the first change, the constraint is lifted to its state', () => {
    const p = robustPlayer({ title: 'Web Browser', ticks: ['0', '200', '300', '500'] });
    p.setState(undefined, undefined, NO_COLORS, 'Initializing');
    p.setState(tick('0'), undefined, NO_COLORS, 'idle');
    p.setState(tick('200'), undefined, NO_COLORS, 'Processing');
    p.setState(tick('300'), undefined, NO_COLORS, 'Waiting');
    p.createConstraint(tick('0'), tick('50'), '{50 ms lag}', CONFIG);
    expect(leftWidth(p)).toBeCloseTo(59.4 + 40, 5);
    expect(drawLeft(p, 25, 35, 99.4)).toEqual(CONSTRAINT_WB_LEFT);
    expect(drawRight(p, 124.4, 35)).toEqual(CONSTRAINT_WB_RIGHT);
  });

  it('draws cov-robust-edges: 40 px height, a hidden change, a comment, right-aligned beside a wider panel', () => {
    const skinParam = timingSkinParam();
    const ruler = new TimingRuler(skinParam);
    const s = robustPlayer({ title: 'Short', skinParam, ruler, ticks: ['0', '10', '20', '30', '40'] });
    const l = statePlayer('concise', { title: 'Longer title here', skinParam, ruler });
    s.setHeight(40);
    l.setState(undefined, undefined, NO_COLORS, 'A very long initial label');
    s.setState(undefined, undefined, NO_COLORS, 'Init');
    s.setState(tick('0'), 'first', NO_COLORS, 'A');
    s.setState(tick('10'), undefined, NO_COLORS, '{hidden}');
    s.setState(tick('20'), undefined, NO_COLORS, 'B');
    s.setState(tick('30'), undefined, NO_COLORS, '{-}');
    s.setState(tick('40'), undefined, NO_COLORS, 'C');
    const available = l.panels().getLeftPanelWidth(stringBounder());
    expect(available).toBeCloseTo(143.475, 5);
    expect(drawLeft(s, 25, 35, available)).toEqual(ROBUST_EDGES_LEFT);
    expect(drawRight(s, 25 + available, 35)).toEqual(ROBUST_EDGES_RIGHT);
  });

  it('draws nothing on the right with no change, and its states have no height', () => {
    const p = robustPlayer({ ticks: ['0'] });
    expect(drawRight(p, 0, 0)).toEqual([]);
    expect(p.panels().getFullHeight(stringBounder())).toBe(10 + 12 + 6);
    expect(leftWidth(p)).toBe(0);
  });
});

describe('PanelsRobust#getFullHeight and the step height (java:279-307)', () => {
  it('is the 10 px constraint band, 20 px per step, 12 px bottom margin and 6 (cov-messages: 35 to 103)', () => {
    expect(robustBasic().panels().getFullHeight(stringBounder())).toBe(68);
  });

  it('divides a suggested height over the steps between the rows (cov-robust-edges: 40 / 4)', () => {
    const p = robustPlayer({ ticks: ['0'] });
    p.setHeight(40);
    for (const [i, s] of ['a', 'b', 'c'].entries()) p.setState(tick(String(i)), undefined, NO_COLORS, s);
    expect(p.panels().getFullHeight(stringBounder())).toBe(10 + 40 + 12 + 6);
  });

  it('keeps 20 px for a single row even with a suggested height', () => {
    const p = robustPlayer({ ticks: ['0'] });
    p.setHeight(40);
    p.setState(tick('0'), undefined, NO_COLORS, 'a');
    expect(p.panels().getFullHeight(stringBounder())).toBe(10 + 0 + 12 + 6);
  });

  it('raises the constraint band above 10 when the label is taller than the row it starts on', () => {
    const p = robustPlayer({ ticks: ['0', '10'] });
    p.setState(tick('0'), undefined, NO_COLORS, 'a');
    p.setState(tick('10'), undefined, NO_COLORS, 'b');
    p.createConstraint(tick('10'), tick('20'), 'label', CONFIG);
    // tick 10 is on row b (y 0), so nothing is subtracted: the band is the 17 px of the label (cov-constraint's WU
    // ribbon starts 17 px below its frame) plus 20 + 12 + 6.
    expect(p.panels().getFullHeight(stringBounder())).toBe(17 + 20 + 12 + 6);
  });
});

describe('PanelsRobust#getConstraintDeltaY (java:290-296)', () => {
  const MANY_LINES = 'a\\nb\\nc\\nd';
  const heightWith = (to: string): number => {
    const p = robustPlayer({ ticks: ['0', '100', '300'] });
    p.setState(tick('0'), undefined, NO_COLORS, 'Idle');
    p.setState(tick('100'), undefined, NO_COLORS, 'Processing');
    p.setState(tick('300'), undefined, NO_COLORS, 'Waiting');
    p.createConstraint(tick('0'), tick(to), MANY_LINES, CONFIG);
    return p.panels().getFullHeight(stringBounder());
  };

  it('lifts a constraint to the highest row of a change strictly inside it (Idle y 40, Processing y 20)', () => {
    // the band is the label height less the delta: spanning tick 100 the delta is 20 instead of 40
    expect(heightWith('300') - heightWith('50')).toBe(20);
  });

  it('throws for a constraint on a player with no change: no state is in force (java:327 `list.get(-1)`)', () => {
    const p = robustPlayer({ ticks: ['0'] });
    p.createConstraint(tick('0'), tick('50'), 'x', CONFIG);
    expect(() => p.panels().getFullHeight(stringBounder())).toThrow('IndexOutOfBoundsException');
  });
});

describe('PanelsRobust with a hidden last change (java:239-245)', () => {
  it('draws the line of the change before it and nothing for the hidden one', () => {
    const p = robustPlayer({ ticks: ['0', '10'] });
    p.setState(tick('0'), undefined, NO_COLORS, 'A');
    p.setState(tick('10'), undefined, NO_COLORS, '{hidden}');
    expect(drawRight(p, 0, 0)).toEqual([
      '<line x1="0" y1="10" x2="50" y2="10" style="stroke:#006400;stroke-width:2;"/>',
    ]);
  });
});

describe('PanelsRobust#getTimeProjection (cov-messages: Idle@0, Processing@100, Waiting@300 at y = 35)', () => {
  const player = (): PlayerRobust => {
    const p = robustPlayer({ ticks: ['0', '100', '300'] });
    p.setState(tick('0'), undefined, NO_COLORS, 'Idle');
    p.setState(tick('100'), undefined, NO_COLORS, 'Processing');
    p.setState(tick('300'), undefined, NO_COLORS, 'Waiting');
    return p;
  };
  const at = (p: PlayerRobust, t: string): [object, object] | undefined => {
    const pt = p.panels().getTimeProjection(stringBounder(), tick(t));
    return pt === undefined ? undefined : [pt.getPointA(), pt.getPointB()];
  };

  it('is the two rows either side of a change (oracle URL arrow ends at y 85 = 35 + 10 + 40)', () => {
    expect(at(player(), '100')).toEqual([
      { x: 50, y: 50 },
      { x: 50, y: 30 },
    ]);
    expect(at(player(), '300')).toEqual([
      { x: 150, y: 30 },
      { x: 150, y: 10 },
    ]);
  });

  it('is one point at the first change, or two when an initial state precedes it', () => {
    expect(at(player(), '0')).toEqual([
      { x: 0, y: 50 },
      { x: 0, y: 50 },
    ]);
    const p = player();
    p.setState(undefined, undefined, NO_COLORS, 'Init');
    expect(at(p, '0')).toEqual([
      { x: 0, y: 70 },
      { x: 0, y: 50 },
    ]);
  });

  it('is the state in force between changes, after the last, and the first before it', () => {
    expect(at(player(), '200')?.[0]).toEqual({ x: 100, y: 30 });
    expect(at(player(), '350')?.[0]).toEqual({ x: 175, y: 10 });
    expect(at(player(), '-50')?.[0]).toEqual({ x: -25, y: 50 });
  });

  it('is nothing for no tick or no change', () => {
    expect(player().panels().getTimeProjection(stringBounder(), undefined)).toBeUndefined();
    expect(at(robustPlayer({ ticks: ['0'] }), '0')).toBeUndefined();
  });

  it('adds the constraint band to y, as cov-constraint places WB rows at 35 + 10', () => {
    const p = player();
    p.createConstraint(tick('0'), tick('100'), 'label', CONFIG);
    // the label is 14.4 px high plus the 8 px top margin, less the y of the row of tick 0 (40): the 10 px floor holds
    expect((at(p, '100') as [{ y: number }, object])[0].y).toBe(50);
  });
});

describe('PanelsRobust construction (java:68-72, 119-127, 307-311)', () => {
  const build = (someStates: readonly string[]): PanelsRobust => {
    const skinParam = timingSkinParam();
    return new PanelsRobust({
      ruler: new TimingRuler(skinParam),
      skinParam,
      someStates,
      suggestedHeight: 0,
      style: timingStyle(skinParam, 'robust'),
      constraints: undefined,
    });
  };

  it('lists the given states reversed, so the first declared sits at the top', () => {
    const panels = build(['Idle', 'Busy', 'Off']);
    // reversed: [Off, Busy, Idle], and the row of index 0 is the lowest, so from the top: Idle, Busy, Off. The labels
    // are drawn in list order: Off (y 40 + 10 band), Busy, Idle.
    const ug = svgGraphic();
    panels.drawLeftPanel(ug, 0);
    const ys = svgElements(ug.getSvgString()).map((e) => /y="([\d.]+)"/.exec(e)?.[1]);
    expect(ys).toEqual(['54.333', '34.333', '14.333']);
  });

  it('adds a hidden change without its state, and an initial state already listed is not listed twice', () => {
    const panels = build([]);
    panels.addChange(new ChangeState(tick('0'), undefined, undefined, '{hidden}'));
    panels.addChange(new ChangeState(tick('10'), undefined, undefined, 'A'));
    panels.setInitialState('A', NO_COLORS);
    panels.setInitialState(undefined, undefined);
    const ug = svgGraphic();
    panels.drawLeftPanel(ug, 0);
    expect(svgElements(ug.getSvgString())).toHaveLength(1);
    expect(panels.getFullHeight(stringBounder())).toBe(10 + 0 + 12 + 6);
  });

  it('is 28 high with no state at all: the band, the margin and 6, with no step', () => {
    expect(build([]).getFullHeight(stringBounder())).toBe(28);
  });
});
