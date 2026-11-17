# Component map

The one module that changes (T1b), what feeds it and what reads it.

```plantuml
@startuml
component "description-entity-style.ts" as DES #FFEEEE
component "parse-state.ts" as PS
component "core/style StyleSignatureBasic" as SSB
component "renderer-entity.ts" as RE
component "leaf sizer (entitySizing)" as LS
component "usecase-title-style.authored.test.ts" as GATE
PS --> DES : node.styleGeneration
SSB --> DES : signature and merge
DES --> RE : entityStyle.title
DES --> LS : thickness, fonts
GATE ..> RE : renders 6 fixtures
@enduml
```

Only `description-entity-style.ts` changes in `src/`. The renderer already reads `entityStyle.title` for every symbol.
