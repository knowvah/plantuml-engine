/**
 * `ActivityDiagram`: the legacy (`(*) --> "act"`) activity diagram, a `CucaDiagram` drawn through svek. It is
 * also the plugin's AST (`index.ts`): leafs, groups, links, notes, pragma and the port-only members the chrome
 * step reads (`annotations`, `scale`, the sprite registry on the skin param).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram/ActivityDiagram.java:56-172
 */
import { Direction } from '../../core/abel/Direction.js';
import type { Entity } from '../../core/abel/Entity.js';
import { GroupType } from '../../core/abel/GroupType.js';
import { LeafType } from '../../core/abel/LeafType.js';
import { createAnnotations, type DiagramAnnotations } from '../../core/annotations/index.js';
import { CucaDiagram } from '../../core/cucadiagram/CucaDiagram.js';
import { Display } from '../../core/klimt/creole/Display.js';
import type { Quark } from '../../core/plasma/Quark.js';
import type { ScaleSpec } from '../../core/scale-command.js';
import type { SpriteRegistry } from '../../core/sprite-registry.js';
import type { Previous, UmlSource } from '../../core/TitledDiagram.js';
import { OptionKey } from '../../core/tim/EaterOption.js';
import type { LineLocation } from '../../core/tim/LineLocation.js';
import type { PreprocessingArtifact } from '../../core/tim/PreprocessingArtifact.js';
import type { ActivityLegacySkinParam } from './activity-legacy-skin-param.js';
import { ConditionalContext } from './ConditionalContext.js';

/** `getAutoBranch`'s prefix. @see ActivityDiagram.java:67-69 */
const AUTO_BRANCH_PREFIX = '#';
/** `createInnerActivity`'s and `concurrentActivity`'s sequence prefix. @see ActivityDiagram.java:145, 161 */
const INNER_ACTIVITY_PREFIX = '##';
/** The quark names of the start leaf, and of the end leaf (`end$<id>` with an id). @see ActivityDiagram.java:83, 92 */
const START_NAME = 'start';
const END_NAME = 'end';
const END_ID_SEPARATOR = '$';
/** `getDotStrings`. @see ActivityDiagram.java:116-119 */
const DOT_STRINGS: readonly string[] = [
  'nodesep=.20;',
  'ranksep=0.4;',
  'edge [fontsize=11,labelfontsize=11];',
  'node [fontsize=11];',
];

/** @see ActivityDiagram.java:56 */
export class ActivityDiagram extends CucaDiagram {
  /** @see ActivityDiagram.java:58-60 */
  private lastEntityConsulted: Entity | undefined = undefined;
  private lastEntityBrancheConsulted: Entity | undefined = undefined;
  private currentContext: ConditionalContext | undefined = undefined;

  private readonly skinParam: ActivityLegacySkinParam;
  /** `TitledDiagram`'s title/caption/legend/header/footer/mainframe, read by the chrome step. */
  readonly annotations: DiagramAnnotations = createAnnotations();
  /** `CommandScale*`'s target (`UmlDiagram#setScale`). */
  scale: ScaleSpec | undefined = undefined;

  /**
   * The skin param is built by the factory (the board/packet precedent); upstream builds it in
   * `TitledDiagram`'s constructor.
   * @see ActivityDiagram.java:62-65
   */
  constructor(
    source: UmlSource,
    previous: Previous | undefined,
    preprocessing: PreprocessingArtifact,
    skinParam: ActivityLegacySkinParam,
  ) {
    super(source, 'ACTIVITY', previous, preprocessing);
    this.skinParam = skinParam;
    this.setNamespaceSeparator(undefined);
  }

