/**
 * The regex leaves the nwdiag commands share. Each command is a
 * `SingleLineCommand2` with `doTrim = true` (`SingleLineCommand2.java:56-58`),
 * so the factory matches it against `StringUtils.trin(line)`, and its
 * `RegexConcat` compiles through `Pattern2` (`%pLN`, `%s`, CASE_INSENSITIVE),
 * which `core/regex/Pattern2.ts#compileInternal` ports.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/regex/RegexLeaf.java
 */
import { compileInternal } from '../../core/regex/Pattern2.js';

/** `RegexLeaf.spaceZeroOrMore()`. @see RegexLeaf.java */
export const SP0 = '[%s]*';

/** `RegexConcat.build(start(), leaves..., end())`, compiled by `Pattern2`. */
export function concat(...leaves: readonly string[]): RegExp {
  return compileInternal(`^${leaves.join('')}$`);
}

/** `arg.get(name, 0)`: an unmatched optional group is Java's `null`. */
export function group(match: RegExpExecArray, name: string): string | null {
  return match.groups?.[name] ?? null;
}
