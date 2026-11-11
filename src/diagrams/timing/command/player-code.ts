/**
 * PORT-ONLY home of `CommandTimeMessage.PLAYER_CODE`, which six commands of this package read
 * (`CommandAtPlayer`, `CommandChangeStateByPlayerCode`, `CommandConstraint`, `CommandNote`,
 * `CommandNoteLong`, `CommandTimeMessage`). `CommandTimeMessage.ts` (T3c) re-exports it as upstream's static.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandTimeMessage.java:56
 */
export const PLAYER_CODE = String.raw`([\p{L}_][%pLN_.]*)`;
