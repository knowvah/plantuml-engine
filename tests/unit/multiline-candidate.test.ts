import { describe, expect, it } from 'vitest';
import { CommandControl } from '../../src/core/command/CommandControl.js';
import { CommandExecutionResult } from '../../src/core/command/CommandExecutionResult.js';
import type { HasNbMaxLines, MultilineCommand } from '../../src/core/command/CommandMultilines2.js';
import { isMultilineCommandOk } from '../../src/core/command/multiline-candidate.js';
import { StringLocated } from '../../src/core/tim/StringLocated.js';
import type { BlocLines } from '../../src/core/utils/BlocLines.js';

/** A block opened by `<` and closed by a `>` line, with an optional cap of partial answers. */
class Brackets implements MultilineCommand<null>, HasNbMaxLines {
  constructor(private readonly max: number) {}
  getNbMaxLines(): number {
    return this.max;
  }
  isValid(lines: BlocLines): CommandControl {
    const last = lines.getLast().getString();
    if (lines.size() === 1) return last === '<' ? CommandControl.OK_PARTIAL : CommandControl.NOT_OK;
    if (last === '!') return CommandControl.NOT_OK;
    return last === '>' ? CommandControl.OK : CommandControl.OK_PARTIAL;
  }
  execute(): CommandExecutionResult {
    return CommandExecutionResult.ok();
  }
  isEligibleFor(): boolean {
    return true;
  }
}

/** A command with no cap: it does not carry `getNbMaxLines`. */
class Uncapped extends Brackets {
  constructor() {
    super(0);
  }
}
Object.defineProperty(Uncapped.prototype, 'getNbMaxLines', { value: undefined });

const run = (cmd: MultilineCommand<null>, ...texts: string[]): { lines: string[]; nextIndex: number } | undefined => {
  const located = texts.map((t) => new StringLocated(t, undefined));
  const step = isMultilineCommandOk((i) => located[i]!, located.length, 0, cmd);
  return step === undefined ? undefined : { lines: [...step.lines.asList()], nextIndex: step.nextIndex };
};

describe('isMultilineCommandOk', () => {
  it('returns the block up to the line that makes the command OK, and the index after it', () => {
    expect(run(new Brackets(9), '<', 'a', 'b', '>', 'after')).toEqual({ lines: ['<', 'a', 'b', '>'], nextIndex: 4 });
  });

  it('is undefined when the command answers NOT_OK on a later line', () => {
    expect(run(new Brackets(9), '<', 'a', '!', '>')).toBeUndefined();
  });

  it('is undefined when the lines run out before the block closes', () => {
    expect(run(new Brackets(9), '<', 'a', 'b')).toBeUndefined();
  });

  it('gives up after getNbMaxLines partial answers (CommandDecoratorMultine)', () => {
    expect(run(new Brackets(1), '<', 'a', '>')).toBeUndefined();
    expect(run(new Brackets(2), '<', 'a', '>')).toEqual({ lines: ['<', 'a', '>'], nextIndex: 3 });
  });

  it('a command with no cap reads on without limit', () => {
    expect(run(new Uncapped(), '<', 'a', 'b', 'c', 'd', '>')?.nextIndex).toBe(6);
  });

  it('an embedded diagram counts as one line, nesting included', () => {
    // `{{` .. `}}` holds a `>` that must not close the block
    expect(run(new Brackets(9), '<', '{{', '>', '{{', '}}', '}}', '>')).toEqual({
      lines: ['<', '{{', '>', '{{', '}}', '}}', '>'],
      nextIndex: 7,
    });
  });

  it('an unterminated embedded diagram takes the rest of the source', () => {
    expect(run(new Brackets(9), '<', '{{', 'x')).toBeUndefined();
  });
});
