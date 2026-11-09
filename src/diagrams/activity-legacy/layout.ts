/**
 * Layout of a legacy activity diagram: `CucaDiagramFileMakerSvek#getTextBlock` up to `DotStringFactory#solve`. The
 * autarkic groups are simplified first (`CucaDiagramSimplifierActivity#simplify`, each one a nested pass that lays
 * itself out before the parent), then the root pass is solved ({@link solveActivityLegacy}). The renderer (T2c)
 * draws that geometry and measures its ink (`SvekResult#calculateDimension`, `svek/SvekResult.ts`:
 * `svekDimension`, `svekInkShift`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/CucaDiagramFileMakerSvek.java:59-87
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/GraphvizImageBuilder.java:145-150, 238-256
 */
import { MeasurerStringBounder } from '../../core/measurer-bounder.js';
import type { StringMeasurer } from '../../core/measurer.js';
import type { ActivityDiagram } from './ActivityDiagram.js';
import { CucaDiagramSimplifierActivity } from './CucaDiagramSimplifierActivity.js';
import { solveActivityLegacy, type ActivityLegacyGeometry } from './layout-geometry.js';
import { NodePolygonStore } from './activity-legacy-dot.js';

export type {
  ActivityLegacyClusterGeo,
  ActivityLegacyEdgeGeo,
  ActivityLegacyGeometry,
  ActivityLegacyNodeGeo,
} from './layout-geometry.js';

/** `EntityImageSimpleEmpty#calculateDimension`: what a diagram with no entity draws. @see GraphvizImageBuilder.java:146-147, 184 */
const EMPTY_SIZE = 10;

/** `DotData#isDegeneratedWithFewEntities(nb)`. @see DotData.java:69-71 */
function isDegeneratedWithFewEntities(diagram: ActivityDiagram, nb: number): boolean {
  return diagram.groups().length === 0 && diagram.getLinks().length === 0 && diagram.leafs().length === nb;
}

/** `new EntityImageSimpleEmpty(...)`: the 10x10 of a diagram with nothing in it. */
function emptyGeometry(): ActivityLegacyGeometry {
  return {
    dot: { nodes: [], edges: [] },
    nodes: [],
    edges: [],
    clusters: [],
    width: EMPTY_SIZE,
    height: EMPTY_SIZE,
    polygons: new NodePolygonStore(),
  };
}

/**
 * The geometry of `diagram`: the DOT, the layout, and the leaves, links and partitions placed.
 * @see CucaDiagramFileMakerSvek.java:59-87, GraphvizImageBuilder.java:145-256
 */
export function layoutActivityLegacy(diagram: ActivityDiagram, measurer: StringMeasurer): ActivityLegacyGeometry {
  const stringBounder = new MeasurerStringBounder(measurer);
  // `new CucaDiagramSimplifierActivity().simplify(diagram, stringBounder, DotMode.NORMAL)`. @see CucaDiagramFileMakerSvek.java:67-68
  new CucaDiagramSimplifierActivity().simplify(diagram, stringBounder, measurer);
  if (isDegeneratedWithFewEntities(diagram, 0)) return emptyGeometry();

  if (isDegeneratedWithFewEntities(diagram, 1))
    throw new Error('unported: EntityImageDegenerated (one leaf and no link, GraphvizImageBuilder.java:149-158)');

  return solveActivityLegacy({ diagram, stringBounder, measurer });
}
