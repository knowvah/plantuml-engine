import { describe, expect, it } from 'vitest';

import { ColorType } from '../../../src/core/abel/ColorType.js';
import { Colors } from '../../../src/core/abel/Colors.js';
import { Position } from '../../../src/core/abel/Position.js';
import { HColorSet } from '../../../src/core/klimt/color/HColorSet.js';
import { Display } from '../../../src/core/klimt/creole/Display.js';
import { UTranslate } from '../../../src/core/klimt/UTranslate.js';
import { Stereotype } from '../../../src/core/stereo/Stereotype.js';
import type { ArrowConfiguration } from '../../../src/diagrams/sequence/sequence-arrowhead.js';
import { ChangeState } from '../../../src/diagrams/timing/ChangeState.js';
import { PanelsConcise } from '../../../src/diagrams/timing/graphic/PanelsConcise.js';
import { TimingRuler } from '../../../src/diagrams/timing/TimingRuler.js';
import { timingStyle } from '../../../src/diagrams/timing/timing-klimt.js';
import { PlayerConcise } from '../../../src/diagrams/timing/PlayerConcise.js';
import { PlayerRectangle } from '../../../src/diagrams/timing/PlayerRectangle.js';
import { stringBounder, svgGraphic } from '../mindmap/helpers/mindmap-skin.js';
import {
  COLORS_CONCISE,
  CONCISE_BASIC,
  CONSTRAINT_WU,
  NOTES_WU,
  RECTANGLE,
  RELATIVE,
  SPECIAL_CONCISE,
} from './helpers/oracle.js';
import { statePlayer } from './helpers/players.js';
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

type State = PlayerConcise | PlayerRectangle;

function rightPanel(player: State, x: number, y: number): string[] {
  const ug = svgGraphic();
  player.panels().drawRightPanel(ug.apply(new UTranslate(x, y)));
  return svgElements(ug.getSvgString());
}

/** The number as the SVG writer prints it (3 decimals, no trailing zeros). */
const fmt = (n: number): string => String(Math.round(n * 1000) / 1000);

const text = (player: State, s: string): Display => Display.getWithNewlines(player.getSkinParam().getPragma(), s);

function conciseBasic(): State {
  const p = statePlayer('concise', { title: 'Web User', ticks: ['0', '100', '300'] });
  p.setState(tick('0'), undefined, NO_COLORS, 'Idle');
  p.setState(tick('100'), undefined, NO_COLORS, 'Waiting');
  p.setState(tick('300'), undefined, NO_COLORS, 'Idle');
  return p;
}

