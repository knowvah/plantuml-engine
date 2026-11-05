/**
 * `CommandSameHeight`: `same_height = true|false`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/packetdiag/command/CommandSameHeight.java
 */
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { PacketDiagram } from '../PacketDiagram.js';
import { directive } from './packet-command-text.js';

/** @see CommandSameHeight.java:62-70 */
export const SAME_HEIGHT_RE = directive('same_height', '(?<VALUE>true|false)');

/** @see CommandSameHeight.java:72-78 */
export function applySameHeight(system: PacketDiagram, match: RegExpExecArray): CommandExecutionResult {
  const value = match.groups!['VALUE']!;
  system.setSameHeight(value.toLowerCase() === 'true');
  return CommandExecutionResult.ok();
}
