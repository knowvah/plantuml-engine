# Data flow: how an accepted @startdot row is measured

The jar and the port start from the same DOT. They part where text is measured. The ratchet holds the resulting score;
the survey never sees it.

```plantuml
@startuml
participant "dot.golden.ratchet.test" as R
participant "renderSync (INSECURE)" as P
participant "dot-engine LutTextMeasurer" as L
participant "golden.svg (jar, INSECURE)" as G
participant "accepted-divergences.json" as A
R -> P : in.puml
P -> L : measure "Node A" (Times 14)
L --> P : 42.75 (no kern pair)
P --> R : our SVG (node a rx 40.09)
R -> G : read
G --> R : jar SVG (node a rx 39.58, pango kerned)
R -> R : compareSvg, then weightedScore
R -> A : accepted id is in force?
A --> R : svg-dot/slug entry (surveyBlind)
note over R : pass when the score is at most the pin and greater than 0
@enduml
```
