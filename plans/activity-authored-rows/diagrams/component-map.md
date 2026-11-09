# Component map: what each batch touches

```plantuml
@startuml
package "src/core" {
  [skinparam block parser\nand router] as route
  [creole atoms\nsprites, emoji, qrcode] as creole
  [style builder\nmerged styles] as style
}
package "src/diagrams/activity" {
  [parser commands] as cmd
  [while and repeat tiles] as loops
  [fork, split, merge builders] as par
  [if and switch tiles] as cond
  [connectors and rainbows] as conn
  [group tile and notes] as group
  [spot glyph data] as glyph
}
package "tests" {
  [dss pin\nauthored rows] as pin
  [activity golden ratchet] as gold
}
route --> cmd : T1a
cmd --> loops : T1b
loops --> conn : T2a
par --> conn : T2b
cond --> conn : T2c
conn --> gold : T3a, T3b, T3c
style --> cond : T4a
style --> group : T4b, T4c
creole --> group : T5b
glyph --> pin : T5a
pin --> gold : T0, pins per task
@enduml
```
