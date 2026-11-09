import { Url } from './Url.js';
import { RegexLeaf } from '../regex/RegexLeaf.js';
import { RegexOptional } from '../regex/RegexOptional.js';
import { transform } from '../regex/Pattern2.js';
import { UrlMode } from './UrlMode.js';

/**
 * UrlBuilder — parses PlantUML `[[...]]` hyperlink syntax into a {@link
 * Url}: quoted/plain link, optional `{tooltip}`, optional trailing label,
 * plus an optional `topurl` base prefixed onto relative links.
 *
 * Upstream: url/UrlBuilder.java — ported in full EXCEPT the two `IRegex`
 * composer constants (see below). `Url.ts`'s own module doc comment
 * anticipated this pull: "UrlBuilder ... joins whichever mission ports
 * the ... parsing that calls it" — that caller is SI1/T7's
 * `cucadiagram/Member.ts` (Member.java:93/:115).
 *
 * ## Command-grammar constants
 *
 * `MANDATORY`/`OPTIONAL` (java:48-49) are `RegexLeaf`/`RegexOptional` values of the regex composer
 * (`src/core/regex/`, ported by laep T1b for `CommandLinkActivity`).
 *
 * ## Pattern2 translation
 *
 * Upstream compiles the five pattern strings through `Pattern2.cmpile`,
 * which substitutes `%`-tokens (`%s` → whitespace incl. NBSP, `%g` →
 * double-quote variants, ...) and compiles CASE_INSENSITIVE
 * (regex/Pattern2.java:51-61/:120). No `Pattern2` class exists in this
 * port (established: patterns are translated inline —
 * `abel/Stereostyles.ts`); {@link transform} carries the substitution
 * table so the five sources stay VERBATIM upstream text, and so
 * `Member.ts` can compose `getRegexp()` into its own `Pattern2` pattern.
 * `matches()` → anchored `^(?:...)$` compile; `find()` → unanchored.
 * Java CASE_INSENSITIVE (ASCII folding) → `iu` flags (Unicode folding —
 * strictly wider; links are ASCII-cased in practice).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/url/UrlBuilder.java
 */

/** `Pattern2.transform` lives with `Pattern2` (`../regex/Pattern2.ts`, so the regex composer can use it without an import
 *  cycle through this file); re-exported for its existing importers.
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/regex/Pattern2.java (transform) */
export { transform };

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/url/UrlBuilder.java:46 */
export const URL_KEY = 'URL';

// Code review: composed regex grammar (UrlBuilder.ts's URL patterns, preprocessor.ts's skinparam grammar) has not been run through a static ReDoS checker. Revisit if diagram sources are ever attacker-supplied at scale, or if these patterns are extended with additional nested quantifiers.
/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/url/UrlBuilder.java:51-52 */
const START_PART = '\\[\\[[%s]*';
const END_PART = '[%s]*\\]\\]';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/url/UrlBuilder.java:54-58 */
const S_QUOTED =
  START_PART +
  '[%g]([^%g]+)[%g]' + // Quoted part
  '(?:[%s]*\\{([^{}]*)\\})?' + // Optional tooltip
  '(?:[%s]([^%s\\{\\}\\[\\]][^\\[\\]]*))?' + // Optional label
  END_PART;

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/url/UrlBuilder.java:60-62 */
const S_ONLY_TOOLTIP =
  START_PART +
  '\\{(.*)\\}' + // Tooltip
  END_PART;

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/url/UrlBuilder.java:64-68 */
const S_ONLY_TOOLTIP_AND_LABEL =
  START_PART +
  '\\{([^{}]*)\\}' + // Tooltip
  '[%s]*' +
  '([^\\[%s\\{\\}\\[\\]][^\\[\\]]*)' + // Label
  END_PART;

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/url/UrlBuilder.java:70-74 */
const S_LINK_TOOLTIP_NOLABEL =
  START_PART +
  '([^\\s%g{}\\[\\]]+?)' + // Link
  '[%s]*' +
  '\\{(.+)\\}' + // Tooltip
  END_PART;

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/url/UrlBuilder.java:76-80 */
const S_LINK_WITH_OPTIONAL_TOOLTIP_WITH_OPTIONAL_LABEL =
  START_PART +
  '([^%s%g\\[\\]]+?)' + // Link
  '(?:[%s]*\\{([^{}]*)\\})?' + // Optional tooltip
  '(?:[%s]([^%s\\{\\}\\[\\]][^\\[\\]]*))?' + // Optional label
  END_PART;

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/url/UrlBuilder.java:82-88 */
export function getRegexp(): string {
  return (
    S_QUOTED +
    '|' +
    S_ONLY_TOOLTIP +
    '|' +
    S_ONLY_TOOLTIP_AND_LABEL +
    '|' +
    S_LINK_TOOLTIP_NOLABEL +
    '|' +
    S_LINK_WITH_OPTIONAL_TOOLTIP_WITH_OPTIONAL_LABEL
  );
}

