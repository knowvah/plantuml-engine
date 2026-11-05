# Component map — what this mission touches (proposed)

```plantuml
@startuml
title components ddd changes
package "src/diagrams/description" {
  [command tables and grammars] as PC
  [layout and leaf sizing] as LY
  [renderer entity and cluster] as RN
  [link edge attributes] as LE
  [entity style reader] as ES
}
package "src/core" {
  [style builder] as SB
  [svek SvekEdge] as SV
  [extremity middle decor] as MD
  [USymbol folder border] as UF
  [Colors] as CO
}
package "src/diagrams/class" {
  [arrowhead middle draw] as CM
}
package "tests and oracle" {
  [routing and refusal gates] as GA
  [svg-description ratchet] as RA
  [parity files] as PF
}
PC --> CO : colour specs
PC --> GA : rows flip clean
SB --> ES : merged style per entity
ES --> LY : sizes from the same style
ES --> RN : corners, stroke, fonts
LE --> SV : shield, middle decor
SV --> MD : draws the decor
CM --> MD : moved to core
SV --> UF : magnetic force on line ends
RN --> RA : pinned at zero diff
RA --> PF : read eligibility
@enduml
```
