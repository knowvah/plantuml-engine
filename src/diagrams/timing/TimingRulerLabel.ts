/**
 * The time-axis labels of `TimingRuler`: its nested `TimeLabel` class and the time-axis unit placement and the
 * collision filter of `getTimeLabels` (upstream db06d70e18e, #2982; b066ee08c, #3028), kept beside `TimingRuler.ts` so that file stays under the size limit.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/TimingRuler.java
 */
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';

/** The least gap between the unit and the time value before it. @see TimingRuler.java:70 */
const UNIT_GAP = 6;
/** Minimal horizontal space between two time labels of the axis. @see TimingRuler.java:71-72 (upstream b066ee08c) */
const LABEL_GAP = 4;

/** A time label, its x and its width. @see TimingRuler.java:391-409 (upstream b066ee08c) */
export interface TimeLabel {
  readonly text: TextBlock;
  readonly x: number;
  readonly width: number;
}

/** `TimeLabel#getRight`. @see TimingRuler.java:402-404 (upstream b066ee08c) */
function getRight(label: TimeLabel): number {
  return label.x + label.width;
}

/** `TimeLabel#overlaps`: closer than `LABEL_GAP`. @see TimingRuler.java:406-408 (upstream b066ee08c) */
function overlaps(label: TimeLabel, other: TimeLabel): boolean {
  return label.x < getRight(other) + LABEL_GAP && other.x < getRight(label) + LABEL_GAP;
}

/** @see TimingRuler.java:411-416 (upstream b066ee08c) */
function overlapsAny(label: TimeLabel, others: readonly TimeLabel[]): boolean {
  for (const other of others) if (overlaps(other, label)) return true;
  return false;
}

/**
 * Events close in time give labels drawn on top of each other (#3028): going from left to right, a label that would
 * overlap the previous one is skipped. The labels of break edges are always kept, the regular ones give way to them.
 * `breakEdges` holds the very objects of `all` (Java's `contains` is by identity: `TimeLabel` has no `equals`).
 * @see TimingRuler.java:457-469 (upstream b066ee08c)
 */
export function withoutOverlaps(all: readonly TimeLabel[], breakEdges: readonly TimeLabel[]): TimeLabel[] {
  const result: TimeLabel[] = [];
  for (const label of all) {
    if (!breakEdges.includes(label)) {
      if (result.length > 0 && overlaps(result[result.length - 1] as TimeLabel, label)) continue;
      if (overlapsAny(label, breakEdges)) continue;
    }
    result.push(label);
  }
  return result;
}

/**
 * The unit is right-aligned on the last tick of the axis, so that it never makes the diagram wider: the time values
 * it would overlap are removed instead. Mutates and returns `result`, as Java's list.
 * @see TimingRuler.java:474-484 (upstream b066ee08c)
 */
export function withUnit(result: TimeLabel[], unit: TimeLabel): TimeLabel[] {
  while (result.length > 0 && getRight(result[result.length - 1] as TimeLabel) + UNIT_GAP > unit.x) result.pop();
  result.push(unit);
  return result;
}
