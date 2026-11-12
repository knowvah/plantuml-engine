/**
 * `ListSpriteDiagram`: the `@startsprites` page (or an `@startuml` block every earlier factory refused), a
 * `TitledDiagram` typed `HELP` — upstream borrows the help type, so the root says `data-diagram-type="HELP"` (lsp D8).
 * The page draws every sprite the diagram defined, each over its name.
 *
 * The skin param is built by the factory, as regex's is (`ListSpriteDiagramFactory.ts#parseListSprite`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/sprite/ListSpriteDiagram.java:57-106
 */
import { FontConfiguration } from '../../abel/FontConfiguration.js';
import { createAnnotations, type DiagramAnnotations } from '../../annotations/index.js';
import type { UmlSource } from '../../block-extractor.js';
import type { ScaleSpec } from '../../scale-command.js';
import { getAllSpriteNames, type SpriteRegistry } from '../../sprite-registry.js';
import { OptionKey } from '../../tim/EaterOption.js';
import type { PreprocessingArtifact } from '../../tim/PreprocessingArtifact.js';
import { TitledDiagram } from '../../TitledDiagram.js';
import { HColors } from '../color/HColors.js';
import { Display } from '../creole/Display.js';
import { bridgeFontConfiguration } from '../font/FontConfigurationBridge.js';
import type { StringBounder } from '../font/StringBounder.js';
import { UFontFactory } from '../font/UFontFactory.js';
import { HorizontalAlignment } from '../geom/HorizontalAlignment.js';
import { XDimension2D } from '../geom/XDimension2D.js';
import type { TextBlock } from '../shape/TextBlock.js';
import { TextBlockUtils } from '../shape/TextBlockUtils.js';
import type { UGraphic } from '../UGraphic.js';
import { UTranslate } from '../UTranslate.js';
import type { SkinParam } from './listsprite-skin-param.js';
import { asTextBlock } from './sprite-text-block.js';

/** `UFontFactory.sansSerif(14)`, the name's font. @see ListSpriteDiagram.java:85 */
const NAME_FONT_SIZE = 14;
/** `x += 30` after each sprite. @see ListSpriteDiagram.java:93 */
const GAP_X = 30;
/** `if (x > 1024)` wraps the row. @see ListSpriteDiagram.java:95 */
const WRAP_X = 1024;
/** `y += rawHeight + 50` on a wrap. @see ListSpriteDiagram.java:97 */
const GAP_Y = 50;
/** `sprite.asTextBlock(HColors.BLACK, null, 1.0, null)`'s scale. @see ListSpriteDiagram.java:87 */
const SPRITE_SCALE = 1.0;

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/sprite/ListSpriteDiagram.java:57 */
export class ListSpriteDiagram extends TitledDiagram {
  private readonly skinParam: SkinParam;
  /** `TitledDiagram`'s title/caption/legend/header/footer/mainframe, read by the chrome step. */
  readonly annotations: DiagramAnnotations = createAnnotations();
  /** `CommandScale*`'s target (`UmlDiagram#setScale`). */
  scale: ScaleSpec | undefined = undefined;

  /** `super(source, DiagramType.HELP, previous, preprocessing)`. @see ListSpriteDiagram.java:59-61 */
  constructor(source: UmlSource, preprocessing: PreprocessingArtifact, skinParam: SkinParam) {
    super(source, 'HELP', undefined, preprocessing);
    this.skinParam = skinParam;
  }

  /** `new DiagramDescription("(Sprites)")`. @see ListSpriteDiagram.java:63-65 */
  getDescription(): string {
    return '(Sprites)';
  }

  getSkinParam(): SkinParam {
    return this.skinParam;
  }

  /**
   * `skinParam.handwritten()`, else `!option handwritten` through the artifact.
   * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/TitledDiagram.java:114-118
   */
  isHandwritten(): boolean {
    if (this.skinParam.getValue('handwritten')?.toLowerCase() === 'true') return true;
    return this.preprocessing.getOptions().get(OptionKey.HANDWRITTEN)?.toLowerCase() === 'true';
  }

  /** The skin param's sprites, read by the sprite commands and the page. */
  get sprites(): SpriteRegistry {
    return this.skinParam.getSprites();
  }

  /**
   * The anonymous `TextBlock`: `drawU` lays out with `ug`, `calculateDimension` lays out with none.
   * @see ListSpriteDiagram.java:67-78
   */
  getTextBlock(): TextBlock {
    return {
      drawU: (ug: UGraphic): void => {
        this.layout(ug.getStringBounder(), ug);
      },
      calculateDimension: (stringBounder: StringBounder): XDimension2D => this.layout(stringBounder, null),
    };
  }

  /**
   * One sprite's block: the sprite over its name, centred.
   * @see ListSpriteDiagram.java:84-88
   */
  private spriteBlock(n: string): TextBlock {
    const ctx = {
      fontConfiguration: bridgeFontConfiguration(
        FontConfiguration.blackBlueTrue(UFontFactory.sansSerif(NAME_FONT_SIZE)),
      ),
      spriteContainer: this.skinParam,
      atomOps: this.skinParam.atomOps,
    };
    const blockName = Display.create(n).create(ctx, HorizontalAlignment.LEFT);
    const tb = asTextBlock({ registry: this.sprites, name: n }, HColors.BLACK, undefined, SPRITE_SCALE, undefined);
    return TextBlockUtils.mergeTB(tb, blockName, HorizontalAlignment.CENTER);
  }

  /**
   * The flow: each block at `(x, y)`, `x` advancing by its width plus 30, the row wrapping past 1024.
   * @see ListSpriteDiagram.java:80-104
   */
  private layout(stringBounder: StringBounder, ug: UGraphic | null): XDimension2D {
    let x = 0;
    let y = 0;
    let rawHeight = 0;
    let totalWidth = 0;
    for (const n of getAllSpriteNames(this.sprites)) {
      const tb = this.spriteBlock(n);
      if (ug !== null) tb.drawU(ug.apply(new UTranslate(x, y)));
      const dim = tb.calculateDimension(stringBounder);
      rawHeight = Math.max(rawHeight, dim.getHeight());
      x += dim.getWidth();
      x += GAP_X;
      totalWidth = Math.max(totalWidth, x);
      if (x > WRAP_X) {
        x = 0;
        y += rawHeight + GAP_Y;
        rawHeight = 0;
      }
    }
    return new XDimension2D(totalWidth, y + rawHeight);
  }
}
