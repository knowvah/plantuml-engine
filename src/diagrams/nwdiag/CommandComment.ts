/**
 * `CommandComment`: a `//` line, ignored.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/nwdiag/CommandComment.java
 */
import { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import { concat, SP0 } from './nwdiag-command-text.js';

/** @see CommandComment.java:53-60 */
export const COMMENT_RE = concat(SP0, '//', '.*');

/** @see CommandComment.java:62-65 */
export function applyComment(): CommandExecutionResult {
  return CommandExecutionResult.ok();
}
