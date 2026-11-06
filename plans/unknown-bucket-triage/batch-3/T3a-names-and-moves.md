# T3a — Name the HCL and sudoku rows; hand the moved rows over

**HCL:** `unknown/jubete-32-sutu417` and `unknown/vocago-35-xodu446` have the same `in.puml` and `in.svg` as
`hcl/jubete-32` and `hcl/vocago-35` (`cmp`, 2026-11-05) and the same survey `maxDelta` (1.923, 1.476). Both `hcl/`
rows are in `DIVERGENCES.md`'s Smetana table (`:98-99`, U-REC, U-ARROW, U-CLIP). Re-run `cmp` and the two surveys,
then add the `unknown/` copies to that table, or a line under it, saying they are the same rows. No new divergence.

**Sudoku:** `unknown/gazale-13-tadu312` and `unknown/lazama-75-loli189` (`sudoku 5678`, `sudoku 1234`). We draw the
syntax-error page (`Syntax Error? (Assumed diagram type: sequence)`); the GPL oracle draws a puzzle. User ruling
2026-10-13 (ufp D13, `.claude/memory/mirror-mit-edition.md`): mirror the MIT edition, which removes
`PSystemSudokuFactory` (`PSystemBuilder.java:161-164`, `// ::comment when __MIT__`). `README.md:79-89` already says
so. Add a `### Sudoku is not included` entry beside `### Ditaa is not included`, naming both rows, the ruling and
the Java. Read what the MIT build does with that line before writing "syntax error": with the factory gone, the
`@startuml` candidates refuse it, so check our page against an oracle of a line no factory accepts
(`scripts/oracle-render.sh` on `@startuml` / `nosuchkeyword 1234` / `@enduml`) and journal any difference beyond
the echoed line.

**Moved rows (D1):** comment on #123 naming `bitabu-34` and the three lone-note rows `coruvi-63`, `nezaxe-99`,
`tiseze-53`, with `PSystemBuilder.java:137,140` and `ActivityDiagramFactory.java:84-86`, and the SVG evidence
(`class="entity"`, `start_entity`). Comment on #121 that `dijapi-54` is counted there, not in #119. A comment must
not contain a `plans/<x>/README.md` path (the driver greps for one).

**Measure:** none beyond the `cmp` and the oracle.

## Acceptance
- Given `DIVERGENCES.md`, then all four rows are named with their mechanism and ruling or library.
- Given #121 and #123, then each has a comment naming its rows and the evidence.

Observability N/A. Rollback Reversible.
