import type { TimeTick } from './TimeTick.js';
import type { TimingFormat } from './TimingFormat.js';

/**
 * What `TimeTickBuilder#parseTimeTick` reads from the diagram (`TimingDiagram implements Clocks`).
 * `undefined` stands for Java's `null`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/Clocks.java
 */
export interface Clocks {
  getNow(): TimeTick | undefined;
  getClockValue(clockName: string, nb: number): TimeTick | undefined;
  getCodeValue(code: string): TimeTick | undefined;
  getTimingFormatDate(): TimingFormat;
}
