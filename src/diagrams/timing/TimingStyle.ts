/**
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/TimingStyle.java
 */
export const TimingStyle = {
  ROBUST: 'ROBUST',
  CONCISE: 'CONCISE',
  RECTANGLE: 'RECTANGLE',
} as const;
export type TimingStyle = (typeof TimingStyle)[keyof typeof TimingStyle];
