# T1: the license text (D1 to D6)

## Context

`src/diagrams/version/License.ts` (293 lines) ports the MIT edition of `License.java`. The ruling (issue #179 body,
items 1-7) replaces seven blocks; README "Objective" maps each to its upstream and our lines. The authored-row
numbers move as a result; T2a re-pins them, so the authored ratchet is **expected** to fail on the three
`cov-licen*` rows at the end of T1 only if their score rises. Run it and journal what it says; a rise is not a stop
here because T2a owns it, but every other row must stay green.

## Write-set

- `src/diagrams/version/License.ts`: line tables, `header1`, `header2`, `end3`, `addMit`, `LicenseBuild`,
  `ORACLE_BUILD`, the module JSDoc (it describes the edition; add the ruling).
- `tests/unit/version/License.test.ts`: the expected tables and the line-count test.
- `tests/unit/version/PSystemLicense.test.ts`: the drawn page (x / y / textLength rows, size, no qrcode PNG).
- `src/diagrams/version/PSystemLicense.ts`: its module JSDoc only, if it describes the qrcode row.

## Read-set

- `~/git/knowvah/plantuml/src/main/java/net/sourceforge/plantuml/version/License.java:112-265`.
- `src/diagrams/version/PSystemLicense.ts` (whole, to see how lines are drawn).
- `gh issue view 179` (the ruling text, character for character).
- `package.json:80-90` (D4).

## Steps

1. **D4 check.** `grep -n '"elkjs"\|"@knowvah/elk-engine"' package.json`. Follow D4: either file the `needs-ruling`
   issue (`gh issue create --label needs-ruling --title … --body-file …`) and omit the line, or include it. Journal the
   outcome and the issue number.
2. **Red.** Rewrite `License.test.ts`'s tables to the new page (D1). Replace the "71 lines … qrcode line at index 15"
   test with one asserting the new full NONE-licence list and its length (count it from the list; planning counts 63
   without the ELK line, 64 with it: verify, do not trust). Replace the "switches" IGY test (no `isThereArchive` any
   more) and keep the stats test. Keep the licensed-build tests: the Professional header and `addLicenseInfo` do not
   change, but their `header2`/`end3` expectations lose the support, qrcode and sponsored lines (items 2 and 4). Run
   `npx vitest run tests/unit/version/License.test.ts`: it must fail on the new lines.
3. **Green.** Edit `License.ts`:
   - `header1` NONE arm: `|      plantuml-engine : a TypeScript port of PlantUML`. Professional arm unchanged.
   - `header2`: `BLANK`, the two copyright lines, `BLANK`, the two project lines, `BLANK`; no `isNone` branch (D3).
   - `MIT_TEXT[0]`: `plantuml-engine is free software; you can redistribute it and/or modify it`.
   - `end3`: no sponsored block; the images paragraph per item 5 (`this ${this.toString()} license.` stays a
     template); `BLANK`; the three GraphViz lines per item 6; the credits per item 7 and D5/D6.
   - `LicenseBuild` = `{ enableStats }`, `ORACLE_BUILD` = `{ enableStats: false }`; delete tables nothing reads.
4. **Drawn page.** Run `npx vitest run tests/unit/version/PSystemLicense.test.ts`, read each failure, and re-derive the
   expected rows from the new line list and `GraphicStrings`'s layout (the test file's own helpers show how), not by
   pasting the actual output. Any line whose x or textLength changes must be one whose text changed; any y change must
   be explained by the removed lines. Journal the new page size.
5. Run `npx vitest run tests/unit/version` and the authored ratchet; journal the counts and each license row's diff
   count.

## Acceptance (Given/When/Then)

- Given the NONE licence, when `getText1` + `getText2` run, then they return exactly D1's page with the issue's
  characters, and the test asserts the whole list.
- Given a NAMED licence, when `getText2` runs, then it holds the new header2 lines, no support/qrcode/sponsored
  lines, and the Professional header and key lines from `getText1` are unchanged.
- Given `package.json` at T1, when the ELK check runs, then the page credits elk-engine only if it has replaced elkjs;
  otherwise a `needs-ruling` issue exists and its number is in the journal.
- Given the page, when `PSystemLicense` draws it, then no `<image>` (qrcode PNG) is embedded and every `<text>` row's
  x, y and textLength match the test's derived rows.

Observability N/A. Rollback Reversible.
