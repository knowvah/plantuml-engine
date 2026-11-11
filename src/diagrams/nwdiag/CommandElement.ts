/**
 * `CommandElement`: a server name, an optional `[definition]`, an optional `;`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/nwdiag/CommandElement.java
 */
import type { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import { concat, SP0 } from './nwdiag-command-text.js';
import type { NwDiagram } from './NwDiagram.js';

/** `DEFINITION`'s group 1 is the bracket's content. @see CommandElement.java:53-60 */
export const ELEMENT_RE = concat(SP0, '(?<NAME>[-.%pLN_]+)', SP0, '(\\[(?<DEFINITION>.*)\\])?', ';?');

/** `diagram.addElement(arg.get("NAME", 0), arg.get("DEFINITION", 1))`. @see CommandElement.java:62-65 */
export function applyElement(diagram: NwDiagram, match: RegExpExecArray): CommandExecutionResult {
  return diagram.addElement(match.groups!['NAME']!, match.groups!['DEFINITION']);
}
