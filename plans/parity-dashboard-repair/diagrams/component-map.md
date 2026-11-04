# Component map — what this mission touches (proposed)

```plantuml
@startuml
title parity dashboard components touched by pdg
skinparam componentStyle rectangle

package "Changed by T1, T3, T5" {
  component "parity-dashboard-goldens\nfamily maps + guard" as GOLD
  component "parity-dashboard-inputs\nunknown tag tally" as INP
  component "parity-dashboard-notes\ngenerated unknown note" as NOTE
  component "parity-dashboard\npreamble, freshness" as DASH
}
package "Changed by T2" {
  component "svg-conformance-census\nargv, sequence, gantt" as CEN
}
package "Rewritten by T4" {
  artifact "parity and census json" as JSON
  artifact "docs/parity-report.md" as REP
}
package "Read only" {
  artifact "oracle/goldens svg families" as PINS
  artifact "test-results/dot-cache" as CACHE
  component "render-fixture helpers" as HELP
}

CEN --> HELP : renders through
CEN --> CACHE : compares against
CEN --> JSON : writes
GOLD --> PINS : reads pins
INP --> JSON : reads tallies
INP --> CACHE : reads jar tags
NOTE --> INP : takes tally from
DASH --> GOLD : composes
DASH --> NOTE : composes
DASH --> REP : writes
@enduml
```
