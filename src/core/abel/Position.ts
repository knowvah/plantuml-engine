import { Rankdir } from '../klimt/geom/Rankdir.js';
import { Direction } from './Direction.js';

/**
 * Position — where a note (or similar satellite) sits relative to its
 * subject (`utils/Position.java`).
 *
 * SI1/T5 consumed-slice LOCAL port: `Entity#addNote`/`getNotes` and
 * `CucaNote` carry one. Upstream home is `utils/` — move to
 * `src/core/utils/Position.ts` when that package fills out.
 *
 * Ported members: the 4 values, `fromString`, `reverseDirection`,
 * `withRankdir` (laep-T1d, now that `klimt/geom/Rankdir` exists).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/utils/Position.java:43
 */
export const Position = {
  RIGHT: 'RIGHT',
  LEFT: 'LEFT',
  BOTTOM: 'BOTTOM',
  TOP: 'TOP',
} as const;
export type Position = (typeof Position)[keyof typeof Position];

/** `Position.fromString(String)` — case-insensitive `valueOf`. Throws on
 * an unknown name exactly where Java's `valueOf` would.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/utils/Position.java:45-47 */
export function fromString(s: string): Position {
  const upper = s.toUpperCase();
  if (upper in Position) return Position[upper as keyof typeof Position];
  throw new Error(`IllegalArgumentException: No enum constant Position.${upper}`);
}

/** `Position#reverseDirection()` — LEFT→RIGHT, RIGHT→LEFT; TOP/BOTTOM are
 * unsupported (upstream `UnsupportedOperationException`).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/utils/Position.java:66-74 */
export function reverseDirection(position: Position): Direction {
  if (position === Position.LEFT) return Direction.RIGHT;
  if (position === Position.RIGHT) return Direction.LEFT;
  throw new Error('UnsupportedOperationException');
}

/** `Position.withRankdir(Rankdir)`: under `left to right direction` every position turns a quarter
 * (RIGHT->BOTTOM, LEFT->TOP, BOTTOM->RIGHT, TOP->LEFT); top to bottom is the default and keeps it.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/utils/Position.java:49-66 */
export function withRankdir(position: Position, rankdir: Rankdir): Position {
  // Default
  if (rankdir === Rankdir.TOP_TO_BOTTOM) return position;

  if (position === Position.RIGHT) return Position.BOTTOM;
  if (position === Position.LEFT) return Position.TOP;
  if (position === Position.BOTTOM) return Position.RIGHT;
  if (position === Position.TOP) return Position.LEFT;
  throw new Error('IllegalStateException');
}
