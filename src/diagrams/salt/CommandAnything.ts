import { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import { javaTrim } from '../../core/java-number-format.js';

/**
 * `RegexConcat(start, (.*), end)`: every line matches. `Pattern2` compiles
 * case-insensitive (`regex/Pattern2.java:114`), immaterial for `.*`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/salt/CommandAnything.java:54-58
 */
export const COMMAND_ANYTHING_PATTERN = /^(.*)$/;

/** The text a first line must not be. @see CommandAnything.java:70 */
const SALT_KEYWORD = 'salt';

/** @see CommandAnything.java:71 */
const NOT_NEEDED_ANYMORE = 'This is not needed anymore.';

/**
 * The slice of `PSystemSalt` `CommandAnything#executeArg` reaches: `size()`
 * and `add(String)` (PSystemSalt.java:103-109).
 */
export interface CommandAnythingTarget {
  size(): number;
  add(s: string): void;
}

/**
 * CommandAnything — the salt factory's catch-all: every line no common
 * command claimed is salt data. Registered with `doTrim` false
 * (`super(false, …)`, java:51), so `s` is the raw line, indentation kept.
 *
 * A first data line `salt` is an execution error: the `@startuml` + `salt`
 * wrapper predates `@startsalt`. `s.trim()` is Java's `String#trim` (every
 * char `<= ' '` stripped), `javaTrim`; not `StringUtils.trin`, which also strips U+00A0.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/salt/CommandAnything.java:48-76
 */
export function executeArg(diagram: CommandAnythingTarget, s: string): CommandExecutionResult {
  if (diagram.size() === 0 && javaTrim(s) === SALT_KEYWORD) return CommandExecutionResult.error(NOT_NEEDED_ANYMORE);
  diagram.add(s);
  return CommandExecutionResult.ok();
}
