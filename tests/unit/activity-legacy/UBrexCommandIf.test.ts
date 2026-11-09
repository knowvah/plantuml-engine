import { describe, expect, it } from 'vitest';
import type { Entity } from '../../../src/core/abel/Entity.js';
import { LeafType } from '../../../src/core/abel/LeafType.js';
import type { Link } from '../../../src/core/abel/Link.js';
import { CommandControl } from '../../../src/core/command/CommandControl.js';
import { ParserPass } from '../../../src/core/command/ParserPass.js';
import { StringLocated } from '../../../src/core/tim/StringLocated.js';
import type { ActivityDiagram } from '../../../src/diagrams/activity-legacy/ActivityDiagram.js';
import { UBrexCommandIf } from '../../../src/diagrams/activity-legacy/command/UBrexCommandIf.js';
import { emptyDiagram, parseOk } from './helpers.js';

const command = new UBrexCommandIf();
const line = (text: string): StringLocated => new StringLocated(text, undefined);
const leaf = (diagram: ActivityDiagram, name: string): Entity => diagram.leafs().find((e) => e.getName() === name)!;
const branches = (diagram: ActivityDiagram): Entity[] =>
  diagram.leafs().filter((e) => e.getLeafType() === LeafType.BRANCH);
const ends = (link: Link): [string, string] => [link.getEntity1().getName(), link.getEntity2().getName()];

describe('UBrexCommandIf grammar', () => {
  it.each([
    ['if "ok?" then'],
    ['if "ok?"'],
    ['if cond then'],
    ['if cond'],
    ['if "test" as T1 then'],
    ['--> if "x" then'],
    ['-->[label] if "x" then'],
    ['-[#red]-> if "x" then'],
    ['-left-> if "x" then'],
    ['-*-> if "x" then'],
    ['(*) --> if "x" then'],
    ['(*top) --> if "x" then'],
    ['A --> if "x" then'],
    ['"a b" --> if "x" then'],
    ['"a b" as AB --> if "x" then'],
    ['===S1=== --> if "x" then'],
    ['  if "x" then  '],
  ])('claims %j', (text) => {
    expect(command.isValid(line(text))).toBe(CommandControl.OK);
  });

  // `if "test" as T1` with no `then`: the third alternative wants a space after the code, and `isValid` trims it
  // away (jar oracle: Syntax Error? on that line).
  it.each([['iffy'], ['if'], ['A --> B'], ['endif'], ['else'], ['(*) --> A'], [''], ['if "test" as T1']])(
    'does not claim %j',
    (text) => {
      expect(command.isValid(line(text))).toBe(CommandControl.NOT_OK);
    },
  );
});

