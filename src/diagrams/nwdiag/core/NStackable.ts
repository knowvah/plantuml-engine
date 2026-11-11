/**
 * NStackable — what `NwDiagram`'s open-block stack holds: a network or a group.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/nwdiag/core/NStackable.java
 */
import type { HColor } from '../../../core/style/Value.js';

/** @see NStackable.java:39-45 */
export interface NStackable {
  setDescription(description: string | null): void;
  setColor(color: HColor | null): void;
}
