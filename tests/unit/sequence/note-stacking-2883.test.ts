/**
 * plantuml#2883, upstream `2c679666164`: two `&` notes on the same footprint
 * stack (`NoteTile.java:100-133`, `YGauge#noteAnchorsInRun`), standalone notes
 * join the `&` disjointness pass (`PlayingSpace#findAnchorLivingSpace`,
 * `:384-409`), and the leading `/` merge warns that it is deprecated
 * (`FactorySequenceNoteCommand.java:279-283`).
 *
 * Sources are upstream's `vega/nonreg/group2883` cases (YAML header dropped);
 * expected values are the jar's (`scripts/oracle-render.sh`, 1.2026.11beta1,
 * 2026-11-19).
 */
import { describe, expect, it } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderFixtureSequence } from '../../oracle/svg-conformance/render-fixture-sequence.js';

function render(...lines: string[]): string {
  return renderFixtureSequence(['@startuml', ...lines, '@enduml', ''].join('\n'), new DeterministicMeasurer());
}

/** Each participant's lifeline x, by code. */
function lifelines(svg: string): Record<string, number> {
  const re =
    /data-qualified-name="([^"]+)" data-entity-uid="part\d+" id="part\d+-lifeline"[^>]*><g><title>[^<]*<\/title>(?:<rect[^>]*\/>)?<line x1="([\d.]+)"/g;
  return Object.fromEntries([...svg.matchAll(re)].map((m) => [m[1]!, Number(m[2])]));
}

/** The top-left of every note body (the first `<path>` of each note). */
function noteCorners(svg: string): [number, number][] {
  const corners = [...svg.matchAll(/<path d="M([\d.]+),([\d.]+) L/g)].map((m): [number, number] => [
    Number(m[1]),
    Number(m[2]),
  ]);
  return corners.filter((_, i) => i % 2 === 0);
}

const DEPRECATED =
  "The leading '/' note-merge syntax is deprecated; use '&amp;' to place notes on the same row instead.";

describe('same-footprint & notes stack (NoteTile.java:100-133)', () => {
  it('stacks three notes over the same participant below one another', () => {
    const svg = render(
      '!pragma teoz true',
      'A -> B: hello',
      'note over A: first note',
      '& note over A: second note',
      '& note over A: third note',
    );
    expect(noteCorners(svg)).toEqual([
      [25.522, 79],
      [15, 112],
      [23.328, 145],
    ]);
  });

  it('keeps a later note on another participant on the original line', () => {
    const svg = render(
      '!pragma teoz true',
      'participant A',
      'participant B',
      'participant C',
      'A -> B: hello',
      'note over A: n1',
      '& note over B: n2',
      '& note over A: n3',
      '& note over C: n4',
    );
    expect(noteCorners(svg)).toEqual([
      [15, 79],
      [66.544, 79],
      [15, 112],
      [112.006, 79],
    ]);
  });
});

describe('& notes take part in the disjointness pass (PlayingSpace.java:384-409)', () => {
  it('pushes notes on different participants apart', () => {
    const svg = render(
      '!pragma teoz true',
      'note left of U : first note quite wide here',
      '& note right of U : second note also fairly wide',
      '& note over O : third one',
    );
    expect(lifelines(svg)).toEqual({ U: 182.456, O: 413.881 });
  });

  it('pushes a & note clear of the message and of the note before it', () => {
    const svg = render(
      '!pragma teoz true',
      'U -> O : hello',
      '& note over ml : parallel note',
      '& note over sl : another parallel note',
    );
    expect(lifelines(svg)).toEqual({ U: 22.075, O: 73.619, ml: 124.544, sl: 250.2 });
  });
});

describe("the '/' note merge is deprecated (FactorySequenceNoteCommand.java:279-283)", () => {
  it('warns once for a standalone note merged with /', () => {
    // The banner writes its spaces as U+00A0, as the jar does.
    const svg = render('note over A : one', '/ note over B : two', '/ note over C : three').replace(/\u00a0/g, ' ');
    expect(svg.split(DEPRECATED)).toHaveLength(2);
  });

  it('does not warn for / note over several participants (FactorySequenceNoteOverSeveralCommand)', () => {
    const svg = render('A -> B : m', 'note over A : one', '/ note over A, B : two');
    expect(svg).not.toContain('deprecated');
  });
});
