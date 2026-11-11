/**
 * `CommandNetwork`: `network`, an optional name, then `{`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/nwdiag/CommandNetwork.java
 */
import type { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import { concat, group, SP0 } from './nwdiag-command-text.js';
import type { NwDiagram } from './NwDiagram.js';

/** @see CommandNetwork.java:53-61 */
export const NETWORK_RE = concat(SP0, 'network', SP0, '(?<NAME>[-.%pLN_]+)?', SP0, '\\{');

/** @see CommandNetwork.java:63-66 */
export function applyNetwork(diagram: NwDiagram, match: RegExpExecArray): CommandExecutionResult {
  return diagram.openNetwork(group(match, 'NAME'));
}
