/**
 * `ChartDiagram`'s nested enums, apart from the diagram so the renderers can read
 * them without an import cycle. `ChartDiagram.ts` re-exports them.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/ChartDiagram.java:54-68
 */

/** @see ChartDiagram.java:54-56 */
export const LegendPosition = {
  NONE: 'NONE',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  TOP: 'TOP',
  BOTTOM: 'BOTTOM',
} as const;
export type LegendPosition = (typeof LegendPosition)[keyof typeof LegendPosition];

/** @see ChartDiagram.java:58-60 */
export const GridMode = { OFF: 'OFF', MAJOR: 'MAJOR', BOTH: 'BOTH' } as const;
export type GridMode = (typeof GridMode)[keyof typeof GridMode];

/** @see ChartDiagram.java:62-64 */
export const StackMode = { GROUPED: 'GROUPED', STACKED: 'STACKED' } as const;
export type StackMode = (typeof StackMode)[keyof typeof StackMode];

/** @see ChartDiagram.java:66-68 */
export const Orientation = { VERTICAL: 'VERTICAL', HORIZONTAL: 'HORIZONTAL' } as const;
export type Orientation = (typeof Orientation)[keyof typeof Orientation];
