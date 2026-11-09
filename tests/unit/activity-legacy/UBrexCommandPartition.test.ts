import { describe, expect, it } from 'vitest';
import { ColorType } from '../../../src/core/abel/ColorType.js';
import type { Entity } from '../../../src/core/abel/Entity.js';
import { GroupType } from '../../../src/core/abel/GroupType.js';
import { CommandControl } from '../../../src/core/command/CommandControl.js';
import { ParserPass } from '../../../src/core/command/ParserPass.js';
import { parseRefusalOf } from '../../../src/core/parse-refusal.js';
import { GUILLEMET_NONE } from '../../../src/core/stereo/StereotypeDecoration.js';
import { StringLocated } from '../../../src/core/tim/StringLocated.js';
import type { ActivityDiagram } from '../../../src/diagrams/activity-legacy/ActivityDiagram.js';
import { UBrexCommandEndPartition } from '../../../src/diagrams/activity-legacy/command/UBrexCommandEndPartition.js';
import { UBrexCommandPartition } from '../../../src/diagrams/activity-legacy/command/UBrexCommandPartition.js';
import { emptyDiagram, parseLines, parseOk } from './helpers.js';

const partition = new UBrexCommandPartition();
const endPartition = new UBrexCommandEndPartition();
const line = (text: string): StringLocated => new StringLocated(text, undefined);
const group = (diagram: ActivityDiagram, name: string): Entity => diagram.groups().find((g) => g.getName() === name)!;
const backOf = (e: Entity): unknown => e.getColors().getColor(ColorType.BACK);

describe('UBrexCommandPartition grammar', () => {
  it.each([
    ['partition P1'],
    ['partition P1 {'],
    // the name is `〇+〴S`, any non-space run: a lone `{` is a name
    ['partition {'],
    ['partition Conductor {'],
    ['partition Audience #LightSkyBlue {'],
    ['partition "My P" {'],
    ['partition P1 #123456'],
    ['partition P1 <<s>> {'],
    ['partition P1 #red {'],
    ['  partition   P1  '],
  ])('claims %j', (text) => {
    expect(partition.isValid(line(text))).toBe(CommandControl.OK);
  });

  // jar oracle: `partition P1 #red <<s>> {` is "Syntax Error?": no space may stand between the colour and `<<`
  it.each([['partition'], ['partitions P1'], ['partition P1 #red <<s>> {'], ['partition P1 {{']])(
    'does not claim %j',
    (text) => {
      expect(partition.isValid(line(text))).toBe(CommandControl.NOT_OK);
    },
  );
});

describe('UBrexCommandPartition#executeArg (lap-partition)', () => {
  it('lap-partition: two PACKAGE groups, Conductor and Audience (with #LightSkyBlue)', () => {
    const diagram = parseOk(
      'partition Conductor {',
      '(*) --> "Climbs on Platform"',
      '--> === S1 ===',
      '--> "Bows"',
      '}',
      'partition Audience #LightSkyBlue {',
      '=== S1 === --> "Applauds"',
      '}',
    );

    expect(diagram.groups().map((g) => [g.getName(), g.getGroupType()])).toEqual([
      ['Conductor', GroupType.PACKAGE],
      ['Audience', GroupType.PACKAGE],
    ]);
    expect(backOf(group(diagram, 'Audience'))).toBeDefined();
    expect(group(diagram, 'Audience').getColors().isEmpty()).toBe(false);
    expect(group(diagram, 'Conductor').getColors().isEmpty()).toBe(true);
  });

  it('lap-partition: the start leaf lives inside the group that was open (oracle: Conductor.start)', () => {
    const diagram = parseOk('partition Conductor {', '(*) --> "Climbs on Platform"', '}');

    const start = diagram.leafs().find((e) => e.getName() === 'start')!;
    expect(start.getQuark().getParent()!.getName()).toBe('Conductor');
  });

  it('the display of the group is its quark name', () => {
    const diagram = parseOk('partition "My P" {', '}');

    expect(group(diagram, 'My P').getDisplay().toString()).toBe('[My P]');
  });

  it('the stereotype is set on the group; without one it stays unset', () => {
    const diagram = parseOk('partition A <<warn>> {', '}', 'partition B {', '}');

    expect(group(diagram, 'A').getStereotype()!.getLabel(GUILLEMET_NONE)).toBe('warn');
    expect(group(diagram, 'B').getStereotype()).toBeUndefined();
  });

  it('a legacy hex colour is accepted and ignored, as `LEGACYCOLORIGNORED` says', () => {
    const diagram = parseOk('partition P1 #123456', 'end partition');

    expect(group(diagram, 'P1').getColors().isEmpty()).toBe(false);
  });

  it('the same name twice reopens the group instead of creating a second one', () => {
    const diagram = parseOk('partition P {', '(*) --> A', '}', 'partition P {', 'A --> B', '}');

    expect(diagram.groups().map((g) => g.getName())).toEqual(['P']);
  });

  it('a bad colour name is the standard bad-colour result', () => {
    const result = partition.execute(emptyDiagram(), line('partition P #nocolor'), ParserPass.ONE);

    expect(result.isOk()).toBe(false);
  });

  it('explains itself', () => {
    expect(partition.explain(line('partition P1 #red {'))).toBe("Starting the partition 'P1', background color #red");
    expect(partition.explain(line('partition P1 <<s>>'))).toBe("Starting the partition 'P1', stereotype <<s>>");
  });
});

describe('UBrexCommandEndPartition (lap-partition-end)', () => {
  it.each([['}'], ['end partition'], ['endpartition'], ['end   partition'], ['']])('claims %j', (text) => {
    expect(endPartition.isValid(line(text))).toBe(CommandControl.OK);
  });

  it.each([['end'], ['partition'], ['}}'], ['end partition x'], ['end if']])('does not claim %j', (text) => {
    expect(endPartition.isValid(line(text))).toBe(CommandControl.NOT_OK);
  });

  it('lap-partition-end: `partition P1` closed by `end partition`, then A --> B is outside it', () => {
    const diagram = parseOk('partition P1', '(*) --> A', 'end partition', 'A --> B');

    expect(diagram.groups().map((g) => g.getName())).toEqual(['P1']);
    const parentOf = (name: string): string | undefined =>
      diagram
        .leafs()
        .find((e) => e.getName() === name)!
        .getQuark()
        .getParent()
        ?.getName();
    expect([parentOf('start'), parentOf('A'), parentOf('B')]).toEqual(['P1', 'P1', '']); // '' is the root quark
  });

  it('`}` closes the open partition', () => {
    const diagram = parseOk('partition P1 {', '(*) --> A', '}', 'A --> B');

    expect(diagram.getCurrentGroup().getName()).not.toBe('P1');
  });

  it('one `}` more than the open partitions pops the root and is still ok (jar oracle: drawn as ACTIVITY)', () => {
    const diagram = parseOk('partition P1 {', '(*) --> A', '}', '}');

    expect(diagram.groups().map((g) => g.getName())).toEqual(['P1']);
  });

  it('two `}` with no partition: the second is "No partition defined" (jar oracle: line 4, activity)', () => {
    const refusal = parseRefusalOf(parseLines('(*) --> A', '}', '}'));

    expect(refusal).toMatchObject({ kind: 'execution', message: 'No partition defined' });
  });

  it('a link after the root was popped crashes in getCurrentGroup (jar oracle: IllegalStateException)', () => {
    expect(() => parseLines('(*) --> A', '}', '--> B')).toThrow('IllegalStateException');
  });

  it('explains itself', () => {
    expect(endPartition.explain(line('}'))).toBe('Closing the current partition');
  });
});