/** `new RegexLeaf(12, URL_KEY, "(" + getRegexp() + ")")`: 1 outer group plus 3+1+2+2+3 of the five alternatives.
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/url/UrlBuilder.java:48 */
export const MANDATORY: RegexLeaf = new RegexLeaf(12, URL_KEY, '(' + getRegexp() + ')');

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/url/UrlBuilder.java:49 */
export const OPTIONAL: RegexOptional = new RegexOptional(MANDATORY);

/** One `Pattern2` compiled both ways: `anchored` backs `Matcher#matches`
 *  (STRICT), `anywhere` backs `Matcher#find` (ANYWHERE) — the `(?:...)`
 *  wrapper adds no capture group, so group numbering is unchanged. */
interface CompiledPattern2 {
  readonly anchored: RegExp;
  readonly anywhere: RegExp;
}

/** `Pattern2.cmpile` (regex/Pattern2.java:93-107 + compileInternal
 *  :109-121): `%`-token transform, then CASE_INSENSITIVE compile. */
function cmpile(source: string): CompiledPattern2 {
  const transformed = transform(source);
  return {
    anchored: new RegExp(`^(?:${transformed})$`, 'iu'),
    anywhere: new RegExp(transformed, 'iu'),
  };
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/url/UrlBuilder.java:90-94 */
const QUOTED = cmpile(S_QUOTED);
const ONLY_TOOLTIP = cmpile(S_ONLY_TOOLTIP);
const ONLY_TOOLTIP_AND_LABEL = cmpile(S_ONLY_TOOLTIP_AND_LABEL);
const LINK_TOOLTIP_NOLABEL = cmpile(S_LINK_TOOLTIP_NOLABEL);
const LINK_WITH_OPTIONAL_TOOLTIP_WITH_OPTIONAL_LABEL = cmpile(S_LINK_WITH_OPTIONAL_TOOLTIP_WITH_OPTIONAL_LABEL);

export class UrlBuilder {
  private readonly topurl: string | null;
  private readonly mode: UrlMode;

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/url/UrlBuilder.java:99-102 */
  constructor(topurl: string | null, mode: UrlMode) {
    this.topurl = topurl;
    this.mode = mode;
  }

  /** Java `Matcher#group(n)` returns `null` for an unmatched OPTIONAL
   *  group; JS yields `undefined` — normalized to `null` (`?? null`) so
   *  the {@link Url} constructor sees upstream's exact inputs. Required
   *  groups cannot be undefined on a successful match (`as string`).
   *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/url/UrlBuilder.java:104-128 */
  getUrl(s: string): Url | null {
    let m: RegExpExecArray | null;
    m = this.matchesOrFind(QUOTED, s);
    if (m !== null) return new Url(this.withTopUrl(m[1] as string), m[2] ?? null, m[3] ?? null);

    m = this.matchesOrFind(ONLY_TOOLTIP, s);
    if (m !== null) return new Url('', m[1] as string, null);

    m = this.matchesOrFind(ONLY_TOOLTIP_AND_LABEL, s);
    if (m !== null) return new Url('', m[1] as string, m[2] as string);

    m = this.matchesOrFind(LINK_TOOLTIP_NOLABEL, s);
    if (m !== null) return new Url(this.withTopUrl(m[1] as string), m[2] as string, null);

    m = this.matchesOrFind(LINK_WITH_OPTIONAL_TOOLTIP_WITH_OPTIONAL_LABEL, s);
    if (m !== null) return new Url(this.withTopUrl(m[1] as string), m[2] ?? null, m[3] ?? null);

    // #lizard forgives -- faithful port of upstream's 5-pattern cascade
    // (UrlBuilder.java:104-128); CCN is inflated by the pattern literals.
    return null;
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/url/UrlBuilder.java:130-138 */
  private matchesOrFind(p: CompiledPattern2, s: string): RegExpExecArray | null {
    if (this.mode === UrlMode.STRICT) return p.anchored.exec(s);
    else if (this.mode === UrlMode.ANYWHERE) return p.anywhere.exec(s);
    else throw new Error('IllegalStateException');
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/url/UrlBuilder.java:140-146 */
  private withTopUrl(url: string): string {
    if (!url.startsWith('http:') && !url.startsWith('https:') && !url.startsWith('file:') && this.topurl !== null)
      return this.topurl + url;

    return url;
  }
}
