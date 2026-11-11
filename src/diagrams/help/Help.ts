/**
 * `help colors|fonts|keywords|types|themes`: a `TitledDiagram` of type `HELP`
 * whose page is its accumulated lines, as creole serif 16, margin 0.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/help/Help.java
 */
import { FontConfiguration as AbelFontConfiguration } from '../../core/abel/FontConfiguration.js';
import type { UmlSource } from '../../core/block-extractor.js';
import type { CreoleAtom } from '../../core/klimt/creole/atom/Atom.js';
import { CreoleMode } from '../../core/klimt/creole/CreoleMode.js';
import { Display } from '../../core/klimt/creole/Display.js';
import type { Sheet } from '../../core/klimt/creole/Sheet.js';
import { SheetBlock1 } from '../../core/klimt/creole/SheetBlock1.js';
import { bridgeFontConfiguration } from '../../core/klimt/font/FontConfigurationBridge.js';
import { UFontFactory } from '../../core/klimt/font/UFontFactory.js';
import { ClockwiseTopRightBottomLeft } from '../../core/klimt/geom/ClockwiseTopRightBottomLeft.js';
import { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import { LineBreakStrategy } from '../../core/klimt/LineBreakStrategy.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import { SkinParamFresh } from '../../core/skin/SkinParamFresh.js';
import type { SkinParamClasspath } from '../../core/skin/SkinParamFresh.js';
import { OptionKey } from '../../core/tim/EaterOption.js';
import type { PreprocessingArtifact } from '../../core/tim/PreprocessingArtifact.js';
import { TitledDiagram } from '../../core/TitledDiagram.js';

/** `UFontFactory.serif(16)`. @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/help/Help.java:83 */
const HELP_FONT_SIZE = 16;

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/help/Help.java:58 */
export class Help extends TitledDiagram {
  private readonly lines: string[] = [];
  /** `TitledDiagram`'s `SkinParam.create(...)` (TitledDiagram.java:107): no command here can reach it. */
  private readonly skinParam: SkinParamFresh;

  /** `classpath` is port-only (ADR-2). @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/help/Help.java:66-68 */
  constructor(source: UmlSource, preprocessing: PreprocessingArtifact, classpath?: SkinParamClasspath) {
    super(source, 'HELP', undefined, preprocessing);
    this.skinParam = new SkinParamFresh(classpath);
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/help/Help.java:62-64 */
  getDescription(): string {
    return '(Help)';
  }

  getSkinParam(): SkinParamFresh {
    return this.skinParam;
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/help/Help.java:70-72 */
  add(line: string): void {
    this.lines.push(line);
  }

  /** The lines, for the tests. */
  getLines(): readonly string[] {
    return this.lines;
  }

  /**
   * `skinParam.handwritten()` (always false: no `skinparam` can run), else
   * `!option handwritten` through the artifact.
   * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/TitledDiagram.java:114-118
   */
  isHandwritten(): boolean {
    return this.preprocessing.getOptions().get(OptionKey.HANDWRITTEN)?.toLowerCase() === 'true';
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/help/Help.java:74-77 */
  override getDefaultMargins(): ClockwiseTopRightBottomLeft {
    return ClockwiseTopRightBottomLeft.same(0);
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/help/Help.java:79-87 */
  getTextBlock(): TextBlock {
    const display = Display.create(this.lines);
    const font = UFontFactory.serif(HELP_FONT_SIZE);
    const fontConfiguration = bridgeFontConfiguration(AbelFontConfiguration.blackBlueTrue(font));
    // The `Sheet<StripeAtom>` -> `Sheet<CreoleAtom>` cast is the pre-existing
    // seam between `SheetBuilder` and `SheetBlock1` (`DisplayCreole.ts`).
    const sheet = this.skinParam
      .sheet(fontConfiguration, HorizontalAlignment.LEFT, CreoleMode.FULL)
      .createSheet(display) as unknown as Sheet<CreoleAtom>;
    return new SheetBlock1(
      sheet,
      LineBreakStrategy.NONE,
      this.skinParam.atomOps(fontConfiguration),
      ClockwiseTopRightBottomLeft.none(),
    );
  }
}
