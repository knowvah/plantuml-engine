/**
 * dss T3c: state readers of the scoped element colours, end to end through the
 * authored rows (`tests/fixtures/diagram-style-scope/state__*`). Each expectation
 * is a count the jar's own SVG holds (counted from the row's oracle, the number
 * is the literal), so the test fails if a reader skips its bucket.
 *
 * Sites (plans/diagram-style-scope/measurements/reader-audit.md section 2):
 *   1-4 start/end circles `EntityImageCircleStart.java:56-58`, `EntityImageCircleEnd.java:57-59`
 *   5   choice `EntityImageBranch.java:62-63` (`activityDiagram`, not `stateDiagram`)
 *   6   composite body `InnerStateAutonom.java:107-117`, `Cluster.java:464-470`
 *   7-9 arrow line, head, label `SvekEdge.java:817-819`, `Rainbow.java:84-95`
 *   10-12 note fill, stroke, text `EntityImageNote.java:100-108`
 */
import { describe, it, expect } from 'vitest';
import { readScopeFixture } from '../../oracle/svg-conformance/diagram-style-scope.js';
import { renderDbgMarkup } from '../../oracle/svg-conformance/document-background.js';

function ours(row: string): string {
  return renderDbgMarkup(readScopeFixture(row).markup);
}

function count(svg: string, needle: string): number {
  return svg.split(needle).length - 1;
}

describe('state rows read the scoped colours', () => {
  it('element { LineColor }: circles, arrows, heads and notes draw #B00 (jar: 23 occurrences)', () => {
    const golden = readScopeFixture('state__cascade-line-element').golden;
    const svg = ours('state__cascade-line-element');
    expect(count(golden, '#B00')).toBe(23);
    expect(count(svg, '#B00')).toBe(23);
  });

  it('diagram { FontColor }: the note text and the arrow label draw #00B (jar: 4 occurrences)', () => {
    const svg = ours('state__cascade-font-diag');
    expect(count(svg, '#00B')).toBe(4);
  });

  it('diagram { BackgroundColor }: circles, notes, zones and the composite body fill #AAA (jar: 9)', () => {
    const svg = ours('state__cascade-bg-diag');
    expect(count(svg, 'fill="#AAA"')).toBe(9);
    expect(count(svg, 'fill="#F1F1F1"')).toBe(1);
  });

  it('element { BackgroundColor } reaches the choice diamond, diagram { BackgroundColor } does not (jar: 0 and 1 #F1F1F1)', () => {
    expect(count(ours('state__cascade-bg-element'), 'fill="#F1F1F1"')).toBe(0);
    // `stateDiagram { }` does not sign `activityDiagram, activity, diamond`: the diamond keeps #F1F1F1.
    expect(count(ours('state__cascade-bg-diag'), 'fill="#F1F1F1"')).toBe(1);
  });

  it('activityDiagram { activity { BackgroundColor } } fills the choice only (jar: 1 #AAA, 1 #F1F1F1)', () => {
    const svg = ours('state__d5-activitydiag-activity');
    expect(count(svg, 'fill="#AAA"')).toBe(1);
    expect(count(svg, 'fill="#F1F1F1"')).toBe(1);
  });

  it('flat note rows: fill, stroke and text come from the note signature', () => {
    expect(count(ours('state__flatnote-bg-diag'), 'fill="#AAA"')).toBe(7);
    // jar: 5. `stateDiagram { }` does not reach the link note's `sequenceDiagram` signature
    // (`ComponentType.java:98-99`), so the fifth is the inline link label `l`, which sat beside the note
    // in the merged block and which T3e now draws (`SvekEdge.java:307-325`).
    expect(count(ours('state__flatnote-font-diag'), '#00B')).toBe(5);
    expect(count(ours('state__flatnote-line-diag'), '#B00')).toBe(11);
  });

  it('a top-level note beside a composite is drawn (D7): the row equals the jar document', () => {
    const svg = ours('state__cascade-none');
    // jar: width 170px, height 355px, with the note `ent0012` drawn (the composite pipeline used to lay it out only).
    expect(svg).toContain('width="170px" height="355px"');
    expect(count(svg, '<g class="entity"')).toBe(
      count(readScopeFixture('state__cascade-none').golden, '<g class="entity"'),
    );
  });
});
