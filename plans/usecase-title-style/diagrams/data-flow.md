# Data flow: a use case's border style

Where the usecase's `title` style comes from, after T1b. Before T1b, the signature had no `title` part and the builder
was always the diagram's last one.

```plantuml
@startuml
start
:parse: usecase node, styleGeneration recorded;
:annotateEntityStyles;
if (any skinparam in the diagram?) then (yes)
  :builder = the diagram's last;
else (no)
  :builder = the one current at the node;
endif
:sign root, element, componentDiagram, usecase, title;
:merge with the node's stereotype;
:entityStyle.title;
:renderer-entity reads LineColor, BackGroundColor, stroke;
:USymbolUsecase draws the ellipse;
stop
@enduml
```

Upstream: `Entity.java:755-767` (the builder), `EntityImageDescription.java:142-171` (signature and reads),
`GeneralImageBuilder.java:169-175` (the dispatch that makes this path the one a use case takes).
