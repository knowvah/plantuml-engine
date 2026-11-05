/**
 * `CommandPacketDiagStart`: an optional `packetdiag`, then an optional `{`.
 * It matches an empty line too, though `CommandNope` (registered first) takes that.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/packetdiag/command/CommandPacketDiagStart.java
 */
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import { SP0 } from './packet-command-text.js';

/** @see CommandPacketDiagStart.java:62-67 */
export const PACKET_DIAG_START_RE = new RegExp(`^(?<TYPE>packetdiag)?${SP0}\\{?$`, 'i');

/** @see CommandPacketDiagStart.java:69-72 */
export function applyPacketDiagStart(): CommandExecutionResult {
  return CommandExecutionResult.ok();
}
