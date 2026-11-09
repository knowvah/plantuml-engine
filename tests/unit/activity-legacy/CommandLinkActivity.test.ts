import { describe, expect, it } from 'vitest';
import { ColorType } from '../../../src/core/abel/ColorType.js';
import type { Entity } from '../../../src/core/abel/Entity.js';
import { GroupType } from '../../../src/core/abel/GroupType.js';
import { LeafType } from '../../../src/core/abel/LeafType.js';
import type { Link } from '../../../src/core/abel/Link.js';
import { CommandControl } from '../../../src/core/command/CommandControl.js';
import { ParserPass } from '../../../src/core/command/ParserPass.js';
import { StringLocated } from '../../../src/core/tim/StringLocated.js';
import { GUILLEMET_NONE } from '../../../src/core/stereo/StereotypeDecoration.js';
import type { ActivityDiagram } from '../../../src/diagrams/activity-legacy/ActivityDiagram.js';
import { CommandLinkActivity } from '../../../src/diagrams/activity-legacy/command/CommandLinkActivity.js';
import { emptyDiagram, parseOk } from './helpers.js';

const command = new CommandLinkActivity();
const line = (text: string): StringLocated => new StringLocated(text, undefined);

/** Runs the command on `text` against `diagram`, failing the test when the command refuses or errors. */
function run(diagram: ActivityDiagram, text: string): void {
  expect(command.isValid(line(text))).toBe(CommandControl.OK);
  const result = command.execute(diagram, line(text), ParserPass.ONE);
  expect(result.isOk()).toBe(true);
}

/** A diagram after the link lines, each run in order. */
function linked(...texts: string[]): ActivityDiagram {
  const diagram = emptyDiagram();
  for (const text of texts) run(diagram, text);
  return diagram;
}

const names = (diagram: ActivityDiagram): string[] => diagram.leafs().map((leaf) => leaf.getName());
const types = (diagram: ActivityDiagram): (LeafType | undefined)[] => diagram.leafs().map((leaf) => leaf.getLeafType());
const ends = (link: Link): [string, string] => [link.getEntity1().getName(), link.getEntity2().getName()];
const leaf = (diagram: ActivityDiagram, name: string): Entity => diagram.leafs().find((e) => e.getName() === name)!;

describe('CommandLinkActivity grammar', () => {
  it.each([
    ['(*) --> A'],
    ['A --> B'],
    ['A --> (*)'],
    ['--> B'],
    ['===X=== --> A'],
    ['"a b" --> "c d"'],
    ['"a b" as AB --> C'],
    ['(*top) --> A'],
    ['A --> (*top)'],
    ['A --> (*12)'],
    ['A --> {'],
    ['A --> some words'],
    ['A ..> B'],
    ['A -[#red]-> B'],
    ['A -[#red,dashed]left[bold]-> B'],
    ['A -*-> B'],
    ['A --> [label] B'],
    ['A --> B in P'],
    ['A --> B in "my lane"'],
    ['A --> B #red'],
    ['(*) [[http://example.com]]--> A'],
  ])('claims %s', (text) => {
    expect(command.isValid(line(text))).toBe(CommandControl.OK);
  });

  it.each([
    ['A - > B'],
    ['A -->'],
    ['A > B'],
    ['hello'],
    [''],
    // lap-url's oracle is "Syntax Error?" on this line: the `[[url]]` sits after the arrow, where only `[label]` goes
    ['(*) --> [[http://example.com]] A'],
  ])('does not claim %j', (text) => {
    expect(command.isValid(line(text))).toBe(CommandControl.NOT_OK);
  });

  it('claims `A -> B`: ARROW_BODY1 is `[-.]+`, so one dash is an arrow of length 1, as the Java regex reads', () => {
    const diagram = linked('A -> B');

    expect(diagram.getLinks().map(ends)).toEqual([['A', 'B']]);
    expect(diagram.getLinks()[0]!.getLength()).toBe(1);
  });

  it('on a line that does not match it answers the standard parse error', () => {
    const result = command.execute(emptyDiagram(), line('hello'), ParserPass.ONE);

    expect(result.getError()).toBe('Cannot parse line hello');
  });
});

