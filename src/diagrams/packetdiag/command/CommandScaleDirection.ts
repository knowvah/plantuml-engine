/**
 * `CommandScaleDirection`: `scale_direction = ltr|rtl`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/packetdiag/command/CommandScaleDirection.java
 */
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { PacketDiagram } from '../PacketDiagram.js';
import { directive } from './packet-command-text.js';

/** @see CommandScaleDirection.java:64-72 */
export const SCALE_DIRECTION_RE = directive('scale_direction', '(?<DIR>ltr|rtl)');

/** @see CommandScaleDirection.java:74-82 */
export function applyScaleDirection(system: PacketDiagram, match: RegExpExecArray): CommandExecutionResult {
  const dir = match.groups!['DIR']?.toUpperCase() ?? 'LTR';
  system.setScaleDirection(dir);
  return CommandExecutionResult.ok();
}
