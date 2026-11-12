/**
 * `TileGeometry`: the four sides of a golem tile plus `CENTER`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/golem/TileGeometry.java
 */

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/golem/TileGeometry.java:40-41 */
export enum TileGeometry {
  NORTH = 'NORTH',
  SOUTH = 'SOUTH',
  EAST = 'EAST',
  WEST = 'WEST',
  CENTER = 'CENTER',
}

/** The values in declaration order, `TileGeometry.values()`. @see TileGeometry.java:41 */
export const TILE_GEOMETRY_VALUES: readonly TileGeometry[] = [
  TileGeometry.NORTH,
  TileGeometry.SOUTH,
  TileGeometry.EAST,
  TileGeometry.WEST,
  TileGeometry.CENTER,
];

/**
 * `CENTER` (and `default`) throw: no command can reach it, since every
 * orientation comes from `[nsew]` (D5).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/golem/TileGeometry.java:43-57
 */
export function opposite(geometry: TileGeometry): TileGeometry {
  switch (geometry) {
    case TileGeometry.NORTH:
      return TileGeometry.SOUTH;
    case TileGeometry.SOUTH:
      return TileGeometry.NORTH;
    case TileGeometry.EAST:
      return TileGeometry.WEST;
    case TileGeometry.WEST:
      return TileGeometry.EAST;
    default:
      throw new Error('UnsupportedOperationException: TileGeometry.CENTER has no opposite');
  }
}

/**
 * The first character, upper-cased (`StringUtils.goUpperCase`).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/golem/TileGeometry.java:59-73
 */
export function fromString(s: string): TileGeometry {
  // Java's `s.charAt(0)` throws on an empty string; the regex `[nsew]` never passes one.
  const c = s.charAt(0).toUpperCase();
  switch (c) {
    case 'N':
      return TileGeometry.NORTH;
    case 'S':
      return TileGeometry.SOUTH;
    case 'E':
      return TileGeometry.EAST;
    case 'W':
      return TileGeometry.WEST;
    default:
      throw new Error(`IllegalArgumentException: ${s}`);
  }
}