describe('CommandLinkActivity FIRST branches', () => {
  it('STAR is the start leaf, displayed "start"', () => {
    const diagram = linked('(*) --> A');

    expect(names(diagram)).toEqual(['start', 'A']);
    expect(types(diagram)).toEqual([LeafType.CIRCLE_START, LeafType.ACTIVITY]);
    expect(ends(diagram.getLinks()[0]!)).toEqual(['start', 'A']);
  });

  it('(*top) as a source is still the single start leaf', () => {
    const diagram = linked('(*) --> A', '(*top) --> B');

    expect(types(diagram).filter((t) => t === LeafType.CIRCLE_START)).toHaveLength(1);
    expect(diagram.getLinks().map(ends)).toEqual([
      ['start', 'A'],
      ['start', 'B'],
    ]);
  });

  it('CODE names an ACTIVITY leaf displayed as written', () => {
    const diagram = linked('Foo.bar_1 --> B');

    expect(names(diagram)).toEqual(['Foo.bar_1', 'B']);
    expect(leaf(diagram, 'Foo.bar_1').getDisplay().toString()).toBe('[Foo.bar_1]');
  });

  it('CODE reuses the leaf it created before', () => {
    const diagram = linked('A --> B', 'B --> C');

    expect(names(diagram)).toEqual(['A', 'B', 'C']);
    expect(diagram.getLinks().map(ends)).toEqual([
      ['A', 'B'],
      ['B', 'C'],
    ]);
  });

  it('BAR names a SYNCHRO_BAR leaf after the text between the equals signs', () => {
    const diagram = linked('=== Y1 === --> A');

    expect(names(diagram)).toEqual(['Y1', 'A']);
    expect(types(diagram)).toEqual([LeafType.SYNCHRO_BAR, LeafType.ACTIVITY]);
  });

  it('QUOTED without `as` is named and displayed by its text', () => {
    const diagram = linked('"First Activity" --> B');

    expect(names(diagram)).toEqual(['First Activity', 'B']);
    expect(leaf(diagram, 'First Activity').getDisplay().toString()).toBe('[First Activity]');
  });

  it('QUOTED with `as` is named by the code and displays the quoted text', () => {
    const diagram = linked('"A long label" as A1 --> B');

    expect(names(diagram)).toEqual(['A1', 'B']);
    expect(leaf(diagram, 'A1').getDisplay().toString()).toBe('[A long label]');
  });

  it('a quoted source is found again by the code of its `as`', () => {
    const diagram = linked('"A long label" as A1 --> B', 'A1 --> C');

    expect(names(diagram)).toEqual(['A1', 'B', 'C']);
    expect(diagram.getLinks().map(ends)).toEqual([
      ['A1', 'B'],
      ['A1', 'C'],
    ]);
  });
});

describe('CommandLinkActivity FIRST2 branches', () => {
  it('STAR2 is the end leaf, displayed "end"', () => {
    const diagram = linked('A --> (*)');

    expect(names(diagram)).toEqual(['A', 'end']);
    expect(types(diagram)).toEqual([LeafType.ACTIVITY, LeafType.CIRCLE_END]);
    expect(leaf(diagram, 'end').getDisplay().toString()).toBe('[end]');
  });

  it('(*top) and (*N) name distinct end leaves "end$top" and "end$N"', () => {
    const diagram = linked('A --> (*)', 'A --> (*top)', 'A --> (*2)');

    expect(names(diagram)).toEqual(['A', 'end', 'end$top', 'end$2']);
    expect(types(diagram).filter((t) => t === LeafType.CIRCLE_END)).toHaveLength(3);
  });

  it('OPENBRACKET2 opens an INNER_ACTIVITY group and links to it', () => {
    const diagram = linked('(*) --> {');

    expect(diagram.getCurrentGroup().getGroupType()).toBe(GroupType.INNER_ACTIVITY);
    expect(diagram.getLinks()).toHaveLength(1);
    expect(diagram.getLinks()[0]!.getEntity2()).toBe(diagram.getCurrentGroup());
    expect(diagram.getLinks()[0]!.getEntity1().getName()).toBe('start');
  });

  it('CODE2 and BAR2 and QUOTED2 create their leaves', () => {
    const diagram = linked('A --> B', 'A --> ==bar2==', 'A --> "Quoted two" as Q2');

    expect(names(diagram)).toEqual(['A', 'B', 'bar2', 'Q2']);
    expect(types(diagram)).toEqual([LeafType.ACTIVITY, LeafType.ACTIVITY, LeafType.SYNCHRO_BAR, LeafType.ACTIVITY]);
    expect(leaf(diagram, 'Q2').getDisplay().toString()).toBe('[Quoted two]');
  });

  it('QUOTED_INVISIBLE2 takes the whole word run as an ACTIVITY named by itself', () => {
    const diagram = linked('A --> some words');

    expect(names(diagram)).toEqual(['A', 'some words']);
    expect(types(diagram)).toEqual([LeafType.ACTIVITY, LeafType.ACTIVITY]);
  });
});

