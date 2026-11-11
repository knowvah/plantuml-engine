import type { StringBounder } from '../../../core/klimt/font/StringBounder.js';
import type { TextBlock } from '../../../core/klimt/shape/TextBlock.js';
import { TextBlockUtils } from '../../../core/klimt/shape/TextBlockUtils.js';
import { ULine } from '../../../core/klimt/shape/ULine.js';
import type { UGraphic } from '../../../core/klimt/UGraphic.js';
import type { UStroke } from '../../../core/klimt/UStroke.js';
import { UTranslate } from '../../../core/klimt/UTranslate.js';
import type { HColor } from '../../../core/style/Value.js';
import { fore, timingStyle, type TimingSkinParam } from '../timing-klimt.js';

/** `TimingDiagram.marginX1` (TimingDiagram.java:76): the frame line starts that far left of the title. */
export const TIMING_DIAGRAM_MARGIN_X1 = 5;
/** The tail of the frame line goes up-right by this much past the title width (PlayerFrame.java:80). */
const TAIL_DX = 10;

/**
 * The title of a player and the line under it.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/graphic/PlayerFrame.java:53-118
 */
export class PlayerFrame {
  readonly #skinParam: TimingSkinParam;
  readonly #title: TextBlock;
  readonly #compact: boolean;

  public constructor(title: TextBlock, skinParam: TimingSkinParam, compact: boolean) {
    this.#title = title;
    this.#skinParam = skinParam;
    this.#compact = compact;
  }

  /** java:68-71 */
  #getLineColor(): HColor {
    return timingStyle(this.#skinParam).value('LineColor').asColor(this.#skinParam.getIHtmlColorSet());
  }

  /** java:73-76 */
  #getUStroke(): UStroke {
    return timingStyle(this.#skinParam).getStroke();
  }

  /** java:78-80 */
  public drawTitle(ug: UGraphic): void {
    this.#title.drawU(ug);
  }

  /** java:82-96 */
  public drawFrameTitle(ug: UGraphic): void {
    if (this.#title === TextBlockUtils.EMPTY_TEXT_BLOCK) return;
    this.#title.drawU(ug);

    if (this.#compact) return;

    ug = ug.apply(fore(this.#getLineColor())).apply(this.#getUStroke());
    const dimTitle = this.#title.calculateDimension(ug.getStringBounder());

    const widthTmp = dimTitle.getWidth() + 1;
    const height = dimTitle.getHeight() + 1;
    this.#drawLine(ug, -TIMING_DIAGRAM_MARGIN_X1, height, widthTmp, height, widthTmp + TAIL_DX, 0);
  }

  /** java:98-104 */
  public getHeight(stringBounder: StringBounder): number {
    const height = this.#title.calculateDimension(stringBounder).getHeight();
    if (this.#compact) return height - 1;
    return height + 1;
  }

  /** java:106-117: a polyline as consecutive `ULine`s. */
  #drawLine(ug: UGraphic, ...coord: number[]): void {
    for (let i = 0; i < coord.length - 2; i += 2) {
      const x1 = coord[i] as number;
      const y1 = coord[i + 1] as number;
      const x2 = coord[i + 2] as number;
      const y2 = coord[i + 3] as number;
      ug.apply(new UTranslate(x1, y1)).draw(new ULine(x2 - x1, y2 - y1));
    }
  }
}
