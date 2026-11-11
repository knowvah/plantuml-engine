/**
 * Staged — anything that spans a range of stages and a number of columns.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/nwdiag/next/Staged.java
 */
import type { NStage } from './NStage.js';

/** @see Staged.java:38-46 */
export interface Staged {
  getStart(): NStage;
  getEnd(): NStage;
  getNWidth(): number;
  contains(stage: NStage): boolean;
}