describe('CommandLinkActivity stereotypes, colours, URL', () => {
  it('sets a stereotype on each end', () => {
    const diagram = linked('A <<one>> --> B <<two>>');

    expect(leaf(diagram, 'A').getStereotype()!.getLabel(GUILLEMET_NONE)).toBe('one');
    expect(leaf(diagram, 'B').getStereotype()!.getLabel(GUILLEMET_NONE)).toBe('two');
  });

  it('sets a background colour on each end, and nothing when there is none', () => {
    const diagram = linked('A #red --> B #LightBlue', 'B --> C');

    const back = (name: string): unknown => leaf(diagram, name).getColors().getColor(ColorType.BACK);
    const redOnly = leaf(linked('A #red --> B'), 'A').getColors().getColor(ColorType.BACK);
    expect(redOnly).toBeDefined();
    expect(back('A')).toEqual(redOnly);
    expect(back('B')).toBeDefined();
    expect(back('B')).not.toEqual(back('A'));
    expect(back('C')).toBeUndefined();
  });

  it('an unknown colour is a bad-colour result', () => {
    const result = command.execute(emptyDiagram(), line('A #nosuchcolourzz --> B'), ParserPass.ONE);

    expect(result.getError()).toBe('No such color');
  });

  it('puts a [[url]] before the arrow on the link', () => {
    const diagram = linked('(*) [[http://example.com]]--> A');

    expect(diagram.getLinks()[0]!.getUrl()!.getUrl()).toBe('http://example.com');
  });
});

describe('CommandLinkActivity arrow', () => {
  const link = (text: string): Link => linked(text).getLinks()[0]!;

  it('a plain arrow has an ARROW head, length 1 and a constraint', () => {
    const l = link('A --> B');

    expect(l.getLength()).toBe(2);
    expect(l.isConstraint()).toBe(true);
    expect(l.getType().toString()).toBe(link('A --> B').getType().toString());
  });

  it('counts the dashes of the arrow into the length, the way manageArrowForCuca does', () => {
    expect(link('A -> B'.replace('->', '-->')).getLength()).toBe(2);
    expect(link('A ---> B').getLength()).toBe(3);
    expect(link('A -down-> B').getLength()).toBe(2);
    expect(link('A -right-> B').getLength()).toBe(1);
  });

  it('a dot anywhere in the body makes the link dotted', () => {
    expect(link('A ..> B').getType().toString()).not.toBe(link('A --> B').getType().toString());
    expect(link('A -.-> B').getType().toString()).toBe(link('A ..> B').getType().toString());
  });

  it('a * direction drops the layout constraint and fixes the length at 2', () => {
    const l = link('A -*-> B');

    expect(l.isConstraint()).toBe(false);
    expect(l.getLength()).toBe(2);
  });

  it('left and up invert the link, down and right do not', () => {
    expect(ends(link('A -left-> B'))).toEqual(['B', 'A']);
    expect(ends(link('A -up-> B'))).toEqual(['B', 'A']);
    expect(ends(link('A -le-> B'))).toEqual(['B', 'A']);
    expect(ends(link('A -down-> B'))).toEqual(['A', 'B']);
    expect(ends(link('A -right-> B'))).toEqual(['A', 'B']);
    expect(ends(link('A -ri-> B'))).toEqual(['A', 'B']);
  });

  it('applies a [style] on either side of the direction', () => {
    expect(link('A -[dashed]-> B').getType().toString()).toBe(link('A -down[dashed]-> B').getType().toString());
    expect(link('A -[dashed]-> B').getType().toString()).not.toBe(link('A --> B').getType().toString());
    expect(link('A -[#red]-> B').getColors().isEmpty()).toBe(false);
    expect(link('A -[#red]-> B').getType().toString()).toBe(link('A --> B').getType().toString());
  });

  it('keeps the bracket text as the link label', () => {
    expect(link('A -->[go on] B').getLabel().toString()).toBe('[go on]');
    expect(link('A --> [go on] B').getLabel().toString()).toBe('[go on]');
    expect(link('A --> B').getLabel().toString()).toBe(link('A --> B').getLabel().toString());
  });
});

