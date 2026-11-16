/**
 * The colour-validity rule (ucol D3, issue #145): every colour the jar draws is one of `#hex` (3, 4, 6 or 8 digits),
 * `none`, `black`, `white` or `url(#id)` — measured across all 5,938 cached oracles (2026-11-15). A colour token the
 * jar cannot resolve still yields one of these (`HColorSet.java:58-76`), so any other value in our output is a token
 * we passed through unresolved.
 *
 * Scanned: the `fill`, `stroke` and `stop-color` attributes, and the same three properties inside a `style`
 * attribute. The jar puts colours in `style` too: `UGraphicSvg` writes `style="stroke:#181818;stroke-width:1;"` on
 * every stroked shape. The cached oracles' `style` colours all pass the rule, except one Batik-drawn
 * `@startmath` root carrying `fill:yellow` (`unknown/caruta-83-deta919`), which is the jar's own output.
 */

/** A colour-carrying attribute. The leading boundary keeps `fill-opacity` and `stroke-width` out. */
const COLOUR_ATTRIBUTE = /(?<![\w-])(fill|stroke|stop-color)="([^"]*)"/g;
/** A colour-carrying property inside a `style` attribute value. */
const COLOUR_PROPERTY = /(?:^|;)\s*(fill|stroke|stop-color)\s*:\s*([^;]*?)\s*(?=;|$)/g;
const STYLE_ATTRIBUTE = /(?<![\w-])style="([^"]*)"/g;
const VALID = /^(#[0-9A-Fa-f]{3,4}|#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{8}|none|black|white|url\(#[^)]+\))$/;

/** The distinct `attr=value` strings in `svg` whose colour value the jar would never emit, in first-seen order. */
export function invalidColours(svg: string): string[] {
  const out = new Set<string>();
  const check = (attr: string, value: string): void => {
    if (!VALID.test(value)) out.add(`${attr}=${value}`);
  };
  // Each regex has exactly the groups read here, so every index is defined when the match is.
  for (const [, attr = '', value = ''] of svg.matchAll(COLOUR_ATTRIBUTE)) check(attr, value);
  for (const [, style = ''] of svg.matchAll(STYLE_ATTRIBUTE))
    for (const [, attr = '', value = ''] of style.matchAll(COLOUR_PROPERTY)) check(attr, value);
  return [...out];
}