describe('UBrexCommandIf#executeArg (lap-if-else, lap-if-as)', () => {
  it('lap-if-else: one BRANCH leaf named by the automatic id #4, both branches leave it', () => {
    const diagram = parseOk(
      '(*) --> "check"',
      'if "ok?" then',
      '  -->[true] "yes"',
      '  --> (*)',
      'else',
      '  -->[false] "no"',
      '  --> (*)',
      'endif',
    );

    expect(branches(diagram).map((b) => b.getName())).toEqual(['#4']);
    const branch = leaf(diagram, '#4');
    // oracle: ent0005 is the diamond, leaving to ent0007 (yes) and ent0011 (no); ent0009 is the shared end
    expect(branch.getUid()).toBe('ent0005');
    expect(leaf(diagram, 'yes').getUid()).toBe('ent0007');
    expect(leaf(diagram, 'end').getUid()).toBe('ent0009');
    expect(leaf(diagram, 'no').getUid()).toBe('ent0011');
    expect(diagram.getLinks().map(ends)).toEqual([
      ['start', 'check'],
      ['check', '#4'],
      ['#4', 'yes'],
      ['yes', 'end'],
      ['#4', 'no'],
      ['no', 'end'],
    ]);
  });

  it('lap-if-else: the condition is the link quantifier, [true] and [false] are the link labels', () => {
    const diagram = parseOk(
      '(*) --> "check"',
      'if "ok?" then',
      '  -->[true] "yes"',
      '  --> (*)',
      'else',
      '  -->[false] "no"',
      '  --> (*)',
      'endif',
    );

    const links = diagram.getLinks();
    expect(links[1]!.getQuantifier2()).toBe('ok?');
    expect(links[2]!.getLabel().toString()).toBe('[true]');
    expect(links[4]!.getLabel().toString()).toBe('[false]');
    expect(links[0]!.getQuantifier2()).toBeUndefined();
  });

  it('lap-if-as: `if "test" as T1 then` names the BRANCH T1, so `T1 --> C` leaves it', () => {
    const diagram = parseOk('(*) --> if "test" as T1 then', '  --> A', 'else', '  --> B', 'endif', 'T1 --> C');

    expect(branches(diagram).map((b) => b.getName())).toEqual(['T1']);
    // oracle: ent0002 is the diamond, with three links leaving it (A, B, C)
    expect(leaf(diagram, 'T1').getUid()).toBe('ent0002');
    expect(diagram.getLinks().map(ends)).toEqual([
      ['start', 'T1'],
      ['T1', 'A'],
      ['T1', 'B'],
      ['T1', 'C'],
    ]);
    expect(diagram.getLinks()[0]!.getQuantifier2()).toBe('test');
  });

  it('lap-if-nested: the second automatic branch is #9, after the uids of B, its links and the first if', () => {
    const diagram = parseOk(
      '(*) --> A',
      'if "x" then',
      '  --> B',
      '  if "y" then',
      '    --> C',
      '  else',
      '    --> D',
      '  endif',
      'else',
      '  --> E',
      'endif',
      '--> (*)',
    );

    expect(branches(diagram).map((b) => b.getName())).toEqual(['#4', '#9']);
    // oracle: ent0005 and ent0010
    expect(leaf(diagram, '#4').getUid()).toBe('ent0005');
    expect(leaf(diagram, '#9').getUid()).toBe('ent0010');
    expect(leaf(diagram, 'end').getUid()).toBe('ent0018');
    expect(diagram.getLinks().map(ends)).toEqual([
      ['start', 'A'],
      ['A', '#4'],
      ['#4', 'B'],
      ['B', '#9'],
      ['#9', 'C'],
      ['#9', 'D'],
      ['#4', 'E'],
      ['E', 'end'],
    ]);
  });

  it('an if without a source leaves the last activity, and opens a context', () => {
    const diagram = parseOk('(*) --> A', 'if "x" then');

    expect(diagram.getLinks().map(ends)).toEqual([
      ['start', 'A'],
      ['A', '#4'],
    ]);
    expect(diagram.getCurrentContext()!.getBranch().getName()).toBe('#4');
  });

  it('with no activity before it, an unnamed source is the last entity: none, so the jar refuses', () => {
    const result = command.execute(emptyDiagram(), line('if "x" then'), ParserPass.ONE);

    expect(result.isOk()).toBe(false);
    expect(result.getError()).toBe('No if possible at this point');
  });

  it.each([
    ['(*) --> if "x" then', 'start'],
    ['A --> if "x" then', 'A'],
    ['"a b" --> if "x" then', 'a b'],
    ['"a b" as AB --> if "x" then', 'AB'],
    // the UBrex BAR capture is the whole `===S1===`, so it is not the entity `S1` the regex link names (jar oracle:
    // `(*) --> ===S1===` then `===S1=== --> if` gives two bar entities, ent0002 and ent0004)
    ['===S1=== --> if "x" then', '===S1==='],
  ])('source %j links from %s', (text, source) => {
    const diagram = emptyDiagram();
    expect(command.execute(diagram, line(text), ParserPass.ONE).isOk()).toBe(true);

    expect(diagram.getLinks().map(ends)).toEqual([[source, '#2']]);
  });

  it('the arrow decides the length: `-->` is 2, `---->` is 4, `->` is 1; no arrow is 2', () => {
    const lengthOf = (text: string): number => {
      const diagram = parseOk('(*) --> A');
      command.execute(diagram, line(text), ParserPass.ONE);
      return diagram.getLinks()[1]!.getLength();
    };

    expect([lengthOf('if "x"'), lengthOf('-> if "x"'), lengthOf('--> if "x"'), lengthOf('----> if "x"')]).toEqual([
      2, 1, 2, 4,
    ]);
  });

  it('the bracket is the link label and the arrow style reaches the link', () => {
    const diagram = parseOk('(*) --> A', '-[#red]->[why] if "x" then');

    const link = diagram.getLinks()[1]!;
    expect(link.getLabel().toString()).toBe('[why]');
    expect(link.getColors().isEmpty()).toBe(false);
  });

  it('an arrow pointing left or up is not inverted: the grammar has no ARROW key (java:196-201 is dead)', () => {
    const diagram = parseOk('(*) --> A', '-left-> if "x" then', '-up-> if "y" then');

    expect(diagram.getLinks().map(ends)).toEqual([
      ['start', 'A'],
      ['A', '#4'],
      ['#4', '#7'],
    ]);
  });

  it('a bare-word condition (IF2) is the quantifier, with no code; the lazy capture keeps the space before `then`', () => {
    const diagram = parseOk('(*) --> A', 'if cond then');

    // `〶$IF2=〇l+〴.` is lazy up to `then`: the space stays in the capture (the jar draws "cond" at the same
    // textLength as `if "cond"`, so the drawing trims it)
    expect(diagram.getLinks()[1]!.getQuantifier2()).toBe('cond ');
    expect(branches(diagram).map((b) => b.getName())).toEqual(['#4']);
  });
});

describe('UBrexCommandIf#explainArg', () => {
  const explain = (text: string): string | undefined => command.explain(line(text));

  it('describes the test, the source, and the arrow', () => {
    expect(explain('if "ok?" then')).toBe('Starting an \'if\', testing "ok?", linked from the last activity');
    expect(explain('(*) -[#red]left->[go] if "ok?" as C1 then')).toBe(
      'Starting an \'if\', testing "ok?" (code \'C1\'), linked from the start node, arrow labelled "go", ' +
        "oriented to the left, with style '#red'",
    );
    expect(explain('A --> if cond')).toBe("Starting an 'if', testing \"cond\", linked from 'A'");
    expect(explain('"a b" as AB --> if "x"')).toBe(
      'Starting an \'if\', testing "x", linked from \'AB\' displayed as "a b"',
    );
    expect(explain('===S1=== --> if "x"')).toBe(
      "Starting an 'if', testing \"x\", linked from the synchronization bar '===S1==='",
    );
  });

  it('answers nothing for a line that is no if', () => {
    expect(explain('hello')).toBeUndefined();
  });
});
