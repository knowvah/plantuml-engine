# T1 Java probe (aae)

`aae-probe.patch` adds `System.err.println("AAE …")` lines, and nothing else, to three upstream classes at the
oracle seam commit `8fec366a9` (the source of `oracle/dist/plantuml-oracle.jar`): `FtileFactoryDelegatorAssembly`,
`Snake` and `SheetBlock1`. The patch replaces the instrumented full copies first committed here, so no upstream
source is vendored (and CodeQL does not lint upstream's own code). Apply it in a scratch tree; never in the fork
checkout:

```sh
U=~/git/knowvah/plantuml           # the oracle fork checkout; read only
T=/tmp/aae-probe && mkdir -p $T/src $T/classes
for f in activitydiagram3/ftile/vcompact/FtileFactoryDelegatorAssembly activitydiagram3/ftile/Snake klimt/creole/SheetBlock1; do
  p=src/main/java/net/sourceforge/plantuml/$f.java; mkdir -p $T/src/$(dirname $p); git -C $U show 8fec366a9:$p > $T/src/$p
done
(cd $T/src && patch -p1 < "$OLDPWD/plans/activity-arrow-embed/measurements/aae-probe.patch")
javac -nowarn -cp oracle/dist/plantuml-oracle.jar -d $T/classes $(find $T/src -name '*.java')
java -Djava.awt.headless=true -DPLANTUML_DETERMINISTIC_TEXT=true \
  -cp $T/classes:oracle/dist/plantuml-oracle.jar net.sourceforge.plantuml.Run \
  -tsvg -o $T/out tests/fixtures/edge-label-embed/act3.puml 2>&1 | grep AAE
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
