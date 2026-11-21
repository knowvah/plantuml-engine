/**
 * PORT-ONLY -- the player-stacking arithmetic of `TimingDiagram` (`getUTranslateForPlayer`,
 * `getUTranslateForPlayerFrame`, `getPart1MaxWidth`), `drawMessages` and `getBreakBackColor` as functions over the
 * players in declaration order, so `TimingDiagram.ts` stays under the file cap (D16). Each cites its Java method.
 */
import { HColors } from '../../core/klimt/color/HColors.js';
import { HColorSimple } from '../../core/klimt/color/HColorSimple.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { HColor } from '../../core/style/Value.js';
import { TimeArrow } from './graphic/TimeArrow.js';
import type { Player } from './Player.js';
import type { TimeMessage } from './TimeMessage.js';
import type { SkinParam } from './timing-skin-param.js';

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

/**
 * The back colour masking a break over a player: its own background, else the document's, else white when that is
 * absent or transparent (`HColor#isTransparent` is false but for a transparent `HColorSimple`).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/TimingDiagram.java:175-182
 */
export function getBreakBackColor(player: Player, skinParam: SkinParam): HColor {
  const general = player.getGeneralBackgroundColor();
  if (general !== undefined) return general;
  const back = skinParam.getBackgroundColor();
  if (back instanceof HColorSimple && back.isTransparent()) return HColors.WHITE;
  return back;
}

/**
 * Returns silently when either projection is `null` (java:259-260, D7).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/TimingDiagram.java:246-266
 */
export function drawMessages(
  players: Iterable<Player>,
  ug: UGraphic,
  message: TimeMessage,
  skinParam: SkinParam,
): void {
  const player1 = message.getPlayer1();
  const player2 = message.getPlayer2();

  const stringBounder = ug.getStringBounder();

  const translate1 = getUTranslateForPlayer(players, player1, stringBounder);
  const translate2 = getUTranslateForPlayer(players, player2, stringBounder);

  const pt1 = player1.panels().getTimeProjection(stringBounder, message.getTick1());
  const pt2 = player2.panels().getTimeProjection(stringBounder, message.getTick2());

  if (pt1 === undefined || pt2 === undefined) return;

  const timeArrow = TimeArrow.create(
    pt1.translated(translate1),
    pt2.translated(translate2),
    message.getLabel(),
    skinParam,
    message,
  );
  timeArrow.drawU(ug);
}
