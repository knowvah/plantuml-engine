/**
 * hnh T2a (#204): a class/object `NOTE` draws under its own hidden flag, which it takes from its single-link host
 * (`CucaDiagram#isHidden`, `net/atmp/CucaDiagram.java:778-794`); `SvekResult#drawU` draws a hidden node through
 * `UHidden` (`svek/SvekResult.java:82-90`), so it draws nothing, and a link touching it writes only its comment
 * (`abel/Link.java:458-459`). A member tip is never delegated (`CucaDiagram.java:836-837`) and keeps drawing on a
 * hidden host (D2). Expected comments are the jar's (`tests/fixtures/hidden-note-host/*.svg`).
 */
import { describe, expect, it } from 'vitest';

import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { markHiddenNotes } from '../../../src/diagrams/class/note-hidden.js';
import type { NoteGeo } from '../../../src/diagrams/class/note-layout.js';
import { renderSync } from '../../../src/index.js';
import { svgComments } from '../../oracle/svg-conformance/svg-comments.js';

function render(lines: readonly string[]): string {
  return renderSync(['@startuml', ...lines, '@enduml'].join('\n'), { measurer: new DeterministicMeasurer() });
}

describe('hnh T2a: a note on a hidden class draws nothing', () => {
  it('note right of B + hide B: no note group, no note text, the jar comments', () => {
    const svg = render(['class A', 'class B', 'A --> B', 'note right of B : a note', 'hide B']);
    expect(svg).not.toContain('data-qualified-name="__note_0"');
    expect(svg).not.toContain('>a note<');
    expect(svgComments(svg)).toEqual(['class A', 'class B', 'link A to B']);
  });

  it('hide N on a lone note hides it by its own fold', () => {
    const svg = render(['class A', 'class B', 'A --> B', 'note "alone" as N', 'hide N']);
    expect(svg).not.toContain('>alone<');
    expect(svgComments(svg)).toEqual(['class A', 'class B', 'link A to B']);
  });

  it('hide N on a two-link note: no note, each link writes only its comment', () => {
    const svg = render(['class A', 'class B', 'note "two links" as N', 'N .. A', 'N .. B', 'hide N']);
    expect(svg).not.toContain('>two links<');
    expect(svg).not.toContain('class="link"');
    expect(svgComments(svg)).toEqual(['class A', 'class B', 'link N to A', 'link N to B']);
  });

  it('a member tip on a hidden host keeps drawing (D2)', () => {
    const svg = render([
      'class A',
      'class B {',
      '  x : int',
      '}',
      'A --> B',
      'note right of B::x',
      '  a tip',
      'end note',
    ]);
    const hidden = render([
      'class A',
      'class B {',
      '  x : int',
      '}',
      'A --> B',
      'note right of B::x',
      '  a tip',
      'end note',
      'hide B',
    ]);
    expect(svg).toContain('>a tip<');
    expect(hidden).toContain('>a tip<');
  });
});

describe('markHiddenNotes', () => {
  const geo = (id: string, kind: NoteGeo['kind']): NoteGeo => ({ id, kind }) as NoteGeo;

  it('marks a hidden note and leaves a visible note and a tip unchanged', () => {
    const notes = [geo('N1', 'note'), geo('N2', 'note'), geo('T1', 'tips')];
    const marked = markHiddenNotes(notes, new Set(['N1', 'T1']));
    expect(marked.map((n) => [n.id, n.hidden])).toEqual([
      ['N1', true],
      ['N2', undefined],
      ['T1', undefined],
    ]);
    expect(marked[1]).toBe(notes[1]);
  });
});