  override getSkinParam(): ActivityLegacySkinParam {
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

  /** @see ActivityDiagram.java:67-69 */
  private getAutoBranch(): string {
    return this.getUniqueSequence(AUTO_BRANCH_PREFIX);
  }

  /** @see ActivityDiagram.java:71-76 */
  startIf(location: LineLocation | undefined, optionalCodeString: string | undefined): void {
    const idShort = optionalCodeString === undefined ? this.getAutoBranch() : optionalCodeString;
    const quark = this.quarkInContext(true, this.cleanId(idShort) as string);
    const br = this.reallyCreateLeaf(location, quark, Display.create(''), LeafType.BRANCH, undefined);
    this.currentContext = new ConditionalContext(this.currentContext, br, Direction.DOWN);
  }

  /** `currentContext.getParent()` throws a `NullPointerException` upstream with no open `if`. @see ActivityDiagram.java:78-80 */
  endif(): void {
    if (this.currentContext === undefined) throw new Error('NullPointerException');
    this.currentContext = this.currentContext.getParent();
  }

  /** @see ActivityDiagram.java:82-89 */
  getStart(location: LineLocation | undefined): Entity {
    const quark = this.quarkInContext(true, START_NAME);
    if (quark.getData() === undefined)
      this.reallyCreateLeaf(
        location,
        quark,
        Display.getWithNewlines(this.getPragma(), START_NAME),
        LeafType.CIRCLE_START,
        undefined,
      );

    return quark.getData() as Entity;
  }

  /** @see ActivityDiagram.java:91-99 */
  getEnd(location: LineLocation | undefined, suppId: string | undefined): Entity {
    const tmp = suppId === undefined ? END_NAME : END_NAME + END_ID_SEPARATOR + suppId;
    const quark = this.quarkInContext(true, tmp);
    if (quark.getData() === undefined)
      this.reallyCreateLeaf(
        location,
        quark,
        Display.getWithNewlines(this.getPragma(), END_NAME),
        LeafType.CIRCLE_END,
        undefined,
      );

    return quark.getData() as Entity;
  }

  /** A note is neither the last entity consulted nor a branch. @see ActivityDiagram.java:100-110 */
  protected override updateLasts(result: Entity | undefined): void {
    if (result === undefined || result.getLeafType() === LeafType.NOTE) return;

    this.lastEntityConsulted = result;
    if (result.getLeafType() === LeafType.BRANCH) this.lastEntityBrancheConsulted = result;
  }

  /** @see ActivityDiagram.java:112-114 */
  createNote(location: LineLocation | undefined, idNewLong: Quark<Entity>, _code: string, display: Display): Entity {
    return this.reallyCreateLeaf(location, idNewLong, display, LeafType.NOTE, undefined);
  }

  /** Dead under svek (`CucaDiagramFileMakerSvek` builds the DOT itself), kept. @see ActivityDiagram.java:116-119 */
  protected override getDotStrings(): readonly string[] {
    return DOT_STRINGS;
  }

  /** `new DiagramDescription("(" + this.leafs().size() + " activities)")`. @see ActivityDiagram.java:121-123 */
  getDescription(): string {
    return '(' + String(this.leafs().length) + ' activities)';
  }

  /** @see ActivityDiagram.java:125-127 */
  getLastEntityConsulted(): Entity | undefined {
    return this.lastEntityConsulted;
  }

  /**
   * @deprecated mirrors the upstream `@Deprecated` getter, kept (D9).
   * @see ActivityDiagram.java:129-132
   */
  getLastEntityBrancheConsulted(): Entity | undefined {
    return this.lastEntityBrancheConsulted;
  }

  /** @see ActivityDiagram.java:134-136 */
  getCurrentContext(): ConditionalContext | undefined {
    return this.currentContext;
  }

  /** @see ActivityDiagram.java:138-141 */
  setLastEntityConsulted(lastEntityConsulted: Entity | undefined): void {
    this.lastEntityConsulted = lastEntityConsulted;
  }

  /** Opens an `INNER_ACTIVITY` group (reached from `CommandLinkActivity`'s `getEntity`). @see ActivityDiagram.java:143-155 */
  createInnerActivity(location: LineLocation | undefined): Entity {
    const idShort = this.getUniqueSequence(INNER_ACTIVITY_PREFIX);

    const quark = this.quarkInContext(true, idShort);
    this.gotoGroup(
      location,
      quark,
      Display.getWithNewlines(this.getPragma(), quark.getName()),
      GroupType.INNER_ACTIVITY,
    );
    const g = this.getCurrentGroup();

    this.lastEntityConsulted = undefined;
    this.lastEntityBrancheConsulted = undefined;

    return g;
  }

  /**
   * Only `CommandInnerConcurrent` calls it, and `ActivityDiagramFactory` has that command commented out
   * (java:98): ported, unreachable.
   * @see ActivityDiagram.java:157-172
   */
  concurrentActivity(location: LineLocation | undefined, _name: string): void {
    if (this.getCurrentGroup().getGroupType() === GroupType.CONCURRENT_ACTIVITY) this.endGroup();

    const idShort = this.getUniqueSequence(INNER_ACTIVITY_PREFIX);

    if (this.getCurrentGroup().getGroupType() !== GroupType.INNER_ACTIVITY)
      throw new Error('IllegalStateException: type=' + String(this.getCurrentGroup().getGroupType()));

    const idNewLong = this.quarkInContext(true, idShort);
    this.gotoGroup(
      location,
      idNewLong,
      Display.getWithNewlines(this.getPragma(), 'code'),
      GroupType.CONCURRENT_ACTIVITY,
    );
    this.lastEntityConsulted = undefined;
    this.lastEntityBrancheConsulted = undefined;
  }
}
