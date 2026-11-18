/**
 * `GraphicsPath` — the `path` egg's drawing: a `UMotif` drawn once, in black,
 * from (20, 20), on a fixed 50×50 white canvas.
 *
 * Upstream writes that canvas as a PNG (`EmptyImageBuilder` + `UGraphicG2d`,
 * `PngIO.write`). The port writes it as an SVG page on `UGraphicSvg`, because
 * `renderSync` returns SVG (ipe D2, the library-forced divergence signed by
 * the #178 ruling; DIVERGENCES.md). The canvas stays 50×50 whatever the
 * motif's extent, as the raster does (`SvgOption.fixedDim`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/eggs/GraphicsPath.java
 */
import type { ColorMapper } from '../../core/klimt/color/ColorMapper.js';
import { HColors } from '../../core/klimt/color/HColors.js';
import { VERSION_PLACEHOLDER } from '../../core/klimt/document-shell.js';
import { driverBounderFor } from '../../core/klimt/drawing/ink-walk.js';
import { basicSvgOption } from '../../core/klimt/drawing/svg/svg-option.js';
import { UGraphicSvg } from '../../core/klimt/drawing/svg/u-graphic-svg.js';
import { Fore } from '../../core/klimt/Fore.js';
import { UMotif } from '../../core/klimt/UMotif.js';
import type { StringMeasurer } from '../../core/measurer.js';

/** `new EmptyImageBuilder(null, 50, 50, XColor.WHITE, stringBounder)`. @see GraphicsPath.java:74 */
const IMAGE_SIZE = 50;
/** `motif.drawHorizontal(ug..., 20, 20, 1)`. @see GraphicsPath.java:81 */
const MOTIF_ORIGIN = 20;
/** @see GraphicsPath.java:81 */
const MOTIF_REPETITIONS = 1;

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/eggs/GraphicsPath.java:56 */
export class GraphicsPath {
  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/eggs/GraphicsPath.java:61-64 */
  constructor(
    private readonly colorMapper: ColorMapper,
    private readonly path: string,
  ) {}

  /**
   * The page as an SVG document, in place of `PngIO.write(im, ...)`'s PNG
   * bytes. `measurer` stands in for `FileFormat.PNG.getDefaultStringBounder()`;
   * the page draws no text.
   * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/eggs/GraphicsPath.java:66-70
   */
  writeImage(measurer: StringMeasurer): string {
    return this.createImage(measurer);
  }

  /**
   * The motif is built here, at export (java:80), so a character outside
   * `A-Z`/`a-w` throws `IllegalArgumentException` from `UMotif` here too (D3).
   * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/eggs/GraphicsPath.java:72-88
   */
  private createImage(measurer: StringMeasurer): string {
    const size = { width: IMAGE_SIZE, height: IMAGE_SIZE };
    const option = basicSvgOption({
      minDim: size,
      fixedDim: size,
      backcolor: HColors.WHITE,
      colorMapper: this.colorMapper,
    });
    const ug = UGraphicSvg.build(0, option, VERSION_PLACEHOLDER, driverBounderFor(measurer), measurer);
    const motif = new UMotif(this.path);
    // `ug.apply((UChange) HColors.BLACK)`: the port spells an `HColor` change as `Fore` (`Fore.ts`).
    motif.drawHorizontal(ug.apply(new Fore(HColors.BLACK)), MOTIF_ORIGIN, MOTIF_ORIGIN, MOTIF_REPETITIONS);
    return ug.getSvgString();
  }
}
