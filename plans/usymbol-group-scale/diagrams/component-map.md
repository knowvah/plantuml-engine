# Component map

The modules the mission changes (highlighted), what feeds them and what checks them.

```plantuml
@startuml
component "class-scale-geo.ts" as SG
component "class-namespace-usymbol-shape.ts" as US #FFEEEE
component "class-cluster-header.ts" as CH #FFEEEE
component "class-namespace-shape.ts" as NS #FFEEEE
component "renderer.ts renderNamespace" as RN #FFEEEE
component "core/svek ClusterDecoration and USymbol asBig" as CD
component "renderDrawableToFragment" as RF
component "usymbol-group-scale.authored.test.ts" as GATE
SG --> RN : scaled geo and scaleK
RN --> US : USymbol groups
RN --> NS : folder and rect groups
US --> CD : layout-unit draw
US --> RF : scale k
CH --> US : header block and splice
CH --> NS : placeHeaderStereo
GATE ..> RN : renders 29 fixtures
@enduml
```

`core/svek` and the `USymbol` classes are read-only here: they are shared with the description engine, which is
already conformant under scale (`desc-rectangle`).
