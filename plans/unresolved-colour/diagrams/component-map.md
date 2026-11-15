# Component map: where each mechanism is ported

Faithful core ports (already used by state, at 0 diffs) on the left. The class and description sites this mission
changes are on the right. The two gates read the rendered SVG.

```plantuml
@startuml
package "core (faithful)" {
  [HColorSet.ts] as HCS
  [WithLinkType.ts] as WLT
  [Colors.ts] as COL
  [ValueImpl.ts] as VI
}
package "class (batch 2)" {
  [class-arrow-grammar.ts] as CAG
  [class colour parsers] as CCP
  [style-cascade-class.ts and theme] as CSC
}
package "description (batch 3)" {
  [link-grammar.ts] as DLG
  [renderer-color-override.ts and link-colors.ts] as DCO
}
package "gates (batch 1)" {
  [refusal-coverage-gate.ts] as RG
  [unresolved-colour.authored.test.ts] as AG
  [svg-colour-validity.ts] as SCV
}
WLT --> HCS : getColorOrWhite
COL --> HCS : getColorOrNull
VI --> HCS : getColorOrWhite
CAG ..> HCS : T2a M1
CCP ..> HCS : T2b M2
CSC ..> VI : T2c M3
DLG ..> HCS : T3a M1
DCO ..> HCS : T3b M2
RG --> SCV : every committed row
AG --> SCV : 27 probes
@enduml
```
