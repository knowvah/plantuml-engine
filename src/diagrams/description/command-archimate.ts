/**
 * `CommandArchimate.java`'s single-line leaf form, moved out of `parser.ts`
 * (file cap) by cdd8-T1c when it gained the `<<$archimate/icon>>` rewrite.
 *
 * @see net/sourceforge/plantuml/descdiagram/command/CommandArchimate.java
 */
import { compileUpstream } from '../../core/command/CommandCreateElementFull.js';
import { KEYWORD_TO_SYMBOL } from '../../core/descriptive-keywords.js';
import { COLOR_REGEXP, COLORS_REGEXP } from '../../core/klimt/color/ColorParser.js';
import { getRegexp } from '../../core/url/UrlBuilder.js';
import { extractNodeStereotype, makeNode, parseNameSection } from './parse-helpers.js';
import { emitNode, type ParseState } from './parse-state.js';
import { leafDisplayName } from './namespace-groups.js';

/**
 * `archimate #color (CODE | DISPLAY "as" CODE | CODE "as" DISPLAY) STEREOTYPE?`
 * — `CommandArchimate.java`'s single-line leaf form (T8,
 * description-leaf-sizing-audit). The mandatory `#color` token PRECEDES
 * CODE/DISPLAY here — the only `KEYWORD_TO_SYMBOL` keyword where color is
 * required and leads, rather than optional and trailing. Every other
 * keyword's grammar leaves `parseNameSection`'s `remainder` starting at the
 * quote (if any), so its `splitLeadingQuote` quote-protection (guillemets
 * INSIDE a quoted display are literal text, never STEREOTYPE) engages
 * correctly; feeding it `#color "..."` unstripped defeats that check
 * entirely (the remainder starts with `#`, not `"`), letting
 * `extractNodeStereotype` reach inside the quotes. Stripping the color
 * HERE, before `parseNameSection` ever sees the rest, keeps that guard
 * intact — verified against `archimate #Business "<<inside>> Hello"`
 * (co-located test).
 *
 * `CommandArchimatePackage` (`{ … }` group) is filed, not implemented — see
 * plans/s1l-leaf-sizing/ledger.md. A line missing the color token (upstream:
 * no command matches, no entity created) falls through to the generic
 * `KEYWORD_TO_SYMBOL` dispatch (`command-table-containers.ts` rule 14)
 * instead, which has no color requirement — more lenient than upstream on
 * that one malformed-input edge, documented in the co-located test.
 */
const ARCHIMATE_RE = /^archimate\s+(#\S+)\s+(.+)$/i;

/** The icon token `StereotypePattern.optionalArchimate` admits,
 *  `(\<\<[-\w]+?\>\>)` (`stereo/StereotypePattern.java:83`), chevrons off. */
const ARCHIMATE_ICON_RE = /^[-\w]+$/;

/**
 * `CommandArchimate.java:146-154`: `icon = removeChevronBrackets(STEREOTYPE)`
 * and, when present, the leaf's stereotype is REPLACED by
 * `Stereotype.build("<<$archimate/" + icon + ">>", ...)` — a sprite
 * stereotype, so `EntityImageDescription.java:194-195` draws the
 * `archimate/<icon>` sprite. `Stereotype#getLabel`'s archimate case
 * (`Stereotype.java:171-172`) still yields `icon` as the label, which only
 * draws when the sprite does not resolve. A run that is not one `[-\w]+`
 * token never matches upstream's STEREOTYPE and is left as parsed.
 */
function archimateStereotype(labels: readonly string[] | undefined): ReturnType<typeof extractNodeStereotype> {
  const icon = labels?.length === 1 ? labels[0]! : undefined;
  if (icon === undefined || !ARCHIMATE_ICON_RE.test(icon)) return undefined;
  return extractNodeStereotype(`<<$archimate/${icon}>>`);
}

/**
 * `CommandArchimateMultilines.java:76-90`: `archimate #color CODE <<icon>> [url] [#color] [`. The text on the opening
 * and closing lines is dropped (`lines.subExtract(1, 1)`, `:157`), and `END` is any line ending `]` (`:71-72`).
 */
const ARCHIMATE_MULTILINE_RE = compileUpstream(
  String.raw`^archimate[%s]+(?:${COLORS_REGEXP})?[%s]+(?<CODE>[%pLN_.]+)[%s]*(?<STEREOTYPE><<[-\w]+?>>)?[%s]*` +
    String.raw`(?:${getRegexp()})?[%s]*(?<COLOR2>${COLOR_REGEXP})?[%s]*\[.*$`,
);

function tryArchimateMultilines(state: ParseState, line: string): boolean {
  const g = ARCHIMATE_MULTILINE_RE.exec(line)?.groups;
  if (g === undefined) return false;
  const code = g['CODE']!;
  const icon =
    g['STEREOTYPE'] === undefined ? undefined : extractNodeStereotype(`<<$archimate/${g['STEREOTYPE'].slice(2, -2)}>>`);
  // Both colour leaves are named COLOR (`:80,85`), and the later entry of `RegexComposed#createPartialMatch`'s map wins
  // (`RegexComposed.java:109`), so the leading `#Technology` is parsed and dropped (jar: ceboti-36 fills `#F1F1F1`).
  const node = makeNode(code, code, 'rectangle', icon?.stereotypes, g['COLOR2'], undefined, icon?.sprite);
  emitNode(state, node);
  state.pendingElement = { terminator: 'archimate', node, lines: [], baseIndent: undefined };
  return true;
}

export function tryArchimate(state: ParseState, line: string): number | null {
  if (tryArchimateMultilines(state, line)) return 1;
  const m = ARCHIMATE_RE.exec(line);
  if (m === null) return null;
  const symbol = KEYWORD_TO_SYMBOL.get('archimate');
  if (symbol === undefined) return null;
  const color = m[1]!;
  const { id, display, stereotype, tags, stereotypeSprite } = parseNameSection(m[2]!);
  const finalDisplay = display === id ? leafDisplayName(id, state.namespaceSeparator) : display;
  const icon = archimateStereotype(stereotype);
  const node =
    icon === undefined
      ? makeNode(id, finalDisplay, symbol, stereotype, color, tags, stereotypeSprite)
      : makeNode(id, finalDisplay, symbol, icon.stereotypes, color, tags, icon.sprite);
  node.archimate = true;
  emitNode(state, node);
  return 1;
}
