import { Colors } from '../../abel/Colors.js';
import type { ColorType } from '../../abel/ColorType.js';
import { RegexLeaf } from '../../regex/RegexLeaf.js';
import type { HColorSet } from './HColorSet.js';

/**
 * `ColorParser` — the `#color` / `#back:blue;line:red` token grammar and its
 * conversion to {@link Colors}. A parser here is the capture name plus the
 * main type; its regex source is exposed as {@link ColorParser.regexSource}
 * (upstream's `RegexLeaf`, whose single capture group is named `name`), and
 * `getColor` takes the captured string (upstream's `RegexResult.getLazzy`).
 *
 * `exp1`, `exp2` and `exp3` (the "old parsers", `ColorParser.java:89-99`) return `RegexLeaf`; `exp4`, `exp6` and
 * `exp7` are left out until an engine on this port needs them.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/color/ColorParser.java:41-112
 */

/** @see ColorParser.java:43 */
export const COLOR_REGEXP = String.raw`#\w+[-\\|/]?\w+`;

/** @see ColorParser.java:45 */
export const PART2 =
  String.raw`#(?:\w+[-\\|/]?\w+;)?(?:(?:text|back|header|line|line\.dashed|line\.dotted|line\.bold|shadowing)` +
  String.raw`(?::\w+[-\\|/]?\w+)?(?:;|(?![\w;:.])))+`;

/** @see ColorParser.java:46 */
export const COLORS_REGEXP = `(?:${PART2})|(?:${COLOR_REGEXP})`;

export class ColorParser {
  /** `RegexLeaf(1, name, pattern)`'s pattern: one capture group. */
  readonly regexSource: string;

  private constructor(
    private readonly name: string,
    regexSource: string,
    private readonly mainType: ColorType,
  ) {
    this.regexSource = regexSource;
  }

  /** The capture name upstream's `RegexLeaf` carries. */
  getName(): string {
    return this.name;
  }

  /**
   * `getColor(RegexResult, HColorSet)`: `captured` is `arg.getLazzy(name, 0)`.
   * @see ColorParser.java:58-66
   */
  getColor(captured: string | undefined | null, set: Pick<HColorSet, 'getColor' | 'getColorOrNull'>): Colors {
    if (captured === undefined || captured === null) return Colors.empty();
    return Colors.parse(captured, set, this.mainType);
  }

  /** `simpleColor(mainType)` / `simpleColor(mainType, id)`. @see ColorParser.java:69-76 */
  static simpleColor(mainType: ColorType, id = 'COLOR'): ColorParser {
    return new ColorParser(id, `(${COLORS_REGEXP})?`, mainType);
  }

  /** @see ColorParser.java:78-80 */
  static mandatoryColor(mainType: ColorType): ColorParser {
    return new ColorParser('COLOR', `(${COLORS_REGEXP})`, mainType);
  }

  /** `simpleColor(optPrefix, mainType)`. @see ColorParser.java:82-85 */
  static simpleColorWithPrefix(optPrefix: string, mainType: ColorType): ColorParser {
    return new ColorParser('COLOR', `(?:${optPrefix} (${COLORS_REGEXP}))?`, mainType);
  }

  /** `getRegex()`: the `RegexLeaf(1, name, pattern)` `simpleColor` built. @see ColorParser.java:113-115 */
  getRegex(): RegexLeaf {
    return new RegexLeaf(1, this.name, this.regexSource);
  }

  /** `exp1()`: `simpleColor(null).regex`, a `COLOR` group (the old parsers' name for it). @see ColorParser.java:89-91 */
  static exp1(): RegexLeaf {
    return new RegexLeaf(1, 'COLOR', `(${COLORS_REGEXP})?`);
  }

  /** `BACKCOLOR`, one group. @see ColorParser.java:93-95 */
  static exp2(): RegexLeaf {
    return new RegexLeaf(1, 'BACKCOLOR', `(${COLOR_REGEXP})?`);
  }

  /** `BACKCOLOR2`, one group. @see ColorParser.java:97-99 */
  static exp3(): RegexLeaf {
    return new RegexLeaf(1, 'BACKCOLOR2', `(${COLOR_REGEXP})?`);
  }
}
