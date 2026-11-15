/**
 * cdd3-T10 (S-4t): the colour half of a relationship's trailing
 * `#color[;key:color]` spec (`CommandLinkClass.java:368`'s
 * `link.setColors(color().getColor(...))`, `color()` =
 * `ColorParser.simpleColor(ColorType.LINE)` at `:173-174`). Split out of
 * `class-relationship-parser.ts` (500-line hook cap).
 */

import { HColorSet } from '../../core/klimt/color/HColorSet.js';

/** The two `Colors` entries a class link reads back. */
export interface RelColors {
  /** `getColor(ColorType.ARROW, ColorType.LINE)` (`SvekEdge.java:884-885`). */
  line?: string;
  /** `getColor(ColorType.TEXT)` -- `FontConfiguration#mute`
   *  (`klimt/font/FontConfiguration.java:195-201`), applied to the link's
   *  label font at `SvekEdge.java:260-262`. */
  text?: string;
}

/**
 * Port of the `Colors(String, HColorSet, ColorType)` tokenizer with
 * `mainType = LINE`: `#` stripped, `;`-separated; a bare token without a
 * `.` is the LINE colour; `name:value` keys by `ColorType.getType(name)`
 * (the part before any `.`, `ColorType.java:41-47`); `shadowing:` is not a
 * colour. Later tokens overwrite earlier ones (`map.put`). The
 * `line.dashed`/`.dotted`/`.bold` stroke half (`Colors.java:118-123`) is
 * not carried here. Colour names stay raw (with a leading `#`), resolved
 * at render time like `Relationship.colorOverride`; a value `getColorOrNull`
 * rejects is null, so it clears its key.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/color/Colors.java:95-124
 */
export function parseRelColors(spec: string | undefined): RelColors {
  if (spec === undefined) return {};
  // A key mapped to `undefined` is upstream's `map.put(key, null)` (`Colors.java:111-113`).
  const map = new Map<string, string | undefined>();
  for (const s of spec.replace(/#/g, '').split(';')) {
    if (s === '') continue;
    const x = s.indexOf(':');
    if (x === -1) {
      if (!s.includes('.')) map.set('line', `#${s}`);
      continue;
    }
    const name = s.slice(0, x).toLowerCase();
    if (name === 'shadowing') continue;
    const value = s.slice(x + 1);
    // `set.getColorOrNull(value)`: an unparseable value claims its key as null (ucol T2b).
    map.set(
      name.split('.')[0] ?? name,
      HColorSet.instance().getColorOrNull(value) === undefined ? undefined : `#${value}`,
    );
  }
  const line = map.get('arrow') ?? map.get('line');
  const text = map.get('text');
  return { ...(line !== undefined ? { line } : {}), ...(text !== undefined ? { text } : {}) };
}
