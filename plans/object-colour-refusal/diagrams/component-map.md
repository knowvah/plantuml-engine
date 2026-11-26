# Component map: what T2 and T3 touch

```plantuml
@startuml
package "src/core" {
  [klimt/color/HColorSet.ts\nbare-colour predicate (D2)] as H
  [klimt/color/ColorParser.ts\nCOLOR_REGEXP] as CP
  [command/CommandCreateJson.ts\napply functions + JsonCommandHost] as J
  [command/CommandExecutionResult.ts\nbadColor message and score] as B
}
package "src/diagrams/class" {
  [class-object-commands.ts\nobject single and multi-line] as O
  [class-json-commands.ts\nclass host] as CJ
  [parser.ts\npendingBodyRefusal at the closing brace] as CPa
}
package "src/diagrams/state" {
  [state-json-commands.ts\nstate host, deferred refusal (T3)] as SJ
}
package "src/diagrams/description" {
  [command-json.ts\ndescription host] as DJ
  [parser.ts\nrefusal line (T3)] as DP
}
O --> H : test the capture
J --> H : test the capture
H --> CP : anchored bare shape
O --> B : message and score
J --> B : message and score
J --> CJ : host refusal member
J --> SJ : host refusal member
J --> DJ : host refusal member
O --> CPa : multi-line refusal
CJ --> CPa : multi-line refusal
DJ --> DP : last line of the block
@enduml
```
