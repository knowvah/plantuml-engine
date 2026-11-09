/**
 * One legacy activity partition as `Cluster#drawU` draws it: the solved {@link ActivityLegacyClusterGeo} becomes the
 * inputs of the shared drawing half (`core/svek/Cluster.ts`). The style is `getDefaultStyleDefinition(styleName,
 * USymbols.PACKAGE, groupType)` (a group with no symbol reads the package symbol's style, whose `getSNames()` is `package_`, `Cluster.java:451-457`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/Cluster.java:298-372, 683-712
 */
import { ColorType } from '../../core/abel/ColorType.js';
import type { HColorOrPaint } from '../../core/klimt/color/ColorMapper.js';
import { HColorGradient } from '../../core/klimt/color/HColorGradient.js';
import { HColorSimple } from '../../core/klimt/color/HColorSimple.js';
import { HorizontalAlignment, horizontalAlignmentFromString } from '../../core/klimt/geom/HorizontalAlignment.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import { Cluster, type ClusterGroupInfo, type ClusterStyleDefaults } from '../../core/svek/Cluster.js';
import { PackageStyle, type PackageStyleName } from '../../core/svek/PackageStyle.js';
import type { SName } from '../../core/style/SName.js';
import type { StyleBuilder } from '../../core/style/StyleBuilder.js';
import { StyleSignatureBasic } from '../../core/style/StyleSignatureBasic.js';
import type { Style } from '../../core/style/Style.js';
import type { ActivityLegacyClusterGeo } from './layout.js';
import type { ActivityLegacySkinParam } from './activity-legacy-skin-param.js';

const STYLE_NAME: SName = 'activityDiagram';

/** `skinParam.packageStyle()`: `packageStyle`, else FOLDER. @see SkinParam.java:819-826 */
function packageStyleOf(skinParam: ActivityLegacySkinParam): PackageStyleName {
  const value = skinParam.getValue('packagestyle')?.trim().toUpperCase();
  const known = Object.values(PackageStyle).find((name) => name === value);
  return known ?? PackageStyle.FOLDER;
}

function paintOf(color: object | undefined): HColorOrPaint | null {
  if (color === undefined) return null;
  if (color instanceof HColorSimple) return color;
  if (color instanceof HColorGradient) return color;
  throw new Error('ClassCastException: colour is not an HColorSimple or HColorGradient');
}

/** `Cluster#getStyle`. @see Cluster.java:441-448 */
function clusterStyleOf(cluster: ActivityLegacyClusterGeo, builder: StyleBuilder): Style {
  const style = StyleSignatureBasic.of('root', 'element', STYLE_NAME, 'group', 'package_')
    .withTOBECHANGED(cluster.group.getStereotype())
    .getMergedStyle(builder);
  if (style === undefined) throw new Error('NullPointerException: no group style merged');
  return style;
}

function groupInfoOf(cluster: ActivityLegacyClusterGeo): ClusterGroupInfo {
  const group = cluster.group;
  const colors = group.getColors();
  const url = group.getUrl99();
  const location = group.getLocation();
  return {
    hidden: group.isHidden(),
    name: group.getName(),
    uid: group.getUid(),
    qualifiedName: group.getQuark().getQualifiedName(),
    location: location === undefined ? null : { position: location.getPosition() },
    isRoot: false,
    lineColorOverride: paintOf(colors.getColor(ColorType.LINE)),
    backColorOverride: paintOf(colors.getColor(ColorType.BACK)),
    specificLineStroke: colors.getSpecificLineStroke() ?? null,
    ...(url === undefined ? {} : { url: { url: url.getUrl(), tooltip: url.getTooltip() } }),
  };
}

function styleDefaultsOf(style: Style, skinParam: ActivityLegacySkinParam): ClusterStyleDefaults<HColorOrPaint> {
  const set = skinParam.getIHtmlColorSet();
  return {
    shadowing: style.getShadowing(),
    roundCorner: style.value('RoundCorner').asDouble(),
    strictUmlStyle: skinParam.strictUmlStyle(),
    diagonalCorner: style.value('DiagonalCorner').asDouble(),
    lineColorDefault: paintOf(style.value('LineColor').asColor(set)) ?? 'none',
    backGroundColorDefault: paintOf(style.value('BackGroundColor').asColor(set)),
    strokeDefault: style.getStroke(),
  };
}

/**
 * Under swimlanes `drawU` draws the title at `xyTitle.x`, the min x of the title table `DotStringFactory#solve` read
 * back (`cluster.setTitlePosition(SvekUtils.getMinXY(pointsTitle))`). Our label is the table's centre.
 * @see Cluster.java:347-350, 438-446; DotStringFactory.java:440-448
 */
function swimlaneTitle(
  cluster: ActivityLegacyClusterGeo,
  skinParam: ActivityLegacySkinParam,
): { swimlaneTitleX?: number } {
  if (!skinParam.swimlanes()) return {};
  const label = cluster.label;
  if (label === undefined) throw new Error('unported: a swimlane with no title table');
  return { swimlaneTitleX: label.x - label.width / 2 };
}

/** Draws `cluster` (`Cluster#drawU`). The geometry is translated by the caller's `ug`. */
export function drawCluster(ug: UGraphic, cluster: ActivityLegacyClusterGeo, skinParam: ActivityLegacySkinParam): void {
  // Port-only: `group.getColors().mute(skinParam)`'s muted builder is the diagram's; the group's own LINE and BACK
  // colours are applied by `Cluster#drawU` as overrides (`groupInfoOf`).
  const style = clusterStyleOf(cluster, skinParam.getCurrentStyleBuilder());
  const drawn = new Cluster(
    groupInfoOf(cluster),
    {
      title: cluster.header.title,
      stereo: cluster.header.stereo,
      titleHorizontalAlignment: style.getHorizontalAlignment() ?? HorizontalAlignment.LEFT,
    },
    {
      position: new UTranslate(cluster.x, cluster.y),
      width: cluster.width,
      height: cluster.height,
      ...swimlaneTitle(cluster, skinParam),
    },
    styleDefaultsOf(style, skinParam),
    {
      symbol: null,
      packageStyle: cluster.group.getPackageStyle() ?? null,
      defaultPackageStyle: packageStyleOf(skinParam),
      stereoAlignment:
        horizontalAlignmentFromString(skinParam.getValue('stereotypealignment')) ?? HorizontalAlignment.CENTER,
    },
  );
  drawn.drawU(ug);
}
