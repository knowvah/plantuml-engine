/**
 * `PSystemEbnf`: one `@startebnf` block — rules and notes in source order, stacked left-aligned. With nothing in
 * it, the text `Syntax error!`.
 *
 * `getTextBlock`'s `TextBlockUtils.addBackcolor(result, null)` wraps the block with a `null` back colour, which
 * draws and measures as the block itself; the export reads the document colour from `calculateBackColor`, not from
 * here (`UgDiagram.java:123-131`), and the port's `addBackcolor` is unported (`TextBlockUtils.ts:125`). It is the
 * block itself here.
 *
 * Mutable: `expressions` grows in place as commands execute, as Java's `ArrayList`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/ebnf/PSystemEbnf.java:62-114
 */
import { createAnnotations, type DiagramAnnotations } from '../../core/annotations/index.js';
import type { Colors } from '../../core/abel/Colors.js';
import { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import type { Display } from '../../core/klimt/creole/Display.js';
import { bridgeFontConfiguration } from '../../core/klimt/font/FontConfigurationBridge.js';
import { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import { TextBlockUtils } from '../../core/klimt/shape/TextBlockUtils.js';
import type { ScaleSpec } from '../../core/scale-command.js';
import { PragmaKey } from '../../core/skin/PragmaKey.js';
import type { SpriteRegistry } from '../../core/sprite-registry.js';
import { TitledDiagram, type UmlSource } from '../../core/TitledDiagram.js';
import { OptionKey } from '../../core/tim/EaterOption.js';
import type { PreprocessingArtifact } from '../../core/tim/PreprocessingArtifact.js';
import type { BlocLines } from '../../core/utils/BlocLines.js';
import { FloatingNote } from '../activity/ftile/vcompact/FloatingNote.js';
import type { SkinParam } from './ebnf-skin-param.js';
import { EbnfEngine, ebnfStyleOf } from './EbnfEngine.js';
import { EbnfExpression } from './EbnfExpression.js';
import type { TextBlockable } from './TextBlockable.js';

/** `withMargin(f, 0, 0, 5, 15)`: a note's 5 px above, 15 below. @see PSystemEbnf.java:90 */
const NOTE_MARGIN_TOP = 5;
const NOTE_MARGIN_BOTTOM = 15;

/** `addNote`'s anonymous `TextBlockable`. `colors` is accepted and unread upstream too. @see PSystemEbnf.java:86-92 */
class NoteBlockable implements TextBlockable {
  constructor(private readonly note: Display) {}

  getUDrawable(skinParam: SkinParam, _preprocessing: PreprocessingArtifact): TextBlock {
    const f = FloatingNote.create(this.note, skinParam, 'ebnf');
    return TextBlockUtils.withMargin(f, 0, 0, NOTE_MARGIN_TOP, NOTE_MARGIN_BOTTOM);
  }
}

export class PSystemEbnf extends TitledDiagram {
  private readonly expressions: TextBlockable[] = [];
  private readonly skinParam: SkinParam;
  /** `TitledDiagram`'s title/caption/legend/header/footer/mainframe, read by the chrome step. */
  readonly annotations: DiagramAnnotations = createAnnotations();
  /** `CommandScale*`'s target (`UmlDiagram#setScale`). */
  scale: ScaleSpec | undefined = undefined;

  /** The skin param is built by the factory, as board's and nwdiag's are. @see PSystemEbnf.java:66-68 */
  constructor(source: UmlSource, preprocessing: PreprocessingArtifact, skinParam: SkinParam) {
    super(source, 'EBNF', undefined, preprocessing);
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

  /** `new DiagramDescription("(EBNF)")`. @see PSystemEbnf.java:70-72 */
  getDescription(): string {
    return '(EBNF)';
  }

  /** The rules and notes in source order, for the tests. */
  getExpressions(): readonly TextBlockable[] {
    return this.expressions;
  }

  /** @see PSystemEbnf.java:74-83 */
  addBlocLines(blines: BlocLines, commentAbove: string | null, commentBelow: string | null): CommandExecutionResult {
    const isCompact = this.getPragma().isDefine(PragmaKey.COMPACT);
    const it = blines.inspector();
    const tmp1 = EbnfExpression.create(it, isCompact, commentAbove, commentBelow);
    if (tmp1.isEmpty()) return CommandExecutionResult.error('Unparsable expression');
    this.expressions.push(tmp1);
    return CommandExecutionResult.ok();
  }

  /** @see PSystemEbnf.java:85-94 */
  addNote(note: Display, _colors: Colors | undefined): CommandExecutionResult {
    this.expressions.push(new NoteBlockable(note));
    return CommandExecutionResult.ok();
  }

  /** @see PSystemEbnf.java:96-112 */
  getTextBlock(): TextBlock {
    const skinParam = this.getSkinParam();
    if (this.expressions.length === 0) {
      const style = ebnfStyleOf(skinParam);
      const fc = bridgeFontConfiguration(style.getFontConfiguration(skinParam.getIHtmlColorSet()));
      return EbnfEngine.syntaxError(fc, skinParam);
    }

    let result = this.expressions[0]!.getUDrawable(skinParam, this.preprocessing);
    for (let i = 1; i < this.expressions.length; i++)
      result = TextBlockUtils.mergeTB(
        result,
        this.expressions[i]!.getUDrawable(skinParam, this.preprocessing),
        HorizontalAlignment.LEFT,
      );
    return result;
  }
}
