/**
 * if-header -- the `if` opener line, split out of `if-dispatch.ts` (500-line
 * cap): `CommandIf4`, `CommandIf2`, `CommandIfLegacy1`, each with the exp4
 * colour upstream parses and only warns about (443598c29ce).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/command/CommandIf2.java
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/command/CommandIf4.java
 */
import { getRegexp, transform } from '../../core/url/UrlBuilder.js';
import { RE_IF, RE_IF4, RE_IF_LEGACY } from './dispatch-support.js';
import { splitExp4 } from './dispatch-stereogroup.js';
import { unescapeLabel, unescapeLabelNewlines } from './label-newlines.js';

export interface IfHeader {
  condition: string;
  thenLabel: string | undefined;
  /** The stereogroup, whose inner BACK colours the diamond (`CommandIf2.java:141-152`, `CommandIf4.java:126-131`). */
  group?: string | undefined;
  /** The exp4 `COLOR`, parsed and no longer applied: it only warns (`CommandIf2.java:136-138`, `CommandIf4.java:122-124`). */
  leadingColor?: string;
  /** `CommandIf2`'s `URL` group, raw (`[[...]]`), resolved against `topurl` at render (`CommandIf2.java:139-145`). */
  url?: string;
}

/** `CommandIf2.java:70-72`: `UrlBuilder.OPTIONAL`, `spaceZeroOrMore`, `ColorParser.exp4()` -- always matches. */
const RE_IF2_PREFIX = new RegExp(`^(?<url>${transform(getRegexp())})?\\s*(?:(?<color>#\\w+[-\\\\|/]?\\w+):)?`, 'iu');

/**
 * Tries the three `if`-opener spellings in upstream's registration order
 * (`ActivityDiagramFactory3.java:118-121`): `CommandIf4`'s `is`/`equals`
 * form, `CommandIf2`'s `then (label)?` form (now with an optional trailing
 * stereogroup, mission ubrr-T10 M4a), then `CommandIfLegacy1`'s `then when
 * LABEL` form (M4c). All three hand their label to the SAME
 * `diagram.startIf(test, when, ...)` call upstream-side, so they collapse
 * onto the one `thenLabel` field here.
 */
export function matchIfHeader(line: string): IfHeader | null {
  // `CommandIf4.java:66`: `ColorParser.exp4()` right at the start.
  const exp4 = splitExp4(line);
  const if4 = RE_IF4.exec(exp4.rest);
  if (if4 !== null) {
    return {
      condition: unescapeLabelNewlines(if4[1]!),
      thenLabel: unescapeLabel(if4[2]),
      group: if4[3],
      ...(exp4.color !== undefined ? { leadingColor: exp4.color } : {}),
    };
  }
  // `CommandIf2`'s leading `UrlBuilder.OPTIONAL`, `spaceZeroOrMore` and `ColorParser.exp4()` (`:70-72`): the URL
  // rides on the diamond (`:139-145`), the colour is "currently ignored" (`:129-130`, `:120-121`).
  const prefix = RE_IF2_PREFIX.exec(line)!;
  const if2 = RE_IF.exec(line.slice(prefix[0].length));
  if (if2 !== null) {
    const url = prefix.groups?.url;
    const leadingColor = prefix.groups?.color;
    return {
      condition: unescapeLabelNewlines(if2[1]!),
      thenLabel: unescapeLabel(if2[2]),
      group: if2[3],
      ...(url !== undefined ? { url } : {}),
      ...(leadingColor !== undefined ? { leadingColor } : {}),
    };
  }
  const legacy = RE_IF_LEGACY.exec(line);
  if (legacy !== null) {
    return { condition: unescapeLabelNewlines(legacy[1]!), thenLabel: unescapeLabel(legacy[2]!.trim()) };
  }
  return null;
}
