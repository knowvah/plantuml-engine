/**
 * `ChenEerDiagram`: the Chen entity-relationship diagram (`@startchen`), a `CucaDiagram` drawn through svek. It is
 * also the plugin's AST (`index.ts`): leaves, links, pragma and the port-only members the chrome step reads
 * (`annotations`, `scale`, the sprite registry on the skin param).
 *
 * D1 (cheneer): upstream extends `AbstractEntityDiagram` (`ChenEerDiagram.java:46`), which this port has no class
 * for. Its three members, checked against `~/git/plantuml/src/main/java/net/`:
 * - `getDescription` (`AbstractEntityDiagram.java:72-83`) is only read by the Java API and CLI
 *   (`Pipe.java:175`, `SourceStringReader.java:197`, `SourceFileReaderAbstract.java:212`): no rendering path.
 * - `packSomePackage` (`:85-106`) is only called from `ClassDiagram.java:85` and `DescriptionDiagram.java:94`.
 * - `getDotStrings` (`:60-71`) IS reached: `CucaDiagram#getDotStringSkek` (`net/atmp/CucaDiagram.java:399-415`,
 *   read at `svek/CucaDiagramFileMakerSvek.java:83`) keeps its `nodesep`/`ranksep` entries, whose values
 *   `DotStringFactory#createDotString` replaces (`DotStringFactory.java:140-144`). Only their presence and order
 *   reach the DOT, so `getDotStrings` is ported below and the other two are not.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/cheneer/ChenEerDiagram.java:46-96
 */
import type { Entity } from '../../core/abel/Entity.js';
import { createAnnotations, type DiagramAnnotations } from '../../core/annotations/index.js';
import { CucaDiagram } from '../../core/cucadiagram/CucaDiagram.js';
import type { ScaleSpec } from '../../core/scale-command.js';
import type { SpriteRegistry } from '../../core/sprite-registry.js';
import type { Previous, UmlSource } from '../../core/TitledDiagram.js';
import { OptionKey } from '../../core/tim/EaterOption.js';
import type { PreprocessingArtifact } from '../../core/tim/PreprocessingArtifact.js';
import { PragmaKey } from '../../core/skin/PragmaKey.js';
import type { ChenEerSkinParam } from './cheneer-skin-param.js';

/**
 * `AbstractEntityDiagram#getDotStrings`' fixed lines.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/classdiagram/AbstractEntityDiagram.java:61-62
 */
const DOT_STRINGS: readonly string[] = [
  'nodesep=.35;',
  'ranksep=0.8;',
  'edge [fontsize=11,labelfontsize=11];',
  'node [fontsize=11,height=.35,width=.55];',
];

/** @see ChenEerDiagram.java:46 */
export class ChenEerDiagram extends CucaDiagram {
  /** @see ChenEerDiagram.java:52 */
  private readonly ownerStack: Entity[] = [];

  private readonly skinParam: ChenEerSkinParam;
  /** `TitledDiagram`'s title/caption/legend/header/footer/mainframe, read by the chrome step. */
  readonly annotations: DiagramAnnotations = createAnnotations();
  /** `CommandScale*`'s target (`UmlDiagram#setScale`). */
  scale: ScaleSpec | undefined = undefined;

  /**
   * The skin param is built by the factory (the board/packet precedent); upstream builds it in `TitledDiagram`'s
   * constructor. The printed type is `CHEN_EER` (D4).
   * @see ChenEerDiagram.java:48-50
   */
  constructor(
    source: UmlSource,
    previous: Previous | undefined,
    preprocessing: PreprocessingArtifact,
    skinParam: ChenEerSkinParam,
  ) {
    super(source, 'CHEN_EER', previous, preprocessing);
    this.skinParam = skinParam;
  }

  override getSkinParam(): ChenEerSkinParam {
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

  /**
   * `AbstractEntityDiagram#getDotStrings`: the fixed lines, then the `GRAPH_ATTRIBUTES` pragma when defined.
   * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/classdiagram/AbstractEntityDiagram.java:60-71
   */
  protected override getDotStrings(): readonly string[] {
    if (!this.getPragma().isDefine(PragmaKey.GRAPH_ATTRIBUTES)) return DOT_STRINGS;

    const attribute = this.getPragma().getValue(PragmaKey.GRAPH_ATTRIBUTES) as string;
    return [...DOT_STRINGS, attribute];
  }

  /**
   * Pushes the owner of the following attributes.
   *
   * @param group the entity that owns the following attributes
   * @see #peekOwner()
   * @see ChenEerDiagram.java:54-62
   */
  pushOwner(group: Entity): void {
    this.ownerStack.push(group);
  }

  /**
   * Pops an attribute owner from the stack. See also {@link #peekOwner()}.
   *
   * @returns true if an owner was popped, false if the stack was empty
   * @see ChenEerDiagram.java:64-77
   */
  popOwner(): boolean {
    if (this.ownerStack.length === 0) return false;

    this.ownerStack.pop();
    return true;
  }

  /**
   * Returns the owner of the current attribute.
   *
   * This is used to link attributes based on their lexical position (how they appear in sources) without nesting
   * the entities (like how packages are done). It is for this reason that we can't use
   * `CucaDiagram.getCurrentGroup`, as that method nests the entities.
   *
   * @returns the owner of the current attribute, or `undefined` if there is no owner
   * @see ChenEerDiagram.java:79-94
   */
  peekOwner(): Entity | undefined {
    return this.ownerStack[this.ownerStack.length - 1];
  }
}
