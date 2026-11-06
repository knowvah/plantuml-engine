# Component map: what each task touches

```plantuml
@startuml
package "activity engine" {
  [dispatch and AST] as disp
  [dispatch-stereogroup] as sg
  [scoped colours] as sc
  [tiles and sizers] as tiles
  [shape and composite renderers] as rend
}
package "klimt" {
  [SvgNanoParser] as nano
}
package "state engine" {
  [box and table renderers] as state
}
package "sequence engine" {
  [note placement] as seq
}
package "oracle tests" {
  [activity, sequence, state ratchets] as ratchet
}
disp --> sg : T1a reads inner colours
sc --> rend : T1b one merged style
tiles --> rend : T1b sized by that style
rend --> nano : T2a sprite with the group stroke
state --> state : T2b ambient table stroke
seq --> seq : T2c note at the left edge
ratchet --> rend : T3c pins unknown rows
@enduml
```
