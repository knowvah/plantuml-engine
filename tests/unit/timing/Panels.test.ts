import { describe, expect, it } from 'vitest';

import { Position } from '../../../src/core/abel/Position.js';
import { Display } from '../../../src/core/klimt/creole/Display.js';
import { XPoint2D } from '../../../src/core/klimt/geom/XPoint2D.js';
import { ULine } from '../../../src/core/klimt/shape/ULine.js';
import type { ArrowConfiguration } from '../../../src/diagrams/sequence/sequence-arrowhead.js';
import type { PanelsArgs } from '../../../src/diagrams/timing/graphic/Panels.js';
import { TimeConstraint } from '../../../src/diagrams/timing/TimeConstraint.js';
import { TimingNote } from '../../../src/diagrams/timing/TimingNote.js';
import { TimingRuler } from '../../../src/diagrams/timing/TimingRuler.js';
import { timingStyle } from '../../../src/diagrams/timing/timing-klimt.js';
import { stringBounder, svgGraphic } from '../mindmap/helpers/mindmap-skin.js';
import { DeltaPanels, TestPanels } from './helpers/panels.js';
import { TestStatePlayer } from './helpers/players.js';
import { svgElements, tick, timingSkinParam } from './helpers/timing.js';

const skinParam = timingSkinParam();
const CONFIG: ArrowConfiguration = {
  dressing1: { head: 'NORMAL', part: 'FULL' },
  dressing2: { head: 'NORMAL', part: 'FULL' },
  decoration1: 'NONE',
  decoration2: 'NONE',
  dashed: false,
};

/** Ticks 0, 10, 30, 50 at 5 px per unit (`cov-highlight`'s ruler: 300 px wide). */
function ruler(): TimingRuler {
  const r = new TimingRuler(skinParam);
  for (const t of ['0', '10', '30', '50']) r.addTime(tick(t));
  return r;
}

function note(position: Position, when: string | undefined, text: string): TimingNote {
  return new TimingNote({
    when: when === undefined ? undefined : tick(when),
    player: new TestStatePlayer({ skinParam }),
    note: Display.getWithNewlines(skinParam.getPragma(), text),
    position,
    skinParam,
    style: timingStyle(skinParam, 'note'),
  });
}

function constraint(from: string, to: string): TimeConstraint {
  return new TimeConstraint({ marginx: 1, tick1: tick(from), tick2: tick(to), label: 'c', skinParam, config: CONFIG });
}

function panels(extra: Partial<PanelsArgs> = {}, klass: typeof TestPanels = TestPanels): TestPanels {
  return new klass({
    ruler: ruler(),
    skinParam,
    suggestedHeight: 24,
    style: timingStyle(skinParam, 'concise'),
    notes: undefined,
    constraints: undefined,
    ...extra,
  });
}

function draw(f: (ug: ReturnType<typeof svgGraphic>) => void): string[] {
  const ug = svgGraphic();
  f(ug);
  return svgElements(ug.getSvgString());
}

describe('Panels constants (Panels.java:68-71)', () => {
  it('are 8, 12, 10 and 5', () => {
    expect(TestPanels.constants()).toEqual({ MARGIN_Y: 8, MARGIN_X: 12, BOTTOM_MARGIN: 10, LEFT_PANEL_MIN_WIDTH: 5 });
  });
});

describe('PanelsNoLeft', () => {
  it('has a 5 px left panel and draws nothing on it', () => {
    const p = panels();
    expect(p.getLeftPanelWidth(stringBounder())).toBe(5);
    expect(draw((ug) => p.drawLeftPanel(ug, 100))).toEqual([]);
  });
});

