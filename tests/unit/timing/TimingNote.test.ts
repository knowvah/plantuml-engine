import { describe, expect, it } from 'vitest';

import { Position } from '../../../src/core/abel/Position.js';
import { Display } from '../../../src/core/klimt/creole/Display.js';
import { UTranslate } from '../../../src/core/klimt/UTranslate.js';
import { TimingNote } from '../../../src/diagrams/timing/TimingNote.js';
import { timingStyle } from '../../../src/diagrams/timing/timing-klimt.js';
import { stringBounder, svgGraphic } from '../mindmap/helpers/mindmap-skin.js';
import { TestStatePlayer } from './helpers/players.js';
import { svgElements, tick, timingSkinParam } from './helpers/timing.js';

/** `cov-notes`, `note top of WU : first note`, drawn at x = tick 100 (134.4), y = under the title (118). */
const FIRST_NOTE_ORACLE = [
  '<path d="M134.4,118 L134.4,141 L205.125,141 L205.125,128 L195.125,118 L134.4,118" style="stroke:#333;stroke-width:0.5;" fill="#FEFFDD"/>',
  '<path d="M195.125,118 L195.125,128 L205.125,128 L195.125,118" style="stroke:#333;stroke-width:0.5;" fill="#FEFFDD"/>',
  '<text x="140.4" y="133.111" fill="#333" font-size="13" textLength="49.725" font-weight="700">first note</text>',
];

function noteOf(position: Position, text = 'first note'): { note: TimingNote; when: undefined } {
  const skinParam = timingSkinParam();
  const player = new TestStatePlayer({ skinParam });
  player.addNote(undefined, Display.getWithNewlines(skinParam.getPragma(), text), position);
  return { note: player.getNotes()[0] as TimingNote, when: undefined };
}

describe('TimingNote', () => {
  it('draws the Opale of cov-notes "first note": the folded-corner path, the dog-ear and the bold text', () => {
    const ug = svgGraphic();
    noteOf(Position.TOP).note.drawU(ug.apply(new UTranslate(134.4, 118)));
    expect(svgElements(ug.getSvgString())).toEqual(FIRST_NOTE_ORACLE);
  });

  it('shifts a BOTTOM note down by half the 10 px margin (TimingNote.java:79-80)', () => {
    const ug = svgGraphic();
    noteOf(Position.BOTTOM).note.drawU(ug.apply(new UTranslate(134.4, 118)));
    const [path] = svgElements(ug.getSvgString());
    expect(path).toContain('d="M134.4,123 L134.4,146 L205.125,146 L205.125,133 L195.125,123 L134.4,123"');
  });

  it('is 23 px of Opale plus the 10 px margin high (oracle path 118 to 141)', () => {
    expect(noteOf(Position.TOP).note.getHeight(stringBounder())).toBe(33);
  });

  it('grows with a multi-line note (cov-notes "a long\\nnote")', () => {
    const one = noteOf(Position.BOTTOM, 'a long').note.getHeight(stringBounder());
    const two = noteOf(Position.BOTTOM, 'a long\\nnote').note.getHeight(stringBounder());
    expect(one).toBe(33);
    expect(two).toBeGreaterThan(one);
  });

  it('keeps its tick, position and an absent tick for a note with no time', () => {
    const skinParam = timingSkinParam();
    const player = new TestStatePlayer({ skinParam });
    const when = tick('100');
    const note = new TimingNote({
      when,
      player,
      note: Display.getWithNewlines(skinParam.getPragma(), 'n'),
      position: Position.TOP,
      skinParam,
      style: timingStyle(skinParam, 'note'),
    });
    expect(note.getWhen()).toBe(when);
    expect(note.getPosition()).toBe('TOP');
    expect(noteOf(Position.BOTTOM).note.getWhen()).toBeUndefined();
  });
});
