/**
 * `CommandEndSomething`: `}` closes the innermost open block.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/nwdiag/CommandEndSomething.java
 */
import type { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import { concat, SP0 } from './nwdiag-command-text.js';
import type { NwDiagram } from './NwDiagram.js';

/** @see CommandEndSomething.java:53-58 */
export const END_SOMETHING_RE = concat(SP0, '\\}', SP0);

/** @see CommandEndSomething.java:60-63 */
export function applyEndSomething(diagram: NwDiagram): CommandExecutionResult {
  return diagram.closeSomething();
}
