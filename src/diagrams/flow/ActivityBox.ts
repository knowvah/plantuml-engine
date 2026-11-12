/**
 * `ActivityBox`: a flow box — the label in serif 14, black, inside a
 * 25-rounded `MY_YELLOW` rectangle stroked `MY_RED` at 1.5, inset 10.
 * Nothing is styleable: `FlowDiagramFactory` has no `skinparam` (flp D3).
 *
 * The label is one `Display` element (`Display.create(label)`), so a typed
 * `\n` stays literal (`cov-label-newline`), while `%newline()`'s
 * `Jaws.BLOCK_E1_NEWLINE` splits in the creole sheet (`cov-label-newline-fn`)
 * (flp D8).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/flowdiagram/ActivityBox.java
 */
import { FontConfiguration as AbelFontConfiguration } from '../../core/abel/FontConfiguration.js';
import type { Tile } from '../../core/golem/Tile.js';
import { Back } from '../../core/klimt/Back.js';
import { HColors } from '../../core/klimt/color/HColors.js';
import { Display } from '../../core/klimt/creole/Display.js';
import { bridgeFontConfiguration } from '../../core/klimt/font/FontConfigurationBridge.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { UFontFactory } from '../../core/klimt/font/UFontFactory.js';
import { Fore } from '../../core/klimt/Fore.js';
import { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import type { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import { URectangle } from '../../core/klimt/shape/URectangle.js';
import { SpriteContainerEmpty } from '../../core/klimt/sprite/SpriteContainerEmpty.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UStroke } from '../../core/klimt/UStroke.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { SkinParamClasspath } from '../../core/skin/SkinParamFresh.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/flowdiagram/ActivityBox.java:58 */
const CORNER = 25;
/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/flowdiagram/ActivityBox.java:59 */
const MARGIN = 10;
/** `UFontFactory.serif(14)`. @see ActivityBox.java:70 */
const FONT_SIZE = 14;
/** `UStroke.withThickness(1.5)`. @see ActivityBox.java:97 */
const BORDER_THICKNESS = 1.5;

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/flowdiagram/ActivityBox.java:56 */
export class ActivityBox implements TextBlock {
  /** @see ActivityBox.java:64 */
  private readonly tb: TextBlock;

  /**
   * `classpath` is port-only (ADR-2): the jar-resident sprite and emoji
   * stores `new SpriteContainerEmpty()` reads off the classpath.
   * @see ActivityBox.java:66-73
   */
  constructor(
    private readonly tile: Tile,
    private readonly id: string,
    private readonly label: string,
    classpath?: SkinParamClasspath,
  ) {
    const font = UFontFactory.serif(FONT_SIZE);
    const fc = bridgeFontConfiguration(AbelFontConfiguration.blackBlueTrue(font));
    const spriteContainer = new SpriteContainerEmpty(classpath?.sprites, classpath?.emoji);
    const ctx = { fontConfiguration: fc, spriteContainer, atomOps: spriteContainer.atomOps(fc) };
    this.tb = Display.create(label).create(ctx, HorizontalAlignment.LEFT);
  }

  /** @see ActivityBox.java:75-77 */
  getTile(): Tile {
    return this.tile;
  }

  /** @see ActivityBox.java:79-81 */
  getId(): string {
    return this.id;
  }

  /** @see ActivityBox.java:83-85 */
  getLabel(): string {
    return this.label;
  }

  /** @see ActivityBox.java:87-100 */
  drawU(ugIn: UGraphic): void {
    const dimTotal = this.calculateDimension(ugIn.getStringBounder());
    const widthTotal = dimTotal.getWidth();
    const heightTotal = dimTotal.getHeight();
    const rect = URectangle.build(widthTotal, heightTotal).rounded(CORNER);
    let ug = ugIn.apply(new Fore(HColors.MY_RED));
    ug = ug.apply(new Back(HColors.MY_YELLOW));
    ug.apply(UStroke.withThickness(BORDER_THICKNESS)).draw(rect);

    this.tb.drawU(ug.apply(new UTranslate(MARGIN, MARGIN)));
  }

  /** @see ActivityBox.java:102-108 */
  calculateDimension(stringBounder: StringBounder): XDimension2D {
    const dim = this.tb.calculateDimension(stringBounder);
    return dim.delta(2 * MARGIN, 2 * MARGIN);
  }
}
