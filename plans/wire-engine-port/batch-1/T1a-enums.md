# T1a — The three enums

**Read:** `wire/WArrowDirection.java`, `wire/WLinkType.java`, `wire/WOrientation.java` (whole files); D1, D4, D9.

**Write-set:** `src/diagrams/wire/{WArrowDirection,WLinkType,WOrientation}.ts`, `tests/unit/wire/{WArrowDirection,WLinkType,WOrientation}.test.ts`.

**Do:** port the three as `const` enum-like objects or classes with the upstream names and statics (`from`,
`spaceForNext`), following how the repo ports small Java enums (`src/diagrams/regex/ReTokenType.ts`). `WLinkType.from`
checks `-` before `=` and throws `IllegalArgumentException` otherwise; `spaceForNext` is `15` and `25` with a
`WLinkType.java` citation.

Journal D1's two reachability greps, run fresh:
`grep -rnE "\bWCursor\b" ~/git/plantuml/src/main ~/git/plantuml/src/test` and
`grep -rn "wire\.Block" ~/git/plantuml/src/main ~/git/plantuml/src/test`. If either finds code that uses the class, stop
treating it as unreachable and add a task that ports it (D1).

**Tests (from the Java):** every style spelling the regex admits: `->`, `<->`, `<-`, `-`, `-->`, `<-->`, `<--`, `--`,
`=>`, `<=>`, `<=`, `=`, `==>`, `<==>`, `<==`, `==` for direction, type and orientation.

## Acceptance
- Given each of the 16 spellings, when the three `from`s run, then direction, type and orientation are what the Java
  branches give (`<=>` BUS, BOTH, HORIZONTAL; `<==>` BUS, BOTH, VERTICAL; `--` NORMAL, NONE, VERTICAL).
- Given a style with neither `-` nor `=`, when `WLinkType.from` runs, then it throws.

Observability N/A. Rollback Reversible.
