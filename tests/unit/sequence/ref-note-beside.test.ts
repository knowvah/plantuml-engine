/**
 * sdd2 T5h -- a note written after a `ref` belongs to the `Reference`
 * (`SequenceDiagram.java:154-158` getLastEventWithNote) and `ReferenceTile`
 * draws it beside the ref at the ref's own top (`ReferenceTile.java:76-85,
 * 138-150`), adding no height (`:153-157`). Expected values are read off the
 * jar's `in.svg` for the ficiru / rezoma fixtures (`test-results/dot-cache/
 * sequence/{ficiru-65-geda551,rezoma-09-vixi307}`).
 */
import { describe, expect, it } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderFixtureSequence } from '../../oracle/svg-conformance/render-fixture-sequence.js';

const SOURCE = (note: string): string =>
  `@startuml\nparticipant Alice\nactor Bob\n\nAlice -> Bob : hello\nnote right: This is a note1\n\nref over Bob\n  This can be on\n  several lines\nend ref\n\n${note}\n@enduml`;

const render = (note: string): string => renderFixtureSequence(SOURCE(note), new DeterministicMeasurer());

describe('note after ref', () => {
  it('draws a right note at last, ref top + 5 (ficiru)', () => {
    const svg = render('note right: This is a right note2');
    expect(svg).toContain('<path d="M163.975,130 L163.975,153 L297.975,153 L297.975,140 L287.975,130 L163.975,130"');
    expect(svg).toContain('height="272px"');
  });

  it('draws a left note at first - width (rezoma)', () => {
    const svg = render('note left: This is a left note2');
    expect(svg).toContain('<path d="M15,130 L15,153 L141,153 L141,140 L131,130 L15,130"');
  });
});

describe('top/bottom note after ref', () => {
  // Oracle probe (scripts/oracle-render.sh, 2026-10-21): `A -> B : hi`,
  // `ref over A, B : r`, `note bottom : n`, `A -> B : after` draws NO note
  // (no FEFFDD fill) and the later message sits right under the ref (jar
  // y=148.111 = ours 128.111 + the 20px banner); the jar adds a banner, reworded upstream in
  // 443598c29ce to "'note bottom' is not supported on a 'ref': …" (built by T7e). Its width sets the
  // canvas: jar 416 (bottom) and 399 (top), re-probed against a720bdd.
  // `Reference#addNote` returns that Warning instead of storing the note
  // (`Reference.java:166-168`).
  const probe = (position: string): string =>
    renderFixtureSequence(
      `@startuml\nparticipant A\nparticipant B\nA -> B : hi\nref over A, B : r\nnote ${position} : n\nA -> B : after\n@enduml`,
      new DeterministicMeasurer(),
    );

  it.each([
    ['bottom', 416],
    ['top', 399],
  ])('draws no %s note: canvas is the jar %ix211 (191 body + the 20px banner)', (position, width) => {
    const svg = probe(position);
    expect(svg).not.toContain('#FEFFDD');
    expect(svg).toContain(`width="${width}px" height="211px"`);
    const warning = `'note ${position}' is not supported on a 'ref': this note is ignored.`;
    expect(svg).toContain(warning.replaceAll(' ', '\u00a0'));
  });
});
