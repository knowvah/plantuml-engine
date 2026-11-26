# Data flow: the svgDimensionStyle flag, after batch 2

Before batch 2, only class and the unchromed description path carried the flag to the shell.

```plantuml
@startuml
start
:skinparam svgDimensionStyle false;
:preprocessor skinparam map;
split
  :Theme.svgDimensionStyle = false;
  :sequence, state, activity, chromed description;
split again
  :engine SkinParam port;
  :svgDimensionStyle() returns false;
  :klimt basicSvgOption gets it;
split end
:fragment carries svgDimensionStyle false;
:chrome and finalizers spread the fragment;
:document-shell dimensionAttributes;
:root keeps viewBox, drops style, width and height;
stop
@enduml
```

Upstream: `TextBlockExporter.java:418-421` (the option), `SkinParam.java:1216-1218` (the read),
`SvgGraphics.java:795-799` (the root attributes).
