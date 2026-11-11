/**
 * `CommandGroup`: `group`, an optional name, then `{`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/nwdiag/CommandGroup.java
 */
import type { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import { concat, group, SP0 } from './nwdiag-command-text.js';
import type { NwDiagram } from './NwDiagram.js';

/** @see CommandGroup.java:53-61 */
export const GROUP_RE = concat(SP0, 'group', SP0, '(?<NAME>[%pLN_]+)?', SP0, '\\{');

/** @see CommandGroup.java:63-66 */
export function applyGroup(diagram: NwDiagram, match: RegExpExecArray): CommandExecutionResult {
  return diagram.openGroup(group(match, 'NAME'));
}
