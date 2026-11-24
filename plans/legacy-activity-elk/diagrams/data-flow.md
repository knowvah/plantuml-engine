# Data flow

A legacy activity source with `!pragma layout elk`, after this mission. The svek branch is unchanged and drawn only
for contrast.

```plantuml
@startuml
start
:parseActivityLegacy: ActivityDiagram, setUseElk(true);
:activityLegacyPlugin.requiresElk answers isUseElk();
if (an ELK backend was supplied?) then (yes)
  :layoutActivityLegacy branches before the simplifier;
  :ActivityLegacyElkAdapter over the abel model;
  :makeElkLayout walks groups, leaves and links;
  :ElkBackend lays the graph out;
  :MyElkDrawing measured by calculateDimension;
  :renderActivityLegacy draws the drawing as the text block;
  stop
else (no)
  :throw ELK_RENDER_SYNC_UNSUPPORTED;
  end
endif
@enduml
```

Without the pragma nothing changes: `CucaDiagramSimplifierActivity`, then `solveActivityLegacy` on dot-engine, then
the svek renderer.