describe('Panels notes and constraints', () => {
  it('takes absent notes and constraints as empty lists (java:88-89)', () => {
    const p = panels();
    expect(p.noteList()).toEqual([]);
    expect(p.constraintList()).toEqual([]);
    expect(p.heightForConstraints(stringBounder())).toBe(0);
    expect(p.heightForNotes(stringBounder(), Position.TOP)).toBe(0);
  });

  it('keeps the lists it was given, live', () => {
    const notes: TimingNote[] = [];
    const constraints: TimeConstraint[] = [];
    const p = panels({ notes, constraints });
    notes.push(note(Position.TOP, '0', 'n'));
    constraints.push(constraint('0', '30'));
    expect(p.noteList()).toHaveLength(1);
    expect(p.constraintList()).toHaveLength(1);
  });

  it('sizes notes per position: the tallest of the notes at that position', () => {
    const p = panels({
      notes: [note(Position.TOP, '0', 'a'), note(Position.TOP, '10', 'a\\nb'), note(Position.BOTTOM, '0', 'c')],
    });
    const sb = stringBounder();
    expect(p.heightForNotes(sb, Position.BOTTOM)).toBe(33);
    expect(p.heightForNotes(sb, Position.TOP)).toBeGreaterThan(33);
    expect(p.heightForNotes(sb, Position.LEFT)).toBe(0);
  });

  it('draws only the notes at the position, each at its tick (a note with no tick at x = 0)', () => {
    const p = panels({
      notes: [
        note(Position.TOP, '10', 'at ten'),
        note(Position.TOP, undefined, 'no tick'),
        note(Position.BOTTOM, '0', 'b'),
      ],
    });
    const paths = draw((ug) => p.drawNotesAt(ug, Position.TOP)).filter((e) => e.startsWith('<path'));
    expect(paths).toHaveLength(4);
    expect(paths[0]).toContain('d="M50,0 L50,23');
    expect(paths[2]).toContain('d="M0,0 L0,23');
  });

  it('is as high as its tallest constraint, less the delta (java:115-124)', () => {
    const p = panels({ constraints: [constraint('0', '30'), constraint('10', '50')] });
    expect(p.heightForConstraints(stringBounder())).toBe(17);
    const q = panels({ constraints: [constraint('0', '30')] }, DeltaPanels);
    expect(q.heightForConstraints(stringBounder())).toBe(14);
  });

  it('draws each constraint moved by its delta', () => {
    const plain = panels({ constraints: [constraint('0', '30')] });
    const delta = panels({ constraints: [constraint('0', '30')] }, DeltaPanels);
    const a = draw((ug) => plain.drawConstraintsAt(ug));
    const b = draw((ug) => delta.drawConstraintsAt(ug));
    expect(a[0]).toBe('<line x1="4" y1="0" x2="146" y2="0" style="stroke:#8B0000;stroke-width:1.5;"/>');
    expect(b[0]).toBe('<line x1="4" y1="3" x2="146" y2="3" style="stroke:#8B0000;stroke-width:1.5;"/>');
  });
});

describe('Panels drawing helpers', () => {
  it('builds the context from the style: concise fill #E2E2F0, line #006400, stroke 1.5', () => {
    const p = panels();
    const out = draw((ug) => p.context().apply(ug).draw(new ULine(10, 0)));
    expect(out).toEqual(['<line x1="0" y1="0" x2="10" y2="0" style="stroke:#006400;stroke-width:1.5;"/>']);
    expect(p.stroke().getThickness()).toBe(1.5);
  });

  it('lays text out in the style font, left aligned (concise: 12 px bold, "Idle" 19.35 wide)', () => {
    const p = panels();
    const out = draw((ug) => p.textBlock('Idle').drawU(ug));
    expect(out).toEqual([
      '<text x="0" y="9.333" fill="#333" font-size="12" textLength="19.35" font-weight="700">Idle</text>',
    ]);
    expect(draw((ug) => p.createText('Idle').drawU(ug))).toEqual(out);
    expect(p.fontConfiguration().size).toBe(12);
  });

  it('draws a horizontal line from a point, and a vertical line at x, y', () => {
    const p = panels();
    const line = '"stroke:#006400;stroke-width:1.5;"';
    expect(draw((ug) => p.hLineFromPoint(p.context().apply(ug), new XPoint2D(3, 4), 20))).toEqual([
      `<line x1="3" y1="4" x2="23" y2="4" style=${line}/>`,
    ]);
    expect(draw((ug) => p.vline(p.context().apply(ug), 7, 8, ULine.vline(5)))).toEqual([
      `<line x1="7" y1="8" x2="7" y2="13" style=${line}/>`,
    ]);
  });

  it('maps a time to its pixel, and stops a horizontal line at the end of the ruler (java:176-186)', () => {
    const p = panels();
    const line = '"stroke:#006400;stroke-width:1.5;"';
    expect(p.x(5)).toBe(25);
    expect(p.x(50)).toBe(250);
    expect(draw((ug) => p.hBetweenTimes(p.context().apply(ug), 5, 20))).toEqual([
      `<line x1="25" y1="0" x2="100" y2="0" style=${line}/>`,
    ]);
    // 1000 is far past the ruler's 300 px: the line is cut at the ruler width
    expect(draw((ug) => p.hBetweenTimes(p.context().apply(ug), 5, 1000))).toEqual([
      `<line x1="25" y1="0" x2="300" y2="0" style=${line}/>`,
    ]);
  });
});
