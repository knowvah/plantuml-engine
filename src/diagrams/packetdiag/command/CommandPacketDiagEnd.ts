/**
 * `CommandPacketDiagEnd`: an optional `}` alone on its line, accepted anywhere.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/packetdiag/command/CommandPacketDiagEnd.java
 */
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import { SP0 } from './packet-command-text.js';

/** @see CommandPacketDiagEnd.java:62-66 */
export const PACKET_DIAG_END_RE = new RegExp(`^${SP0}\\}?${SP0}$`, 'i');

/** @see CommandPacketDiagEnd.java:70-73 */
export function applyPacketDiagEnd(): CommandExecutionResult {
  return CommandExecutionResult.ok();
}
