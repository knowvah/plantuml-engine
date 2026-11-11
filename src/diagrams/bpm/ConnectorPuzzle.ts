import type { Placeable } from './Placeable.js';

/**
 * `ConnectorPuzzle.Where`: the four stub directions, in declaration order
 * (an `EnumSet` iterates that way, D9).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/ConnectorPuzzle.java:39-56
 */
export enum Where {
  NORTH = 'NORTH',
  EAST = 'EAST',
  SOUTH = 'SOUTH',
  WEST = 'WEST',
}

/** `Where.values()`. */
export const WHERE_VALUES: readonly Where[] = [Where.NORTH, Where.EAST, Where.SOUTH, Where.WEST];

/** `Where#coding`. @see ConnectorPuzzle.java:41,43-45 */
const CODING: Readonly<Record<Where, number>> = { NORTH: 1, EAST: 2, SOUTH: 4, WEST: 8 };

/** `name().substring(0, 1)`. @see ConnectorPuzzle.java:47-49 */
export function toShortString(where: Where): string {
  return where.substring(0, 1);
}

/** @see ConnectorPuzzle.java:51-53 */
export function getCoding(where: Where): number {
  return CODING[where];
}

/**
 * ConnectorPuzzle — a placeable with a set of stub directions.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/ConnectorPuzzle.java:37-64
 */
export interface ConnectorPuzzle extends Placeable {
  /** @see ConnectorPuzzle.java:58 */
  append(where: Where): void;
  /** @see ConnectorPuzzle.java:60 */
  remove(where: Where): void;
  /** @see ConnectorPuzzle.java:62 */
  have(where: Where): boolean;
}
