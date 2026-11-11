/**
 * `EbnfEngine`: replays a rule's postfix queue on a stack of tiles. One tile left means a drawing (inside its two
 * circles); anything else is the text `Syntax error!`.
 *
 * Java's `ArrayDeque<ETile>` is an array used at its front; `removeFirst` on an empty stack throws
 * `NoSuchElementException` (caught by `EbnfExpression#getUDrawable`), and `commentAbove`/`commentBelow` throw
 * `IllegalStateException` on an empty stack (eep D10). The `ConfigurationStore<OptionKey>` is the preprocessor's
 * option map.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/ebnf/EbnfEngine.java:54-171
 */
import type { HColorSet } from '../../core/klimt/color/HColorSet.js';
import { Display } from '../../core/klimt/creole/Display.js';
import { bridgeFontConfiguration } from '../../core/klimt/font/FontConfigurationBridge.js';
import { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import type { FontConfiguration } from '../../core/klimt/shape/UText.js';
import type { Style } from '../../core/style/Style.js';
import type { HColor } from '../../core/style/Value.js';
import type { SkinParam } from './ebnf-skin-param.js';
import { ETile } from './ETile.js';
import { ETileAlternation } from './ETileAlternation.js';
import { ETileBox } from './ETileBox.js';
import { ETileConcatenation } from './ETileConcatenation.js';
import { ETileNot } from './ETileNot.js';
import { ETileOneOrMore } from './ETileOneOrMore.js';
import { ETileOptional2 } from './ETileOptional2.js';
import { ETileWithCircles } from './ETileWithCircles.js';
import { ETileZeroOrMore } from './ETileZeroOrMore.js';
import type { Token } from './Token.js';

/** `repetitionLabel + "×"`. @see EbnfEngine.java:102 */
const TIMES = '×';
/** `fontConfiguration.bigger(-2)`. @see EbnfEngine.java:102 */
const LOOP_LABEL_DELTA = -2;

/** `FontConfiguration#bigger`: `changeSize((float) (currentFont.getSize() + delta))`. @see FontConfiguration.java:273-275 */
function bigger(fc: FontConfiguration, delta: number): FontConfiguration {
  return { ...fc, size: Math.fround(fc.size + delta) };
}

/** `ETile.getStyleSignature().getMergedStyle(…)`; `null` only for a missing builder, which a diagram always has. */
export function ebnfStyleOf(skinParam: SkinParam): Style {
  const style = ETile.getStyleSignature().getMergedStyle(skinParam.getCurrentStyleBuilder());
  if (style === undefined) throw new Error('NullPointerException: no ebnf style');
  return style;
}

export class EbnfEngine {
  private readonly stack: ETile[] = [];
  private readonly fontConfiguration: FontConfiguration;
  private readonly style: Style;
  private readonly colorSet: HColorSet;
  private readonly skinParam: SkinParam;
  private readonly option: ReadonlyMap<string, string>;
  private readonly lineColor: HColor;

  /** @see EbnfEngine.java:64-72 */
  constructor(skinParam: SkinParam, option: ReadonlyMap<string, string>) {
    this.skinParam = skinParam;
    this.option = option;
    this.style = ebnfStyleOf(skinParam);
    this.fontConfiguration = bridgeFontConfiguration(this.style.getFontConfiguration(skinParam.getIHtmlColorSet()));
    this.colorSet = skinParam.getIHtmlColorSet();
    this.lineColor = this.style.value('LineColor').asColor(skinParam.getIHtmlColorSet());
  }

  /** `ArrayDeque#removeFirst`. */
  private removeFirst(): ETile {
    const first = this.stack.shift();
    if (first === undefined) throw new Error('NoSuchElementException');
    return first;
  }

  /** @see EbnfEngine.java:74-77 */
  push(element: Token): void {
    const { fontConfiguration: fc, style, colorSet, skinParam, option } = this;
    // `element.getData()` is non-null for the four symbols `getMainDrawing` pushes (`EbnfExpression.java:196-198`).
    this.stack.unshift(
      new ETileBox({ value: element.getData()!, symbol: element.getSymbol(), fc, style, colorSet, skinParam, option }),
    );
  }

  /** @see EbnfEngine.java:79-82 */
  optional(): void {
    const arg1 = this.removeFirst();
    this.stack.unshift(new ETileOptional2(arg1, this.skinParam));
  }

  /** @see EbnfEngine.java:84-87 */
  not(): void {
    const arg1 = this.removeFirst();
    this.stack.unshift(new ETileNot(arg1, this.fontConfiguration, this.style, this.colorSet, this.skinParam));
  }

  /** @see EbnfEngine.java:89-92 */
  repetitionZeroOrMore(): void {
    const arg1 = this.removeFirst();
    this.stack.unshift(new ETileZeroOrMore(arg1, this.skinParam));
  }

  /** @see EbnfEngine.java:94-97 */
  repetitionOneOrMore(): void {
    const arg1 = this.removeFirst();
    this.stack.unshift(new ETileOneOrMore(arg1));
  }

  /** `n * x`: a loop labelled `n×`; `0 * x` wraps it in an `ETileOptional2`. @see EbnfEngine.java:99-107 */
  repetitionSymbol(): void {
    const arg1 = this.removeFirst();
    const repetitionLabel = this.removeFirst().getRepetitionLabel();
    let tile: ETile = new ETileOneOrMore(
      arg1,
      repetitionLabel + TIMES,
      bigger(this.fontConfiguration, LOOP_LABEL_DELTA),
      this.skinParam,
    );
    if (repetitionLabel === '0') tile = new ETileOptional2(tile, this.skinParam);
    this.stack.unshift(tile);
  }

  /** @see EbnfEngine.java:109-124 */
  alternation(): void {
    const arg1 = this.removeFirst();
    const arg2 = this.removeFirst();
    if (arg1 instanceof ETileAlternation) {
      arg1.push(arg2);
      this.stack.unshift(arg1);
    } else if (arg2 instanceof ETileAlternation) {
      arg2.push(arg1);
      this.stack.unshift(arg2);
    } else {
      const concat = new ETileAlternation();
      concat.push(arg1);
      concat.push(arg2);
      this.stack.unshift(concat);
    }
  }

  /** @see EbnfEngine.java:126-142 */
  concatenation(): void {
    const arg1 = this.removeFirst();
    const arg2 = this.removeFirst();
    if (arg1 instanceof ETileConcatenation) {
      arg1.push(arg2);
      this.stack.unshift(arg1);
    } else if (arg2 instanceof ETileConcatenation) {
      arg2.pushLast(arg1);
      this.stack.unshift(arg2);
    } else {
      const concat = new ETileConcatenation();
      concat.push(arg1);
      concat.push(arg2);
      this.stack.unshift(concat);
    }
  }

  /** @see EbnfEngine.java:144-148 */
  getTextBlock(): TextBlock {
    if (this.stack.length !== 1) return EbnfEngine.syntaxError(this.fontConfiguration, this.skinParam);
    return new ETileWithCircles(this.stack[0]!, this.lineColor);
  }

  /** `Display.create("Syntax error!").create(fc, LEFT, spriteContainer)`. @see EbnfEngine.java:150-153 */
  static syntaxError(fontConfiguration: FontConfiguration, spriteContainer: SkinParam): TextBlock {
    const msg = Display.create(['Syntax error!']);
    return msg.create(
      { fontConfiguration, spriteContainer, atomOps: spriteContainer.atomOps },
      HorizontalAlignment.LEFT,
    );
  }

  /** @see EbnfEngine.java:155-161 */
  commentBelow(comment: string): void {
    const arg1 = this.stack[0];
    if (arg1 === undefined) throw new Error('IllegalStateException');
    arg1.addCommentBelow(comment);
  }

  /** @see EbnfEngine.java:163-169 */
  commentAbove(comment: string): void {
    const arg1 = this.stack[0];
    if (arg1 === undefined) throw new Error('IllegalStateException');
    arg1.addCommentAbove(comment);
  }
}
