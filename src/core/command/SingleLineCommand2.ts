/**
 * SingleLineCommand2 -- base class of the commands whose syntax is one `RegexConcat` matched against one source
 * line. The regex counterpart of `UBrexSingleLineCommand2.ts`; its adaptations apply unchanged: `BlocLines` is the one
 * `StringLocated`, so Java's `lines.size() != 1` checks and the two-line `{` branches cannot be entered, and
 * `S extends Diagram` is an unconstrained `S`. `@Explain` is a build-time annotation and is dropped.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/SingleLineCommand2.java:51-193
 */
import { PSystemError } from '../error/PSystemError.js';
import { NoSuchColorException } from '../klimt/color/NoSuchColorException.js';
import type { IRegex } from '../regex/IRegex.js';
import type { RegexResult } from '../regex/RegexResult.js';
import type { LineLocation } from '../tim/LineLocation.js';
import { StringLocated } from '../tim/StringLocated.js';
import { CommandControl } from './CommandControl.js';
import { CommandExecutionResult } from './CommandExecutionResult.js';
import { ParserPass } from './ParserPass.js';

export abstract class SingleLineCommand2<S> {
  private readonly pattern: IRegex;
  private readonly doTrim: boolean;

  /** Both Java constructors: `(pattern)` (`doTrim` true) and `(doTrim, pattern)`. @see SingleLineCommand2.java:56-63 */
  public constructor(pattern: IRegex);
  public constructor(doTrim: boolean, pattern: IRegex);
  public constructor(doTrimOrPattern: boolean | IRegex, pattern?: IRegex) {
    if (typeof doTrimOrPattern === 'boolean') {
      this.doTrim = doTrimOrPattern;
      this.pattern = pattern as IRegex;
    } else {
      this.doTrim = true;
      this.pattern = doTrimOrPattern;
    }
  }

  /** @see SingleLineCommand2.java:65-67 */
  public syntaxWithFinalBracket(): boolean {
    return false;
  }

  /** @see SingleLineCommand2.java:69-81 */
  private myTrim2(s: StringLocated): StringLocated {
    return this.doTrim ? s.getTrimmed() : s;
  }

  /** `Command#isCommandForbidden` (interface default). */
  public isCommandForbidden(_line: StringLocated): boolean {
    return false;
  }

  /** `final` upstream. @see SingleLineCommand2.java:83-107 */
  public isValid(line: StringLocated): CommandControl {
    if (this.isCommandForbidden(line)) return CommandControl.NOT_OK;

    const line2 = this.myTrim2(line);
    if (this.syntaxWithFinalBracket() && !line2.getString().endsWith('{')) {
      const vline = line.getString() + ' {';
      if (this.isValid(new StringLocated(vline, undefined)) === CommandControl.OK) return CommandControl.OK_PARTIAL;

      return CommandControl.NOT_OK;
    }

    if (this.pattern.match(line2.getString())) return this.finalVerification();

    return CommandControl.NOT_OK;
  }

  /** @see SingleLineCommand2.java:121-123 */
  protected finalVerification(): CommandControl {
    return CommandControl.OK;
  }

  /** `final` upstream; `null` is `undefined`. @see SingleLineCommand2.java:125-146 */
  public explain(first: StringLocated): string | undefined {
    const line = this.myTrim2(first).getString();
    if (this.isForbidden(line)) return undefined;

    const arg = this.pattern.matcher(line);
    if (arg === undefined) return undefined;

    return this.explainArg(first.getLocation(), arg);
  }

  /** @see SingleLineCommand2.java:148-151 */
  protected explainArg(_location: LineLocation | undefined, _arg: RegexResult): string | undefined {
    return undefined;
  }

  /** `final` upstream. @see SingleLineCommand2.java:153-179 */
  public execute(system: S, first: StringLocated, currentPass: ParserPass): CommandExecutionResult {
    const line = this.myTrim2(first).getString();
    if (this.isForbidden(line)) return CommandExecutionResult.error('Syntax error: ' + line);

    const arg = this.pattern.matcher(line);
    if (arg === undefined) return CommandExecutionResult.error('Cannot parse line ' + line);

    if ((system as unknown) instanceof PSystemError) return CommandExecutionResult.error('PSystemError cannot be cast');

    try {
      return this.executeArg(system, first.getLocation(), arg, currentPass);
    } catch (e) {
      if (e instanceof NoSuchColorException) return CommandExecutionResult.badColor();
      throw e;
    }
  }

  /** @see SingleLineCommand2.java:181-183 */
  protected isForbidden(_line: string): boolean {
    return false;
  }

  /** May throw {@link NoSuchColorException} (checked upstream). @see SingleLineCommand2.java:185-186 */
  protected abstract executeArg(
    system: S,
    location: LineLocation | undefined,
    arg: RegexResult,
    currentPass: ParserPass,
  ): CommandExecutionResult;

  /** @see SingleLineCommand2.java:188-191 */
  public isEligibleFor(pass: ParserPass): boolean {
    return pass === ParserPass.ONE;
  }
}
