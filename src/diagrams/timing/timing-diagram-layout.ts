/**
 * PORT-ONLY -- the player-stacking arithmetic of `TimingDiagram` (`getUTranslateForPlayer`,
 * `getUTranslateForPlayerFrame`, `getPart1MaxWidth`) as functions over the players in declaration order, so
 * `TimingDiagram.ts` stays under the file cap (D16). Each cites its Java method.
 */
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { Player } from './Player.js';

/**
 * Throws `IllegalArgumentException` for a player not in the map (java:270, D7). The commented-out
 * `getHeightHighlights` lines (java:262-264) stay comments:
 * `// if (y == 0) { y += getHeightHighlights(stringBounder); }`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/TimingDiagram.java:255-272
 */
export function getUTranslateForPlayer(
  players: Iterable<Player>,
  candidate: Player | undefined,
  stringBounder: StringBounder,
): UTranslate {
  let y = 0;
  for (const player of players) {
    y += player.getFrameHeight(stringBounder);
    if (candidate === player) return UTranslate.dy(y);

    y += player.panels().getFullHeight(stringBounder);
  }
  if (candidate === undefined) return UTranslate.dy(y);

  throw new Error('java.lang.IllegalArgumentException');
}

/**
 * Throws `IllegalArgumentException` for a player not in the map (java:288, D7); java:279-281 stay comments.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/TimingDiagram.java:274-290
 */
export function getUTranslateForPlayerFrame(
  players: Iterable<Player>,
  candidate: Player | undefined,
  stringBounder: StringBounder,
): UTranslate {
  let y = 0;
  for (const player of players) {
    if (candidate === player) return UTranslate.dy(y);

    y += player.getFrameHeight(stringBounder);
    y += player.panels().getFullHeight(stringBounder);
  }
  if (candidate === undefined) return UTranslate.dy(y);

  throw new Error('java.lang.IllegalArgumentException');
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/TimingDiagram.java:222-229 */
export function getPart1MaxWidth(players: Iterable<Player>, stringBounder: StringBounder): number {
  let width = 0;
  for (const player of players) {
    const widthLeftPanel = player.panels().getLeftPanelWidth(stringBounder);
    width = Math.max(width, widthLeftPanel);
  }
  return width;
}
