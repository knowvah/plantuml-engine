/**
 * The `CommandCreateElementMultilines` opener patterns, shared by the description parser and by
 * `preprocessor-collector.ts` (core), which must know where a `[ ... ]` description body opens to skip an
 * embedded `{{ }}` diagram that starts on the opener's own line (`label a [{{`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/descdiagram/command/CommandCreateElementMultilines.java:110-122
 */
import { KEYWORD_TO_SYMBOL } from './descriptive-keywords.js';

export const ALL_KW_ALT = [...KEYWORD_TO_SYMBOL.keys()]
  .sort((a, b) => b.length - a.length)
  .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  .join('|');

/**
 * `StereotypePattern.optional("STEREO")` + `UrlBuilder.OPTIONAL` +
 * `ColorParser.exp1()` — the decoration run both
 * `CommandCreateElementMultilines` phases place between CODE and their own
 * opener token (`CommandCreateElementMultilines.java:99-102, :111-114`).
 *
 * The color alternative must accept the FULL color/style spec, not just
 * `#word`: `node B #red|green;line.dashed;line:blue [` otherwise failed this
 * pattern entirely and fell through to KEYWORD_RE, which swallowed the spec
 * AND the trailing `[` into the element's name (titona-45-jile471 measured
 * 3.50in against the jar's 0.82in, S1L-e). Same character class `RE_COLOR`
 * uses in parse-helpers-strings.ts.
 *
 * CAPTURING (S1L tail G9-E1): the run used to be `(?:…)*`, so a
 * `file policy <<policy>> [` open form matched — and then dropped the
 * stereotype on the floor, leaving `node.stereotype` unset and the `«policy»`
 * row unmeasured (fariba-82-xolu802). Callers split the captured run with
 * the same `extractNodeStereotype`/`extractColor` the single-line path uses.
 */
export const ELEMENT_DECORATION_RUN = '((?:\\s*(?:<<[^>]+>>|\\[\\[[^\\]]*\\]\\]|#[\\w:;.#\\\\/|-]+))*)';

/** CommandCreateElementMultilines TYPE1: `<keyword> <code> [stereo][url]
 *  [#color] [` opening a multi-line `[ … ]` description block. The line ends
 *  with `[` and (crucially) no matching `]`; the body is closed by a line
 *  ending in `]`. Groups: 1 TYPE, 2 CODE, 3 decoration run, 4 the opener's
 *  own `DESC` tail (everything after the `[`).
 *  @see ~/git/plantuml/.../descdiagram/command/CommandCreateElementMultilines.java:110-122 */
export const ELEMENT_MULTILINE_OPEN_RE = new RegExp(
  `^(${ALL_KW_ALT})\\s+([\\p{L}\\p{N}_.]+)` + ELEMENT_DECORATION_RUN + '\\s*\\[([^\\[]*)$',
  'iu',
);
