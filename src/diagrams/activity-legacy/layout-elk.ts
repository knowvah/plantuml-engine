/**
 * Layout of a legacy activity diagram under `!pragma layout elk` (lae D2, #158): `CucaDiagram#getTextBlock` picks
 * `CucaDiagramFileMakerElk` (`CucaDiagram.java:478-479`), whose `getTextBlock` lays the leaves and groups out with ELK
 * and measures the resulting `MyElkDrawing`. None of the svek path applies here: no `CucaDiagramSimplifierActivity`
 * (`CucaDiagramFileMakerSvek.java:67` is the svek maker's, so an inner activity stays an ELK cluster), no empty-diagram
 * block and no `EntityImageDegenerated` (`GraphvizImageBuilder.java:145-158`), so a one-leaf diagram goes through ELK
 * too.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/elk/CucaDiagramFileMakerElk.java:477-500
 */
import type { ElkBackend } from '../../core/elk/elk-backend.js';
import { makeElkLayout } from '../../core/elk/CucaDiagramFileMakerElk.js';
import { MyElkDrawing, newMyElkDrawing } from '../../core/elk/MyElkDrawing.js';
import { MeasurerStringBounder } from '../../core/measurer-bounder.js';
import type { StringMeasurer } from '../../core/measurer.js';
import type { ActivityDiagram } from './ActivityDiagram.js';
import { ActivityLegacyElkAdapter } from './activity-legacy-elk-adapter.js';
import { NodePolygonStore } from './activity-legacy-dot.js';
import type { ActivityLegacyGeometry } from './layout-geometry.js';

/** Lays `diagram` out through `backend`: the geometry carries the `MyElkDrawing` the renderer draws as is. */
export function layoutActivityLegacyElk(
  diagram: ActivityDiagram,
  measurer: StringMeasurer,
  backend: ElkBackend,
): ActivityLegacyGeometry {
  const stringBounder = new MeasurerStringBounder(measurer);
  const adapter = new ActivityLegacyElkAdapter(diagram, stringBounder);
  const result = makeElkLayout(adapter, backend, newMyElkDrawing);
  const drawing = new MyElkDrawing(adapter, result.minMax, result);
  const dim = drawing.calculateDimension(stringBounder);
  return {
    dot: { nodes: [], edges: [] },
    nodes: [],
    edges: [],
    clusters: [],
    width: dim.getWidth(),
    height: dim.getHeight(),
    polygons: new NodePolygonStore(),
    elk: drawing,
  };
}
