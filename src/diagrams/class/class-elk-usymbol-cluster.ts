/**
 * A class group that carries a USymbol (`component c1 { ... }`, `node`, `database`, ...) under `!pragma layout elk`:
 * what `MyElkCluster` and `ClusterHeader` read off `Entity#getUSymbol()` (the folder family is the null symbol, as the
 * adapter has always answered for it).
 *
 * - `MyElkCluster.java:93-104` merges `Cluster.getDefaultStyleDefinition(classDiagram, uSymbol, PACKAGE)`: the group's
 *   thickness and dash come from the symbol's own element tier, then `plantuml.skin:102-104`'s `group { LineThickness 1 }`
 *   (not the folder family's 1.5), and its line colour from the symbol's tier, then `packageBorderColor`;
 * - `Cluster.getBackColor` (`Cluster.java:701-710`) reads `BackGroundColor` off the same signature, transparent by
 *   default (the oracle draws `fill="none"`);
 * - `ClusterHeader.java:81-95` adds `uSymbol.suppHeightBecauseOfShape()` to the title height;
 * - the title is the USymbol one (`{..., <usymbol>, composite, title}`, `ClusterHeader.java:150-153`): `packageFontColor`
 *   never reaches it, so its colour is the group default.
 *
 * The same cascade the svek path draws a USymbol group with (`class-namespace-usymbol-shape.ts`), minus the group's own
 * inline colours, which the ELK adapter has never carried (`getEntityColors`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/elk/MyElkCluster.java:91-126
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/ClusterHeader.java:73-96
 */
import type { USymbol } from '../../core/decoration/symbol/USymbol.js';
import type { ElkClusterStyle } from '../../core/elk/ElkDiagramAdapter.js';
import { UStroke } from '../../core/klimt/UStroke.js';
import type { Paint } from '../../core/paint.js';
import { clusterBucketOf } from '../../core/style-element-scope.js';
import type { Theme } from '../../core/theme.js';
import type { Namespace } from './ast.js';
import { namespaceColorFill } from './class-namespace-shape.js';
import { GROUP_STROKE_WIDTH, resolveKeywordUSymbol } from './class-namespace-usymbol-shape.js';
import { byStereo, elementLineStyle, isFolderFamilyUSymbol, namespaceRoundCorner } from './class-package-style.js';

/** The group's USymbol keyword, `undefined` for a bare package or the folder family (`ClusterDecoration#guess`). */
function keywordOf(ns: Namespace): string | undefined {
  return ns.usymbol === undefined || isFolderFamilyUSymbol(ns.usymbol) ? undefined : ns.usymbol;
}

/** `Entity#getUSymbol()` of a group, `null` where the folder/package path draws it. */
export function classElkGroupUSymbol(ns: Namespace, theme: Theme): USymbol | null {
  return resolveKeywordUSymbol(keywordOf(ns), theme) ?? null;
}

/** The style `MyElkCluster` reads for a USymbol group, `undefined` for a group that is not one. */
export function classElkUSymbolClusterStyle(
  ns: Namespace,
  theme: Theme,
  tags: readonly string[],
): ElkClusterStyle | undefined {
  const keyword = keywordOf(ns);
  if (keyword === undefined || classElkGroupUSymbol(ns, theme) === null) return undefined;
  const own = theme.colors.elements?.[keyword];
  const specific = { ...own, ...theme.colors.elements?.[clusterBucketOf(keyword)] };
  const thickness = byStereo(own?.lineThicknessByStereo, tags) ?? own?.lineThickness ?? GROUP_STROKE_WIDTH;
  const dash = elementLineStyle(theme, [keyword, 'group'], tags) ?? { dashVisible: 0, dashSpace: 0 };
  return {
    shadowing: theme.shadowing ?? 0,
    stroke: new UStroke(dash.dashVisible, dash.dashSpace, thickness),
    roundCorner: namespaceRoundCorner(ns, theme),
    lineColor:
      byStereo(specific.borderByStereo, tags) ??
      specific.border ??
      theme.colors.graph.packageBorder ??
      theme.colors.border,
  };
}

/** `Cluster.getBackColor` for a group: its USymbol's element tier, else the package background. */
export function classElkGroupBackColor(ns: Namespace, theme: Theme): Paint {
  return namespaceColorFill(undefined, theme, keywordOf(ns));
}