describe('PlayerConcise right panel (jar fragments)', () => {
  it('draws cov-concise-basic: hexagons, the pentagon of the last change, and the labels', () => {
    expect(rightPanel(conciseBasic(), 25, 35)).toEqual(CONCISE_BASIC);
  });

  it('draws cov-special-states: {hidden} nothing, {-} a line, {A,B} the first state, a quoted state', () => {
    const p = statePlayer('concise', { title: 'C', ticks: ['0', '10', '20', '30'] });
    p.setState(tick('0'), undefined, NO_COLORS, '{hidden}');
    p.setState(tick('10'), undefined, NO_COLORS, '{-}');
    p.setState(tick('20'), undefined, NO_COLORS, 'A', 'B');
    p.setState(tick('30'), undefined, NO_COLORS, 'quoted state');
    expect(rightPanel(p, 51.7, 35)).toEqual(SPECIAL_CONCISE);
  });

  it('draws cov-state-colors: the change colour fills the hexagon, the comment sits above the state', () => {
    const p = statePlayer('concise', { title: 'C', ticks: ['0', '10'] });
    p.setState(tick('0'), undefined, Colors.parse('#pink', set, ColorType.BACK), 'A');
    p.setState(tick('10'), 'comment', NO_COLORS, 'B');
    // The jar's origin is 20 + 5 + the width of R's widest label ('X', a float32 8.024999...), not 33.025: the
    // 'A' label at (0 + 50) / 2 - w / 2 sits on a rounding tie (54.0125) that only that origin resolves to 54.012.
    const left = stringBounder().calculateDimension({ family: 'sans-serif', size: 12 }, 'X').getWidth();
    expect(rightPanel(p, 25 + left, 35)).toEqual(COLORS_CONCISE);
  });

  it('draws cov-relative-time: a 5.5 step is 55 px wide (the ruler truncates 15.5 to 15 for its unit)', () => {
    const p = statePlayer('concise', { title: 'A', ticks: ['0', '10', '15.5'] });
    p.setState(tick('0'), undefined, NO_COLORS, 'x');
    p.setState(tick('10'), undefined, NO_COLORS, 'y');
    p.setState(tick('15.5'), undefined, NO_COLORS, 'z');
    expect(rightPanel(p, 25, 35)).toEqual(RELATIVE);
  });

  it('draws cov-constraint WU: the initial pentagon with its label, then the constraint at the player offset 1', () => {
    const p = statePlayer('concise', { title: 'Web User', ticks: ['0', '200', '300', '500'] });
    p.setState(undefined, undefined, NO_COLORS, 'Absent');
    p.setState(tick('0'), undefined, NO_COLORS, 'Waiting');
    p.setState(tick('500'), undefined, NO_COLORS, 'ok');
    p.createConstraint(tick('200'), tick('350'), '{150 ms}', CONFIG);
    expect(rightPanel(p, 124.4, 138)).toEqual(CONSTRAINT_WU);
    expect(p.panels().getLeftPanelWidth(stringBounder())).toBeCloseTo(37.35 + 24, 5);
  });

  it('draws cov-notes WU: a top note pushes the ribbon down by its height and draws after the labels', () => {
    const p = statePlayer('concise', { title: 'Web User', ticks: ['0', '100', '300'] });
    p.setState(tick('0'), undefined, NO_COLORS, 'Idle');
    p.setState(tick('100'), undefined, NO_COLORS, 'Waiting');
    p.addNote(tick('100'), text(p, 'first note'), Position.TOP);
    expect(rightPanel(p, 84.4, 118)).toEqual(NOTES_WU);
    expect(p.panels().getFullHeight(stringBounder())).toBe(5 + 33 + 24 + 10);
  });

  it('answers the heights: 5 for constraints at least, the ribbon, both notes, the 10 px bottom margin', () => {
    const sb = stringBounder();
    expect(conciseBasic().panels().getFullHeight(sb)).toBe(39);
    const p = statePlayer('concise', { ticks: ['0', '10'] });
    p.setState(tick('0'), 'on top', NO_COLORS, 'A');
    p.addNote(tick('0'), text(p, 'n'), Position.BOTTOM);
    // constraints 5 + the 12 px comment + ribbon 24 + bottom note (23 + 10) + margin 10
    expect(p.panels().getFullHeight(sb)).toBe(5 + 12 + 24 + 33 + 10);
  });
});

describe('PlayerRectangle right panel (jar fragments)', () => {
  it('draws cov-rectangle: boxes with the rectangle style, a flat line, 14 px labels', () => {
    const p = statePlayer('rectangle', { title: 'Rect', ticks: ['0', '10', '20'] });
    p.setState(tick('0'), undefined, NO_COLORS, 'A');
    p.setState(tick('10'), undefined, NO_COLORS, 'B');
    p.setState(tick('20'), undefined, NO_COLORS, '{-}');
    expect(rightPanel(p, 25, 35)).toEqual(RECTANGLE);
  });
});

