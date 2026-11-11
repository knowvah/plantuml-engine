/**
 * `CommandLink`: `a -- b`, an optional `;`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/nwdiag/CommandLink.java
 */
import type { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import { concat, SP0 } from './nwdiag-command-text.js';
import type { NwDiagram } from './NwDiagram.js';

/** @see CommandLink.java:53-63 */
export const LINK_RE = concat(SP0, '(?<NAME1>[%pLN_]+)', SP0, '--', SP0, '(?<NAME2>[%pLN_]+)', SP0, ';?');

/** @see CommandLink.java:65-70 */
export function applyLink(diagram: NwDiagram, match: RegExpExecArray): CommandExecutionResult {
  return diagram.link(match.groups!['NAME1']!, match.groups!['NAME2']!);
}
