/**
 * `@startdef`: the page draws only its start line (`@startdef(id=macro)`),
 * sans-serif 14 in black through `Display.getWithNewlines`, so a `\n` breaks
 * and creole markup applies. Body lines are stored and never read.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/definition/PSystemDefinition.java
 */
import { FontConfiguration } from '../../core/abel/FontConfiguration.js';
import type { UmlSource } from '../../core/block-extractor.js';
import { HColors } from '../../core/klimt/color/HColors.js';
import { Display } from '../../core/klimt/creole/Display.js';
import { bridgeFontConfiguration } from '../../core/klimt/font/FontConfigurationBridge.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { UFontFactory } from '../../core/klimt/font/UFontFactory.js';
import { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import type { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import { SpriteContainerEmpty } from '../../core/klimt/sprite/SpriteContainerEmpty.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import type { UStroke } from '../../core/klimt/UStroke.js';
import { Pragma } from '../../core/skin/Pragma.js';
import type { PreprocessingArtifact } from '../../core/tim/PreprocessingArtifact.js';
import { UgSimpleDiagram } from '../../core/UgSimpleDiagram.js';

/** `UFontFactory.sansSerif(14)`. @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/definition/PSystemDefinition.java:85 */
const DEFINITION_FONT_SIZE = 14;

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/definition/PSystemDefinition.java:59 */
export class PSystemDefinition extends UgSimpleDiagram {
  private readonly lines: string[] = [];

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/definition/PSystemDefinition.java:64-67 */
  constructor(
    source: UmlSource,
    private readonly startLine: string,
    preprocessing: PreprocessingArtifact,
  ) {
    super(source, preprocessing);
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/definition/PSystemDefinition.java:69-71 */
  getDescription(): string {
    return '(Definition)';
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/definition/PSystemDefinition.java:73-76 */
  override drawU(ug: UGraphic): void {
    this.buildTextBlock().drawU(ug);
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/definition/PSystemDefinition.java:78-82 */
  override calculateDimension(stringBounder: StringBounder): XDimension2D {
    return this.buildTextBlock().calculateDimension(stringBounder);
  }

  /**
   * Upstream's private `getTextBlock()`, renamed because the base class
   * declares a public `getTextBlock(num, stringBounder)` (the
   * `PSystemListEmoji.ts#buildTextBlock` precedent).
   * `FontConfiguration.create(font, BLACK, BLACK, null)`: the `null` stroke
   * is passed through as upstream passes it.
   * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/definition/PSystemDefinition.java:84-89
   */
  private buildTextBlock(): TextBlock {
    const font = UFontFactory.sansSerif(DEFINITION_FONT_SIZE);
    const fc = bridgeFontConfiguration(
      FontConfiguration.create(font, HColors.BLACK, HColors.BLACK, null as unknown as UStroke),
    );
    const spriteContainer = new SpriteContainerEmpty();
    return Display.getWithNewlines(Pragma.createEmpty(), this.startLine).create(
      { fontConfiguration: fc, spriteContainer, atomOps: spriteContainer.atomOps(fc) },
      HorizontalAlignment.LEFT,
    );
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/definition/PSystemDefinition.java:91-93 */
  doCommandLine(line: string): void {
    this.lines.push(line);
  }
}
