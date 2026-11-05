# T4a — degenerate and leaf sizing

Commit: `fix(description): size a lone leaf with the element's fonts`.

## Context
Codd left this named: "Degenerate-leaf sizing omits element font options (`layout.ts:406` vs `layout-dot-tree.ts:190-206`; kuciku, mavicu; patch proven in T4's report)". Read `plans/component-divergence-drive/measurements/T4-report.md`. Line numbers will have moved. `EntityImageDegenerated.java` and `CucaDiagramFileMakerSvek` are the jar's path.

- Stereotype font size: `kuciku-99`, `mavicu-17`, `bixofa-44`.
- `wrapWidth` and `maxMessageSize` on a lone rectangle: `depali-74`, `nefire-75`, `zoguvu-43`, and with a link, `zimuxu-52`. `style.wrapWidth()` (`EntityImageDescription.java:188-191`) is read from `style`, not the skinparam, so check `FromSkinparamToStyle`.
- `==` headings and `%n()` in a body, with a coloured `<color>` line: `sotine-10`, `sumata-59`, `xixaca-96`, `toxeto-79`, `xapuji-91`, `zetedu-83`, `fesusa-40`. Height 84 against 98.
- OpenIconic in a use case: `ridola-99`, `pacope-41`. Text width 1 px off in the ellipse.
- `tegaju-61`, `vomaka-65`: the survey says `dotEqual` false; read which leaf is off.

## Rows
`kuciku-99`, `mavicu-17`, `bixofa-44`, `depali-74`, `nefire-75`, `zoguvu-43`, `zimuxu-52`, `sotine-10`, `sumata-59`, `xixaca-96`, `toxeto-79`, `xapuji-91`, `zetedu-83`, `ridola-99`, `pacope-41`, `tegaju-61`, `vomaka-65`, `larevi-66`.

## Acceptance
- Given `kuciku-99`, when rendered, then the canvas is the jar's 112 x 84, and the row has zero diffs.
- Given `depali-74`, then the wrapped lines and canvas match.
- Given `sotine-10`, then the height is 98.

Observability: N/A — no new observable operations. Rollback: Reversible.
