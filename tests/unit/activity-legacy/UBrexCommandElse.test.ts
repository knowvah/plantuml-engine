import { describe, expect, it } from 'vitest';
import { CommandControl } from '../../../src/core/command/CommandControl.js';
import { ParserPass } from '../../../src/core/command/ParserPass.js';
import { parseRefusalOf } from '../../../src/core/parse-refusal.js';
import { StringLocated } from '../../../src/core/tim/StringLocated.js';
import { UBrexCommandElse } from '../../../src/diagrams/activity-legacy/command/UBrexCommandElse.js';
import { emptyDiagram, parseLines, parseOk } from './helpers.js';

const command = new UBrexCommandElse();
const line = (text: string): StringLocated => new StringLocated(text, undefined);
const NO_IF = 'No if for this else';

describe('UBrexCommandElse grammar', () => {
  it.each([['else'], ['  else  ']])('claims %j', (text) => {
    expect(command.isValid(line(text))).toBe(CommandControl.OK);
  });

  it.each([['elsewhere'], ['else if'], ['els'], ['']])('does not claim %j', (text) => {
    expect(command.isValid(line(text))).toBe(CommandControl.NOT_OK);
  });
});

describe('UBrexCommandElse#executeArg', () => {
  it('makes the open if its branch the last entity again, so the next link leaves the diamond', () => {
    const diagram = parseOk('(*) --> A', 'if "x" then', '--> B', 'else');

    expect(diagram.getLastEntityConsulted()!.getName()).toBe('#4');
    expect(diagram.getCurrentContext()!.getBranch().getName()).toBe('#4');
  });

  it('with no activity at all answers "No if for this else" (the jar prints it after the sequence error)', () => {
    const result = command.execute(emptyDiagram(), line('else'), ParserPass.ONE);

    expect(result.isOk()).toBe(false);
    expect(result.getError()).toBe(NO_IF);
  });

  it('with an activity but no open if answers the same error (jar oracle: "No if for this else", activity)', () => {
    const refusal = parseRefusalOf(parseLines('(*) --> A', 'else'));

    expect(refusal).toMatchObject({ kind: 'execution', message: NO_IF });
  });

  it('after the if is closed the context is gone again: the else is an error', () => {
    const refusal = parseRefusalOf(parseLines('(*) --> A', 'if "x" then', '--> B', 'endif', 'else'));

    expect(refusal).toMatchObject({ kind: 'execution', message: NO_IF });
  });

  it('explains itself', () => {
    expect(command.explain(line('else'))).toBe("Starting the 'else' branch of the enclosing if");
    expect(command.explain(line('other'))).toBeUndefined();
  });
});