describe('PanelsState#getTimeProjection (cov-messages: WU at y = 118)', () => {
  const player = (): State => {
    const p = statePlayer('concise', { title: 'Web User', ticks: ['0', '100', '300'] });
    p.setState(tick('0'), undefined, NO_COLORS, 'Idle');
    p.setState(tick('100'), undefined, NO_COLORS, 'Waiting');
    return p;
  };

  it('is one point at the middle of the ribbon on a change (oracle: 84.4 + 50, 118 + 17)', () => {
    const pt = player().panels().getTimeProjection(stringBounder(), tick('100'));
    expect(pt?.getPointA()).toEqual({ x: 50, y: 17 });
    expect(pt?.getPointB()).toEqual({ x: 50, y: 17 });
  });

  it('is the top and the bottom of the ribbon off a change (oracle: 259.4 - 84.4, 118 + 5 and 118 + 29)', () => {
    const pt = player().panels().getTimeProjection(stringBounder(), tick('350'));
    expect(pt?.getPointA()).toEqual({ x: 175, y: 5 });
    expect(pt?.getPointB()).toEqual({ x: 175, y: 29 });
  });

  it('is nothing for no tick', () => {
    expect(player().panels().getTimeProjection(stringBounder(), undefined)).toBeUndefined();
  });

  it('counts a top note and a top comment in the y of the ribbon', () => {
    const p = player();
    p.addNote(tick('0'), text(p, 'n'), Position.TOP);
    const pt = p.panels().getTimeProjection(stringBounder(), tick('0'));
    expect(pt?.getPointA().y).toBe(5 + 33 + 12);
  });
});

describe('PanelsState before the first change and with no change', () => {
  const INITIAL_WIDTH = 19.35 + 24;
  const leftWidth = (p: State): number => p.panels().getLeftPanelWidth(stringBounder());

  it('draws the initial state alone as a box over the whole panel, with its label (java:195-216)', () => {
    const p = statePlayer('concise', { ticks: ['0', '10'] });
    p.setState(undefined, undefined, NO_COLORS, 'Idle');
    expect(p.panels().getLeftPanelWidth(stringBounder())).toBeCloseTo(INITIAL_WIDTH, 5);
    expect(rightPanel(p, 0, 0)).toEqual([
      `<rect x="-43.35" y="5" width="143.35" height="24" fill="#E2E2F0" style="stroke:#E2E2F0;stroke-width:1.5;"/>`,
      `<line x1="-43.35" y1="5" x2="100" y2="5" style="stroke:#006400;stroke-width:1.5;"/>`,
      `<line x1="-43.35" y1="29" x2="100" y2="29" style="stroke:#006400;stroke-width:1.5;"/>`,
      `<text x="-31.35" y="20.333" fill="#333" font-size="12" textLength="19.35" font-weight="700">Idle</text>`,
    ]);
  });

  it('draws an initial {-} alone as one line through the middle, and no label', () => {
    const p = statePlayer('concise', { ticks: ['0', '10'] });
    p.setState(undefined, undefined, NO_COLORS, '{-}');
    expect(rightPanel(p, 0, 0)).toEqual([
      `<line x1="${fmt(-leftWidth(p))}" y1="17" x2="100" y2="17" style="stroke:#006400;stroke-width:1.5;"/>`,
    ]);
  });

  it('draws an initial {-} before a change as a flat line in that change`s colours', () => {
    const p = statePlayer('concise', { ticks: ['0', '10'] });
    p.setState(undefined, undefined, NO_COLORS, '{-}');
    p.setState(tick('10'), undefined, NO_COLORS, '{hidden}');
    // the line runs from the left of the initial label to the first change (tick 10 is 50 px in)
    expect(rightPanel(p, 0, 0)).toEqual([
      `<line x1="${fmt(-leftWidth(p))}" y1="17" x2="50" y2="17" style="stroke:#006400;stroke-width:1.5;"/>`,
    ]);
  });

  it('gives the pentagon before the first change the initial colours (java:277-287)', () => {
    const p = statePlayer('concise', { ticks: ['0', '10'] });
    p.setState(undefined, undefined, Colors.parse('#pink;line:#red', set, ColorType.BACK), 'Idle');
    p.setState(tick('10'), undefined, NO_COLORS, 'B');
    const [polygon, path] = rightPanel(p, 0, 0);
    expect(polygon).toContain('fill="#FFC0CB"');
    expect(polygon).toContain('stroke:#FFC0CB');
    expect(path).toContain('stroke:#F00');
    expect(path).toContain('fill="#FFC0CB"');
  });

  it('throws NullPointerException for the first pentagon with no initial colours (java:279)', () => {
    const p = statePlayer('concise', { ticks: ['0', '10'] });
    p.setState(undefined, undefined, undefined as unknown as Colors, 'Idle');
    p.setState(tick('10'), undefined, NO_COLORS, 'B');
    expect(() => rightPanel(p, 0, 0)).toThrow('java.lang.NullPointerException');
  });

  it('draws the rectangle player`s initial state as a box open on the left, then the boxes', () => {
    const p = statePlayer('rectangle', { ticks: ['0', '10'] });
    p.setState(undefined, undefined, NO_COLORS, 'Idle');
    p.setState(tick('0'), undefined, NO_COLORS, 'A');
    p.setState(tick('10'), undefined, NO_COLORS, 'B');
    const width = fmt(leftWidth(p));
    const out = rightPanel(p, 0, 0);
    expect(out[0]).toBe(
      `<rect x="-${width}" y="5" width="${width}" height="24" fill="#F1F1F1" style="stroke:#F1F1F1;stroke-width:0.5;"/>`,
    );
    expect(out[1]).toBe(
      `<path d="M-${width},5 L0,5 L0,29 L-${width},29" style="stroke:#333;stroke-width:0.5;" fill="#F1F1F1"/>`,
    );
  });
});

