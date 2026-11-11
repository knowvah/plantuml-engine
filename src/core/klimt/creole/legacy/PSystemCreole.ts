/**
 * `@startcreole`: every body line is one creole line, drawn serif 14 with a
 * fresh `SkinParam`, so no `title`, `skinparam` or `<style>` line is a command
 * (`cov-creole-title`: `title foo` is text). Not a `TitledDiagram`: the export
 * is `UgDiagram`'s non-titled arm, with no `data-diagram-type`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/creole/legacy/PSystemCreole.java
 */
import type { UmlSource } from '../../../block-extractor.js';
import { FontConfiguration as AbelFontConfiguration } from '../../../abel/FontConfiguration.js';
import { SkinParamFresh } from '../../../skin/SkinParamFresh.js';
import type { SkinParamClasspath } from '../../../skin/SkinParamFresh.js';
import type { PreprocessingArtifact } from '../../../tim/PreprocessingArtifact.js';
import { UgDiagram } from '../../../UgDiagram.js';
import { bridgeFontConfiguration } from '../../font/FontConfigurationBridge.js';
import type { StringBounder } from '../../font/StringBounder.js';
import { UFontFactory } from '../../font/UFontFactory.js';
import { ClockwiseTopRightBottomLeft } from '../../geom/ClockwiseTopRightBottomLeft.js';
import { HorizontalAlignment } from '../../geom/HorizontalAlignment.js';
import { LineBreakStrategy } from '../../LineBreakStrategy.js';
import type { TextBlock } from '../../shape/TextBlock.js';
import type { CreoleAtom } from '../atom/Atom.js';
import { CreoleMode } from '../CreoleMode.js';
import { Display } from '../Display.js';
import type { Sheet } from '../Sheet.js';
import { SheetBlock1 } from '../SheetBlock1.js';

/** `UFontFactory.serif(14)`. @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/creole/legacy/PSystemCreole.java:81 */
const CREOLE_FONT_SIZE = 14;

/** The jar-resident stores standing in for upstream's classpath (ADR-2). */
export type CreoleClasspath = SkinParamClasspath;

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/creole/legacy/PSystemCreole.java:61 */
export class PSystemCreole extends UgDiagram {
  private readonly lines: string[] = [];

  /** `classpath` is port-only (ADR-2): the stores upstream reads off the classpath. */
  constructor(
    source: UmlSource,
    preprocessing: PreprocessingArtifact,
    private readonly classpath?: CreoleClasspath,
  ) {
    super(source, preprocessing);
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/creole/legacy/PSystemCreole.java:69-71 */
  getDescription(): string {
    return '(Creole)';
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/creole/legacy/PSystemCreole.java:73-75 */
  doCommandLine(line: string): void {
    this.lines.push(line);
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/creole/legacy/PSystemCreole.java:77-89 */
  getTextBlock(_num: number, _stringBounder: StringBounder): TextBlock {
    const display = Display.create(this.lines);
    const font = UFontFactory.serif(CREOLE_FONT_SIZE);
    const fontConfiguration = bridgeFontConfiguration(AbelFontConfiguration.blackBlueTrue(font));
    const skinParam = new SkinParamFresh(this.classpath);
    // The `Sheet<StripeAtom>` -> `Sheet<CreoleAtom>` cast is the pre-existing
    // seam between `SheetBuilder` and `SheetBlock1` (`DisplayCreole.ts`,
    // `gantt/draw/AbstractTaskDraw.ts`).
    const sheet = skinParam
      .sheet(fontConfiguration, HorizontalAlignment.LEFT, CreoleMode.FULL)
      .createSheet(display) as unknown as Sheet<CreoleAtom>;
    return new SheetBlock1(
      sheet,
      LineBreakStrategy.NONE,
      skinParam.atomOps(fontConfiguration),
      ClockwiseTopRightBottomLeft.none(),
    );
  }
}
