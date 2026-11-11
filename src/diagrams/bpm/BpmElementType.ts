/**
 * BpmElementType — what a `BpmElement` draws. `END` has no command (D8).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/BpmElementType.java:37-41
 */
export enum BpmElementType {
  START = 'START',
  END = 'END',
  MERGE = 'MERGE',
  DOCKED_EVENT = 'DOCKED_EVENT',
}
