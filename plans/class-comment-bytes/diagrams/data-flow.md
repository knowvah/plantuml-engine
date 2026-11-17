# Data flow: one class-engine leaf or link, after T1b-T1e

Before the mission, a hidden leaf or link returned before writing anything, every remaining classifier wrote
`<!--class X-->` whatever its kind, and names came from a `.` split or the display label.

```plantuml
@startuml
start
:parser creates the quark (classifier or namespace);
note right: T1d/T1e stamp quarkName with the separator active now
:geo builders copy quarkName onto ClassifierGeo / NamespaceGeo;
:renderClass walks clusters, then nodes, then edges (jar order);
if (leaf or link?) then (leaf)
  :image kind from the GeneralImageBuilder dispatch (T1b);
  if (hidden?) then (yes)
    :write only the comment the image would write (T1c);
  else (no)
    :comment when the image is class or entity, then the entity group;
  endif
else (link)
  if (consumed by an Opale note?) then (yes)
    :write nothing;
  elseif (hidden, or an endpoint hidden?) then (yes)
    :write only the link comment (T1c);
  else (no)
    :link comment, then the link group;
  endif
endif
stop
@enduml
```

Upstream: `SvekResult.java:70-101` (draw order, `UHidden`), `AbstractUGraphic.java:128-131` (the comment precedes the
hidden check), `SvgGraphics.java:1190-1195` (an empty group is dropped), `GeneralImageBuilder.java:107-242` (the
dispatch), `EntityImageClass.java:142`, `EntityImageDescription.java:295`, `Cluster.java:298-311`,
`Entity.java:686-688` (`getName`).
