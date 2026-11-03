/**
 * Element colours through the style engine (dss T2a, D1, D1a, D2, D2a, D3, D3a,
 * D5, D5a): one table of what each element's own Java asks the `StyleBuilder`,
 *
 *   StyleSignatureBasic.of(<snames>).getMergedStyle(getSkinParam().getCurrentStyleBuilder())
 *
 * precomputed into `theme.colors.elements` (D2). A signature with a stereotype
 * stays on its existing tier: a snapshot per bucket cannot vary per instance.
 *
 * One bucket holds one signature, so a second signature on one SName takes its
 * own key (D2a): {@link clusterBucketOf}, {@link LINK_NOTE_BUCKET},
 * {@link STATE_CHOICE_BUCKET}.
 *
 * Sequence, json and yaml have no row: they read the builder directly
 * (`sequence-skin-param.ts`, `diagrams/json`). Files and board discard the
 * style the jar's element ignores (`DIVERGENCES.md`, "Extensions").
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/style/StyleStorage.java:102-116
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/style/StyleSignatureBasic.java:194-220
 */
import type { DiagramType } from './block-extractor.js';
import { documentStyleBuilder, isDark, styleNameOf } from './document-back-color.js';
import { parseConditionalColor } from './klimt/color/HColorSet.js';
import { parseColor } from './paint.js';
import type { PreprocessorResult } from './preprocessor.js';
import { buildMindmapStyleBuilder } from './style/mindmap-style-builder.js';
import type { PName } from './style/PName.js';
import type { SName } from './style/SName.js';
import type { StyleBuilder } from './style/StyleBuilder.js';
import { StyleSignatureBasic } from './style/StyleSignatureBasic.js';
import type { Value } from './style/Value.js';
import type { ElementColors } from './theme.js';

/** One element's signature(s) and the `theme.colors.elements` key that carries them. */
export interface ElementSignature {
  readonly bucket: string;
  /** The signature `BackGroundColor` and `LineColor` read; `FontColor` too, without {@link fontSnames}. */
  readonly snames: readonly SName[];
  /** `FontColor`, where the element reads it from another style (`EntityImageDescription.java:173`). */
  readonly fontSnames?: readonly SName[];
  /** The bucket a reader falls through to when this key is absent; see {@link heldByFlat}. */
  readonly shadows?: string;
}

/** The colours one bucket takes. */
export type ElementScopeColors = Pick<ElementColors, 'background' | 'border' | 'font' | 'titleFont'>;

/** What {@link elementScopeColors} takes beyond the document. */
export interface ElementScopeOptions {
  /** `options.theme` is a string (`documentBackColor`'s same exception). */
  readonly callerNamedTheme?: boolean;
  /** The document's one builder (`documentStyleBuilder`); absent, it is built here. */
  readonly builder?: StyleBuilder | undefined;
}

/** `SName.root, SName.element`, the head of nearly every signature. */
const RE: readonly SName[] = ['root', 'element'];

/** The key of a cluster's signature, distinct from its symbol's leaf (D2a). @see svek/Cluster.java:290-291 */
export function clusterBucketOf(symbol: string): string {
  return `group.${symbol}`;
}

/** A note on a link: `ComponentType.NOTE`'s `sequenceDiagram` signature, not the document's (D2a). */
export const LINK_NOTE_BUCKET = 'note.link';

/** State's `<<choice>>`: `EntityImageBranch`'s `activityDiagram` signature; `diamond` is its history (D2a). */
export const STATE_CHOICE_BUCKET = 'activity.diamond';

