/**
 * `PSystemRegex`: one `@startregex` block. Every source line a common command declines is its own regex, parsed by
 * `addBlocLines` onto ONE shared tile stack; `getTextBlock` draws only the top tile, at `(5, 5)`, sized `+10`
 * (rep D4: `abc` then `x|y` draws only `x|y`).
 *
 * The tile style is frozen in the constructor from the default skin, the `skin` line and the `<style>` blocks,
 * before any `skinparam` command runs (`regex-skin-param.ts#tileStyleBuilder`, rep D3). `getTextBlock`'s
 * `TextBlockUtils.addBackcolor(tb, null)` draws and measures as the block itself (`PSystemEbnf.ts`'s note).
 *
 * Mutable: `stack` grows and shrinks in place as lines execute, as Java's `ArrayDeque` used as a stack
 * (`addFirst` → `unshift`, `removeFirst` → `shift`, which throws `NoSuchElementException` when empty, rep D5).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/regexdiagram/PSystemRegex.java:80-372
 */
import { createAnnotations, type DiagramAnnotations } from '../../core/annotations/index.js';
import type { UmlSource } from '../../core/block-extractor.js';
import { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import type { HColorSet } from '../../core/klimt/color/HColorSet.js';
import { bridgeFontConfiguration } from '../../core/klimt/font/FontConfigurationBridge.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import type { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import type { FontConfiguration } from '../../core/klimt/shape/UText.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { ScaleSpec } from '../../core/scale-command.js';
import type { SpriteRegistry } from '../../core/sprite-registry.js';
import type { Style } from '../../core/style/Style.js';
import type { HColor } from '../../core/style/Value.js';
import { TitledDiagram } from '../../core/TitledDiagram.js';
import { OptionKey } from '../../core/tim/EaterOption.js';
import type { PreprocessingArtifact } from '../../core/tim/PreprocessingArtifact.js';
import type { BlocLines } from '../../core/utils/BlocLines.js';
import { fore } from '../ebnf/ebnf-klimt.js';
import { ETile } from '../ebnf/ETile.js';
import { ETileAlternation } from '../ebnf/ETileAlternation.js';
import { ETileBox } from '../ebnf/ETileBox.js';
import { ETileConcatenation } from '../ebnf/ETileConcatenation.js';
import { ETileLookAheadOrBehind } from '../ebnf/ETileLookAheadOrBehind.js';
import { ETileNamedGroup } from '../ebnf/ETileNamedGroup.js';
import { ETileOneOrMore } from '../ebnf/ETileOneOrMore.js';
import { ETileOptional2 } from '../ebnf/ETileOptional2.js';
import { ETileRegexGroup } from '../ebnf/ETileRegexGroup.js';
import { ETileRegexGroupAllBut } from '../ebnf/ETileRegexGroupAllBut.js';
import { ETileZeroOrMore } from '../ebnf/ETileZeroOrMore.js';
import { Symbol } from '../ebnf/Symbol.js';
import { GroupSplitter } from './GroupSplitter.js';
import { type SkinParam, tileStyleBuilder } from './regex-skin-param.js';
import { ReToken } from './ReToken.js';
import { needImplicitConcatenation, ReTokenType } from './ReTokenType.js';
import { RegexExpression } from './RegexExpression.js';
import { RegexParsingException } from './RegexParsingException.js';
import { ShuntingYard } from './ShuntingYard.js';

/** `ug.apply(new UTranslate(5, 5))`. @see PSystemRegex.java:118 */
const TILE_OFFSET = 5;
/** `calculateDimension(…).delta(10)`. @see PSystemRegex.java:124 */
const TILE_DELTA = 10;
/** `fontConfiguration.bigger(-2)`, a braced loop's label. @see PSystemRegex.java:231, :253 */
const LOOP_LABEL_DELTA = -2;

/** `FontConfiguration#bigger`: `changeSize((float) (currentFont.getSize() + delta))`. @see FontConfiguration.java:273-275 */
function bigger(fc: FontConfiguration, delta: number): FontConfiguration {
  return { ...fc, size: Math.fround(fc.size + delta) };
}

export class PSystemRegex extends TitledDiagram {
  private readonly skinParam: SkinParam;
  /** `TitledDiagram`'s title/caption/legend/header/footer/mainframe, read by the chrome step. */
  readonly annotations: DiagramAnnotations = createAnnotations();
  /** `CommandScale*`'s target (`UmlDiagram#setScale`). */
  scale: ScaleSpec | undefined = undefined;

  /** @see PSystemRegex.java:103 */
  private readonly stack: ETile[] = [];
  private readonly fontConfiguration: FontConfiguration;
  private readonly style: Style;
  private readonly colorSet: HColorSet;
  private readonly lineColor: HColor;

  /**
   * The skin param is built by the factory, as ebnf's is; the tile style is frozen here from the `skin` and
   * `<style>` blocks only (rep D3). @see PSystemRegex.java:82-97
   */
  constructor(source: UmlSource, preprocessing: PreprocessingArtifact, skinParam: SkinParam) {
    super(source, 'REGEX', undefined, preprocessing);
    this.skinParam = skinParam;
    const style = ETile.getStyleSignature().getMergedStyle(tileStyleBuilder(source));
    // `getMergedStyle` answers null only for a missing builder, which `applyStyles` always builds.
    if (style === undefined) throw new Error('NullPointerException: no regex tile style');
    this.style = style;
    this.fontConfiguration = bridgeFontConfiguration(style.getFontConfiguration(skinParam.getIHtmlColorSet()));
    this.colorSet = skinParam.getIHtmlColorSet();
    this.lineColor = style.value('LineColor').asColor(skinParam.getIHtmlColorSet());
  }

  getSkinParam(): SkinParam {
    return this.skinParam;
  }

  /**
   * `skinParam.handwritten()`, else `!option handwritten` through the artifact.
   * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/TitledDiagram.java:114-118
   */
  isHandwritten(): boolean {
    if (this.skinParam.getValue('handwritten')?.toLowerCase() === 'true') return true;
    return this.preprocessing.getOptions().get(OptionKey.HANDWRITTEN)?.toLowerCase() === 'true';
  }

  /** The skin param's sprites, read by the sprite commands and the chrome step. */
  get sprites(): SpriteRegistry {
    return this.skinParam.getSprites();
  }

  /** `new DiagramDescription("(Regular Expression)")`. @see PSystemRegex.java:99-101 */
  getDescription(): string {
    return '(Regular Expression)';
  }

  /** The tile stack, top first, for the tests. */
  getStack(): readonly ETile[] {
    return this.stack;
  }

  /**
   * The top tile only; Java's `while (stack.size() > 1) concatenation();` stays commented out (rep D4). An empty
   * stack throws a `NullPointerException` from `peekFirst.calculateDimension`, outside any command (rep D5 kind 4).
   * @see PSystemRegex.java:109-129
   */
  getTextBlock(): TextBlock {
    const peekFirst = this.stack[0];
    const lineColor = this.lineColor;
    const top = (): ETile => {
      if (peekFirst === undefined) throw new Error('NullPointerException: this.val$peekFirst is null');
      return peekFirst;
    };
    return {
      drawU(ug: UGraphic): void {
        top().drawU(ug.apply(new UTranslate(TILE_OFFSET, TILE_OFFSET)).apply(fore(lineColor)));
      },
      calculateDimension(stringBounder: StringBounder): XDimension2D {
        return top().calculateDimension(stringBounder).delta(TILE_DELTA);
      },
    };
  }

  /**
   * Tokenize, concatenate, shunt, then replay the queue on the stack. A {@link RegexParsingException} is the
   * command's `Error parsing: …`; any other throw escapes to `ProtectedCommand` (rep D5 kinds 2 and 3).
   * @see PSystemRegex.java:131-178
   */
  addBlocLines(from: BlocLines): CommandExecutionResult {
    try {
      const it = from.inspector();
      const parsed1 = RegexExpression.parse(it);
      const parsed2 = addImplicitConcatenation(parsed1);
      const shuntingYard = new ShuntingYard(parsed2.values());
      const result = shuntingYard.getOuputQueue();
      for (const token of result) this.executeToken(token);
    } catch (ex) {
      if (ex instanceof RegexParsingException) return CommandExecutionResult.error(`Error parsing: ${ex.message}`);
      throw ex;
    }
    return CommandExecutionResult.ok();
  }

  /**
   * The loop body's `if` chain. Each token type has one branch, so a table keeps the order; a `QUANTIFIER` goes by
   * its first character, and anything else (an unbalanced `(` left in the queue) is a `RegexParsingException` with
   * the token's `toString` (rep D11). @see PSystemRegex.java:142-172
   */
  private executeToken(token: ReToken): void {
    const type = token.getType();
    if (type === ReTokenType.QUANTIFIER) return this.executeQuantifier(token);
    const branch = this.branches().get(type);
    if (branch === undefined) throw new RegexParsingException(token.toString());
    branch(token);
  }

  /** The non-quantifier branches of the chain, by token type. @see PSystemRegex.java:143-162 */
  private branches(): ReadonlyMap<ReTokenType, (token: ReToken) => void> {
    return new Map<ReTokenType, (token: ReToken) => void>([
      [ReTokenType.SIMPLE_CHAR, (t) => this.pushEtileBox(t, Symbol.TERMINAL_STRING1)], // :143-144
      [ReTokenType.ESCAPED_CHAR, (t) => this.pushEtileBox(t, Symbol.TERMINAL_STRING1)], // :145-146
      [ReTokenType.GROUP, (t) => this.pushRegexGroup(t)], // :147-148
      [ReTokenType.LOOK_AHEAD, (t) => this.lookAheadOrBehind(t.getData())], // :149-150
      [ReTokenType.LOOK_BEHIND, (t) => this.lookAheadOrBehind(t.getData())], // :151-152
      [ReTokenType.NAMED_GROUP, (t) => this.namedGroup(t.getData())], // :153-154
      [ReTokenType.CLASS, (t) => this.pushEtileBox(t, Symbol.LITERAL)], // :155-156
      [ReTokenType.ANCHOR, (t) => this.pushEtileBox(t, Symbol.LITERAL)], // :157-158
      [ReTokenType.CONCATENATION_IMPLICIT, () => this.concatenation()], // :159-160
      [ReTokenType.ALTERNATIVE, () => this.alternation()], // :161-162
    ]);
  }

  /** The four `QUANTIFIER` branches, by first character. @see PSystemRegex.java:163-172 */
  private executeQuantifier(token: ReToken): void {
    const data = token.getData();
    if (data.startsWith('*')) this.repetitionZeroOrMore();
    else if (data.startsWith('+')) this.repetitionOneOrMore();
    else if (data.startsWith('?')) this.optional();
    else if (data.startsWith('{')) this.repetitionBraced(data);
    else throw new RegexParsingException(token.toString());
  }

  /** `ArrayDeque#removeFirst`: `NoSuchElementException` when empty (rep D5). */
  private removeFirst(): ETile {
    const first = this.stack.shift();
    if (first === undefined) throw new Error('NoSuchElementException');
    return first;
  }

  /** @see PSystemRegex.java:191-194 */
  private pushEtileBox(element: ReToken, type: Symbol): void {
    const { fontConfiguration: fc, style, colorSet, skinParam } = this;
    const option = this.preprocessing.getOptions();
    this.stack.unshift(
      new ETileBox({ value: element.getData(), symbol: type, fc, style, colorSet, skinParam, option }),
    );
  }

  /** `[^…]` (the first item `^`) is `ETileRegexGroupAllBut`. @see PSystemRegex.java:196-202 */
  private pushRegexGroup(element: ReToken): void {
    const elements = new GroupSplitter().split(element.getData());
    const { fontConfiguration: fc, style, colorSet, skinParam } = this;
    // `elements.get(0)` throws `IndexOutOfBoundsException` on an empty group (`[]`).
    if (elements.length === 0) throw new Error('IndexOutOfBoundsException');
    if (elements[0] === '^') this.stack.unshift(new ETileRegexGroupAllBut(elements, fc, style, colorSet, skinParam));
    else this.stack.unshift(new ETileRegexGroup(elements, fc, style, colorSet, skinParam));
  }

  /** @see PSystemRegex.java:204-207 */
  private lookAheadOrBehind(name: string): void {
    const arg1 = this.removeFirst();
    this.stack.unshift(new ETileLookAheadOrBehind(arg1, this.fontConfiguration, this.style, this.colorSet, name));
  }

  /** @see PSystemRegex.java:209-212 */
  private namedGroup(name: string): void {
    const arg1 = this.removeFirst();
    this.stack.unshift(new ETileNamedGroup(arg1, this.fontConfiguration, this.colorSet, this.skinParam, name));
  }

  /** @see PSystemRegex.java:214-217 */
  private repetitionZeroOrMore(): void {
    const arg1 = this.removeFirst();
    this.stack.unshift(new ETileZeroOrMore(arg1, this.skinParam));
  }

  /** @see PSystemRegex.java:219-222 */
  private optional(): void {
    const arg1 = this.removeFirst();
    this.stack.unshift(new ETileOptional2(arg1, this.skinParam));
  }

  /** Both Java overloads: with a `repetition` the loop is labelled. @see PSystemRegex.java:224-233 */
  private repetitionOneOrMore(repetition?: string): void {
    const arg1 = this.removeFirst();
    if (repetition === undefined) this.stack.unshift(new ETileOneOrMore(arg1));
    else this.stack.unshift(this.labelledOneOrMore(arg1, repetition));
  }

  /** `new ETileOneOrMore(arg1, repetition, fontConfiguration.bigger(-2), getSkinParam())`. @see PSystemRegex.java:231 */
  private labelledOneOrMore(arg1: ETile, repetition: string): ETile {
    return new ETileOneOrMore(arg1, repetition, bigger(this.fontConfiguration, LOOP_LABEL_DELTA), this.skinParam);
  }

  /**
   * `{0,}` (and `{0}`, `{0,0}`) is `*`, `{0,1}` is `?`, `{0,N}` an optional around a labelled one-or-more, and
   * anything else a labelled one-or-more. @see PSystemRegex.java:235-258
   */
  private repetitionBraced(repetition: string): void {
    // repetition is of the form "{N}", "{N,}" or "{N,M}" (optionally followed by '?')
    const min = parseBracedMin(repetition);
    const unboundedOrZeroMax = isBracedMaxUnbounded(repetition) || parseBracedMax(repetition) === 0;
    if (min === 0 && unboundedOrZeroMax) {
      // {0,} is equivalent to *
      this.repetitionZeroOrMore();
      return;
    }
    if (min === 0) {
      const max = parseBracedMax(repetition);
      if (max === 1) {
        // {0,1} is equivalent to ?
        this.optional();
        return;
      }
      // {0,N} with N >= 2: wrap a OneOrMore (labeled) into an Optional
      const arg1 = this.removeFirst();
      this.stack.unshift(new ETileOptional2(this.labelledOneOrMore(arg1, repetition), this.skinParam));
      return;
    }
    this.repetitionOneOrMore(repetition);
  }

  /** @see PSystemRegex.java:307-322 */
  private alternation(): void {
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

  /** @see PSystemRegex.java:324-354 */
  private concatenation(): void {
    const arg1 = this.removeFirst();
    const arg2 = this.removeFirst();
    if (isBoxMergeable(arg1) && isBoxMergeable(arg2)) {
      this.stack.unshift(arg2.mergeWith(arg1));
      return;
    }
    if (isConcatenation1Mergeable(arg1) && isBoxMergeable(arg2)) {
      const box1 = arg1.getFirst() as ETileBox;
      arg1.overideFirst(arg2.mergeWith(box1));
      this.stack.unshift(arg1);
      return;
    }
    if (arg1 instanceof ETileConcatenation) {
      arg1.push(arg2);
      this.stack.unshift(arg1);
      // This does not work for (A[B])(C)
      // } else if (arg2 instanceof ETileConcatenation) {
      //   arg2.push(arg1);
      //   stack.addFirst(arg2);
    } else {
      const concat = new ETileConcatenation();
      concat.push(arg1);
      concat.push(arg2);
      this.stack.unshift(concat);
    }
  }
}

/** @see PSystemRegex.java:180-189 */
function addImplicitConcatenation(list: readonly ReToken[]): ReToken[] {
  const result: ReToken[] = [];
  for (const token of list) {
    const last = result[result.length - 1];
    if (last !== undefined && needImplicitConcatenation(last.getType(), token.getType()))
      result.push(new ReToken(ReTokenType.CONCATENATION_IMPLICIT, ''));
    result.push(token);
  }
  return result;
}

/** `{` `}` and a trailing `?` removed. @see PSystemRegex.java:260-267 */
function stripBraces(repetition: string): string {
  let s = repetition;
  if (s.endsWith('?')) s = s.substring(0, s.length - 1);
  if (s.startsWith('{') && s.endsWith('}')) s = s.substring(1, s.length - 1);
  return s;
}

/** `Integer.parseInt`'s decimal form; `undefined` is its `NumberFormatException` (rep D9). */
const INT_MAX = 2147483647;
const INT_MIN = -2147483648;
const SIGNED_DECIMAL = /^[+-]?[0-9]+$/;
function parseIntJava(s: string): number | undefined {
  if (!SIGNED_DECIMAL.test(s)) return undefined;
  const value = Number.parseInt(s, 10);
  return value > INT_MAX || value < INT_MIN ? undefined : value;
}

/** An empty minimum (`{,5}`) is 0; a `NumberFormatException` (`{1,2,3}`, past `int`) is -1. @see PSystemRegex.java:269-280 */
export function parseBracedMin(repetition: string): number {
  const inside = stripBraces(repetition);
  const comma = inside.indexOf(',');
  const minStr = (comma === -1 ? inside : inside.substring(0, comma)).trim();
  if (minStr.length === 0) return 0;
  return parseIntJava(minStr) ?? -1;
}

/** `{N}` is its minimum; an empty maximum is -1, as a `NumberFormatException`. @see PSystemRegex.java:282-297 */
export function parseBracedMax(repetition: string): number {
  const inside = stripBraces(repetition);
  const comma = inside.indexOf(',');
  // {N} : max == min
  if (comma === -1) return parseBracedMin(repetition);
  const maxStr = inside.substring(comma + 1).trim();
  if (maxStr.length === 0) return -1;
  return parseIntJava(maxStr) ?? -1;
}

/** @see PSystemRegex.java:299-305 */
export function isBracedMaxUnbounded(repetition: string): boolean {
  const inside = stripBraces(repetition);
  const comma = inside.indexOf(',');
  if (comma === -1) return false;
  return inside.substring(comma + 1).trim().length === 0;
}

/** @see PSystemRegex.java:356-362 */
function isConcatenation1Mergeable(tile: ETile): tile is ETileConcatenation {
  if (tile instanceof ETileConcatenation) return isBoxMergeable(tile.getFirst());
  return false;
}

/** @see PSystemRegex.java:364-370 */
function isBoxMergeable(tile: ETile): tile is ETileBox {
  if (tile instanceof ETileBox) return tile.getSymbol() === Symbol.TERMINAL_STRING1;
  return false;
}
