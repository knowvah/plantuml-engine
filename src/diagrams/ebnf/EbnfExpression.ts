/**
 * `EbnfExpression`: one rule — tokenised from a `CharInspector` at construction, drawn as the bold name over its
 * railroad (`withMargin(main, 0, 0, 10, 15)`), with the comments written before and after the name as notes.
 *
 * Mirrored quirks (eep D10): `isCompact` (`!pragma compact`) is stored and never read; `readString` reads to the
 * separator with no end check, so an unterminated string reaches `CharInspectorImpl#jump`'s
 * `IllegalStateException`; any character no branch accepts clears every token (`isEmpty()`, then
 * `Unparsable expression`); `protect("")` is `" "`; `}-` consumes its `-`; `getUDrawable`'s catch-all draws
 * `Syntax error!` (Java also prints the stack trace; stderr is not output).
 *
 * `Character.isWhitespace` and `Character.isLetterOrDigit` are char-level (one UTF-16 unit) JDK predicates, ported
 * as {@link isJavaWhitespace} and {@link isLetterOrDigit} below.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/ebnf/EbnfExpression.java:58-274
 */
import { Display } from '../../core/klimt/creole/Display.js';
import { bridgeFontConfiguration } from '../../core/klimt/font/FontConfigurationBridge.js';
import { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import { TextBlockUtils } from '../../core/klimt/shape/TextBlockUtils.js';
import type { FontConfiguration } from '../../core/klimt/shape/UText.js';
import type { Style } from '../../core/style/Style.js';
import type { PreprocessingArtifact } from '../../core/tim/PreprocessingArtifact.js';
import type { CharInspector } from '../../core/utils/CharInspector.js';
import { FloatingNote } from '../activity/ftile/vcompact/FloatingNote.js';
import type { SkinParam } from './ebnf-skin-param.js';
import { EbnfEngine, ebnfStyleOf } from './EbnfEngine.js';
import { ETileEmpty } from './ETileEmpty.js';
import { ETileWithCircles } from './ETileWithCircles.js';
import { ShuntingYard } from './ShuntingYard.js';
import { Symbol } from './Symbol.js';
import type { TextBlockable } from './TextBlockable.js';
import { TitleBox } from './TitleBox.js';
import { Token } from './Token.js';

/** Java's `'\0'` / `char` 0, what `CharInspector#peek` answers past a line and once exhausted. */
const NUL = '\0';
/** `withMargin(main, 0, 0, 10, 15)`: 10 above the railroad, 15 below. @see EbnfExpression.java:168 */
const MAIN_MARGIN_TOP = 10;
const MAIN_MARGIN_BOTTOM = 15;

/**
 * `Character.isWhitespace(char)`: a Unicode space separator (Zs, Zl, Zp) that is not a no-break space (U+00A0,
 * U+2007, U+202F), or one of U+0009-U+000D, U+001C-U+001F.
 */
const JAVA_WHITESPACE = /^(?:(?![   ])[\p{Zs}\p{Zl}\p{Zp}]|[\t\n\u000B\f\r\u001C-\u001F])$/u;
/** `Character.isLetterOrDigit(char)`: general category Lu, Ll, Lt, Lm, Lo or Nd. A lone surrogate is neither. */
const JAVA_LETTER_OR_DIGIT = /^[\p{L}\p{Nd}]$/u;

function isJavaWhitespace(ch: string): boolean {
  return JAVA_WHITESPACE.test(ch);
}

/** @see EbnfExpression.java:266-268 */
function isLetterOrDigit(ch: string): boolean {
  return ch === '-' || ch === '_' || JAVA_LETTER_OR_DIGIT.test(ch);
}

/** @see EbnfExpression.java:131-133 */
function protect(literal: string): string {
  return literal.length === 0 ? ' ' : literal;
}

/** The single-character tokens of the constructor's `if` chain, in Java order with their lines (eep D12). */
const SINGLE_CHAR_TOKENS: ReadonlyMap<string, Symbol> = new Map([
  [',', Symbol.CONCATENATION], // :89-90
  ['|', Symbol.ALTERNATION], // :91-92
  ['=', Symbol.DEFINITION], // :93-94
  ['(', Symbol.GROUPING_OPEN], // :95-96
  [')', Symbol.GROUPING_CLOSE], // :97-98
  ['[', Symbol.OPTIONAL_OPEN], // :99-100
  [']', Symbol.OPTIONAL_CLOSE], // :101-102
  ['{', Symbol.REPETITION_OPEN], // :103-104
]);

/** The quoted forms, `readString` then `protect`. @see EbnfExpression.java:113-121 */
const STRING_TOKENS: ReadonlyMap<string, Symbol> = new Map([
  ['"', Symbol.TERMINAL_STRING1],
  ["'", Symbol.TERMINAL_STRING2],
  ['?', Symbol.SPECIAL_SEQUENCE],
]);

/** What one turn of the constructor's loop does next. */
type Step = 'jump' | 'continue' | 'break' | 'clear';

export class EbnfExpression implements TextBlockable {
  private readonly tokens: Token[] = [];
  // Read by nothing upstream (`!pragma compact` changes no output, eep D10; `cov-compact`).
  private readonly isCompact: boolean;
  private readonly commentAbove: string | null;
  private readonly commentBelow: string | null;

  /** @see EbnfExpression.java:65-67 */
  static create(
    it: CharInspector,
    isCompact: boolean,
    commentAbove: string | null,
    commentBelow: string | null,
  ): EbnfExpression {
    return new EbnfExpression(it, isCompact, commentAbove, commentBelow);
  }

  /** @see EbnfExpression.java:69-129 */
  private constructor(it: CharInspector, isCompact: boolean, commentAbove: string | null, commentBelow: string | null) {
    this.isCompact = isCompact;
    this.commentAbove = commentAbove;
    this.commentBelow = commentBelow;
    while (true) {
      const step = this.step(it);
      if (step === 'break') break;
      if (step === 'clear') {
        this.tokens.length = 0;
        return;
      }
      if (step === 'jump') it.jump();
    }
  }

  /** One turn of the constructor's `if` chain, Java's branches in order. @see EbnfExpression.java:74-127 */
  private step(it: CharInspector): Step {
    const ch = it.peek(0);
    if (isJavaWhitespace(ch)) return 'jump';
    if (ch === '-') return this.add(Symbol.NOT, null, 'jump');
    if (isLetterOrDigit(ch)) return this.add(Symbol.LITERAL, this.readLitteral(it), 'continue');
    if (ch === '*') return this.add(Symbol.REPETITION_SYMBOL, null, 'jump');
    if (ch === '(' && it.peek(1) === '*') {
      const comment = this.readComment(it);
      if (comment.trim().length > 0) this.tokens.push(new Token(Symbol.COMMENT_TOKEN, comment));
      return 'continue';
    }
    const single = SINGLE_CHAR_TOKENS.get(ch);
    if (single !== undefined) return this.add(single, null, 'jump');
    return this.stepTail(it, ch);
  }

  /** The chain from `}` on. @see EbnfExpression.java:105-125 */
  private stepTail(it: CharInspector, ch: string): Step {
    if (ch === '}' && it.peek(1) === '-') {
      this.tokens.push(new Token(Symbol.REPETITION_MINUS_CLOSE, null));
      it.jump();
      return 'jump';
    }
    if (ch === '}') return this.add(Symbol.REPETITION_CLOSE, null, 'jump');
    if (ch === ';' || ch === NUL) return 'break';
    const quoted = STRING_TOKENS.get(ch);
    if (quoted !== undefined) return this.add(quoted, protect(this.readString(it)), 'jump');
    return 'clear';
  }

  private add(symbol: Symbol, data: string | null, step: Step): Step {
    this.tokens.push(new Token(symbol, data));
    return step;
  }

  /** @see EbnfExpression.java:135-174 */
  getUDrawable(skinParam: SkinParam, preprocessing: PreprocessingArtifact): TextBlock {
    const style = ebnfStyleOf(skinParam);
    const fc = bridgeFontConfiguration(style.getFontConfiguration(skinParam.getIHtmlColorSet()));

    if (this.tokens.length === 0) return EbnfEngine.syntaxError(fc, skinParam);

    try {
      return this.drawRule(skinParam, preprocessing, style, fc) ?? EbnfEngine.syntaxError(fc, skinParam);
    } catch {
      // Java: `catch (Exception e) { e.printStackTrace(); return EbnfEngine.syntaxError(fc, skinParam); }`
      return EbnfEngine.syntaxError(fc, skinParam);
    }
  }

  /**
   * `getUDrawable`'s `try` body (split for the 30-NLOC cap, eep D12); `undefined` for its two early
   * `return EbnfEngine.syntaxError(…)`. @see EbnfExpression.java:144-169
   */
  private drawRule(
    skinParam: SkinParam,
    preprocessing: PreprocessingArtifact,
    style: Style,
    fc: FontConfiguration,
  ): TextBlock | undefined {
    // `iterator.next()` twice: a one-token rule throws `NoSuchElementException`, caught by `getUDrawable`.
    const name = this.tokens[0]!;
    const definition = elementAt(this.tokens, 1);
    if (definition.getSymbol() !== Symbol.DEFINITION) return undefined;

    const rest = this.tokens.slice(2);
    let main: TextBlock;
    if (rest.length > 0) {
      const full = new ShuntingYard(rest.values()).getOuputQueue();
      if (full.length === 0) return undefined;

      main = this.getMainDrawing(skinParam, preprocessing.getOptions(), full);
    } else {
      const lineColor = style.value('LineColor').asColor(skinParam.getIHtmlColorSet());
      main = new ETileWithCircles(new ETileEmpty(), lineColor);
    }

    const titleBox = this.getTitleBox(skinParam, name, fc);
    return TextBlockUtils.mergeTB(
      titleBox,
      TextBlockUtils.withMargin(main, 0, 0, MAIN_MARGIN_TOP, MAIN_MARGIN_BOTTOM),
      HorizontalAlignment.LEFT,
    );
  }

  /**
   * The bold name with the notes above and below it (split from `drawRule` for the NLOC cap). A dataless first
   * token (`( = …`) is `UText.build(null)` upstream: an NPE in `text.replace`, caught by `getUDrawable`.
   * @see EbnfExpression.java:162-166
   */
  private getTitleBox(skinParam: SkinParam, name: Token, fc: FontConfiguration): TextBlock {
    let titleBox: TextBlock = new TitleBox(requireData(name), fc);
    if (this.commentAbove !== null)
      titleBox = TextBlockUtils.mergeTB(this.getNoteAbove(skinParam), titleBox, HorizontalAlignment.CENTER);
    if (this.commentBelow !== null)
      titleBox = TextBlockUtils.mergeTB(titleBox, this.getNoteBelow(skinParam), HorizontalAlignment.CENTER);
    return titleBox;
  }

  /** @see EbnfExpression.java:176-182 */
  private getNoteAbove(skinParam: SkinParam): TextBlock {
    return FloatingNote.create(Display.getWithNewlines(skinParam.getPragma(), this.commentAbove), skinParam, 'ebnf');
  }

  /** @see EbnfExpression.java:184-190 */
  private getNoteBelow(skinParam: SkinParam): TextBlock {
    return FloatingNote.create(Display.getWithNewlines(skinParam.getPragma(), this.commentBelow), skinParam, 'ebnf');
  }

  /** @see EbnfExpression.java:192-222 */
  private getMainDrawing(
    skinParam: SkinParam,
    option: ReadonlyMap<string, string>,
    tokens: readonly Token[],
  ): TextBlock {
    const engine = new EbnfEngine(skinParam, option);
    for (const element of tokens) replay(engine, element);
    return engine.getTextBlock();
  }

  /** @see EbnfExpression.java:224-235 */
  private readString(it: CharInspector): string {
    const separator = it.peek(0);
    it.jump();
    let sb = '';
    while (true) {
      const ch = it.peek(0);
      if (ch === separator) return sb;
      sb += ch;
      it.jump();
    }
  }

  /** @see EbnfExpression.java:237-246 */
  private readLitteral(it: CharInspector): string {
    let sb = '';
    while (true) {
      const ch = it.peek(0);
      if (!isLetterOrDigit(ch)) return sb;
      sb += ch;
      it.jump();
    }
  }

  /** @see EbnfExpression.java:248-264 */
  private readComment(it: CharInspector): string {
    let sb = '';
    it.jump();
    it.jump();
    while (true) {
      const ch = it.peek(0);
      if (ch === NUL) return sb;
      if (ch === '*' && it.peek(1) === ')') {
        it.jump();
        it.jump();
        return sb;
      }
      sb += ch;
      it.jump();
    }
  }

  /** @see EbnfExpression.java:270-272 */
  isEmpty(): boolean {
    return this.tokens.length === 0;
  }
}

/** `Iterator#next` past the end: `NoSuchElementException`. */
function elementAt(tokens: readonly Token[], index: number): Token {
  const token = tokens[index];
  if (token === undefined) throw new Error('NoSuchElementException');
  return token;
}

/** `token.getData()` where Java dereferences it: a `NullPointerException` for a dataless token. */
function requireData(token: Token): string {
  const data = token.getData();
  if (data === null) throw new Error('NullPointerException');
  return data;
}

/** `getMainDrawing`'s `if` chain for one queued token. @see EbnfExpression.java:195-218 */
function replay(engine: EbnfEngine, element: Token): void {
  const symbol = element.getSymbol();
  if (
    symbol === Symbol.TERMINAL_STRING1 ||
    symbol === Symbol.TERMINAL_STRING2 ||
    symbol === Symbol.LITERAL ||
    symbol === Symbol.SPECIAL_SEQUENCE
  )
    engine.push(element);
  else if (symbol === Symbol.COMMENT_ABOVE) engine.commentAbove(requireData(element));
  else if (symbol === Symbol.COMMENT_BELOW) engine.commentBelow(requireData(element));
  else replayOperator(engine, element);
}

/** The operator half of the chain. @see EbnfExpression.java:203-218 */
function replayOperator(engine: EbnfEngine, element: Token): void {
  const symbol = element.getSymbol();
  if (symbol === Symbol.ALTERNATION) engine.alternation();
  else if (symbol === Symbol.CONCATENATION) engine.concatenation();
  else if (symbol === Symbol.OPTIONAL) engine.optional();
  else if (symbol === Symbol.NOT) engine.not();
  else if (symbol === Symbol.REPETITION_ZERO_OR_MORE) engine.repetitionZeroOrMore();
  else if (symbol === Symbol.REPETITION_ONE_OR_MORE) engine.repetitionOneOrMore();
  else if (symbol === Symbol.REPETITION_SYMBOL) engine.repetitionSymbol();
  else throw new Error(`UnsupportedOperationException: ${element.toString()}`);
}
