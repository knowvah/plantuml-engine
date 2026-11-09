import { describe, expect, it } from 'vitest';
import { ColorType } from '../../../src/core/abel/ColorType.js';
import type { Entity } from '../../../src/core/abel/Entity.js';
import { LeafType } from '../../../src/core/abel/LeafType.js';
import { BlocLines } from '../../../src/core/utils/BlocLines.js';
import { CommandControl } from '../../../src/core/command/CommandControl.js';
import { ParserPass } from '../../../src/core/command/ParserPass.js';
import { parseRefusalOf } from '../../../src/core/parse-refusal.js';
import { BackSlash } from '../../../src/core/text/BackSlash.js';
import { GUILLEMET_NONE } from '../../../src/core/stereo/StereotypeDecoration.js';
import { StringLocated } from '../../../src/core/tim/StringLocated.js';
import type { ActivityDiagram } from '../../../src/diagrams/activity-legacy/ActivityDiagram.js';
import { CommandLinkLongActivity } from '../../../src/diagrams/activity-legacy/command/CommandLinkLongActivity.js';
import { emptyDiagram, parseLines, parseOk } from './helpers.js';

const command = new CommandLinkLongActivity();
const NL = BackSlash.hiddenNewLine();
const block = (...texts: string[]): BlocLines => BlocLines.fromArray(texts);
const target = (diagram: ActivityDiagram): Entity => diagram.getLinks()[0]!.getEntity2();

describe('CommandLinkLongActivity#isValid', () => {
  it('answers OK_PARTIAL while the block is open', () => {
    expect(command.isValid(block('(*) --> "Line one'))).toBe(CommandControl.OK_PARTIAL);
    expect(command.isValid(block('(*) --> "Line one', 'line two'))).toBe(CommandControl.OK_PARTIAL);
  });

  it('answers OK once the last line closes the quote', () => {
    expect(command.isValid(block('(*) --> "Line one', 'line two"'))).toBe(CommandControl.OK);
    expect(command.isValid(block('(*) --> "Line one', 'line two" as L2 <<s>> in P1 #red'))).toBe(CommandControl.OK);
  });

  it('answers NOT_OK when the first line is no long link, or the block is empty', () => {
    expect(command.isValid(block('(*) --> A'))).toBe(CommandControl.NOT_OK);
    expect(command.isValid(block('hello'))).toBe(CommandControl.NOT_OK);
    expect(command.isValid(BlocLines.create())).toBe(CommandControl.NOT_OK);
  });

  it('drops the comment lines inside the block (REMOVE_STARTING_QUOTE)', () => {
    expect(command.isValid(block('(*) --> "Line one', "' a comment", 'line two"'))).toBe(CommandControl.OK);
    // the whole block is a comment but the first line: the first line alone is a partial
    expect(command.isValid(block('(*) --> "x', "'  y"))).toBe(CommandControl.OK_PARTIAL);
  });
});

