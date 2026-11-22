# T1 Java probe (aae)

Instrumented copies of three upstream classes at the oracle seam commit `8fec366a9` (`~/git/plantuml` HEAD, the
source of `oracle/dist/plantuml-oracle.jar`). Each adds `System.err.println("AAE …")` lines only.

```sh
mkdir -p /tmp/aae-probe/classes
javac -nowarn -cp oracle/dist/plantuml-oracle.jar -d /tmp/aae-probe/classes \
  $(find plans/activity-arrow-embed/measurements/java/net -name '*.java')
java -Djava.awt.headless=true -DPLANTUML_DETERMINISTIC_TEXT=true \
  -cp /tmp/aae-probe/classes:oracle/dist/plantuml-oracle.jar net.sourceforge.plantuml.Run \
  -tsvg -o /tmp/aae-probe/out tests/fixtures/edge-label-embed/act3.puml 2>&1 | grep AAE
```

Output, 2026-11-22 (deduplicated; the jar lays out several times):

```
act3:       AAE assembly height=103.0 … tb=SheetBlock2
            AAE SheetBlock1 stripe atoms=[EmbeddedDiagram] width=61.0 height=68.0
            AAE Snake.getTextBlockPosition dim=[61.0,68.0] pt1=(13.3375,87.0) pt2=(13.3375,190.0)
act3-open:  AAE assembly height=262.0 … tb=SheetBlock2
            AAE Snake.getTextBlockPosition dim=[532.0,227.0] pt1=(13.3375,87.0) pt2=(13.3375,349.0)
act3-mixed: AAE SheetBlock1.calculateDimensionSlow minMax=(0,0)->(61.0,79.0) stripes=2
            AAE Snake.getTextBlockPosition dim=[61.0,79.0] pt1=(13.3375,87.0) pt2=(13.3375,201.0)
```

The SVG the instrumented run writes is byte-identical in geometry to the fixture (arrow 87 → 107, image at y 92), so
the block is 61x68, not 10 tall: the 20-long arrow and y 92 are produced later, by compression.
