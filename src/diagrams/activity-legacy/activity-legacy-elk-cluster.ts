/**
 * The cluster half of {@link ActivityLegacyElkAdapter} (lae T2b): what `MyElkCluster` and the maker's group walk read
 * off a legacy activity group. Every group the engine opens is one: `PACKAGE` (a partition), `INNER_ACTIVITY` (a
 * braced activity) and `CONCURRENT_ACTIVITY`, since the ELK path runs no simplifier (lae D2) and
 * `printSingleGroup` skips only `CONCURRENT_STATE` (`CucaDiagramFileMakerElk.java:348-354`).
 *
 * The styles are upstream's `Cluster.getDefaultStyleDefinition(styleName, uSymbol, groupType)`, merged on the skin's
 * current style builder. `MyElkCluster#drawSingleCluster` signs no stereotype and never reads the group's own
 * `BACK` colour (`getBackColor(diagramType)` is null, `MyElkCluster.java:99-102`, `:122-124`): a partition's
 * `#LightSkyBlue` does not fill its ELK box (the jar's `elk-lap-partition.svg` has no `#87CEFA`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/elk/MyElkCluster.java:82-175
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/Cluster.java:288-298, 404-410, 703-715
 */
import type { Entity } from '../../core/abel/Entity.js';
import { GroupType } from '../../core/abel/GroupType.js';
import type { USymbol } from '../../core/decoration/symbol/USymbol.js';
import type { ElkClusterHeader, ElkClusterStyle } from '../../core/elk/ElkDiagramAdapter.js';
import { HColorSimple } from '../../core/klimt/color/HColorSimple.js';
import { HColors } from '../../core/klimt/color/HColors.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { HorizontalAlignment, horizontalAlignmentFromString } from '../../core/klimt/geom/HorizontalAlignment.js';
import type { Paint } from '../../core/paint.js';
import { createClusterHeader } from '../../core/svek/ClusterHeader.js';
import { getStyleName } from '../../core/svek/diagram-type-style-name.js';
import type { SName } from '../../core/style/SName.js';
import type { Style } from '../../core/style/Style.js';
import { StyleSignatureBasic } from '../../core/style/StyleSignatureBasic.js';
import type { ActivityDiagram } from './ActivityDiagram.js';
import { lightPaintOf } from './renderer-edge.js';

/** `DiagramType.CLASS.getStyleName()`: `MyElkCluster#getMagneticBorder`'s fixed diagram type. @see MyElkCluster.java:138 */
const MAGNETIC_BORDER_STYLE_NAME: SName = 'classDiagram';

/**
 * `Cluster.getDefaultStyleDefinition(diagramStyleName, symbol, groupType)` as a signature (the legacy engine is
 * never a state diagram, so the first branch is not reached).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/Cluster.java:288-298
 */
function getDefaultStyleDefinition(
  diagramStyleName: SName,
  symbol: USymbol | undefined,
  groupType: GroupType | undefined,
): StyleSignatureBasic {
  // `decoration/symbol/USymbol.ts` types its names as plain strings; they are style `SName`s upstream.
  if (symbol !== undefined)
    return StyleSignatureBasic.of('root', 'element', 'group', diagramStyleName, ...(symbol.getSNames() as SName[]));
  if (groupType === GroupType.PACKAGE)
    return StyleSignatureBasic.of('root', 'element', 'package_', 'group', diagramStyleName);
  return StyleSignatureBasic.of('root', 'element', 'group', diagramStyleName);
}

function merged(diagram: ActivityDiagram, signature: StyleSignatureBasic): Style {
  const style = signature.getMergedStyle(diagram.getSkinParam().getCurrentStyleBuilder());
  if (style === undefined) throw new Error('NullPointerException: no group style merged');
  return style;
}

function elkStyleOf(diagram: ActivityDiagram, style: Style): ElkClusterStyle {
  const set = diagram.getSkinParam().getIHtmlColorSet();
  return {
    shadowing: style.getShadowing(),
    stroke: style.getStroke(),
    roundCorner: style.value('RoundCorner').asDouble(),
    lineColor: lightPaintOf(style.value('LineColor').asColor(set)),
  };
}

/** The diagram's style name, `diagram.getDiagramType().getStyleName()`. */
function styleNameOf(diagram: ActivityDiagram): SName {
  return getStyleName(diagram.getDiagramType());
}

/**
 * `new ClusterHeader(g, diagram, stringBounder)`: the port the svek cluster already feeds
 * (`activity-legacy-dot.ts#printGroup`).
 * @see CucaDiagramFileMakerElk.java:329-331, MyElkCluster.java:109, 154
 */
export function elkClusterHeader(diagram: ActivityDiagram, g: Entity, stringBounder: StringBounder): ElkClusterHeader {
  const header = createClusterHeader(g, styleNameOf(diagram), diagram.getSkinParam(), diagram, stringBounder);
  return {
    getTitleAndAttributeHeight: () => header.titleAndAttributeHeight,
    getTitle: () => header.title,
    getStereo: () => header.stereo,
  };
}

/** `MyElkCluster#drawSingleCluster`'s style: no stereotype. @see MyElkCluster.java:93-96 */
export function elkClusterStyle(diagram: ActivityDiagram, g: Entity): ElkClusterStyle {
  return elkStyleOf(
    diagram,
    merged(diagram, getDefaultStyleDefinition(styleNameOf(diagram), g.getUSymbol(), g.getGroupType())),
  );
}

/** `MyElkCluster#getMagneticBorder`'s style: `DiagramType.CLASS` and the group's stereotype. @see MyElkCluster.java:138-142 */
export function elkClusterStyleForMagneticBorder(
  diagram: ActivityDiagram,
  g: Entity,
  uSymbol: USymbol,
): ElkClusterStyle {
  const signature = getDefaultStyleDefinition(MAGNETIC_BORDER_STYLE_NAME, uSymbol, g.getGroupType()).withTOBECHANGED(
    g.getStereotype(),
  );
  return elkStyleOf(diagram, merged(diagram, signature));
}

/**
 * `Cluster.getBackColor(null, ...)`: the style's `BackGroundColor`, transparent when unset or transparent.
 * @see Cluster.java:703-715, MyElkCluster.java:99-102
 */
export function elkClusterBackColor(diagram: ActivityDiagram, g: Entity): Paint {
  const style = merged(diagram, getDefaultStyleDefinition(styleNameOf(diagram), g.getUSymbol(), g.getGroupType()));
  const backColor = style.value('BackGroundColor').asColor(diagram.getSkinParam().getIHtmlColorSet());
  return lightPaintOf(
    backColor instanceof HColorSimple && backColor.isTransparent() ? HColors.transparent() : backColor,
  );
}

/**
 * `skinParam.getHorizontalAlignment(AlignmentParam.packageTitleAlignment, null, false, null)`: the value, else
 * `packageTitleAlignment`'s default `CENTER` (the `first`/`direction` arms need an arrow direction, null here).
 * @see SkinParam.java:691-750, AlignmentParam.java:44
 */
export function elkPackageTitleAlignment(diagram: ActivityDiagram): HorizontalAlignment {
  return (
    horizontalAlignmentFromString(diagram.getSkinParam().getValue('packagetitlealignment')) ??
    HorizontalAlignment.CENTER
  );
}
