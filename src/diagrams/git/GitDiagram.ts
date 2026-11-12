import type { UmlSource } from '../../core/block-extractor.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import type { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { SkinParamFresh, type SkinParamClasspath } from '../../core/skin/SkinParamFresh.js';
import { OptionKey } from '../../core/tim/EaterOption.js';
import type { PreprocessingArtifact } from '../../core/tim/PreprocessingArtifact.js';
import { TitledDiagram } from '../../core/TitledDiagram.js';
import type { GitTextArea } from './GitTextArea.js';
import { GNodeBuilder } from './GNodeBuilder.js';
import type { GNode } from './GNode.js';
import type { GitSkinParam } from './MagicBox.js';
import { SmetanaForGit } from './SmetanaForGit.js';

/**
 * GitDiagram — the folded commit nodes of a `@startgit` source, drawn by
 * `SmetanaForGit`.
 *
 * The skin is `TitledDiagram`'s own `SkinParam.create(…, type,
 * Pragma.createEmpty(), option)` (`TitledDiagram.java:107-108`), built once with
 * the preprocessing options. The port's `TitledDiagram` leaves `getSkinParam`
 * abstract, and `SkinParamFresh` is exactly that fresh `SkinParam` for a source
 * no command can reach — `GitDiagramFactory` has no commands (gip D4).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/gitlog/GitDiagram.java:50-87
 */
export class GitDiagram extends TitledDiagram {
  /** @see GitDiagram.java:52 */
  private readonly gnodes: readonly GNode[];
  /** @see GitDiagram.java:53 */
  private smetana: SmetanaForGit | undefined;
  private readonly skinParam: GitSkinParam;

  /**
   * The second `GNodeBuilder` is upstream's, result dropped (gip D1): any
   * throw already happened on the first.
   * @see GitDiagram.java:55-59
   */
  constructor(
    source: UmlSource,
    textArea: GitTextArea,
    preprocessing: PreprocessingArtifact,
    classpath?: SkinParamClasspath,
  ) {
    super(source, 'GIT', undefined, preprocessing);
    this.skinParam = new SkinParamFresh(classpath, preprocessing.getOptions());
    this.gnodes = new GNodeBuilder(textArea.getAllCommits()).getAllNodes();
    new GNodeBuilder(textArea.getAllCommits());
  }

  getSkinParam(): GitSkinParam {
    return this.skinParam;
  }

  /** `!option handwritten true` through the artifact (`TitledDiagram.java:114-118`); no skinparam reaches here. */
  isHandwritten(): boolean {
    return this.preprocessing.getOptions().get(OptionKey.HANDWRITTEN)?.toLowerCase() === 'true';
  }

  /** @see GitDiagram.java:61-63 */
  getDescription(): string {
    return '(Git)';
  }

  /** @see GitDiagram.java:65-70 */
  private getOrCreateSmetana(stringBounder: StringBounder): SmetanaForGit {
    this.smetana ??= new SmetanaForGit(stringBounder, this.getSkinParam());
    return this.smetana;
  }

  /** @see GitDiagram.java:72-85 */
  getTextBlock(): TextBlock {
    return {
      drawU: (ug: UGraphic): void => this.getOrCreateSmetana(ug.getStringBounder()).drawMe(ug, this.gnodes),
      calculateDimension: (stringBounder: StringBounder): XDimension2D =>
        this.getOrCreateSmetana(stringBounder).calculateDimension(this.gnodes),
    };
  }
}
