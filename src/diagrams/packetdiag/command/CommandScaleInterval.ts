/**
 * `CommandScaleInterval`: `scale_interval = N`, how often a bit is numbered.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/packetdiag/command/CommandScaleInterval.java
 */
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { PacketDiagram } from '../PacketDiagram.js';
import { directive, parseJavaInt } from './packet-command-text.js';

/** `\d+`: unbounded, so `parseInt` can overflow. @see CommandScaleInterval.java:62-70 */
export const SCALE_INTERVAL_RE = directive('scale_interval', String.raw`(?<INTERVAL>\d+)`);

/** @see CommandScaleInterval.java:72-80 */
export function applyScaleInterval(system: PacketDiagram, match: RegExpExecArray): CommandExecutionResult {
  const interval = parseJavaInt(match.groups!['INTERVAL']!);
  if (interval === undefined) return CommandExecutionResult.error('Scale interval invalid');
  system.updateScaleInterval(interval);
  return CommandExecutionResult.ok();
}
