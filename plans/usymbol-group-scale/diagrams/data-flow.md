# Data flow: a scaled USymbol group, after T1b and T1c

Before the mission, the geo was scaled first and drawn at scale 1, so every `asBig` literal stayed at 1 and the
pre-formatted header stereo was spliced unscaled.

```plantuml
@startuml
start
:layoutClass: NamespaceGeo in layout units;
:header stereo built with deferred numbers (T1c);
:scaleClassGeometry multiplies the geo by k;
:renderNamespaceUSymbol;
if (k is 1?) then (yes)
  :draw as before, no scale option;
else (no)
  :divide the geo and theme back to layout units (T1b);
  :ClusterDecoration and USymbol asBig in layout units;
  :renderDrawableToFragment with scale k;
endif
:splice the header, formatted once at k;
:cluster SVG;
stop
@enduml
```

Upstream: `SvgGraphics.java:467-474` (one multiply-then-format per number), `Cluster.java:367-374` and
`ClusterDecoration.java:66-92` (the draw), `ClusterHeader.java:173-220` (the stereo block).
