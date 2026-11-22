# Component map: what each task touches

```plantuml
@startuml
package "src/core" {
  [index.ts nested callback] as IDX
  [internal-render-options.ts] as IRO
  [ReadLineReader.ts] as RLR
  [BlockUmlBuilder.ts] as BUB
  [error-diagrams.ts] as ERR
  [EmbeddedDiagram.ts] as ED
}
package "tests" {
  [embedded-diagram-preprocess-3015.test.ts] as TST
  [fixtures/embedded-diagram-3015] as FIX
}
package "oracle/goldens" {
  [svg-class ratchet + 2 goldens] as RAT
  [routing and refusal baselines] as BAS
}
IDX --> IRO : sets source description (T1c)
BUB --> RLR : readLines with description (T1c)
ERR --> RLR : readLines with description (T1c)
IRO ..> BUB : read by (T1c)
IRO ..> ERR : read by (T1c)
ED ..> IDX : JSDoc cites the nested preprocessing (T1b)
TST --> FIX : reads jar oracles (T1b, T1c)
TST --> IDX : renderSync
RAT --> BAS : twin rows cloned by pin tool (T1a)
@enduml
```
