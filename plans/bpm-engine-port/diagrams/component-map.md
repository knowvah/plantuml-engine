# Component map — what this mission adds and touches

```plantuml
@startuml
title bpm-engine-port component map
package "src/diagrams/bpm (new)" {
  [BpmDiagramFactory + Command*] as Cmd
  [BpmDiagram] as Diag
  [BpmElement, BpmBranch, BpmEvent*] as Elem
  [Grid, ChainImpl, Navigators, Cleaners] as Grid
  [GridArray] as Arr
}
package "src/diagrams/activity/ftile" {
  [FtileCircleStart, FtileDiamond, FtileBox, Hexagon (new)] as Ftiles
  [AbstractFtile (extended)] as AF
}
package "src/core" {
  [SkinParamFresh (options added)] as Skin
  [CircleStart] as CS
  [block-extractor, assemble-svg] as Seams
}
[registered-plugins (java:141)] as Reg
Cmd --> Diag : appends events
Diag --> Grid : createGrid, cleanGrid
Grid --> Arr : toArray
Arr --> Elem : draws cells
Elem --> Ftiles : toTextBlockInternal
Ftiles --> AF : extends
Ftiles --> CS : start circle
Diag --> Skin : fresh skin param
Reg --> Cmd : registers plugin
Seams --> Diag : routes @startbpm
@enduml
```
