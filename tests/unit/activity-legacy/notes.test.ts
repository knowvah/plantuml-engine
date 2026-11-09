import { describe, expect, it } from 'vitest';
import { ColorType } from '../../../src/core/abel/ColorType.js';
import type { Entity } from '../../../src/core/abel/Entity.js';
import { LeafType } from '../../../src/core/abel/LeafType.js';
import type { Link } from '../../../src/core/abel/Link.js';
import { Position, withRankdir } from '../../../src/core/abel/Position.js';
import { CommandControl } from '../../../src/core/command/CommandControl.js';
import { BlocLines } from '../../../src/core/utils/BlocLines.js';
import { ParserPass } from '../../../src/core/command/ParserPass.js';
import { CommandFactoryNoteOnLink } from '../../../src/core/command/note/CommandFactoryNoteOnLink.js';
import { Rankdir } from '../../../src/core/klimt/geom/Rankdir.js';
import { parseRefusalOf } from '../../../src/core/parse-refusal.js';
import { StringLocated } from '../../../src/core/tim/StringLocated.js';
import type { ActivityDiagram } from '../../../src/diagrams/activity-legacy/ActivityDiagram.js';
import { CommandFactoryNoteActivity } from '../../../src/diagrams/activity-legacy/command/CommandFactoryNoteActivity.js';
import { parseLines, parseOk } from './helpers.js';

const line = (text: string): StringLocated => new StringLocated(text, undefined);
const leaf = (diagram: ActivityDiagram, name: string): Entity => diagram.leafs().find((e) => e.getName() === name)!;
const names = (link: Link): [string, string] => [link.getEntity1().getName(), link.getEntity2().getName()];
const lengthOf = (link: Link): number => link.getLinkArg().getLength();
const textOf = (entity: Entity): string[] => entity.getDisplay().asList().map(String);

/** lap-note-activity.puml, verbatim. */
const NOTE_ACTIVITY = [
  '(*) --> A',
  'note right: a note',
  'A --> B',
  'note left',
  '  multi',
  '  line',
  'end note',
  'B --> (*)',
];

describe('CommandFactoryNoteActivity grammar', () => {
  const factory = new CommandFactoryNoteActivity();
  const single = factory.createSingleLine();
  const multi = factory.createMultiLine(false);

  it.each([['note right: a'], ['note left : a'], ['note top #red: a'], ['  note bottom:  '], ['note right:']])(
    'single line claims %j',
    (text) => {
      expect(single.isValid(line(text))).toBe(CommandControl.OK);
    },
  );

  it.each([['note: a'], ['note on link: a'], ['note right'], ['note right of A: a'], ['notes right: a']])(
    'single line does not claim %j',
    (text) => {
      expect(single.isValid(line(text))).toBe(CommandControl.NOT_OK);
    },
  );

  it('multi line opens on "note <position>" and closes on end note (also "endnote")', () => {
    expect(multi.isValid(BlocLines.single(line('note right')))).toBe(CommandControl.OK_PARTIAL);
    expect(multi.isValid(BlocLines.single(line('note right #red')))).toBe(CommandControl.OK_PARTIAL);
    expect(multi.isValid(BlocLines.single(line('note right of A')))).toBe(CommandControl.NOT_OK);
    expect(multi.getEndPattern().test('  end note')).toBe(true);
    expect(multi.getEndPattern().test('endnote')).toBe(true);
    expect(multi.getEndPattern().test('end  note')).toBe(false);
  });
});

