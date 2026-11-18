# T1b: ledger the row, name the divergence, rewrite the parity note

**Decision:** D3. **Writes:** `oracle/accepted-divergences.json`, `DIVERGENCES.md`,
`scripts/parity-dashboard-notes.ts`, `tests/oracle/svg-conformance/parity-activity.json`, `docs/parity-report.md`,
`docs-site/parity.md`; `oracle/goldens/svg-activity/*-baseline.json` only per the README's not-a-stop rule.
**Reads:** `docs/svg-conformance.md`, the #143 ledger entries, `DIVERGENCES.md:2049-2061`,
`tests/oracle/svg-conformance/emitter.golden.test.ts:95-160`.

## Steps

1. **Pins.** Run the activity pins (README). `diff-baseline` must not rise for `rekefe-90-baju604`. `text-baseline`
   and `style-baseline` histogram fills, anchors, insets, font sizes and the canvas; if one moves, read why (the legend
   box narrows) and follow the README's not-a-stop rule, never re-capturing an oracle.
2. **Ledger.** Append one entry to `entries` in `oracle/accepted-divergences.json`, shaped as D3 lists, with the T1a
   numbers in `reason`. Keep the file's existing formatting (Prettier checks it).
3. **`DIVERGENCES.md`.** Add `### \`%version()\` prints this port's version` under "## Preprocessor (TIM)", after
   "File, environment, clock, and RNG builtins are inert by default". State upstream (`GetVersion.java:63-66`,
   `Version.java:47-49`, the oracle's dev-build `$version$`), this port (`versionString()`, `src/core/version.ts`),
   category "kept by user ruling (2026-11-09, #155)", the row, and that the PI and error pages are unchanged (D4).
4. **Parity note.** In `scripts/parity-dashboard-notes.ts`, rewrite `activity.detail` so `rekefe-90` is a signed
   divergence (`oracle/accepted-divergences.json`, #155), not "waits on #155". Keep the other sentences true: re-read
   the activity counts from the survey before editing the "5 rows" figure. Lines stay under the file's existing wrap.
5. **Regenerate.** `npm run parity:dashboard`; check `docs/parity-report.md` and `docs-site/parity.md` carry the new
   sentence and nothing else moved but dates and counts that the survey changed.
6. **Verify the ledger tests:** `npx vitest run tests/oracle/svg-conformance/emitter.golden.test.ts`; the schema test
   and "no in-force entry names a fixture a fix has since made conformant" pass.
7. **Commit:** `docs(activity): ledger %version() row as a signed divergence`, footer `Refs: #155`.

## Acceptance
- Given the ledger, when `emitter.golden.test.ts` runs, then the new entry is schema-valid and the row is not
  conformant.
- Given `DIVERGENCES.md`, when grepped for `%version()`, then the new section names the row, the ruling and both Java
  lines.
- Given `docs/parity-report.md`, when grepped for `waits on #155`, then there is no match.

Observability is N/A. Rollback is Reversible.
