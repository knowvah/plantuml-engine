/**
 * `WireDiagram`: one `@startwire` block, a tree of `WBlock`s plus the spots and links drawn over it.
 *
 * Draw order is the Java's: the root tree, spots, horizontal links, vertical links (wrp D4). `print` measures with
 * AWT in every render (wrp D3): `FileFormat.PNG.getDefaultStringBounder()` is outside the oracle's deterministic seam.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/wire/WireDiagram.java:57-178
 */
import { createAnnotations, type DiagramAnnotations } from '../../core/annotations/index.js';
import type { UmlSource } from '../../core/block-extractor.js';
import { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import type { Display } from '../../core/klimt/creole/Display.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import type { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import { FontStyle, type FontConfiguration } from '../../core/klimt/shape/UText.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import { MeasurerStringBounder } from '../../core/measurer-bounder.js';
import { jarMeasurer } from '../../core/measurer-jar.js';
import type { FontSpec, StringMeasurer } from '../../core/measurer.js';
import type { ScaleSpec } from '../../core/scale-command.js';
import type { SpriteRegistry } from '../../core/sprite-registry.js';
import type { HColor } from '../../core/style/Value.js';
import { TitledDiagram } from '../../core/TitledDiagram.js';
import { OptionKey } from '../../core/tim/EaterOption.js';
import type { PreprocessingArtifact } from '../../core/tim/PreprocessingArtifact.js';
import { Spot } from './Spot.js';
import type { WArrowDirection } from './WArrowDirection.js';
import { WBlock } from './WBlock.js';
import { WLinkHorizontal } from './WLinkHorizontal.js';
import type { WLinkType } from './WLinkType.js';
import { WLinkVertical } from './WLinkVertical.js';
import type { SkinParam } from './wire-skin-param.js';

/** `UFontFace#isBold`: CSS weight 700 and above. @see UFontFace.java:158-160 */
const BOLD_CSS_WEIGHT = 700;

/** What a bounder receives: a `FontSpec`, carrying a `FontConfiguration`'s members on the atom path. */
type FontConfigurationLike = FontSpec & Partial<Pick<FontConfiguration, 'styles' | 'fontFace'>>;

/** `vlink`/`hlink`'s eight Java arguments under their Java names (wrp D11). */
export interface WireLinkArgs {
  readonly name1: string;
  readonly x1: string | undefined;
  readonly y1: string | undefined;
  readonly name2: string;
  readonly type: WLinkType;
  readonly direction: WArrowDirection;
  readonly color: HColor | undefined;
  readonly label: Display;
}

/**
 * Whether `font`, the `FontConfiguration` a creole atom hands the bounder, is bold. Java's `StringBounderAwt` measures
 * the font's real weight; `jarMeasurer` keys on `FontSpec.weight`, which the atom path leaves out (`cov-print-table`'s
 * bold header cells: `b` is 6.626 bold, 6.294 plain).
 */
function isBoldFont(font: FontConfigurationLike): boolean {
  return font.styles?.has(FontStyle.BOLD) === true || (font.fontFace?.cssWeight ?? 0) >= BOLD_CSS_WEIGHT;
}

/** The measure `jarMeasurer` gives a font whose weight it can read. */
const awtMeasurer: StringMeasurer = {
  measure: (text, font) => jarMeasurer.measure(text, isBoldFont(font) ? { ...font, weight: 'bold' } : font),
  getDescent: (font, text) => jarMeasurer.getDescent(font, text),
};

/** `FileFormat.PNG.getDefaultStringBounder()`: `new StringBounderAwt()`, which `jarMeasurer` reproduces (wrp D3). */
const AWT_BOUNDER: StringBounder = new MeasurerStringBounder(awtMeasurer);

export class WireDiagram extends TitledDiagram {
  private readonly skinParam: SkinParam;
  /** `TitledDiagram`'s title/caption/legend/header/footer/mainframe, read by the chrome step. */
  readonly annotations: DiagramAnnotations = createAnnotations();
  /** `CommandScale*`'s target (`UmlDiagram#setScale`). */
  scale: ScaleSpec | undefined = undefined;

  /** @see WireDiagram.java:59-62 */
  private readonly root = new WBlock('', UTranslate.none(), 0, 0, undefined);
  private readonly spots: Spot[] = [];
  private readonly hlinks: WLinkHorizontal[] = [];
  private readonly vlinks: WLinkVertical[] = [];

  /** The skin param is built by the factory, as regex's is. @see WireDiagram.java:68-70 */
  constructor(source: UmlSource, preprocessing: PreprocessingArtifact, skinParam: SkinParam) {
    super(source, 'WIRE', undefined, preprocessing);
    this.skinParam = skinParam;
  }

  getSkinParam(): SkinParam {
    return this.skinParam;
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/TitledDiagram.java:114-118 */
  isHandwritten(): boolean {
    if (this.skinParam.getValue('handwritten')?.toLowerCase() === 'true') return true;
    return this.preprocessing.getOptions().get(OptionKey.HANDWRITTEN)?.toLowerCase() === 'true';
  }

  /** The skin param's sprites, read by the sprite commands and the chrome step. */
  get sprites(): SpriteRegistry {
    return this.skinParam.getSprites();
  }

  /** @see WireDiagram.java:64-66 */
  getDescription(): string {
    return 'Wire Diagram';
  }

  /** @see WireDiagram.java:73-85 */
  getTextBlock(): TextBlock {
    return {
      drawU: (ug: UGraphic): void => {
        this.drawMe(ug);
      },
      calculateDimension: (_stringBounder: StringBounder): XDimension2D => this.root.getMaxDimension(),
    };
  }

  /** @see WireDiagram.java:87-98 */
  private drawMe(ug: UGraphic): void {
    this.root.drawMe(ug);
    for (const spot of this.spots) spot.drawMe(ug);
    for (const link of this.hlinks) link.drawMe(ug);
    for (const link of this.vlinks) link.drawMe(ug);
  }

  /** @see WireDiagram.java:100-103 */
  addComponent(
    indent: string,
    name: string,
    width: number,
    height: number,
    color: HColor | undefined,
  ): CommandExecutionResult {
    return this.root.addBlock(this.computeIndentationLevel(indent), name, width, height, color);
  }

  /** @see WireDiagram.java:105-108 */
  newColumn(indent: string): CommandExecutionResult {
    return this.root.newColumn(this.computeIndentationLevel(indent));
  }

  /** @see WireDiagram.java:110-118 */
  spot(name: string, color: HColor | undefined, x: string | undefined, y: string | undefined): CommandExecutionResult {
    const block = this.root.getBlock(name);
    if (block === undefined) return CommandExecutionResult.error('No such element ' + name);

    this.spots.push(new Spot(block, color, x, y));
    return CommandExecutionResult.ok();
  }

  /** @see WireDiagram.java:120-123 */
  wgoto(indent: string, x: number, y: number): CommandExecutionResult {
    return this.root.wgoto(this.computeIndentationLevel(indent), x, y);
  }

  /** @see WireDiagram.java:125-128 */
  wmove(indent: string, x: number, y: number): CommandExecutionResult {
    return this.root.wmove(this.computeIndentationLevel(indent), x, y);
  }

  /**
   * The cursor advances by an AWT height whichever measurer the render carries:
   * `final StringBounder stringBounder = FileFormat.PNG.getDefaultStringBounder();` (WireDiagram.java:133), and the
   * deterministic seam covers only SVG (`this == SVG || this == SVG_DETERMINISTIC`, FileFormat.java:185-186, wrp D3).
   * @see WireDiagram.java:130-135
   */
  print(indent: string, text: string): CommandExecutionResult {
    const level = this.computeIndentationLevel(indent);
    return this.root.print(AWT_BOUNDER, this.getSkinParam(), level, text);
  }

  /**
   * Two spaces are level 2, four are level 1, a tab is level 1 (wrp D4, `replace` is every occurrence, D9).
   * Private in the Java; visible here for the tests.
   * @see WireDiagram.java:137-140
   */
  computeIndentationLevel(indent: string): number {
    return indent.replaceAll('    ', '\t').length;
  }

  /** `name1` is checked first; `start` is resolved before `name2`'s position. @see WireDiagram.java:142-158 */
  vlink(args: WireLinkArgs): CommandExecutionResult {
    const { name1, x1, y1, name2, type, direction, color, label } = args;
    const block1 = this.root.getBlock(name1);
    if (block1 === undefined) return CommandExecutionResult.error('No such element ' + name1);

    const block2 = this.root.getBlock(name2);
    if (block2 === undefined) return CommandExecutionResult.error('No such element ' + name2);

    const start = block1.getNextOutVertical(x1, y1, type);
    const destination = block2.getAbsolutePosition('0', '0').getDy();
    this.vlinks.push(
      new WLinkVertical({ skinParam: this.getSkinParam(), start, destination, type, direction, color, label }),
    );
    return CommandExecutionResult.ok();
  }

  /** @see WireDiagram.java:160-176 */
  hlink(args: WireLinkArgs): CommandExecutionResult {
    const { name1, x1, y1, name2, type, direction, color, label } = args;
    const block1 = this.root.getBlock(name1);
    if (block1 === undefined) return CommandExecutionResult.error('No such element ' + name1);

    const block2 = this.root.getBlock(name2);
    if (block2 === undefined) return CommandExecutionResult.error('No such element ' + name2);

    const start = block1.getNextOutHorizontal(x1, y1, type);
    const destination = block2.getAbsolutePosition('0', '0').getDx();
    this.hlinks.push(
      new WLinkHorizontal({ skinParam: this.getSkinParam(), start, destination, type, direction, color, label }),
    );
    return CommandExecutionResult.ok();
  }
}