describe('CommandFactoryNoteActivity#executeInternal (lap-note-activity)', () => {
  it('creates two NOTE leaves, GN4 and GMN9, from the shared cpt1 sequence', () => {
    const diagram = parseOk(...NOTE_ACTIVITY);

    expect(diagram.leafs().map((e) => `${e.getName()}:${String(e.getLeafType())}`)).toEqual([
      'start:CIRCLE_START',
      'A:ACTIVITY',
      'GN4:NOTE',
      'B:ACTIVITY',
      'GMN9:NOTE',
      'end:CIRCLE_END',
    ]);
    // The oracle: ent0005 (GN4) and ent0010 (GMN9), `data-qualified-name` GN4 / GMN9.
    expect(leaf(diagram, 'GN4').getUid()).toBe('ent0005');
    expect(leaf(diagram, 'GMN9').getUid()).toBe('ent0010');
    expect(textOf(leaf(diagram, 'GN4'))).toEqual(['a note']);
    expect(textOf(leaf(diagram, 'GMN9'))).toEqual(['multi', 'line']);
  });

  it('links the notes to A and B on the sides the oracle draws: right is A to note, left is note to B', () => {
    const diagram = parseOk(...NOTE_ACTIVITY);

    expect(diagram.getLinks().map(names)).toEqual([
      ['start', 'A'],
      ['A', 'GN4'],
      ['A', 'B'],
      ['GMN9', 'B'],
      ['B', 'end'],
    ]);
    const [, right, , left] = diagram.getLinks();
    expect(lengthOf(right!)).toBe(1);
    expect(lengthOf(left!)).toBe(1);
    expect(right!.getType().toString()).toContain('DASHED');
    expect(left!.getType().toString()).toContain('DASHED');
  });

  it('leaves getLastEntityConsulted unchanged (ActivityDiagram.java:101-103)', () => {
    const diagram = parseOk('(*) --> A', 'note right: x');
    expect(diagram.getLastEntityConsulted()!.getName()).toBe('A');

    const after = parseOk('(*) --> A', 'note right: x', '--> B');
    expect(names(after.getLinks()[2]!)).toEqual(['A', 'B']);
  });

  it('top and bottom use length 2, top running note to activity', () => {
    const diagram = parseOk('(*) --> A', 'note bottom: b', 'note top: t');

    const [, bottom, top] = diagram.getLinks();
    expect([names(bottom!), lengthOf(bottom!)]).toEqual([['A', 'GN4'], 2]);
    expect([names(top!), lengthOf(top!)]).toEqual([['GN7', 'A'], 2]);
  });

  it('turns every position a quarter under left to right direction (Position.withRankdir)', () => {
    const diagram = parseOk('left to right direction', '(*) --> A', 'note right: r');

    const link = diagram.getLinks()[1]!;
    expect([names(link), lengthOf(link)]).toEqual([['A', 'GN4'], 2]);
    expect(withRankdir(Position.RIGHT, Rankdir.LEFT_TO_RIGHT)).toBe(Position.BOTTOM);
    expect(withRankdir(Position.LEFT, Rankdir.LEFT_TO_RIGHT)).toBe(Position.TOP);
    expect(withRankdir(Position.BOTTOM, Rankdir.LEFT_TO_RIGHT)).toBe(Position.RIGHT);
    expect(withRankdir(Position.TOP, Rankdir.LEFT_TO_RIGHT)).toBe(Position.LEFT);
    expect(withRankdir(Position.TOP, Rankdir.TOP_TO_BOTTOM)).toBe(Position.TOP);
  });

  it('colours the note background when a colour is written, on both flavours', () => {
    const diagram = parseOk('(*) --> A', 'note right #red: r', 'note left #blue', 'x', 'end note');
    const red = diagram.getSkinParam().getIHtmlColorSet().getColor('#red');
    const blue = diagram.getSkinParam().getIHtmlColorSet().getColor('#blue');

    expect(leaf(diagram, 'GN4').getColors().getColor(ColorType.BACK)).toEqual(red);
    expect(leaf(diagram, 'GMN7').getColors().getColor(ColorType.BACK)).toEqual(blue);
  });

  it('a note without a colour leaves the note colours empty', () => {
    const diagram = parseOk('(*) --> A', 'note right: r');

    expect(leaf(diagram, 'GN4').getColors().getColor(ColorType.BACK)).toBeUndefined();
  });

  it('a single-line note turns \\n into several lines', () => {
    const diagram = parseOk('(*) --> A', 'note right: one\\ntwo');

    expect(textOf(leaf(diagram, 'GN4'))).toEqual(['one', 'two']);
  });

  it('a [[url]] first line of a multi-line note becomes its URL and leaves the display', () => {
    const diagram = parseOk('(*) --> A', 'note right', '[[http://example.com]]', 'text', 'end note');

    expect(leaf(diagram, 'GMN4').getUrl99()?.getUrl()).toBe('http://example.com');
    expect(textOf(leaf(diagram, 'GMN4'))).toEqual(['text']);
  });

  it('a multi-line note keeps a starting-quote line (KEEP_STARTING_QUOTE) and removes the empty column', () => {
    const diagram = parseOk('(*) --> A', 'note right', "  'quoted", '    deeper', 'end note');

    expect(textOf(leaf(diagram, 'GMN4'))).toEqual(["'quoted", '  deeper']);
  });
});

describe('CommandFactoryNoteActivity with no activity yet (lap-lone-note, coruvi-63)', () => {
  it('lap-lone-note: accepted; the note is GN1 (ent0002) and getStart creates start (ent0003) after it', () => {
    const diagram = parseOk('note right: alone');

    // The oracle draws `start_entity` ent0003 after the note entity ent0002.
    expect(diagram.leafs().map((e) => `${e.getName()}:${e.getUid()}`)).toEqual(['GN1:ent0002', 'start:ent0003']);
    expect(leaf(diagram, 'start').getLeafType()).toBe(LeafType.CIRCLE_START);
    expect(diagram.getLinks().map(names)).toEqual([['start', 'GN1']]);
    // `getStart`'s reallyCreateLeaf runs `updateLasts` for the non-NOTE start leaf.
    expect(diagram.getLastEntityConsulted()!.getName()).toBe('start');
  });

  it('coruvi-63: the macro expands to `note right: def a, def b`; same shape, same start', () => {
    const diagram = parseOk('note right: def a, def b');

    expect(textOf(leaf(diagram, 'GN1'))).toEqual(['def a, def b']);
    expect(diagram.leafs().map((e) => `${e.getName()}:${e.getUid()}`)).toEqual(['GN1:ent0002', 'start:ent0003']);
    expect(diagram.getLinks().map(names)).toEqual([['start', 'GN1']]);
  });

  it('the multi-line flavour creates the start the same way', () => {
    const diagram = parseOk('note left', 'text', 'end note');

    expect(diagram.getLinks().map(names)).toEqual([['GMN1', 'start']]);
    expect(leaf(diagram, 'start').getLeafType()).toBe(LeafType.CIRCLE_START);
  });
});