describe('CommandLinkActivity in <partition>', () => {
  it('creates the target inside a PACKAGE group named by the partition, then closes the group', () => {
    const diagram = linked('A --> B in P2');

    expect(leaf(diagram, 'B').getParentContainer()!.getName()).toBe('P2');
    expect(leaf(diagram, 'B').getParentContainer()!.getGroupType()).toBe(GroupType.PACKAGE);
    expect(leaf(diagram, 'A').getParentContainer()).toBe(diagram.getRootGroup());
    expect(diagram.getCurrentGroup()).toBe(diagram.getRootGroup());
  });

  it('strips the quotes of a quoted partition name', () => {
    const diagram = linked('A --> B in "my lane"');

    expect(leaf(diagram, 'B').getParentContainer()!.getName()).toBe('my lane');
  });

  it('applies to a QUOTED2 and a QUOTED_INVISIBLE2 target as well', () => {
    const diagram = linked('A --> "Q" as QQ in P3', 'A --> words in P3');

    expect(leaf(diagram, 'QQ').getParentContainer()!.getName()).toBe('P3');
    expect(leaf(diagram, 'words').getParentContainer()!.getName()).toBe('P3');
  });
});

describe('CommandLinkActivity missing source', () => {
  it('links from the last entity consulted, which is the previous target', () => {
    const diagram = linked('(*) --> "First Activity"', '--> "Second Activity"', '--> (*)');

    expect(diagram.getLinks().map(ends)).toEqual([
      ['start', 'First Activity'],
      ['First Activity', 'Second Activity'],
      ['Second Activity', 'end'],
    ]);
  });

  it('with nothing consulted yet the source is missing and the command answers an error', () => {
    const result = command.execute(emptyDiagram(), line('--> B'), ParserPass.ONE);

    expect(result.getError()).toBe('No such activity');
  });

  it('after an inner-activity opening the last entity is the group itself: executeArg sets it after createInnerActivity cleared it', () => {
    const diagram = linked('(*) --> {', '--> B');

    expect(diagram.getLinks()[1]!.getEntity1()).toBe(diagram.getLinks()[0]!.getEntity2());
    expect(diagram.getLinks()[1]!.getEntity2().getName()).toBe('B');
  });
});

describe('CommandLinkActivity consumes the shared sequence like the jar', () => {
  it('(*) --> A takes uid 1 (start), 2 (A), 3 (link): the next automatic branch is #4 (lap-if-nested oracle: .4)', () => {
    const diagram = linked('(*) --> A');

    diagram.startIf(undefined, undefined);

    expect(diagram.getCurrentContext()!.getBranch().getName()).toBe('#4');
  });
});

