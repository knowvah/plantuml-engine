/**
 * Layout of a Chen EER diagram: `CucaDiagramFileMakerSvek#getTextBlock` up to `DotStringFactory#solve`, as
 * `GraphvizImageBuilder#buildImage` runs it. An empty diagram is a 10x10 block, a diagram of exactly one leaf is
 * drawn as an `EntityImageDegenerated` with no graphviz pass, and anything else is solved by the one dot-engine
 * seam ({@link solveChen}). The renderer draws that geometry and measures its ink (`SvekResult#calculateDimension`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/CucaDiagramFileMakerSvek.java:59-87
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/GraphvizImageBuilder.java:145-158
 */
import { MeasurerStringBounder } from '../../core/measurer-bounder.js';
import type { StringMeasurer } from '../../core/measurer.js';
import { createEntityImageBlockInternal } from '../../core/svek/GeneralImageBuilder.js';
import type { ChenEerDiagram } from './ChenEerDiagram.js';
import { NO_POLYGONS } from './cheneer-dot.js';
import type { ElkBackend } from '../../core/elk/elk-backend.js';
import { ELK_RENDER_SYNC_UNSUPPORTED } from '../../core/elk/layout-services.js';
import { layoutChenElk } from './layout-elk.js';
import { solveChen, type ChenGeometry } from './layout-geometry.js';

export type { ChenEdgeGeo, ChenGeometry, ChenNodeGeo } from './layout-geometry.js';

/** `EntityImageSimpleEmpty#calculateDimension`: what a diagram with no entity draws. @see GraphvizImageBuilder.java:146-147, 184 */
const EMPTY_SIZE = 10;

/** `DotData#isDegeneratedWithFewEntities(nb)`. @see DotData.java:69-71 */
function isDegeneratedWithFewEntities(diagram: ChenEerDiagram, nb: number): boolean {
  return diagram.groups().length === 0 && diagram.getLinks().length === 0 && diagram.leafs().length === nb;
}

/** `new EntityImageSimpleEmpty(...)`: the 10x10 of a diagram with nothing in it. */
function emptyGeometry(): ChenGeometry {
  return {
    dot: { nodes: [], edges: [] },
    nodes: [],
    edges: [],
    width: EMPTY_SIZE,
    height: EMPTY_SIZE,
    degenerate: false,
  };
}

/**
 * The single leaf as `createEntityImageBlock(single, ...)` builds it, placed at the origin for the renderer to wrap
 * in an `EntityImageDegenerated`. `single.getUSymbol() instanceof USymbolHexagon` never holds for a Chen leaf.
 * @see GraphvizImageBuilder.java:149-158
 */
function degenerateGeometry(diagram: ChenEerDiagram, stringBounder: MeasurerStringBounder): ChenGeometry {
  const single = diagram.leafs()[0]!;
  const image = createEntityImageBlockInternal(single, diagram.getSkinParam(), NO_POLYGONS, diagram);
  const dim = image.calculateDimension(stringBounder);
  const node = {
    id: single.getUid(),
    entity: single,
    image,
    width: dim.getWidth(),
    height: dim.getHeight(),
    x: 0,
    y: 0,
  };
  return {
    dot: { nodes: [], edges: [] },
    nodes: [node],
    edges: [],
    width: dim.getWidth(),
    height: dim.getHeight(),
    degenerate: true,
  };
}

/** A diagram that asks for ELK must never fall back to dot-engine (`CucaDiagram.java:478-479`, `:950-952`). */
function requireElk(elk: ElkBackend | undefined): ElkBackend {
  if (elk === undefined) throw new Error(ELK_RENDER_SYNC_UNSUPPORTED);
  return elk;
}

/**
 * The geometry of `diagram`: the DOT, the layout, and the leaves and links placed.
 * @see CucaDiagramFileMakerSvek.java:59-87, GraphvizImageBuilder.java:145-256
 */
export function layoutChen(diagram: ChenEerDiagram, measurer: StringMeasurer, elk?: ElkBackend): ChenGeometry {
  if (diagram.isUseElk()) return layoutChenElk(diagram, measurer, requireElk(elk));

  const stringBounder = new MeasurerStringBounder(measurer);
  if (isDegeneratedWithFewEntities(diagram, 0)) return emptyGeometry();

  if (isDegeneratedWithFewEntities(diagram, 1) && diagram.leafs()[0]!.getParentContainer() === diagram.getRootGroup())
    return degenerateGeometry(diagram, stringBounder);

  return solveChen({ diagram, stringBounder });
}
