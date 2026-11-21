/**
 * The time-axis labels of `TimingRuler`: its nested `TimeLabel` class and the time-axis unit placement of
 * `getTimeLabels` (upstream db06d70e18e, #2982), kept beside `TimingRuler.ts` so that file stays under the size limit.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/TimingRuler.java
 */
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';

/** The least gap between the unit and the time value before it. @see TimingRuler.java:70 */
const UNIT_GAP = 6;

/** A time label, its x and its width. @see TimingRuler.java:389-403 */
export interface TimeLabel {
  readonly text: TextBlock;
  readonly x: number;
  readonly width: number;
}

/** `TimeLabel#getRight`. @see TimingRuler.java:400-402 */
function getRight(label: TimeLabel): number {
  return label.x + label.width;
}

/**
 * The unit is right-aligned on the last tick of the axis, so that it never makes the diagram wider: the time values
 * it would overlap are removed instead. Mutates and returns `result`, as Java's list.
 * @see TimingRuler.java:435-444
 */
export function withUnit(result: TimeLabel[], unit: TimeLabel): TimeLabel[] {
  while (result.length > 0 && getRight(result[result.length - 1] as TimeLabel) + UNIT_GAP > unit.x) result.pop();
  result.push(unit);
  return result;
}