describe('CommandLinkLongActivity#executeNow (lap-long-activity)', () => {
  it('lap-long-activity: one ACTIVITY leaf whose display has the three lines', () => {
    const diagram = parseOk('(*) --> "Line one', 'line two', 'line three"', '--> (*)');

    expect(diagram.leafs().map((e) => e.getName())).toEqual([
      'start',
      'Line one' + NL + 'line two' + NL + 'line three',
      'end',
    ]);
    const activity = target(diagram);
    expect(activity.getLeafType()).toBe(LeafType.ACTIVITY);
    expect(activity.getDisplay().size()).toBe(3);
    expect(
      activity
        .getDisplay()
        .asList()
        .map((e) => String(e)),
    ).toEqual(['Line one', 'line two', 'line three']);
  });

  it('links the source to the long activity, the next link leaves it, and the uids follow the jar (ent0002, ent0004)', () => {
    const diagram = parseOk('(*) --> "Line one', 'line two', 'line three"', '--> (*)');

    const [first, second] = diagram.getLinks();
    expect(first!.getEntity1().getName()).toBe('start');
    expect(first!.getEntity2()).toBe(target(diagram));
    expect(second!.getEntity1()).toBe(target(diagram));
    expect(second!.getEntity2().getName()).toBe('end');
    // lap-long-activity oracle: links ent0001 -> ent0002 and ent0002 -> ent0004
    expect([first!.getEntity1().getUid(), first!.getEntity2().getUid(), second!.getEntity2().getUid()]).toEqual([
      'ent0001',
      'ent0002',
      'ent0004',
    ]);
  });

  it('a two-line block keeps the first line, the text before the quote closes the second', () => {
    const diagram = parseOk('(*) --> "Line one', 'line two"');

    expect(
      target(diagram)
        .getDisplay()
        .asList()
        .map((e) => String(e)),
    ).toEqual(['Line one', 'line two']);
  });

  it('a one-line first text may be empty: `"` alone opens, the middle lines are the text', () => {
    const diagram = parseOk('(*) --> "', 'only middle', '"');

    expect(
      target(diagram)
        .getDisplay()
        .asList()
        .map((e) => String(e)),
    ).toEqual(['only middle']);
  });

  it('`as code` names the entity by its code and keeps the text as display', () => {
    const diagram = parseOk('(*) --> "Line one', 'line two" as L2');

    expect(target(diagram).getName()).toBe('L2');
    expect(target(diagram).getDisplay().size()).toBe(2);
  });

  it('applies the stereotype, the colour and the partition written after the closing quote', () => {
    const diagram = parseOk('(*) --> "Line one', 'line two" <<warn>> in P1 #red');

    const activity = target(diagram);
    expect(activity.getStereotype()!.getLabel(GUILLEMET_NONE)).toBe('warn');
    expect(activity.getColors().getColor(ColorType.BACK)).toBeDefined();
    expect(activity.getName()).toBe('Line one' + NL + 'line two');
    expect(activity.getQuark().getParent()!.getName()).toBe('P1');
    expect(diagram.groups().map((g) => g.getName())).toEqual(['P1']);
  });

  it('an arrow label and a dotted body reach the link', () => {
    const diagram = parseOk('(*) ..> [go] "Line one', 'line two"');

    const link = diagram.getLinks()[0]!;
    expect(link.getLabel().toString()).toBe('[go]');
    expect(link.getType().toString()).toContain('DOTTED');
  });

  it('a `[[url]]` in the first text line becomes the activity URL, not display text', () => {
    const diagram = parseOk('(*) --> "[[http://example.com]]', 'line two"');

    expect(target(diagram).getUrl99()?.getUrl()).toBe('http://example.com');
    expect(
      target(diagram)
        .getDisplay()
        .asList()
        .map((e) => String(e)),
    ).toEqual(['line two']);
  });

  it('the source may be any FIRST form: the last activity when it is omitted', () => {
    const diagram = parseOk('(*) --> A', '--> "Line one', 'line two"');

    expect(diagram.getLinks()[1]!.getEntity1().getName()).toBe('A');
  });

  it('a block that does not match its own start is a crash, as the null matcher result is upstream', () => {
    // CommandLinkLongActivity.java:188-189: `getStartingPattern().matcher(...)` is null, `getEntity` dereferences it
    expect(() => command.execute(emptyDiagram(), block('(*) --> A'), ParserPass.ONE)).toThrow(TypeError);
  });
});

describe('CommandLinkLongActivity in the factory loop', () => {
  it('an unterminated block is not a command: the line is a syntax error (jar: "Syntax Error?" at line 2)', () => {
    const refusal = parseRefusalOf(parseLines('(*) --> "Line one', 'line two'));

    expect(refusal).toMatchObject({ kind: 'syntax', message: 'Syntax Error?' });
  });

  it('the block ends at the first line that closes it, and the next line is a command of its own', () => {
    const diagram = parseOk('(*) --> "a', 'b"', '--> "c', 'd"');

    expect(diagram.getLinks().map((l) => l.getEntity2().getDisplay().size())).toEqual([2, 2]);
  });

  it('a one-line quoted activity is CommandLinkActivity, not this command', () => {
    const diagram = parseOk('(*) --> "Line one"');

    expect(diagram.getLinks()[0]!.getEntity2().getDisplay().size()).toBe(1);
  });
});

describe('CommandLinkLongActivity#explainNow', () => {
  it('describes the block, its code, partition, arrow and decorations', () => {
    const lines = BlocLines.from([
      new StringLocated('(*) -[#red]-> [go] "Line one', undefined),
      new StringLocated('line two" as L2 <<s>> in "My P" #blue', undefined),
    ]);

    expect(command.explain(lines)).toBe(
      "Drawing a link from the start node to a multiline activity (block of 2 lines), with code 'L2', " +
        "placed in the partition 'My P', labelled \"go\", with style '#red', " +
        'setting the stereotype of the target to <<s>>, setting the background color of the target to #blue',
    );
  });
});
