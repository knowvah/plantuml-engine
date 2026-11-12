import { describe, expect, it } from 'vitest';
import { LeafType } from '../../../src/core/abel/LeafType.js';
import { ParserPass } from '../../../src/core/command/ParserPass.js';
import { StringLocated } from '../../../src/core/tim/StringLocated.js';
import { CommandCreateEntity } from '../../../src/diagrams/cheneer/command/CommandCreateEntity.js';
import { parseOk } from './helpers.js';

/**
 * `CommandCreateEntityTest.java`, case for case. The Java `command.execute(diagram, BlocLines.singleString(s),
 * ParserPass.ONE)` is `execute(diagram, new StringLocated(s, undefined), ParserPass.ONE)` here
 * (`SingleLineCommand2.ts`: `BlocLines` is the one `StringLocated`).
 */
describe('CommandCreateEntity', () => {
  const command = new CommandCreateEntity();
  const regex = CommandCreateEntity.getRegexConcat();

  function execute(diagram: ReturnType<typeof parseOk>, line: string) {
    return command.execute(diagram, new StringLocated(line, undefined), ParserPass.ONE);
  }

  it('test_parseEntity', () => {
    const matcher = regex.matcher('entity Bus_123 {');

    expect(matcher).toBeDefined();
    expect(matcher!.get('TYPE', 0)).toBe('entity');
    expect(matcher!.get('DISPLAY', 0)).toBeUndefined();
    expect(matcher!.get('CODE', 0)).toBe('Bus_123');
    expect(matcher!.get('STEREO', 0)).toBeUndefined();
  });

  it('test_parseRelationship', () => {
    const matcher = regex.matcher('relationship Drives {');

    expect(matcher).toBeDefined();
    expect(matcher!.get('TYPE', 0)).toBe('relationship');
    expect(matcher!.get('DISPLAY', 0)).toBeUndefined();
    expect(matcher!.get('CODE', 0)).toBe('Drives');
    expect(matcher!.get('STEREO', 0)).toBeUndefined();
  });

  it('test_parseInvalid', () => {
    expect(regex.matcher('class MyClass {')).toBeUndefined();
  });

  it('test_parseEntityWithStereo', () => {
    const matcher = regex.matcher('entity Bus_123 <<red>> {');

    expect(matcher).toBeDefined();
    expect(matcher!.get('TYPE', 0)).toBe('entity');
    expect(matcher!.get('DISPLAY', 0)).toBeUndefined();
    expect(matcher!.get('CODE', 0)).toBe('Bus_123');
    expect(matcher!.get('STEREO', 0)).toBe('<<red>>');
  });

  it('test_parseEntityWithDisplayName', () => {
    const matcher = regex.matcher('entity "Red Bus :)" as Bus_123 <<red>> {');

    expect(matcher).toBeDefined();
    expect(matcher!.get('TYPE', 0)).toBe('entity');
    expect(matcher!.get('DISPLAY', 0)).toBe('Red Bus :)');
    expect(matcher!.get('CODE', 0)).toBe('Bus_123');
    expect(matcher!.get('STEREO', 0)).toBe('<<red>>');
  });

  it('test_executeWithEntity', () => {
    const diagram = parseOk();
    const result = execute(diagram, 'entity "display" as code <<stereo>> {');

    expect(result.isOk()).toBe(true);

    const entity = diagram.quarkInContext(true, 'code').getData();
    expect(entity).toBeDefined();
    expect(entity!.getLeafType()).toBe(LeafType.CHEN_ENTITY);
    expect(entity!.getDisplay().toString()).toBe('[display]');
    expect(entity!.getStereotype()!.toString()).toBe('<<stereo>>');

    expect(diagram.peekOwner()).toBe(entity);
  });

  it('test_executeWithRelationship', () => {
    const diagram = parseOk();
    const result = execute(diagram, 'relationship "display" as code <<stereo>> {');

    expect(result.isOk()).toBe(true);

    const entity = diagram.quarkInContext(true, 'code').getData();
    expect(entity).toBeDefined();
    expect(entity!.getLeafType()).toBe(LeafType.CHEN_RELATIONSHIP);
    expect(entity!.getDisplay().toString()).toBe('[display]');
    expect(entity!.getStereotype()!.toString()).toBe('<<stereo>>');

    expect(diagram.peekOwner()).toBe(entity);
  });

  it('test_executeWithEntityWhenAlreadyExists', () => {
    const diagram = parseOk();
    execute(diagram, 'entity "display" as code <<stereo>> {');

    const result = execute(diagram, 'entity "display" as code <<stereo>> {');

    expect(result.isOk()).toBe(true);
    expect(diagram.leafs()).toHaveLength(1);
  });
});
