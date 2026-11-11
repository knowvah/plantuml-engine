/**
 * `UBrexCommandMultilines2`: `CommandMultilines2` with its start and end patterns as `UnicodeBracketedExpression`s.
 * `isValid` answers `OK_PARTIAL` while the block is open, `OK` (through `finalVerification`) when the last line
 * matches the end pattern exactly, and `NOT_OK` when the first line misses the start pattern.
 *
 * Adaptations, as `CommandMultilines2.ts` documents them: `S extends Diagram` is an unconstrained `S`; `@Explain` and
 * the `TeaVM.a()` assertion are dropped; `getPatternEndToto` (an empty `final` method upstream) is not ported; Java's
 * `final` methods (`isValid`, `explain`, `execute`) must not be overridden.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/UBrexCommandMultilines2.java:48-152
 */
import { NoSuchColorException } from '../klimt/color/NoSuchColorException.js';
import type { Lazy } from '../Lazy.js';
import type { UnicodeBracketedExpression } from '../ubrex/UnicodeBracketedExpression.js';
import { BlocLines } from '../utils/BlocLines.js';
import { CommandControl } from './CommandControl.js';
import { CommandExecutionResult } from './CommandExecutionResult.js';
import type { MultilineCommand } from './CommandMultilines2.js';
import type { MultilinesStrategy } from './MultilinesStrategy.js';
import { ParserPass } from './ParserPass.js';
import { type Trim, trimWith } from './Trim.js';

export abstract class UBrexCommandMultilines2<S> implements MultilineCommand<S> {
  private readonly starting: UnicodeBracketedExpression;
  private readonly trimEnd: Trim;
  private readonly strategy: MultilinesStrategy;
  private readonly end: Lazy<UnicodeBracketedExpression>;

  /** @see UBrexCommandMultilines2.java:58-67 */
  constructor(
    patternStart: UnicodeBracketedExpression,
    strategy: MultilinesStrategy,
    trimEnd: Trim,
    end: Lazy<UnicodeBracketedExpression>,
  ) {
    this.strategy = strategy;
    this.starting = patternStart;
    this.trimEnd = trimEnd;
    this.end = end;
  }

  /** @see UBrexCommandMultilines2.java:69-71 */
  syntaxWithFinalBracket(): boolean {
    return false;
  }

  /** `Command#isCommandForbidden` (interface default). */
  isCommandForbidden(_lines: BlocLines): boolean {
    return false;
  }

  /** `final` upstream. @see UBrexCommandMultilines2.java:77-107 */
  isValid(linesIn: BlocLines): CommandControl {
    let lines = linesIn.cleanList(this.strategy);
    if (this.isCommandForbidden(lines)) return CommandControl.NOT_OK;

    if (this.syntaxWithFinalBracket()) {
      if (lines.size() === 1 && !lines.getAt(0).getTrimmed().getString().endsWith('{')) {
        const vline = lines.getAt(0).getString() + ' {';
        if (this.isValid(BlocLines.singleString(vline)) === CommandControl.OK_PARTIAL) return CommandControl.OK_PARTIAL;

        return CommandControl.NOT_OK;
      }
      lines = lines.eventuallyMoveBracket();
    }
    const first = lines.getFirst();
    if (first === undefined) return CommandControl.NOT_OK;

    const result1 = this.starting.match(first.getTrimmed().getString(), 0);
    if (!result1.exactMatch()) return CommandControl.NOT_OK;

    if (lines.size() === 1) return CommandControl.OK_PARTIAL;
    const m1 = this.end.get().match(trimWith(this.trimEnd, lines.getLast()), 0);
    if (!m1.exactMatch()) return CommandControl.OK_PARTIAL;

    return this.finalVerification(lines);
  }

  /** `final` upstream; the `Explain` text. @see UBrexCommandMultilines2.java:108-116 */
  explain(linesIn: BlocLines): string {
    let lines = linesIn.cleanList(this.strategy);
    if (this.syntaxWithFinalBracket()) lines = lines.eventuallyMoveBracket();

    return this.explainNow(lines);
  }

  /** @see UBrexCommandMultilines2.java:118 */
  protected abstract explainNow(lines: BlocLines): string;

  /** `final` upstream. @see UBrexCommandMultilines2.java:120-130 */
  execute(system: S, linesIn: BlocLines, currentPass: ParserPass): CommandExecutionResult {
    let lines = linesIn.cleanList(this.strategy);
    if (this.syntaxWithFinalBracket()) lines = lines.eventuallyMoveBracket();

    try {
      return this.executeNow(system, lines, currentPass);
    } catch (e) {
      if (e instanceof NoSuchColorException) return CommandExecutionResult.badColor();
      throw e;
    }
  }

  /** May throw {@link NoSuchColorException} (checked upstream). @see UBrexCommandMultilines2.java:132-133 */
  protected abstract executeNow(system: S, lines: BlocLines, currentPass: ParserPass): CommandExecutionResult;

  /** @see UBrexCommandMultilines2.java:135-137 */
  protected finalVerification(_lines: BlocLines): CommandControl {
    return CommandControl.OK;
  }

  /** @see UBrexCommandMultilines2.java:139-141 */
  protected getStartingPattern(): UnicodeBracketedExpression {
    return this.starting;
  }

  /** @see UBrexCommandMultilines2.java:143-146 */
  isEligibleFor(pass: ParserPass): boolean {
    return pass === ParserPass.ONE;
  }

  /** @see UBrexCommandMultilines2.java:148-150 */
  getEndPattern(): UnicodeBracketedExpression {
    return this.end.get();
  }
}
