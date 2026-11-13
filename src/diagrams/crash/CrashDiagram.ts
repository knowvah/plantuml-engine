/**
 * `CrashDiagram` — the page `@startcrash` draws: an 18-line explanation, sans
 * serif 14, unless a `crash when …` line has set a crash type. It is a
 * `TitledDiagram` typed `BPM`, not `CRASH` (`CrashDiagram.java:59`), so the
 * root's `data-diagram-type` is `BPM`.
 *
 * DRAWING throws from `getTextBlock`, FINALIZING from `checkFinalError`
 * (PARSING throws from `CommandSelectCrash#executeArg`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/crash/CrashDiagram.java
 */
import { FontConfiguration as AbelFontConfiguration } from '../../core/abel/FontConfiguration.js';
import type { UmlSource } from '../../core/block-extractor.js';
import { Display } from '../../core/klimt/creole/Display.js';
import { bridgeFontConfiguration } from '../../core/klimt/font/FontConfigurationBridge.js';
import { UFontFactory } from '../../core/klimt/font/UFontFactory.js';
import { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import { SkinParamFresh } from '../../core/skin/SkinParamFresh.js';
import type { SkinParamClasspath } from '../../core/skin/SkinParamFresh.js';
import { OptionKey } from '../../core/tim/EaterOption.js';
import type { PreprocessingArtifact } from '../../core/tim/PreprocessingArtifact.js';
import { TitledDiagram } from '../../core/TitledDiagram.js';
import { CrashType } from './CrashType.js';

/** `UFontFactory.sansSerif(14)`. @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/crash/CrashDiagram.java:86 */
const CRASH_FONT_SIZE = 14;

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/crash/CrashDiagram.java:63-64 */
export const DRAWING_CRASH = 'java.lang.IllegalStateException: This is a normal crash when DRAWING';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/crash/CrashDiagram.java:100-101 */
export const FINALIZING_CRASH = 'java.lang.IllegalStateException: This is a normal crash when FINALIZING';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/crash/CrashDiagram.java:55 */
const DESCRIPTION = 'Crash Diagram';

/** The `Display.create(...)` lines, verbatim. @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/crash/CrashDiagram.java:66-83 */
const LINES: readonly string[] = [
  '<b>Crash Diagram</b>',
  '',
  'This diagram is only used to test crash handling.',
  '',
  'There are three types of crash:',
  '  • During <b>parsing</b>',
  '  • During <b>finalizing</b>',
  '  • During <b>drawing</b>',
  '',
  'The purpose is to verify that PlantUML error recovery',
  'mechanisms work correctly, using a diagram whose',
  'behavior is predictable <i>(it crashes)</i>.',
  '',
  'To do so, you should the following directive:',
  '  • ""crash when parsing""',
  '  • ""crash when finalizing""',
  '  • ""crash when drawing""',
  '',
];

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/crash/CrashDiagram.java:50 */
export class CrashDiagram extends TitledDiagram {
  /** Upstream's `type`, renamed: `TitledDiagram` already holds a private `type` (its `DiagramType`), and
   *  TypeScript forbids a subclass property of the same name.
   *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/crash/CrashDiagram.java:52 */
  private crashType: CrashType | undefined = undefined;
  /** `TitledDiagram`'s `SkinParam.create(...)` (TitledDiagram.java:107): no command here can reach it. */
  private readonly skinParam: SkinParamFresh;

  /** `classpath` is port-only (ADR-2). @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/crash/CrashDiagram.java:58-60 */
  constructor(source: UmlSource, preprocessing: PreprocessingArtifact, classpath?: SkinParamClasspath) {
    super(source, 'BPM', undefined, preprocessing);
    this.skinParam = new SkinParamFresh(classpath);
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/crash/CrashDiagram.java:54-56 */
  getDescription(): string {
    return DESCRIPTION;
  }

  getSkinParam(): SkinParamFresh {
    return this.skinParam;
  }

  /**
   * `skinParam.handwritten()` (always false: no `skinparam` command runs),
   * else `!option handwritten` through the artifact.
   * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/TitledDiagram.java:114-118
   */
  isHandwritten(): boolean {
    return this.preprocessing.getOptions().get(OptionKey.HANDWRITTEN)?.toLowerCase() === 'true';
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/crash/CrashDiagram.java:62-88 */
  getTextBlock(): TextBlock {
    if (this.crashType === CrashType.DRAWING) throw new Error(DRAWING_CRASH);

    const display = Display.create(LINES);
    const fontConfiguration = bridgeFontConfiguration(
      AbelFontConfiguration.blackBlueTrue(UFontFactory.sansSerif(CRASH_FONT_SIZE)),
    );
    const ctx = {
      fontConfiguration,
      spriteContainer: this.skinParam,
      atomOps: this.skinParam.atomOps(fontConfiguration),
    };
    return display.create(ctx, HorizontalAlignment.LEFT);
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/crash/CrashDiagram.java:90-93 */
  setCrashType(type: CrashType): void {
    this.crashType = type;
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/crash/CrashDiagram.java:95-97 */
  getCrashType(): CrashType | undefined {
    return this.crashType;
  }

  /** `super.checkFinalError()` is `AbstractDiagram`'s `null`.
   *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/crash/CrashDiagram.java:99-105
   *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/core/AbstractDiagram.java:162-164 */
  checkFinalError(): string | undefined {
    if (this.crashType === CrashType.FINALIZING) throw new Error(FINALIZING_CRASH);

    return undefined;
  }
}
