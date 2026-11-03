/**
 * dss T3e: the merged label block of a state link that carries a `note ... on link` AND an inline label
 * (`SvekEdge.java:307-325` merges, `:950-954` draws).
 *
 * Offsets are the arithmetic of `TextBlockVertical#drawU` (`TextBlockVertical.java:77-99`, centre
 * horizontally, advance `y` by each operand's height) and `TextBlockHorizontal#drawU`
 * (`TextBlockHorizontal.java:78-93`, advance `x`, centre vertically). The `attachTransitionLabel` numbers
 * are the jar's own, from `tests/fixtures/diagram-style-scope/state__flatnote-none.svg`
 * (`A --> B : l` + `note on link : k`): the note polygon starts at `M99.12,107` (box 94.12,102, 5 px
 * padding) and the label is `<text x="111.408" y="98.111">`.
 */
import { describe, it, expect } from 'vitest';
import { mergedOperandOffsets, noteDrawnFirst } from '../../../src/diagrams/state/state-link-note-merge.js';
import { attachTransitionLabel } from '../../../src/diagrams/state/state-transition-label.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import type { Transition } from '../../../src/diagrams/state/ast.js';

const NOTE = { width: 37, height: 33 };
const LABEL = { width: 10, height: 17 };

describe('mergedOperandOffsets', () => {
  it('bottom: label above, note below, both centred on the wider operand', () => {
    expect(mergedOperandOffsets('bottom', NOTE, LABEL, { width: 37, height: 50 })).toEqual({
      note: { x: 0, y: 17 },
      label: { x: 13.5, y: 0 },
    });
  });
  it('top: note above, label below', () => {
    expect(mergedOperandOffsets('top', NOTE, LABEL, { width: 37, height: 50 })).toEqual({
      note: { x: 0, y: 0 },
      label: { x: 13.5, y: 33 },
    });
  });
  it('left: note leads, the shorter operand is centred vertically', () => {
    expect(mergedOperandOffsets('left', NOTE, LABEL, { width: 47, height: 33 })).toEqual({
      note: { x: 0, y: 0 },
      label: { x: 37, y: 8 },
    });
  });
  it('right: label leads', () => {
    expect(mergedOperandOffsets('right', NOTE, LABEL, { width: 47, height: 33 })).toEqual({
      note: { x: 10, y: 0 },
      label: { x: 0, y: 8 },
    });
  });
  it('the note is drawn first for left and top only (SvekEdge.java:318-325)', () => {
    expect((['left', 'top', 'right', 'bottom'] as const).map((p) => noteDrawnFirst(p))).toEqual([
      true,
      true,
      false,
      false,
    ]);
  });
});

describe('attachTransitionLabel with a note and an inline label', () => {
  const transition = {
    from: 'A',
    to: 'B',
    label: 'l',
    linkNote: 'k',
    linkNotePosition: 'bottom',
  } as unknown as Transition;
  const font = { family: 'sans-serif', size: 13 };
  const points = [
    { x: 0, y: 0 },
    { x: 10, y: 10 },
  ];
  const centre = { labelX: 112.62, labelY: 111 };

  it('places the note box and the label at the jar coordinates of state__flatnote-none', () => {
    const geo = attachTransitionLabel(transition, points, centre, font, new DeterministicMeasurer())!;
    // note box top-left 94.12,102 (jar polygon M99.12,107 less the 5 px padding); box 37x33
    expect(geo.x).toBeCloseTo(94.12, 2);
    expect(geo.y).toBeCloseTo(102, 2);
    expect([geo.width, geo.height]).toEqual([37, 33]);
    // label baseline: jar x=111.408 y=98.111, relative to the note corner
    expect(geo.x + geo.linkLabel!.dx).toBeCloseTo(111.408, 2);
    expect(geo.y + geo.linkLabel!.dy).toBeCloseTo(98.111, 2);
    expect(geo.linkLabel!.text).toBe('l');
    expect(geo.noteFirst).toBe(false);
  });

  it('inks the union of the note polygon and the marged label block', () => {
    const geo = attachTransitionLabel(transition, points, centre, font, new DeterministicMeasurer())!;
    // label block 87..102 (15 high); note polygon 107..130 -> 87..130 high
    expect(geo.inkBox!.y).toBeCloseTo(87, 2);
    expect(geo.inkBox!.height).toBeCloseTo(43, 2);
    // the polygon (99.12, 27 wide) is the wider operand on the x axis
    expect(geo.inkBox!.x).toBeCloseTo(99.12, 2);
    expect(geo.inkBox!.width).toBeCloseTo(27, 2);
  });

  it('a note alone keeps the note-only geometry: no label, ink is the polygon', () => {
    const noteOnly = { from: 'A', to: 'B', linkNote: 'k' } as unknown as Transition;
    const geo = attachTransitionLabel(
      noteOnly,
      points,
      { labelX: 112.62, labelY: 118.5 },
      font,
      new DeterministicMeasurer(),
    )!;
    expect(geo.linkLabel).toBeUndefined();
    expect(geo.noteFirst).toBeUndefined();
    expect([geo.width, geo.height]).toEqual([37, 33]);
    expect(geo.inkBox).toEqual({ x: 99.12, y: 107, width: 27, height: 23 });
  });

  it('draws the note first for position top', () => {
    const geo = attachTransitionLabel(
      { ...transition, linkNotePosition: 'top' },
      points,
      centre,
      font,
      new DeterministicMeasurer(),
    )!;
    expect(geo.noteFirst).toBe(true);
    // the label sits below the note: its baseline is under the note box
    expect(geo.linkLabel!.dy).toBeGreaterThan(geo.height ?? 0);
  });
});
