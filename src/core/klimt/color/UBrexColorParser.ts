/**
 * `UBrexColorParser`: the `#color` token as a `UnicodeBracketedExpression` part, for the commands written in
 * UBrex (the `ColorParser` of the regex commands has `ColorParser.ts`). The part is a `UBrexNamed` capture
 * called `name`; unlike `ColorParser.simpleColor`'s it is NOT optional ("WARNING, this now NOT optional",
 * java:77), so a command wraps it in `UBrexOptional` or `UBrexOr` itself.
 *
 * `exp1`..`exp7` are commented out upstream (java:101-136) and are not ported.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/color/UBrexColorParser.java:44-141
 */
import { Colors } from '../../abel/Colors.js';
import type { ColorType } from '../../abel/ColorType.js';
import type { RegexResult } from '../../regex/RegexResult.js';
import { UBrexLeaf } from '../../ubrex/builder/UBrexLeaf.js';
import { UBrexNamed } from '../../ubrex/builder/UBrexNamed.js';
import type { UBrexPart } from '../../ubrex/builder/UBrexPart.js';
import type { HColorSet } from './HColorSet.js';

/** `# 〇+〴w 〇?〘 「-\|/」 〇+〴w 〙`, i.e. `#\w+[-\\|/]?\w+`. @see UBrexColorParser.java:48 */
const COLOR_REGEXP = '# 〇+〴w 〇?〘 「-\\|/」 〇+〴w 〙';

export class UBrexColorParser {
  private readonly regex: UBrexPart;
  private readonly name: string;
  private readonly mainType: ColorType;

  /** @see UBrexColorParser.java:57-61 */
  private constructor(name: string, regex: UBrexPart, mainType: ColorType) {
    this.regex = regex;
    this.name = name;
    this.mainType = mainType;
  }

  /**
   * `mainType == null` is `IllegalStateException` upstream: the type is non-optional here.
   * @see UBrexColorParser.java:63-71
   */
  getColor(arg: RegexResult, set: Pick<HColorSet, 'getColor' | 'getColorOrNull'>): Colors {
    const data = arg.getLazzy(this.name, 0);
    if (data === undefined) return Colors.empty();

    return Colors.parse(data, set, this.mainType);
  }

  /** `simpleColor(mainType)` and `simpleColor(mainType, id)`. @see UBrexColorParser.java:73-85 */
  static simpleColor(mainType: ColorType, id = 'COLOR'): UBrexColorParser {
    return new UBrexColorParser(id, new UBrexNamed(id, new UBrexLeaf(COLOR_REGEXP)), mainType);
  }

  /** @see UBrexColorParser.java:138-140 */
  getRegex(): UBrexPart {
    return this.regex;
  }
}
