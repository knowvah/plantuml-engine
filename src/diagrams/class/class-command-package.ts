/**
 * `CommandPackage`'s line regex and its CODE/DISPLAY reads -- the
 * `package Name {` opening form of the class diagram (registered by
 * `ClassDiagramFactory` only; the description family opens `package` groups
 * through `CommandPackageWithUSymbol`).
 *
 * Upstream #2846 (399471171e8) replaced the single `NAME [as AS]` pair with a
 * `RegexOr` of two orderings, each with its own groups:
 *
 *   branch 1: CODE1 (`CODE_BAREWORD` | `QUOTED_DISPLAY`) [`as` DISPLAY1]
 *   branch 2: DISPLAY2 `as` CODE2 (`[%pLN_.]+`)
 *
 * `QUOTED_DISPLAY` needs at least one character inside the quotes, so
 * `package "" as p {` no longer matches, and `CODE_BAREWORD` admits only
 * letters, digits, `_`, `.` and `$`, so `package foo-bar {` falls through to
 * the next command (`CommandPackageWithUSymbol`, whose SYMBOL alternation
 * includes `package`).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/CommandPackage.java:79-137
 */
import { eventuallyRemoveStartingAndEndingDoubleQuote } from '../../core/url/Url.js';
import { NOTE_COLOR } from './class-notes.js';

/** `%g` -- PlantUML's double-quote class (the set `class-command-containers.ts` expands). */
const G = String.raw`["“”]`;
const NOT_G = String.raw`[^"“”]`;

/** `[%pLN_.$]*` (`CommandPackage.java:87`): zero or more, so `package {` matches with an empty CODE1. */
const CODE_BAREWORD = String.raw`[\p{L}\p{N}_.$]*`;
/** `[%g][^%g]+[%g]` (`CommandPackage.java:89`). */
const QUOTED_DISPLAY = `${G}${NOT_G}+${G}`;

/**
 * The full `CommandPackage` line (`CommandPackage.java:91-137`). Groups:
 * 1 VISIBILITY, 2 CODE1, 3 DISPLAY1, 4 DISPLAY2, 5 CODE2, 6 TAGS1,
 * 7 STEREOTYPE, 8 TAGS2, 9 URL, 10 COLOR. The tail after the RegexOr (TAGS,
 * STEREOTYPE, URL, COLOR) is the port's existing rendering of
 * `Stereotag.pattern()`, `StereotypePattern.optional`, `UrlBuilder.OPTIONAL`
 * and `ColorParser.simpleColor(BACK)`, unchanged by #2846.
 */
export const COMMAND_PACKAGE_RE = new RegExp(
  String.raw`^(?:([-#+~]))?\s*package\s+` +
    `(?:(${CODE_BAREWORD}|${QUOTED_DISPLAY})(?:\\s+as\\s+(${QUOTED_DISPLAY}))?` +
    String.raw`|(${QUOTED_DISPLAY})\s+as\s+([\p{L}\p{N}_.]+))` +
    String.raw`((?:\s+\$[^\s{}"'<>$]+)*)(?:\s*(<<.+?>>))?((?:\s+\$[^\s{}"'<>$]+)*)(?:\s*(\[\[[^\]]*\]\]))?\s*` +
    NOTE_COLOR +
    String.raw`\s*\{\s*$`,
  'iu',
);

/** The `getLazzy("CODE", 0)` / `getLazzy("DISPLAY", 0)` reads, raw (quotes kept), like the regex result. */
export interface CommandPackageRaw {
  readonly code: string;
  readonly display: string | undefined;
}

/**
 * `arg.getLazzy("CODE", 0)` / `arg.getLazzy("DISPLAY", 0)`: only one branch of
 * the RegexOr fires, so exactly one of CODE1/CODE2 is set, and at most one of
 * DISPLAY1/DISPLAY2.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/CommandPackage.java:159-160,198-199
 */
export function commandPackageRaw(match: RegExpExecArray): CommandPackageRaw {
  // Exactly one of CODE1 (group 2, possibly empty) / CODE2 (group 5) is defined.
  const code = match[2] ?? match[5]!;
  return { code, display: match[3] ?? match[4] };
}

/** `executeArg`'s reads after `eventuallyRemoveStartingAndEndingDoubleQuote` (`CommandPackage.java:198-199`). */
export interface CommandPackageArgs {
  readonly idRaw: string;
  readonly display: string | undefined;
}

/**
 * `idRaw` / `display`, quotes stripped (`StringUtils.java:87-92`, format
 * `"([:`). An empty `idRaw` is `executeArg`'s "Error in name" (java:201-202).
 */
export function commandPackageArgs(match: RegExpExecArray): CommandPackageArgs {
  const raw = commandPackageRaw(match);
  const idRaw = eventuallyRemoveStartingAndEndingDoubleQuote(raw.code, '"([:')!;
  const display =
    raw.display === undefined ? undefined : eventuallyRemoveStartingAndEndingDoubleQuote(raw.display, '"([:')!;
  return { idRaw, display };
}