describe('CommandLinkActivity.explain', () => {
  const explain = (text: string): string | undefined => command.explain(line(text));

  it('describes the endpoints', () => {
    expect(explain('(*) --> A')).toBe("Drawing a link from the start node to 'A'");
    expect(explain('(*top) --> (*3)')).toBe(
      "Drawing a link from the start node (the 'top' flag is currently ignored) to the end node '3'",
    );
    expect(explain('==b== --> {')).toBe(
      "Drawing a link from the synchronization bar 'b' to a new inner activity block",
    );
    expect(explain('"x y" as Z --> "p q"')).toBe('Drawing a link from \'Z\' displayed as "x y" to "p q"');
    expect(explain('--> ==b2==')).toBe("Drawing a link from the last activity to the synchronization bar 'b2'");
    expect(explain('A --> some words')).toBe("Drawing a link from 'A' to 'some words'");
  });

  it('describes the arrow, label, partition, style, URL, stereotypes and colours', () => {
    expect(explain('A <<s1>> #red -[bold]left.-> [lbl] B <<s2>> in "P Q" #blue')).toBe(
      "Drawing a link from 'A' to 'B', placed in the partition 'P Q', labelled \"lbl\", dotted, " +
        "oriented to the left, with style 'bold', setting the stereotype of the source to <<s1>>, " +
        'setting the background color of the source to #red, setting the stereotype of the target to <<s2>>, ' +
        'setting the background color of the target to #blue',
    );
    expect(explain('A [[http://x.org]]-*-> B')).toBe(
      "Drawing a link from 'A' to 'B', without layout constraint, with a URL link",
    );
    expect(explain('A -up-> B')).toBe("Drawing a link from 'A' to 'B', oriented upwards");
    expect(explain('A -r-> B')).toBe("Drawing a link from 'A' to 'B', oriented to the right");
    expect(explain('A -do-> B')).toBe("Drawing a link from 'A' to 'B', oriented downwards");
  });

  it('answers nothing for a line the grammar does not claim', () => {
    expect(explain('hello')).toBeUndefined();
  });
});

describe('CommandLinkActivity against the probe oracles', () => {
  it('lap-end-variants: (*top) is the start as a source, end$top / end$1 / end$2 as targets', () => {
    const diagram = parseOk('(*) --> A', 'A --> (*top)', '(*top) --> B', 'B --> (*1)', 'A --> (*2)');

    expect(diagram.getLinks().map(ends)).toEqual([
      ['start', 'A'],
      ['A', 'end$top'],
      ['start', 'B'],
      ['B', 'end$1'],
      ['A', 'end$2'],
    ]);
  });

  it('lap-sync-bar: bars on both sides, reused by name', () => {
    const diagram = parseOk('(*) --> ===B1===', '--> A', '--> ===B2===', '===B1=== --> B', '--> ===B2===', '--> (*)');

    expect(diagram.getLinks().map(ends)).toEqual([
      ['start', 'B1'],
      ['B1', 'A'],
      ['A', 'B2'],
      ['B1', 'B'],
      ['B', 'B2'],
      ['B2', 'end'],
    ]);
  });

  it('lap-inner-brace: (*) --> { links the start to the group ##2 (start 1, group 2)', () => {
    const diagram = parseOk('(*) --> {');

    expect(diagram.getLinks().map(ends)).toEqual([['start', '##2']]);
  });

  it('lap-colors: quoted names with colours on the second end', () => {
    const diagram = parseOk('(*) --> "red" #red', '"red" --> "blue" #LightBlue', '"blue" --> (*)');

    expect(diagram.getLinks().map(ends)).toEqual([
      ['start', 'red'],
      ['red', 'blue'],
      ['blue', 'end'],
    ]);
  });
});

describe('CommandLinkActivity through the factory', () => {
  it('bokuba-91-poda774: 6 leaves and 5 links in the order of its svek-1.dot', () => {
    const diagram = parseOk(
      '(*) --> VerifyReservation',
      '--> ===Y1===',
      '',
      '--> ===Y2===',
      '',
      '--> GiveTravelDocumentation',
      '--> (*)',
    );

    expect(diagram.leafs().map((e) => e.getLeafType())).toEqual([
      LeafType.CIRCLE_START,
      LeafType.ACTIVITY,
      LeafType.SYNCHRO_BAR,
      LeafType.SYNCHRO_BAR,
      LeafType.ACTIVITY,
      LeafType.CIRCLE_END,
    ]);
    expect(names(diagram)).toEqual(['start', 'VerifyReservation', 'Y1', 'Y2', 'GiveTravelDocumentation', 'end']);
    expect(diagram.getLinks().map(ends)).toEqual([
      ['start', 'VerifyReservation'],
      ['VerifyReservation', 'Y1'],
      ['Y1', 'Y2'],
      ['Y2', 'GiveTravelDocumentation'],
      ['GiveTravelDocumentation', 'end'],
    ]);
  });
});
