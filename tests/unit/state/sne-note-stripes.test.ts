/**
 * sne T1a (issue #168): a state note whose display holds a `{{ … }}` line keeps its size on `buildNoteBody` and also
 * builds its stripes (D2): `BodyEnhanced2#getArea`'s blocks (`BodyEnhanced2.java:84-112`), each block's lines through
 * `CreoleParser#createSheetSlow` (`CreoleParser.java:146-170`), one `EmbeddedDiagram` atom per embed, stacked by
 * `SheetBlock1#initMap` (`SheetBlock1.java:115-171`). Expected values are the jar's, read from each row's oracle
 * (`tests/fixtures/{timing,wire}/…svg`, `plans/state-note-embed/measurements/probes/jar/*.svg`) less the note's
 * `(marginX1, marginY)` = `(6, 5)` (`Opale.java:127`).
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import type { NestedDiagramRenderer } from '../../../src/core/EmbeddedDiagram.js';
import { getNestedDiagramRenderer, registerNestedDiagramRenderer } from '../../../src/core/nested-diagram-registry.js';
import { createNestedDiagramRenderer } from '../../../src/diagrams/class/class-nested-diagram-renderer.js';
import { defaultTheme } from '../../../src/core/theme.js';
import { measureNote } from '../../../src/diagrams/state/state-note-layout.js';
import type { StateNoteStripe } from '../../../src/diagrams/state/state-note-stripes.js';

const measurer = new DeterministicMeasurer();
const TIMING = ['{{', 'robust "R" as R', '@0', 'R is a', '@10', 'R is b', '}}'].join('\n');
const WIRE = ['{{wire', '* a [40x30]', '* b [40x30]', 'a -> b : l', '}}'].join('\n');
const CLASS_X = ['{{', 'class X', '}}'];
/** One 13pt note line (`plantuml.skin` `note { FontSize 13 }`), the deterministic measurer's height. */
const LINE = 13;

/** `[kind, dx, dy, width?, height?]` per stripe, the shape every assertion below compares. */
function shape(items: readonly StateNoteStripe[]): (string | number)[][] {
  return items.map((s) => (s.kind === 'image' ? [s.kind, s.dx, s.dy, s.width, s.height] : [s.kind, s.dx, s.dy]));
}

describe('sne T1a: measureNote builds the stripes of a note with an embed', () => {
  let saved: NestedDiagramRenderer | undefined;
  beforeEach(() => {
    saved = getNestedDiagramRenderer();
    registerNestedDiagramRenderer(createNestedDiagramRenderer((src) => renderSync(src, { measurer })));
  });
  afterEach(() => {
    if (saved !== undefined) registerNestedDiagramRenderer(saved);
  });

  it('holds one 157x115 image stripe for the timing embed (cov-embedded-state.svg)', () => {
    const m = measureNote(TIMING, defaultTheme, measurer);
    expect(shape(m.stripes!.items)).toEqual([['image', 0, 0, 157, 115]]);
    expect([m.stripes!.width, m.stripes!.height]).toEqual([157, 115]);
    // The box stays on `buildNoteBody`: 157 + 6 + 15 by 115 + 2*5 (`EntityImageNote.java:176-181`).
    expect([m.width, m.height]).toEqual([178, 125]);
  });

  it('holds one 81x131 image stripe for a `{{wire` embed (cov-embedded-state-note.svg)', () => {
    const m = measureNote(WIRE, defaultTheme, measurer);
    expect(shape(m.stripes!.items)).toEqual([['image', 0, 0, 81, 131]]);
  });

  it('stacks text, image, text at the jar baselines (mixed.svg: 21.111, image y 24, 102.111 from y 6)', () => {
    const m = measureNote(['before', ...CLASS_X, 'after'].join('\n'), defaultTheme, measurer);
    expect(shape(m.stripes!.items)).toEqual([
      ['text', 0, 0],
      ['image', 0, LINE, 61, 68],
      ['text', 0, LINE + 68],
    ]);
  });

  it('stacks two embeds (two.svg: images at y 11 and 79 from y 6)', () => {
    const m = measureNote([...CLASS_X, ...CLASS_X].join('\n'), defaultTheme, measurer);
    expect(shape(m.stripes!.items)).toEqual([
      ['image', 0, 0, 61, 68],
      ['image', 0, 68, 61, 68],
    ]);
  });

  it('decorates the block after a `--` separator (sep.svg: rule y 135, image y 139 from y 117)', () => {
    const m = measureNote(['head', '--', ...CLASS_X].join('\n'), defaultTheme, measurer);
    // `decorate` without a title: `withMargin(block, 0, 4)` under a `TextBlockLineBefore` rule at its top
    // (`BodyEnhancedAbstract.java` `decorate`).
    expect(shape(m.stripes!.items)).toEqual([
      ['text', 0, 0],
      ['rule', 0, LINE],
      ['image', 0, LINE + 4, 61, 68],
    ]);
    expect(m.stripes!.height).toBe(LINE + 4 + 68 + 4);
    expect(m.height).toBe(m.stripes!.height + 10);
  });

  it('keeps a separator inside an embed out of the block walk (`addOneSingleLineManageEmbedded2`)', () => {
    const m = measureNote(['{{', 'class X', '--', 'class Y', '}}'].join('\n'), defaultTheme, measurer);
    expect(m.stripes!.items.map((s) => s.kind)).toEqual(['image']);
  });

  it('leaves an embed-free note on its text path, with no stripes', () => {
    const m = measureNote('plain\n--\ntext', defaultTheme, measurer);
    expect(m.stripes).toBeUndefined();
    expect(m.lines.map((l) => l.text)).toEqual(['plain', '--', 'text']);
  });
});
