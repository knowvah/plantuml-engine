/** Draws one side of a player's panels at an origin and answers the elements the jar would print for it. */
import { UTranslate } from '../../../../src/core/klimt/UTranslate.js';
import type { Player } from '../../../../src/diagrams/timing/Player.js';
import { stringBounder, svgGraphic } from '../../mindmap/helpers/mindmap-skin.js';
import { svgElements } from './timing.js';

/** The right panel at (x, y): `drawRightPanel(ugPlayer.apply(widthPart1))` of `TimingDiagram#drawInternal`. */
export function drawRight(player: Player, x: number, y: number): string[] {
  const root = svgGraphic();
  player.panels().drawRightPanel(root.apply(new UTranslate(x, y)));
  return svgElements(root.getSvgString());
}

/** The left panel at (x, y), given the widest left panel of the diagram (`part1MaxWidth`). */
export function drawLeft(player: Player, x: number, y: number, available: number): string[] {
  const root = svgGraphic();
  player.panels().drawLeftPanel(root.apply(new UTranslate(x, y)), available);
  return svgElements(root.getSvgString());
}

/** `panels().getLeftPanelWidth` over the deterministic measurer. */
export function leftWidthOf(player: Player): number {
  return player.panels().getLeftPanelWidth(stringBounder());
}

/** `panels().getFullHeight` over the deterministic measurer. */
export function fullHeightOf(player: Player): number {
  return player.panels().getFullHeight(stringBounder());
}