/** `<bucket>, getSNames(), title's getSNames() if different`, every `USymbol` of `USymbols.java:60-95`. */
const USYMBOLS: readonly (readonly [string, readonly SName[], (readonly SName[])?])[] = [
  ['action', ['action']], // USymbols.java:60, USymbolAction.java:60
  ['actor', ['actor']], // USymbolActor.java:53
  ['actor-business', ['business'], ['actor', 'business']], // USymbolActorBusiness.java:48, EntityImageDescription.java:144-146
  ['agent', ['agent']], // USymbols.java:65
  ['archimate', ['archimate']], // USymbols.java:66
  ['artifact', ['artifact']], // USymbolArtifact.java:56
  ['boundary', ['boundary']], // USymbolBoundary.java:46
  ['card', ['card']], // USymbolCard.java:55
  ['circle', ['interface_']], // Entity.java:415-416 returns USymbols.INTERFACE
  ['cloud', ['cloud']], // USymbolCloud.java:63
  ['collections', ['collections']], // USymbolCollections.java:54
  ['component', ['component']], // USymbolComponent1.java:55, USymbolComponent2.java:55, USymbols.java:72
  ['control', ['control']], // USymbolControl.java:46
  ['database', ['database']], // USymbolDatabase.java:57
  ['entity', ['entity']], // USymbolEntityDomain.java:47
  ['file', ['file']], // USymbolFile.java:59
  ['folder', ['folder']], // USymbols.java:79
  ['frame', ['frame']], // USymbols.java:80
  ['hexagon', ['hexagon']], // USymbolHexagon.java:53
  ['interface', ['interface_']], // USymbolInterface.java:46-48
  ['label', ['label']], // USymbolLabel.java:53
  ['node', ['node']], // USymbolNode.java:58
  ['package', ['package_']], // USymbols.java:86
  ['person', ['person']], // USymbolPerson.java:55
  ['process', ['process']], // USymbols.java:89
  ['queue', ['queue']], // USymbolQueue.java:57
  ['rectangle', ['rectangle']], // USymbols.java:91
  ['stack', ['stack']], // USymbolStack.java:57
  ['storage', ['storage']], // USymbolStorage.java:54
  ['usecase', ['usecase']], // USymbolUsecase.java:67-70, Entity.java:410-411
  ['usecase-business', ['usecase', 'business']], // USymbolUsecase.java:67-69, Entity.java:412-413
];

/**
 * The leaf: fill and line off `styleTitle` (`EntityImageDescription.java:152-153,162-166`), text off `style`
 * (`:159-160,173`), which is what a display differing from the code draws with (`:187-190`; jar: bare
 * `title { BackgroundColor; LineColor; FontColor }` fills `[C]` and `database E`, and leaves `component D as "dd d"`'s
 * text black).
 */
