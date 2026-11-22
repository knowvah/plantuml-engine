# Data flow: an unknown arrow colour

Proposed state after T2a. The jar errors at parse time; we carry the token to render time and resolve it there.

```plantuml
@startuml
title "-[#zzblue]->": the jar versus this port (after T2a)
participant "activity dispatch\n(node-dispatch.ts)" as D
participant "ActivityArrowLabel\n(ast.ts)" as A
participant "planEdgeDraw / memberLook\n(activity-rainbow.ts)" as R
participant "colorOrNeutral\n(HColorSet.ts)" as N
participant "SVG" as S

D -> A : style "#zzblue"
note right of D
  jar: CommandArrow3 calls Rainbow.build,
  HtmlColorAndStyle.java:100 getColor throws,
  SingleLineCommand2 returns badColor:
  error page "No such color"
end note
A -> R : edge.color "#zzblue"
R -> N : token "#zzblue"
N --> R : "#D3D3D3" (unparseable)
R -> S : path and polygon stroke #D3D3D3
@enduml
```

The swimlane (T2b) and note (T2c) sites follow the same shape, with `colorOrNeutral` applied where the parser stores
the token instead of at render time.
