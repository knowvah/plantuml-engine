# Data flow: a one-line key-tool source

How `@startuml` / `keycheck abc123` / `@enduml` reaches a page after this mission. The factory tries the regexes in
upstream's order (D1); the key classes build one black-on-white text block (D2, D3).

```plantuml
@startuml
participant "singleLinePlugin" as plugin
participant "PSystemVersionFactory" as factory
participant "PSystemKeycheck" as keycheck
participant "License" as license
participant "GraphicStrings" as gs

plugin -> factory : executeLine(source, line)
factory -> factory : test the six regexes in java:62-87 order
factory -> keycheck : new PSystemKeycheck(source, undefined, key)
plugin -> keycheck : calculateDimension / drawU
keycheck -> keycheck : header() - port version, MIT
keycheck -> license : addLicenseInfo(strings, NONE) - adds no line
keycheck -> keycheck : append the D5 line, then a blank
keycheck -> gs : createBlackOnWhite(strings)
gs --> plugin : the page
@enduml
```

`testdot` takes the same path through `PSystemVersion.createTestDot`, whose second line reads `DOT_ENGINE_VERSION`
from `src/core/version.ts` (D4) and never calls the layout engine (ruling 4).
