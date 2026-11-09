/**
 * `CommandMultilines2`: a command spanning several lines: a start pattern on the first line (`RegexConcat`), an
 * end pattern on the last (`Pattern2`), and the lines between kept verbatim. `isValid` answers `OK_PARTIAL` while
 * the block is open, `OK` when the last line matches the end pattern and `NOT_OK` when the first does not match;
 * the dispatcher (`multiline-candidate.ts`, upstream's `PSystemCommandFactory#isMultilineCommandOk`) feeds it one
 * more line per round.
 *
 * Adaptations: `S extends Diagram` is an unconstrained `S`; the end `Pattern2` is a `RegExp` compiled by
 * `Pattern2.compileInternal` (its source carries its own `^`/`$`, so `find` equals `matches`); `@Explain` and the
 * `TeaVM.a()` assertions are dropped; `getPatternEndToto` (an empty `final` method upstream) is not ported.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/CommandMultilines2.java:44-153
 */
import { NoSuchColorException } from '../klimt/color/NoSuchColorException.js';
import type { Lazy } from '../Lazy.js';
import type { IRegex } from '../regex/IRegex.js';
import { BlocLines } from '../utils/BlocLines.js';
import { CommandControl } from './CommandControl.js';
import { CommandExecutionResult } from './CommandExecutionResult.js';
import type { MultilinesStrategy } from './MultilinesStrategy.js';
import { ParserPass } from './ParserPass.js';
import { type Trim, trimWith } from './Trim.js';

/** `Command#isValid(BlocLines)` and the rest of the contract `PSystemCommandFactory` drives a block through. */
export interface MultilineCommand<S> {
  isValid(lines: BlocLines): CommandControl;
  execute(system: S, lines: BlocLines, currentPass: ParserPass): CommandExecutionResult;
  isEligibleFor(pass: ParserPass): boolean;
}

/** `CommandDecoratorMultine`: a command that caps how many lines it reads. @see CommandDecoratorMultine.java */
export interface HasNbMaxLines {
  getNbMaxLines(): number;
}

export abstract class CommandMultilines2<S> implements MultilineCommand<S> {
  private readonly starting: IRegex;
  private readonly trimEnd: Trim;
  private readonly strategy: MultilinesStrategy;
  private readonly end: Lazy<RegExp>;

  /** @see CommandMultilines2.java:59-69 */
  constructor(patternStart: IRegex, strategy: MultilinesStrategy, trimEnd: Trim, end: Lazy<RegExp>) {
    this.strategy = strategy;
    this.starting = patternStart;
    this.trimEnd = trimEnd;
    this.end = end;
  }

  /** @see CommandMultilines2.java:71-73 */
  syntaxWithFinalBracket(): boolean {
    return false;
  }

  /** `Command#isCommandForbidden` (interface default). */
  isCommandForbidden(_lines: BlocLines): boolean {
    return false;
  }

  /** `final` upstream. @see CommandMultilines2.java:79-110 */
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

    if (!this.starting.match(first.getTrimmed().getString())) return CommandControl.NOT_OK;

    if (lines.size() === 1) return CommandControl.OK_PARTIAL;

    if (!this.end.get().test(trimWith(this.trimEnd, lines.getLast()))) return CommandControl.OK_PARTIAL;

    return this.finalVerification(lines);
  }

  /** `final` upstream. @see CommandMultilines2.java:112-120 */
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

  /** `final` upstream; the `Explain` text. @see CommandMultilines2.java:122-130 */
  explain(linesIn: BlocLines): string | undefined {
    let lines = linesIn.cleanList(this.strategy);
    if (this.syntaxWithFinalBracket()) lines = lines.eventuallyMoveBracket();

    return this.explainNow(lines);
  }

  /** Upstream `@Explain abstract protected`. @see CommandMultilines2.java:133 */
  protected abstract explainNow(lines: BlocLines): string | undefined;

  /** May throw {@link NoSuchColorException} (checked upstream). @see CommandMultilines2.java:135-136 */
  protected abstract executeNow(system: S, lines: BlocLines, currentPass: ParserPass): CommandExecutionResult;

  /** @see CommandMultilines2.java:138-140 */
  protected finalVerification(_lines: BlocLines): CommandControl {
    return CommandControl.OK;
  }

  /** @see CommandMultilines2.java:142-144 */
  protected getStartingPattern(): IRegex {
    return this.starting;
  }

  /** @see CommandMultilines2.java:146-149 */
  isEligibleFor(pass: ParserPass): boolean {
    return pass === ParserPass.ONE;
  }

  /** @see CommandMultilines2.java:151-153 */
  getEndPattern(): RegExp {
    return this.end.get();
  }
}
