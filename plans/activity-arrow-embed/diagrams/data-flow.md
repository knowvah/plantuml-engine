# Data flow: an activity-3 arrow label with an embed (aae)

Proposed flow after batch 2 (D3). The block measure is the one quantity every consumer reads; a label with no embed
line takes today's path unchanged. What the measure returns for an embed line is T1's finding.

```plantuml
@startuml
participant "Activity parser\n(-> label;)" as P
participant "edgeLabelBlock\n(create7, SIMPLE_LINE)" as B
participant "Creole sheet\n+ EmbeddedDiagram" as S
participant "edgeLabelBlockSize\n(Snake.java:247 dim)" as M
participant "Assembly reserve\n(tile-layout-inlabel)" as R
participant "Snake placement\n(edge-label-anchor)" as L
participant "Canvas origin and width\n(canvas-origin-text-ink)" as C
participant "Renderer" as D
P -> B : label display
B -> S : lines, stripes
S --> B : text stripes and embed atom
B -> M : calculateDimension
M --> R : height (35 + height reserve)
M --> L : width and height (mid - height / 2)
M --> C : extent for origin and width
L -> D : label top-left
D -> S : draw stripes, embed as image
@enduml
```
