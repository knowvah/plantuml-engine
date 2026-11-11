import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import type { IntricatedPoint } from './graphic/IntricatedPoint.js';
import type { TimeTick } from './TimeTick.js';

/**
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/TimeProjected.java
 */
export interface TimeProjected {
  /** `tick` is `undefined` where Java passes `null` (`PanelsState#getTimeProjection` answers `null` for it). */
  getTimeProjection(stringBounder: StringBounder, tick: TimeTick | undefined): IntricatedPoint | undefined;
}
