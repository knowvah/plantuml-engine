/**
 * BoardDiagram — one `@startboard` block: the activities side by side, each
 * a grid of cards, with a dashed separator under every stage row. Drawn as
 * one `TextBlock` whose dimension is the drawing's own extent plus 10.
 * `annotations` holds the chrome, as every klimt diagram's does.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/board/BoardDiagram.java
 */
import { createAnnotations, type DiagramAnnotations } from '../../core/annotations/index.js';
import { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import { Fore } from '../../core/klimt/Fore.js';
import { HColors } from '../../core/klimt/color/HColors.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import type { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import { TextBlockUtils } from '../../core/klimt/shape/TextBlockUtils.js';
import { ULine } from '../../core/klimt/shape/ULine.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UStroke } from '../../core/klimt/UStroke.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { ScaleSpec } from '../../core/scale-command.js';
import type { SpriteRegistry } from '../../core/sprite-registry.js';
import { TitledDiagram, type UmlSource } from '../../core/TitledDiagram.js';
import { OptionKey } from '../../core/tim/EaterOption.js';
import type { PreprocessingArtifact } from '../../core/tim/PreprocessingArtifact.js';
import { Activity } from './Activity.js';
import type { SkinParam } from './board-skin-param.js';
import { PostIt } from './PostIt.js';

/** `minMax.getDimension().delta(10, 10)`. @see BoardDiagram.java:81 */
const TEXT_BLOCK_DELTA = 10;
/** `(i + 1) * PostIt.getHeight() - 10`. @see BoardDiagram.java:96 */
const SEPARATOR_LIFT = 10;
/** `new UStroke(5, 5, 0.5)`. @see BoardDiagram.java:97 */
const SEPARATOR_DASH = 5;
/** @see BoardDiagram.java:97 */
const SEPARATOR_THICKNESS = 0.5;

/** @see BoardDiagram.java:59 */
export class BoardDiagram extends TitledDiagram {
  /** @see BoardDiagram.java:61 */
  private readonly activities: Activity[] = [];
  private readonly skinParam: SkinParam;
  /** `TitledDiagram`'s title/caption/legend/header/footer/mainframe, read by the chrome step. */
  readonly annotations: DiagramAnnotations = createAnnotations();
  /** `CommandScale*`'s target (`UmlDiagram#setScale`), as `PacketDiagram.ts` has it. */
  scale: ScaleSpec | undefined = undefined;

  /** The skin param is built by the factory, as packet's is. @see BoardDiagram.java:67-69 */
  constructor(source: UmlSource, preprocessing: PreprocessingArtifact, skinParam: SkinParam) {
    super(source, 'BOARD', undefined, preprocessing);
    this.skinParam = skinParam;
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

  /** The skin param's sprites, read by the sprite commands and the chrome step. */
  get sprites(): SpriteRegistry {
    return this.skinParam.getSprites();
  }

  /** `new DiagramDescription("Board")`. @see BoardDiagram.java:63-65 */
  getDescription(): string {
    return 'Board';
  }

  /** The activities in declaration order, for the tests. */
  getActivities(): readonly Activity[] {
    return this.activities;
  }

  /** Upstream's anonymous `TextBlock`. @see BoardDiagram.java:71-84 */
  getTextBlock(): TextBlock {
    const textBlock: TextBlock = {
      drawU: (ug) => {
        this.drawMe(ug);
      },
      calculateDimension: (stringBounder: StringBounder): XDimension2D => {
        const minMax = TextBlockUtils.getMinMax(textBlock, stringBounder, true);
        return minMax.getDimension().delta(TEXT_BLOCK_DELTA, TEXT_BLOCK_DELTA);
      },
    };
    return textBlock;
  }

  /**
   * The activities side by side, then the separators on the UNTRANSLATED
   * `ug`: from x = 0, across every activity (bep D6).
   * @see BoardDiagram.java:86-99
   */
  private drawMe(ug: UGraphic): void {
    let mug = ug;
    for (const activity of this.activities) {
      activity.drawMe(mug);
      mug = mug.apply(UTranslate.dx(activity.getFullWidth()));
    }

    const line = ULine.hline(this.getFullWidth());

    for (let i = 0; i < this.getMaxStage(); i++) {
      const dy = (i + 1) * PostIt.getHeight() - SEPARATOR_LIFT;
      ug.apply(new Fore(HColors.BLACK))
        .apply(new UStroke(SEPARATOR_DASH, SEPARATOR_DASH, SEPARATOR_THICKNESS))
        .apply(UTranslate.dy(dy))
        .draw(line);
    }
  }

  /** @see BoardDiagram.java:101-107 */
  private getFullWidth(): number {
    let width = 0;
    for (const activity of this.activities) {
      width += activity.getFullWidth();
    }
    return width;
  }

  /** @see BoardDiagram.java:109-115 */
  private getMaxStage(): number {
    let max = 0;
    for (const activity of this.activities) {
      max = Math.max(max, activity.getMaxStage());
    }
    return max;
  }

  /** `activities.get(size() - 1)`: an empty list is Java's `IndexOutOfBoundsException` (bep D10). @see BoardDiagram.java:117-119 */
  private getLastActivity(): Activity {
    const last = this.activities[this.activities.length - 1];
    if (last === undefined) {
      throw new Error(`IndexOutOfBoundsException: Index -1 out of bounds for length 0`);
    }
    return last;
  }

  /**
   * An empty `plus` starts an activity; otherwise the label is a release at
   * stage `plus.length()` of the last activity.
   * @see BoardDiagram.java:121-129
   */
  addLine(plus: string, label: string): CommandExecutionResult {
    if (plus.length === 0) {
      const activity = new Activity(this, label, this.getSkinParam());
      this.activities.push(activity);
      return CommandExecutionResult.ok();
    }
    this.getLastActivity().addRelease(plus.length, label);
    return CommandExecutionResult.ok();
  }
}
