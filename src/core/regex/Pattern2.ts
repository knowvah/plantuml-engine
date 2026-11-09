/**
 * `Pattern2` -- the `%`-token expander and the CASE_INSENSITIVE compile every `RegexLeaf` grammar goes through.
 *
 * Port notes: Java's `Pattern2` object (lazy compile, `Matcher2`) is the pair of functions below.
 * CASE_INSENSITIVE (ASCII folding) becomes the `iu` flags (Unicode folding, strictly wider; the grammars are
 * ASCII-cased in practice, as `UrlBuilder.ts` already records). `u` mode rejects the identity escapes `\<` and `\>`
 * that Java accepts, so {@link toJsPattern} drops the backslash before them (the same hand translation
 * `StereotypePattern` callers made before the composer existed). `%s` is `\s `; Java's `\s` is
 * `[ \t\n\x0B\f\r]` where JS's also holds the Unicode spaces, so a line with U+2003 or U+FEFF matches here and not
 * in the jar (no corpus line carries one).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/regex/Pattern2.java:51-121
 */

/** `Pattern2.QUOTED_REPLACEMENTS`, non-TeaVM branch; `%g`'s last char is `Jaws.BLOCK_E1_INVISIBLE_QUOTE`.
 *  @see Pattern2.java:51-61, jaws/Jaws.java:55 */
const QUOTED_REPLACEMENTS: Readonly<Record<string, string>> = {
  pLN: '\\p{L}\\p{N}',
  s: '\\s\\u00A0',
  q: "'\\u2018\\u2019",
  g: '"\\u201C\\u201D\\uE121',
};

/** @see Pattern2.java:63 (TRANSFORM_PATTERN) */
const TRANSFORM_PATTERN = /%(pLN|s|q|g)/g;

/** `Pattern2.transform`. @see Pattern2.java:121-140 */
export function transform(patternString: string): string {
  return patternString.replace(TRANSFORM_PATTERN, (_m, key: string) => QUOTED_REPLACEMENTS[key] as string);
}

/** Drops the backslash of `\<` and `\>`, which `u` mode refuses; every other pair is copied whole, so `\\<` stays. */
function dropIdentityEscapes(pattern: string): string {
  let out = '';
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern.charAt(i);
    if (c !== '\\' || i === pattern.length - 1) {
      out += c;
      continue;
    }
    const next = pattern.charAt(++i);
    out += next === '<' || next === '>' ? next : c + next;
  }
  return out;
}

/** The JS source of a Java `Pattern2` source: `%`-tokens expanded, `u`-mode escapes made legal. */
export function toJsPattern(patternString: string): string {
  return dropIdentityEscapes(transform(patternString));
}

/** `Pattern2.compileInternal`: `Pattern.compile(transform(p), CASE_INSENSITIVE)`. @see Pattern2.java:109-119 */
export function compileInternal(patternString: string): RegExp {
  return new RegExp(toJsPattern(patternString), 'iu');
}