function leafRows(diagram: SName): ElementSignature[] {
  return USYMBOLS.map(([bucket, snames, title]) => ({
    bucket,
    snames: [...RE, diagram, ...(title ?? snames), 'title'],
    fontSnames: [...RE, diagram, ...snames],
  }));
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/Cluster.java:286-296 */
function clusterRows(diagram: SName): ElementSignature[] {
  return [
    { bucket: 'group', snames: [...RE, diagram, 'group'] }, // Cluster.java:295
    ...USYMBOLS.map(([bucket, snames]): ElementSignature => ({
      bucket: clusterBucketOf(bucket),
      snames: [...RE, diagram, 'group', ...snames], // Cluster.java:290-291
      shadows: bucket,
    })),
  ];
}

/** Every svek engine's shared rows, on its own `getStyleName()` (`AbstractEntityImage.java:95-96`). */
function svekRows(diagram: SName): ElementSignature[] {
  return [
    { bucket: 'note', snames: [...RE, diagram, 'note'] }, // EntityImageNote.java:188-189
    // EntityImageNoteLink.java:64 -> ComponentType.java:98-99
    { bucket: LINK_NOTE_BUCKET, snames: [...RE, 'sequenceDiagram', 'note'], shadows: 'note' },
    { bucket: 'arrow', snames: [...RE, diagram, 'arrow'] }, // SvekEdge.java:817-819
  ];
}

/** Every `EntityImageClassHeader#spotStyleSignature` branch, which names no diagram (java:197-226). */
const SPOT_ROWS: readonly ElementSignature[] = (
  [
    ['spotannotation', 'spotAnnotation'],
    ['spotabstractclass', 'spotAbstractClass'],
    ['spotclass', 'spotClass'],
    ['spotinterface', 'spotInterface'],
    ['spotenum', 'spotEnum'],
    ['spotentity', 'spotEntity'],
    ['spotprotocol', 'spotProtocol'],
    ['spotstruct', 'spotStruct'],
    ['spotexception', 'spotException'],
    ['spotmetaclass', 'spotMetaClass'],
    ['spotstereotype', 'spotStereotype'],
    ['spotdataclass', 'spotDataClass'],
    ['spotrecord', 'spotRecord'],
  ] as const
).map(([bucket, sname]) => ({ bucket, snames: [...RE, 'spot', sname] }));

/** A description document: `DiagramType.java:250-251`, usecase included. */
function descriptionRows(): ElementSignature[] {
  const diagram: SName = 'componentDiagram';
  return [
    ...leafRows(diagram),
    ...clusterRows(diagram),
    ...svekRows(diagram),
    { bucket: 'port', snames: [...RE, diagram, 'port'] }, // EntityImagePort.java:73
  ];
}

/** A class document, objects included: a mixed `CLASS` document reads both tables (D4). */
function classRows(): ElementSignature[] {
  const diagram: SName = 'classDiagram';
  return [
    ...leafRows(diagram).filter(({ bucket }) => !OBJECT_KINDS.has(bucket)),
    ...clusterRows(diagram),
    ...svekRows(diagram),
    ...SPOT_ROWS,
    { bucket: 'class', snames: [...RE, diagram, 'class_'] }, // EntityImageClass.java:162-163
    { bucket: 'class.header', snames: [...RE, diagram, 'class_', 'header'], shadows: 'class' }, // EntityImageClassHeader.java:79-80
    { bucket: 'object', snames: [...RE, 'objectDiagram', 'object'] }, // EntityImageObject.java:123-124
    { bucket: 'map', snames: [...RE, 'objectDiagram', 'map'] }, // EntityImageMap.java:137-138
    { bucket: 'json', snames: [...RE, 'objectDiagram', 'json'] }, // EntityImageJson.java:139-140
    // GeneralImageBuilder.java:154-155, EntityImageLollipopInterface.java:69-70
    { bucket: 'circle.lollipop', snames: [...RE, diagram, 'circle'] },
    { bucket: 'port', snames: [...RE, diagram, 'port'] }, // EntityImagePort.java:73
  ];
}

const OBJECT_KINDS: ReadonlySet<string> = new Set(['object', 'map', 'json']);

function stateRows(): ElementSignature[] {
  const diagram: SName = 'stateDiagram';
  const state: readonly SName[] = [...RE, diagram, 'state'];
  return [
    ...svekRows(diagram),
    { bucket: 'state', snames: state }, // EntityImageStateCommon.java:61-62, ConcurrentStates.java:115-116
    { bucket: clusterBucketOf('state'), snames: [...state, 'group'], shadows: 'state' }, // Cluster.java:288-289
    { bucket: 'state.name', snames: [...state, 'name'], shadows: 'state' }, // EntityImageState.java:90, Cluster.java:464
    // EntityImageState.java:92, Cluster.java:466
    { bucket: 'state.description', snames: [...state, 'description'], shadows: 'state' },
    { bucket: 'state.body', snames: [...state, 'body'], shadows: 'state' }, // Cluster.java:469-470
    { bucket: 'circle.start', snames: [...RE, diagram, 'circle', 'start'] }, // EntityImageCircleStart.java:56-58
    { bucket: 'circle.end', snames: [...RE, diagram, 'circle', 'end'] }, // EntityImageCircleEnd.java:57-59
    { bucket: STATE_CHOICE_BUCKET, snames: [...RE, 'activityDiagram', 'activity', 'diamond'] }, // EntityImageBranch.java:62-63
    { bucket: 'activitybar', snames: [...RE, 'activityDiagram', 'activityBar'] }, // EntityImageSynchroBar.java:62-63
    { bucket: 'diamond', snames: [...RE, diagram, 'diamond'] }, // EntityImagePseudoState.java:70-71
  ];
}

function activityRows(): ElementSignature[] {
  const diagram: readonly SName[] = [...RE, 'activityDiagram'];
  return [
    { bucket: 'activity', snames: [...diagram, 'activity'] }, // ftile/vertical/FtileBox.java:98
    { bucket: 'diamond', snames: [...diagram, 'activity', 'diamond'] }, // ftile/FtileFactoryDelegator.java:79-80
    { bucket: 'activitybar', snames: [...diagram, 'activityBar'] }, // ftile/vertical/FtileBlackBlock.java:98
    { bucket: 'note', snames: [...diagram, 'note'] }, // ftile/vcompact/FtileWithNoteOpale.java:89
    { bucket: 'arrow', snames: [...diagram, 'arrow'] }, // ftile/FtileFactoryDelegator.java:83-84
    { bucket: 'circle.start', snames: [...diagram, 'circle', 'start'] }, // ftile/vcompact/VCompactFactory.java:109
    { bucket: 'circle.stop', snames: [...diagram, 'circle', 'stop'] }, // ftile/vcompact/VCompactFactory.java:101
    { bucket: 'circle.end', snames: [...diagram, 'circle', 'end'] }, // ftile/vcompact/VCompactFactory.java:97
    { bucket: 'circle.spot', snames: [...diagram, 'circle', 'spot'] }, // ftile/vcompact/VCompactFactory.java:105
    { bucket: 'swimlane', snames: [...diagram, 'swimlane'] }, // ftile/Swimlanes.java:127
    { bucket: 'goto', snames: [...diagram, 'goto_'] }, // ftile/Swimlanes.java:248
    // ftile/vcompact/FtileGroup.java:89-91; command/CommandPartition3.java:89-103; USymbols.java:81,86,87,91
    ...(['partition', 'group', 'rectangle', 'card'] as const).map((sname) => ({
      bucket: sname,
      snames: [...diagram, sname, 'composite'] as const,
    })),
    { bucket: 'package', snames: [...diagram, 'package_', 'composite'] },
  ];
}

/**
 * Each `getStyleName()` to the elements its document draws. Signatures come from each element's own Java, which is why
 * a table can name a diagram other than its key.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/core/DiagramType.java:234-296
 */
export const ELEMENT_SIGNATURES: Readonly<Record<string, readonly ElementSignature[]>> = {
  componentDiagram: descriptionRows(),
  classDiagram: classRows(),
  stateDiagram: stateRows(),
  activityDiagram: activityRows(),
};

/** `styleNameOf`'s final `return SName.activityDiagram` covers these too, but they draw no activity element. */
const NO_ELEMENT_ROWS: ReadonlySet<DiagramType> = new Set<DiagramType>(['files', 'board', 'dot']);

function signaturesOf(diagramType: DiagramType): readonly ElementSignature[] {
  return NO_ELEMENT_ROWS.has(diagramType) ? [] : (ELEMENT_SIGNATURES[styleNameOf(diagramType)] ?? []);
}

/** `StyleSignatureBasic#clean` for an SName: lowercase, `_` dropped. @see StyleSignatureBasic.java:226-235 */
function cleanSName(sname: string): string {
  return sname.replaceAll('_', '').toLowerCase();
}

/**
 * Whether `<prefix> { <bucket> { ... } }` (both lowercased, as `StyleMap` keys are) misses the signature `bucket` reads
 * in this document (D5, D5a): a declaration applies only if all its SNames are in the element's
 * (`StyleSignatureBasic.java:194-220`). So `classDiagram { object }` is foreign on a class document, though
 * `classDiagram` is that document's own name. A bucket with no row is signed with the document's name.
 */
export function isForeignDiagramPrefix(prefix: string, bucket: string, diagramType: DiagramType): boolean {
  const row = signaturesOf(diagramType).find((r) => r.bucket === bucket);
  const snames = row === undefined ? [styleNameOf(diagramType)] : [...row.snames, ...(row.fontSnames ?? [])];
  return !snames.some((sname) => cleanSName(sname) === prefix);
}

/**
 * D3a: the flat path already holds this role, in this bucket or in the one a reader falls through to when this key is
 * absent. That one covers `rectangle { title { BackgroundColor } }`: the leaf's value is written, and a cluster reading
 * through to it would take a colour its own signature never sees.
 */
function heldByFlat(
  row: ElementSignature,
  role: 'background' | 'border' | 'font',
  flat: Partial<Record<string, ElementColors>> | undefined,
  out: Readonly<Partial<Record<string, ElementScopeColors>>>,
): boolean {
  if (flat?.[row.bucket]?.[role] !== undefined) return true;
  if (row.shadows === undefined) return false;
  return flat?.[row.shadows]?.[role] !== undefined || out[row.shadows]?.[role] !== undefined;
}

/** The two builders one read compares, and what an untouched default does. */
interface ScopeRead {
  readonly builder: StyleBuilder;
  readonly defaultBuilder: StyleBuilder;
  /** An untouched default keeps the flat path outright: `theme-dark`, or a caller-named theme (D3). */
  readonly keepDefault: boolean;
  readonly flat: Partial<Record<string, ElementColors>> | undefined;
}

/**
 * D3, D3a for one role. `Value#toString` is `value1/value2 (priority)` (`DarkString.java:86-88`), so a declaration
 * equal to the default is not the default: `note { #AAA } root { #FEFFDD }` draws `#FEFFDD` in the jar.
 *
 * A conditional `#?light:dark` is not written, as `build-theme.ts#rootCascadeSkinparams`: `HColorScheme` answers per
 * drawn element, against what it paints on (`HColorScheme.java:52-63`), and a bucket would print the raw token.
 */
function roleColor(
  read: ScopeRead,
  row: ElementSignature,
  role: keyof typeof ROLE_PNAMES,
  out: Readonly<Partial<Record<string, ElementScopeColors>>>,
): ElementColors['background'] {
  const signature = StyleSignatureBasic.of(...(role === 'font' ? (row.fontSnames ?? row.snames) : row.snames));
  const value = signature.getMergedStyle(read.builder)?.value(ROLE_PNAMES[role]);
  const raw = writableColor(value);
  if (raw === undefined) return undefined;
  const untouched = signature.getMergedStyle(read.defaultBuilder)?.value(ROLE_PNAMES[role]);
  const isDefault = value?.toString() === untouched?.toString();
  if (isDefault && (read.keepDefault || !heldByFlat(row, role, read.flat, out))) return undefined;
  return parseColor(raw);
}

/** The value's string, unless it has none (`ValueNull`, a dark-only value) or is conditional (see {@link roleColor}). */
function writableColor(value: Value | undefined): string | undefined {
  const raw = value?.asString();
  return !raw || parseConditionalColor(raw) !== undefined ? undefined : raw;
}

const ROLE_PNAMES: Readonly<Record<Exclude<keyof ElementScopeColors, 'titleFont'>, PName>> = {
  background: 'BackGroundColor',
  border: 'LineColor',
  font: 'FontColor',
};
const ROLES = Object.keys(ROLE_PNAMES) as readonly (keyof typeof ROLE_PNAMES)[];

/**
 * A description leaf's `fcTitle` (`EntityImageDescription.java:172,187-188`), written only where it parts from
 * `font`: a `title` declaration won (jar: bare `title { FontColor #CCC }` paints `[C]` and leaves
 * `component D as "dd d"` black), or `titleFont` holds a stale flat value (D3a).
 */
function titleFontOf(read: ScopeRead, row: ElementSignature): ElementColors['titleFont'] {
  if (row.fontSnames === undefined) return undefined;
  const title = StyleSignatureBasic.of(...row.snames)
    .getMergedStyle(read.builder)
    ?.value('FontColor');
  const plain = StyleSignatureBasic.of(...row.fontSnames)
    .getMergedStyle(read.builder)
    ?.value('FontColor');
  const raw = writableColor(title);
  if (raw === undefined) return undefined;
  const parted = title?.toString() !== plain?.toString();
  return parted || read.flat?.[row.bucket]?.titleFont !== undefined ? parseColor(raw) : undefined;
}

/**
 * The colours `theme.colors.elements` takes for this document, under D3's gate: non-empty `styles` or a `skin` (D3b),
 * and a `<style>` the parser accepts (D6). `flat` is `elements` as the flat path left it.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/style/StyleStorage.java:102-116
 */
export function elementScopeColors(
  pre: PreprocessorResult,
  diagramType: DiagramType,
  flat?: Partial<Record<string, ElementColors>>,
  options: ElementScopeOptions = {},
): Partial<Record<string, ElementScopeColors>> {
  const builder = options.builder ?? documentStyleBuilder(pre);
  const rows = signaturesOf(diagramType);
  if (builder === undefined || rows.length === 0) return {};
  const read: ScopeRead = {
    builder,
    defaultBuilder: buildMindmapStyleBuilder({ skinparam: new Map(), styles: [] }),
    keepDefault: options.callerNamedTheme === true || isDark(pre),
    flat,
  };
  const out: Partial<Record<string, ElementScopeColors>> = {};
  for (const row of rows) {
    for (const role of ROLES) {
      const color = roleColor(read, row, role, out);
      if (color !== undefined) out[row.bucket] = { ...out[row.bucket], [role]: color };
    }
    const titleFont = titleFontOf(read, row);
    if (titleFont !== undefined) out[row.bucket] = { ...out[row.bucket], titleFont };
  }
  return out;
}
