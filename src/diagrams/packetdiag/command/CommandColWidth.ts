/**
 * `CommandColWidth`: `colwidth = N` (1 to 3 digits), the bits per row.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/packetdiag/command/CommandColWidth.java
 */
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { PacketDiagram } from '../PacketDiagram.js';
import { directive, parseJavaInt } from './packet-command-text.js';

/** @see CommandColWidth.java:65-73 */
export const COL_WIDTH_RE = directive('colwidth', String.raw`(?<WIDTH>\d{1,3})`);

/** `\d{1,3}` never fails `parseInt`; the arm is kept as Java has it. @see CommandColWidth.java:75-86 */
export function applyColWidth(system: PacketDiagram, match: RegExpExecArray): CommandExecutionResult {
  const width = match.groups!['WIDTH'];
  if (width !== undefined) {
    const parsed = parseJavaInt(width);
    if (parsed === undefined) return CommandExecutionResult.error('Width must be an integer');
    system.setColWidth(parsed);
  }
  return CommandExecutionResult.ok();
}
