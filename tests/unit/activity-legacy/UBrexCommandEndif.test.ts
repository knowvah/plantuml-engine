import { describe, expect, it } from 'vitest';
import { CommandControl } from '../../../src/core/command/CommandControl.js';
import { ParserPass } from '../../../src/core/command/ParserPass.js';
import { parseRefusalOf } from '../../../src/core/parse-refusal.js';
import { StringLocated } from '../../../src/core/tim/StringLocated.js';
import { UBrexCommandEndif } from '../../../src/diagrams/activity-legacy/command/UBrexCommandEndif.js';
import { emptyDiagram, parseLines, parseOk } from './helpers.js';

const command = new UBrexCommandEndif();
const line = (text: string): StringLocated => new StringLocated(text, undefined);
const NO_IF = 'No if for this endif';

describe('UBrexCommandEndif grammar', () => {
  it.each([['endif'], ['end if'], ['end   if'], ['  endif  ']])('claims %j', (text) => {
    expect(command.isValid(line(text))).toBe(CommandControl.OK);
  });

  it.each([['end'], ['endifx'], ['end partition'], ['if'], ['']])('does not claim %j', (text) => {
    expect(command.isValid(line(text))).toBe(CommandControl.NOT_OK);
  });
});

describe('UBrexCommandEndif#executeArg', () => {
  it('closes the open if: the context returns to its parent (none for a top-level if)', () => {
    const diagram = parseOk('(*) --> A', 'if "x" then', '--> B', 'endif');

    expect(diagram.getCurrentContext()).toBeUndefined();
  });

  it('closes only the inner if of a nested pair', () => {
    const diagram = parseOk('(*) --> A', 'if "x" then', 'if "y" then', 'endif');

    expect(diagram.getCurrentContext()!.getBranch().getName()).toBe('#4');
  });

  it('`end if` closes the same way', () => {
    const diagram = parseOk('(*) --> A', 'if "x" then', 'end if');

    expect(diagram.getCurrentContext()).toBeUndefined();
  });

  it('with no activity at all answers "No if for this endif"', () => {
    const result = command.execute(emptyDiagram(), line('endif'), ParserPass.ONE);

    expect(result.getError()).toBe(NO_IF);
  });

  it('with an activity but no open if answers the same error, as an execution refusal', () => {
    const refusal = parseRefusalOf(parseLines('(*) --> A', 'endif'));

    expect(refusal).toMatchObject({ kind: 'execution', message: NO_IF });
  });

  it('a second endif for one if is the same error', () => {
    const refusal = parseRefusalOf(parseLines('(*) --> A', 'if "x" then', 'endif', 'endif'));

    expect(refusal).toMatchObject({ kind: 'execution', message: NO_IF });
  });

  it('explains itself', () => {
    expect(command.explain(line('endif'))).toBe('Closing the enclosing if');
  });
});
