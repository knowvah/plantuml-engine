import type { StringBounder } from '../../../core/klimt/font/StringBounder.js';
import type { UGraphic } from '../../../core/klimt/UGraphic.js';
import { Panels, type PanelsArgs } from './Panels.js';

/**
 * A panel with nothing to the left of the time axis but a 5 px margin.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/graphic/PanelsNoLeft.java:47-64
 */
export abstract class PanelsNoLeft extends Panels {
  protected constructor(args: PanelsArgs) {
    super(args);
  }

  /** java:50-53 */
  public override drawLeftPanel(_ug: UGraphic, _fullAvailableWidth: number): void {
    // no-op
  }

  /** java:55-58 */
  public override getLeftPanelWidth(_stringBounder: StringBounder): number {
    return Panels.LEFT_PANEL_MIN_WIDTH;
  }
}
