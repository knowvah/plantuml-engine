# Component map — what this mission touches (proposed)

```plantuml
@startuml
title components stdd changes
package "src/diagrams/state" {
  [parser and commands] as PC
  [layout and composite pass] as LY
  [renderer] as RN
  [transitions] as TR
  [border point] as BP
  [composite box] as CB
}
package "src/core" {
  [abel Colors] as CO
  [scale-command] as SC
  [TextBlockExporter] as TE
  [svek SvekEdge] as SV
}
package "tests and oracle" {
  [render-fixture-state] as RF
  [state ratchet] as RA
  [parity and census files] as PF
}
PC --> CO : colour specs, link style
PC --> SC : scale directive
LY --> RN : geometry, uids
RN --> BP : no entity group
RN --> CB : description zone
RN --> TR : lines drawn last
TR --> SV : mirrors id and uniq
RN --> TE : scaleSpec and dpi
RF --> RN : ratchet path
RA --> RF : holds pinned rows
PF --> RA : dotEqual eligibility
@enduml
```
