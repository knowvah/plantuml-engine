/**
 * `CommandNwDiagInit`: an optional `nwdiag`, then an optional `{`. It matches
 * a blank or `{`-only line too, though `CommandNope` (registered first) takes a
 * blank one (nwp D8).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/nwdiag/CommandNwDiagInit.java
 */
import { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import { concat, SP0 } from './nwdiag-command-text.js';

/** @see CommandNwDiagInit.java:53-58 */
export const NWDIAG_INIT_RE = concat('(?<TYPE>nwdiag)?', SP0, '\\{?');

/** @see CommandNwDiagInit.java:60-63 */
export function applyNwDiagInit(): CommandExecutionResult {
  return CommandExecutionResult.ok();
}
