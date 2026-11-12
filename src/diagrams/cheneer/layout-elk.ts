/**
 * Layout of a Chen diagram under `!pragma layout elk`: `CucaDiagram#getTextBlock` picks `CucaDiagramFileMakerElk`
 * (`CucaDiagram.java:478-479`), whose `getTextBlock` (`CucaDiagramFileMakerElk.java:477-499`) lays the leaves out with
 * ELK and measures the resulting `MyElkDrawing`. None of the svek shortcuts applies here: no empty-diagram block and no
 * `EntityImageDegenerated` (`GraphvizImageBuilder.java:145-158` is svek's), so a one-leaf diagram goes through ELK too.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/elk/CucaDiagramFileMakerElk.java:477-499
 */
import type { ElkBackend } from '../../core/elk/elk-backend.js';
import { makeElkLayout } from '../../core/elk/CucaDiagramFileMakerElk.js';
import { MyElkDrawing, newMyElkDrawing } from '../../core/elk/MyElkDrawing.js';
import { MeasurerStringBounder } from '../../core/measurer-bounder.js';
import type { StringMeasurer } from '../../core/measurer.js';
import type { ChenEerDiagram } from './ChenEerDiagram.js';
import { ChenEerElkAdapter } from './cheneer-elk-adapter.js';
import type { ChenGeometry } from './layout-geometry.js';

/** Lays `diagram` out through `backend`: the geometry carries the `MyElkDrawing` the renderer draws as is. */
export function layoutChenElk(diagram: ChenEerDiagram, measurer: StringMeasurer, backend: ElkBackend): ChenGeometry {
  const stringBounder = new MeasurerStringBounder(measurer);
  const adapter = new ChenEerElkAdapter(diagram, stringBounder);
  const result = makeElkLayout(adapter, backend, newMyElkDrawing);
  const drawing = new MyElkDrawing(adapter, result.minMax, result);
  const dim = drawing.calculateDimension(stringBounder);
  return {
    dot: { nodes: [], edges: [] },
    nodes: [],
    edges: [],
    width: dim.getWidth(),
    height: dim.getHeight(),
    degenerate: false,
    elk: drawing,
  };
}
