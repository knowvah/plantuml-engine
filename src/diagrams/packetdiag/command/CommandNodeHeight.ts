/**
 * `CommandNodeHeight`: `node_height = N` (1 to 3 digits), one bit row's pixel height.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/packetdiag/command/CommandNodeHeight.java
 */
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { PacketDiagram } from '../PacketDiagram.js';
import { directive, parseJavaInt } from './packet-command-text.js';

/** @see CommandNodeHeight.java:62-70 */
export const NODE_HEIGHT_RE = directive('node_height', String.raw`(?<HEIGHT>\d{1,3})`);

/** `\d{1,3}` never fails `parseInt`; the arm is kept as Java has it. @see CommandNodeHeight.java:72-81 */
export function applyNodeHeight(system: PacketDiagram, match: RegExpExecArray): CommandExecutionResult {
  // The original python implementation takes int, but it really should be a float number
  const height = parseJavaInt(match.groups!['HEIGHT']!);
  if (height === undefined) return CommandExecutionResult.error('Height must be an integer');
  system.updateNodeHeight(height);
  return CommandExecutionResult.ok();
}
