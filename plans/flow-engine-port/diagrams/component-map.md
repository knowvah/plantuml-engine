# Component map — what this mission adds and touches

```plantuml
@startuml
title flow-engine-port component map
package "src/diagrams/flow (new)" {
  [FlowDiagramFactory + Command*] as Cmd
  [FlowDiagram] as Diag
  [ActivityBox] as Box
  [flow-export] as Exp
}
package "src/core/golem (new)" {
  [TilesField] as Field
  [Tile, TileArea, TileGeometry, Path, Position, MinMaxGolem] as Parts
}
package "src/core" {
  [TitledDiagram, Display, URectangle, UEllipse, ULine] as Klimt
  [block-extractor, assemble-svg] as Seams
}
[registered-plugins (java:185)] as Reg
Cmd --> Diag : lineSimple, linkSimple
Diag --> Field : createTile, addPath
Field --> Parts : positions and paths
Diag --> Box : one per tile
Box --> Klimt : draws box and label
Exp --> Diag : getTextBlock, drawU
Reg --> Cmd : registers plugin
Seams --> Diag : routes @startflow
@enduml
```
