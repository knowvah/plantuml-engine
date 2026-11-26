# Component map: what T2 and T3 touch

```plantuml
@startuml
package "sequence engine" {
  [command-participant.ts] as CP
  [command-lifeline.ts] as CL
  [sequence-command-registry.ts] as REG
  [parser.ts] as P
  [sequence-parse-helpers.ts] as H
}
package "core" {
  [HColorSet.ts] as HC
  [CommandExecutionResult.ts] as CER
  [parse-refusal.ts] as PR
  [dispatcher factory chain] as D
}
[description engine] as DESC
[class engine] as CLS

REG --> CP : registers participant and create
REG --> CL : registers the CommandActivate create rule
CP --> HC : refusesAsBareColor
CP --> CER : badColor message and score
CP --> H : sets executionError and its score
P --> H : reads the refusal
P --> PR : refuse with commandScore
D --> P : tries sequence first
D --> DESC : next factory when sequence refuses
D --> CLS : entity lines
@enduml
```
