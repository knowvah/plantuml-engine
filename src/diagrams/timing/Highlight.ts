import { ColorType } from '../../core/abel/ColorType.js';
import type { Colors } from '../../core/abel/Colors.js';
import { HColors } from '../../core/klimt/color/HColors.js';
import type { Display } from '../../core/klimt/creole/Display.js';
import { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import { ULine } from '../../core/klimt/shape/ULine.js';
import { URectangle } from '../../core/klimt/shape/URectangle.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import type { UStroke } from '../../core/klimt/UStroke.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { Style } from '../../core/style/Style.js';
import type { HColor } from '../../core/style/Value.js';
import type { TimeTick } from './TimeTick.js';
import type { TimingRuler } from './TimingRuler.js';
import { back, fore, timingFontParamConfiguration, timingStyle, type TimingSkinParam } from './timing-klimt.js';

/**
 * `highlight 5 to 15 #Gold;line:DimGrey : Caption`: a band behind the diagram and two dashed edges over it.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/Highlight.java:57-136
 */
export class Highlight {
  readonly #tickFrom: TimeTick;
  readonly #tickTo: TimeTick;
  readonly #caption: Display;
  readonly #colors: Colors;
  readonly #skinParam: TimingSkinParam;

  /** java:65-71 */
  public constructor(
    skinParam: TimingSkinParam,
    tickFrom: TimeTick,
    tickTo: TimeTick,
    caption: Display,
    colors: Colors,
  ) {
    this.#tickFrom = tickFrom;
    this.#tickTo = tickTo;
    this.#caption = caption;
    this.#colors = colors;
    this.#skinParam = skinParam;
  }

  /** java:73-80: `root, element, timingDiagram, highlight`. */
  #getStyle(): Style {
    return timingStyle(this.#skinParam, 'highlight');
  }

  /** java:82-88 */
  #getBackColor(): HColor {
    const result = this.#colors.getColor(ColorType.BACK);
    // abel's `HColor` is a structural placeholder (`object`) for the style layer's `HColor`.
    if (result === undefined)
      return this.#getStyle().value('BackGroundColor').asColor(this.#skinParam.getIHtmlColorSet());
    return result as HColor;
  }

  /** java:90-96 */
  #getLineColor(): HColor {
    const result = this.#colors.getColor(ColorType.LINE);
    if (result === undefined) return this.#getStyle().value('LineColor').asColor(this.#skinParam.getIHtmlColorSet());
    return result as HColor;
  }

  /** java:98-100 */
  #getUStroke(): UStroke {
    return this.#getStyle().getStroke();
  }

  public getTickFrom(): TimeTick {
    return this.#tickFrom;
  }

  public getTickTo(): TimeTick {
    return this.#tickTo;
  }

  /** `getCaption()` (java:110-112) and `getCaption(ISkinParam)` (java:114-117), the second as one TS overload. */
  public getCaption(): Display;
  public getCaption(skinParam: TimingSkinParam): TextBlock;
  public getCaption(skinParam?: TimingSkinParam): Display | TextBlock {
    if (skinParam === undefined) return this.#caption;
    // `FontConfiguration.create(skinParam, FontParam.TIMING, null)`: the legacy font, not the style's.
    const fc = timingFontParamConfiguration(skinParam);
    return this.#caption.create(
      { fontConfiguration: fc, spriteContainer: skinParam, atomOps: skinParam.atomOps },
      HorizontalAlignment.LEFT,
    );
  }

  /** java:119-125: the band, no outline. */
  public drawHighlightsBack(ug: UGraphic, ruler: TimingRuler, height: number): void {
    ug = ug.apply(fore(HColors.none())).apply(back(this.#getBackColor()));
    const start = ruler.getPosInPixel(this.#tickFrom);
    const end = ruler.getPosInPixel(this.#tickTo);
    const rect = URectangle.build(end - start, height);
    ug.apply(UTranslate.dx(start)).draw(rect);
  }

  /** java:127-136: a vertical line at each end. */
  public drawHighlightsLines(ug: UGraphic, ruler: TimingRuler, height: number): void {
    ug = ug.apply(this.#getUStroke());
    ug = ug.apply(fore(this.#getLineColor()));
    const line = ULine.vline(height);
    const start = ruler.getPosInPixel(this.#tickFrom);
    const end = ruler.getPosInPixel(this.#tickTo);
    ug.apply(UTranslate.dx(start)).draw(line);
    ug.apply(UTranslate.dx(end)).draw(line);
  }
}
