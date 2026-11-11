/**
 * Misspelling kept (D1). Java enum order: AUTOMATIC, HIDDEN, MANUAL.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/TimeAxisStategy.java:38
 */
export const TimeAxisStategy = {
  AUTOMATIC: 'AUTOMATIC',
  HIDDEN: 'HIDDEN',
  MANUAL: 'MANUAL',
} as const;
export type TimeAxisStategy = (typeof TimeAxisStategy)[keyof typeof TimeAxisStategy];