describe('PanelsState left panel', () => {
  it('draws nothing on the left and is as wide as the initial state (0 with none)', () => {
    const p = conciseBasic();
    const ug = svgGraphic();
    p.panels().drawLeftPanel(ug, 100);
    expect(svgElements(ug.getSvgString())).toEqual([]);
    expect(p.panels().getLeftPanelWidth(stringBounder())).toBe(0);
  });
});

describe('PanelsState last change of a rectangle player', () => {
  it('draws the last box open on the right: a fill, then top, left and bottom edges (PentaBShapeRectangle)', () => {
    const p = statePlayer('rectangle', { ticks: ['0', '10'] });
    p.setState(tick('0'), undefined, NO_COLORS, 'A');
    p.setState(tick('10'), undefined, NO_COLORS, 'B');
    const out = rightPanel(p, 0, 0);
    expect(out.slice(0, 4)).toEqual([
      '<rect x="0" y="5" width="50" height="24" fill="#F1F1F1" style="stroke:#333;stroke-width:0.5;"/>',
      '<rect x="50" y="5" width="50" height="24" fill="#F1F1F1" style="stroke:#F1F1F1;stroke-width:0.5;"/>',
      '<path d="M100,5 L50,5 L50,29 L100,29" style="stroke:#333;stroke-width:0.5;" fill="#F1F1F1"/>',
      expect.stringContaining('>A</text>'),
    ]);
  });
});

