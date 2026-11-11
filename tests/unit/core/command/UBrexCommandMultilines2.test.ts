import { describe, expect, it } from 'vitest';
import { CommandControl } from '../../../../src/core/command/CommandControl.js';
import { CommandExecutionResult } from '../../../../src/core/command/CommandExecutionResult.js';
import { MultilinesStrategy } from '../../../../src/core/command/MultilinesStrategy.js';
import { ParserPass } from '../../../../src/core/command/ParserPass.js';
import { Trim } from '../../../../src/core/command/Trim.js';
import { UBrexCommandMultilines2 } from '../../../../src/core/command/UBrexCommandMultilines2.js';
import { NoSuchColorException } from '../../../../src/core/klimt/color/NoSuchColorException.js';
import { Lazy } from '../../../../src/core/Lazy.js';
import { UBrexConcat } from '../../../../src/core/ubrex/builder/UBrexConcat.js';
import { UBrexLeaf } from '../../../../src/core/ubrex/builder/UBrexLeaf.js';
import { UBrexNamed } from '../../../../src/core/ubrex/builder/UBrexNamed.js';
import type { UnicodeBracketedExpression } from '../../../../src/core/ubrex/UnicodeBracketedExpression.js';
import { BlocLines } from '../../../../src/core/utils/BlocLines.js';

// UBrexCommandEbnfMultilines.java:55-71: the start and end patterns the EBNF multi-line rule uses.
const END = new Lazy<UnicodeBracketedExpression>(() => new UBrexLeaf('〇+〘 〄>; 〙'));
function start(): UnicodeBracketedExpression {
  return new UBrexNamed(
    'LINE',
    UBrexConcat.build(
      new UBrexLeaf('「〴an_」'),
      new UBrexLeaf('〇*「〴an_-」'),
      UBrexLeaf.spaceZeroOrMore(),
      new UBrexLeaf('='),
      new UBrexLeaf('〇*〴.'),
    ),
  );
}

interface Sink {
  seen: string[][];
}

class Rule extends UBrexCommandMultilines2<Sink> {
  bracket = false;
  forbidden = false;
  throwColor = false;
  throwOther = false;
  constructor() {
    super(start(), MultilinesStrategy.KEEP_STARTING_QUOTE, Trim.BOTH, END);
  }
  override syntaxWithFinalBracket(): boolean {
    return this.bracket;
  }
  override isCommandForbidden(): boolean {
    return this.forbidden;
  }
  protected explainNow(lines: BlocLines): string {
    return `Declaring an EBNF rule with ${lines.size()} lines`;
  }
  protected executeNow(system: Sink, lines: BlocLines): CommandExecutionResult {
    if (this.throwColor) throw new NoSuchColorException();
    if (this.throwOther) throw new Error('other');
    system.seen.push([...lines.asList()]);
    return CommandExecutionResult.ok();
  }
  start(): UnicodeBracketedExpression {
    return this.getStartingPattern();
  }
}

const lines = (...l: string[]): BlocLines => BlocLines.fromArray(l);

describe('UBrexCommandMultilines2 (UBrexCommandMultilines2.java:48-152)', () => {
  it('answers OK_PARTIAL while open, OK on the end line, NOT_OK on a bad start', () => {
    const cmd = new Rule();
    expect(cmd.isValid(lines('rule ='))).toBe(CommandControl.OK_PARTIAL);
    expect(cmd.isValid(lines('rule =', '  "a",'))).toBe(CommandControl.OK_PARTIAL);
    expect(cmd.isValid(lines('rule =', '  "a";'))).toBe(CommandControl.OK);
    expect(cmd.isValid(lines('= x;'))).toBe(CommandControl.NOT_OK);
    expect(cmd.isValid(BlocLines.create())).toBe(CommandControl.NOT_OK);
  });

  it('isCommandForbidden refuses before matching', () => {
    const cmd = new Rule();
    cmd.forbidden = true;
    expect(cmd.isValid(lines('rule =', '"a";'))).toBe(CommandControl.NOT_OK);
  });

  it('execute calls executeNow once with the block, and explain counts its lines', () => {
    const cmd = new Rule();
    const sink: Sink = { seen: [] };
    expect(cmd.execute(sink, lines('rule =', '  "a";'), ParserPass.ONE)).toEqual(CommandExecutionResult.ok());
    expect(sink.seen).toEqual([['rule =', '  "a";']]);
    expect(cmd.explain(lines('rule =', '"a";'))).toBe('Declaring an EBNF rule with 2 lines');
  });

  it('a NoSuchColorException from executeNow is badColor; others propagate', () => {
    const cmd = new Rule();
    cmd.throwColor = true;
    expect(cmd.execute({ seen: [] }, lines('a =', 'b;'), ParserPass.ONE)).toEqual(CommandExecutionResult.badColor());
    cmd.throwColor = false;
    cmd.throwOther = true;
    expect(() => cmd.execute({ seen: [] }, lines('a =', 'b;'), ParserPass.ONE)).toThrow('other');
  });

  it('the final-bracket branch rejoins a lone line with " {" and moves a bracket line', () => {
    const cmd = new Rule();
    cmd.bracket = true;
    // "rule = {" still starts a rule (〇*〴. accepts anything after "="), so the probe answers OK_PARTIAL.
    expect(cmd.isValid(lines('rule ='))).toBe(CommandControl.OK_PARTIAL);
    expect(cmd.isValid(lines('= x'))).toBe(CommandControl.NOT_OK);
    expect(cmd.isValid(lines('rule =', '{', '"a";'))).toBe(CommandControl.OK);
    const sink: Sink = { seen: [] };
    cmd.execute(sink, lines('rule =', '{', 'x;'), ParserPass.ONE);
    expect(sink.seen).toEqual([['rule = {', 'x;']]);
    expect(cmd.explain(lines('rule =', '{', 'x;'))).toBe('Declaring an EBNF rule with 2 lines');
  });

  it('is eligible for pass ONE only and exposes its patterns', () => {
    const cmd = new Rule();
    expect(cmd.isEligibleFor(ParserPass.ONE)).toBe(true);
    expect(cmd.isEligibleFor(ParserPass.TWO)).toBe(false);
    expect(cmd.getEndPattern().match('x;', 0).exactMatch()).toBe(true);
    expect(cmd.start().match('a = b', 0).exactMatch()).toBe(true);
  });
});

class Plain extends UBrexCommandMultilines2<Sink> {
  constructor() {
    super(start(), MultilinesStrategy.KEEP_STARTING_QUOTE, Trim.BOTH, END);
  }
  protected explainNow(): string {
    return '';
  }
  protected executeNow(): CommandExecutionResult {
    return CommandExecutionResult.ok();
  }
}

describe('UBrexCommandMultilines2 defaults', () => {
  it('has no final bracket and forbids nothing', () => {
    const cmd = new Plain();
    expect(cmd.syntaxWithFinalBracket()).toBe(false);
    expect(cmd.isCommandForbidden(lines('a ='))).toBe(false);
    expect(cmd.isValid(lines('a =', 'b;'))).toBe(CommandControl.OK);
  });
});