describe('CommandFactoryNoteOnLink grammar', () => {
  const factory = new CommandFactoryNoteOnLink(ParserPass.ONE);
  const single = factory.createSingleLine();
  const multi = factory.createMultiLine(false);

  it.each([
    ['note on link: x'],
    ['note right on link: x'],
    ['note left of link : x'],
    ['note on link #red: x'],
    ['note top on link #red : x'],
  ])('single line claims %j', (text) => {
    expect(single.isValid(line(text))).toBe(CommandControl.OK);
  });

  it.each([['note on link'], ['note right: x'], ['note on links: x']])('single line does not claim %j', (text) => {
    expect(single.isValid(line(text))).toBe(CommandControl.NOT_OK);
  });

  it('multi line opens on "note [position] on link [colour]" and ends on end note without a leading space', () => {
    expect(multi.isValid(BlocLines.single(line('note on link')))).toBe(CommandControl.OK_PARTIAL);
    expect(multi.isValid(BlocLines.single(line('note bottom of link #red')))).toBe(CommandControl.OK_PARTIAL);
    expect(multi.getEndPattern().test('end note')).toBe(true);
    expect(multi.getEndPattern().test('endnote')).toBe(true);
    // CommandFactoryNoteOnLink.java:100: `^end[%s]?note$`, unlike the activity note, has no `[%s]*` prefix; the
    // trimmed last line is what `Trim.BOTH` hands it, so an indented `end note` still closes the block.
    expect(multi.getEndPattern().test('  end note')).toBe(false);
  });

  it('is eligible only for the pass it was built with (java:128-131, 154-157)', () => {
    expect(single.isEligibleFor(ParserPass.ONE)).toBe(true);
    expect(single.isEligibleFor(ParserPass.TWO)).toBe(false);
    expect(multi.isEligibleFor(ParserPass.TWO)).toBe(false);
  });
});

describe('CommandFactoryNoteOnLink#executeInternal (lap-note-on-link)', () => {
  const NOTE_ON_LINK = [
    '(*) --> A',
    'note on link: link note',
    'A --> B',
    'note on link',
    '  multi line',
    'end note',
    'B --> (*)',
  ];

  it('both notes attach to the preceding link, BOTTOM by default, and create no leaf', () => {
    const diagram = parseOk(...NOTE_ON_LINK);

    const [first, second, third] = diagram.getLinks();
    expect([names(first!), first!.getNote()!.getPosition(), textOf2(first!)]).toEqual([
      ['start', 'A'],
      Position.BOTTOM,
      ['link note'],
    ]);
    expect([names(second!), second!.getNote()!.getPosition(), textOf2(second!)]).toEqual([
      ['A', 'B'],
      Position.BOTTOM,
      ['multi line'],
    ]);
    expect(third!.getNote()).toBeUndefined();
    expect(diagram.leafs().map((e) => e.getName())).toEqual(['start', 'A', 'B', 'end']);
  });

  it('an explicit position and a colour reach the CucaNote', () => {
    const diagram = parseOk('(*) --> A', 'note left on link #red: x');
    const note = diagram.getLinks()[0]!.getNote()!;

    expect(note.getPosition()).toBe(Position.LEFT);
    expect(note.getColors().getColor(ColorType.BACK)).toEqual(
      diagram.getSkinParam().getIHtmlColorSet().getColor('#red'),
    );
  });

  it('a second note replaces the first on the same link (Link#addNote stores one)', () => {
    const diagram = parseOk('(*) --> A', 'note on link: one', 'note top on link: two');
    const note = diagram.getLinks()[0]!.getNote()!;

    expect([note.getPosition(), note.getDisplay().asList().map(String)]).toEqual([Position.TOP, ['two']]);
  });

  it('with no link yet: execution error "No link defined"', () => {
    const refusal = parseRefusalOf(parseLines('note on link: x'));

    expect([refusal?.kind, refusal?.message]).toEqual(['execution', 'No link defined']);
  });

  it('a multi-line note with no text: execution error "No note defined"', () => {
    const refusal = parseRefusalOf(parseLines('(*) --> A', 'note on link', 'end note'));

    expect([refusal?.kind, refusal?.message]).toEqual(['execution', 'No note defined']);
  });

  it('the note after "note on link" does not count as a link: the last link stays', () => {
    const diagram = parseOk('(*) --> A', 'A --> B', 'note on link: x');

    expect(diagram.getLinks()[0]!.getNote()).toBeUndefined();
    expect(diagram.getLinks()[1]!.getNote()!.getDisplay().asList().map(String)).toEqual(['x']);
  });
});

function textOf2(link: Link): string[] {
  return link.getNote()!.getDisplay().asList().map(String);
}