describe('PanelsState labels and drawing rules', () => {
  it('draws {...} as a hexagon with no label, and {?} as an ordinary label', () => {
    const p = statePlayer('concise', { ticks: ['0', '10', '20'] });
    p.setState(tick('0'), undefined, NO_COLORS, '{...}');
    p.setState(tick('10'), undefined, NO_COLORS, '{?}');
    p.setState(tick('20'), undefined, NO_COLORS, 'end');
    const out = rightPanel(p, 0, 0);
    expect(out.filter((e) => e.startsWith('<polygon'))).toHaveLength(3);
    expect(out.filter((e) => e.startsWith('<text')).map((e) => />([^<]*)</.exec(e)?.[1])).toEqual(['{?}', 'end']);
  });

  it('takes the style of its stereotype (java:101-104)', () => {
    const css = '<style>\ntimingDiagram {\n  .foo { concise { LineColor blue } }\n}\n</style>';
    const skinParam = timingSkinParam(css);
    const p = statePlayer('concise', { skinParam, stereotype: Stereotype.build('<<foo>>'), ticks: ['0', '10'] });
    p.setState(tick('0'), undefined, NO_COLORS, 'A');
    p.setState(tick('10'), undefined, NO_COLORS, 'B');
    expect(rightPanel(p, 0, 0)[0]).toContain('stroke:#00F');
  });

  it('draws a rectangle constraint 1 px inside its ticks', () => {
    const p = statePlayer('rectangle', { ticks: ['0', '100', '200'] });
    p.setState(tick('0'), undefined, NO_COLORS, 'A');
    p.createConstraint(tick('0'), tick('200'), 'c', CONFIG);
    const out = rightPanel(p, 0, 0);
    const heads = out.filter((e) => e.startsWith('<polygon') && e.includes('stroke-width:1;'));
    expect(heads[0]).toContain('points="9,'); // the left head's tip is 1 px right of tick 0 (x1 = 1), base at 1 + 8
  });

  it('takes setHeight into account (a 40 px ribbon)', () => {
    const p = statePlayer('concise', { ticks: ['0', '10'] });
    p.setHeight(40);
    p.setState(tick('0'), undefined, NO_COLORS, 'A');
    expect(p.panels().getFullHeight(stringBounder())).toBe(5 + 40 + 10);
    expect(p.panels().getTimeProjection(stringBounder(), tick('0'))?.getPointA().y).toBe(25);
  });

  it('builds panels once: later changes do not reach them, later notes do (live list)', () => {
    const p = statePlayer('concise', { ticks: ['0', '10'] });
    p.setState(tick('0'), undefined, NO_COLORS, 'A');
    const panels = p.panels();
    p.setState(tick('10'), undefined, NO_COLORS, 'B');
    p.addNote(tick('0'), text(p, 'n'), Position.TOP);
    expect(p.panels()).toBe(panels);
    const out = rightPanel(p, 0, 0);
    // only A (one pentagon): B was set after the panels were built
    expect(out.filter((e) => e.startsWith('<polygon') && e.includes('fill="#E2E2F0"'))).toHaveLength(1);
    expect(out.some((e) => e.includes('FEFFDD'))).toBe(true);
  });
});

describe('PanelsState accessors for subclasses (java:151-166)', () => {
  class Exposed extends PanelsConcise {
    public initialState(): string | undefined {
      return this.getInitialState();
    }
    public initialColors(): Colors | undefined {
      return this.getInitialColors();
    }
    public changes(): readonly ChangeState[] {
      return this.getChanges();
    }
    public ribbon(): number {
      return this.getRibbonHeight();
    }
  }

  it('hand back the initial state, its colours, the changes and the ribbon height (0 means 24)', () => {
    const skinParam = timingSkinParam();
    const exposed = new Exposed({
      ruler: new TimingRuler(skinParam),
      skinParam,
      suggestedHeight: 0,
      style: timingStyle(skinParam, 'concise'),
      notes: undefined,
      constraints: undefined,
    });
    const change = new ChangeState(tick('0'), undefined, NO_COLORS, 'A');
    exposed.setInitialState('Idle', NO_COLORS);
    exposed.addChange(change);
    expect(exposed.initialState()).toBe('Idle');
    expect(exposed.initialColors()).toBe(NO_COLORS);
    expect(exposed.changes()).toEqual([change]);
    expect(exposed.ribbon()).toBe(24);
  });
});

describe('PlayerConcise and PlayerRectangle', () => {
  it('are state players with no suggested height of their own', () => {
    expect(statePlayer('concise').getSuggestedHeight()).toBe(0);
    expect(statePlayer('rectangle').getSuggestedHeight()).toBe(0);
    expect(statePlayer('concise')).toBeInstanceOf(PlayerConcise);
    expect(statePlayer('rectangle')).toBeInstanceOf(PlayerRectangle);
  });
});
