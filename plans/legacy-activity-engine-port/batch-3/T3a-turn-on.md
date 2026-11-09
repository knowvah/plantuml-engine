# T3a — register the engine

**Java:** `PSystemBuilder.java:132-140` (factory order), `PSystemErrorUtils.java:140-147` (which error page wins).

**Writes:** `src/registered-plugins.ts` (registration and the comment at `:104-121`, D3),
`oracle/goldens/svg-conformance/{routing,refusal}-baseline.json` and their count tests,
`oracle/goldens/diagram-style-scope.json` (`activity__probe-legacy` falls), `tests/oracle/svg-conformance/parity-*.json`,
`census-*.json`, `docs/parity-report.md`.

## Steps

1. Register `activityLegacyPlugin` between `classPlugin` and `descriptionPlugin`, `// java:137`.
2. Survey `activity`, `unknown`, `network` alone into `/tmp/laep-T3a/`; `legacy-rows.mjs /tmp/laep-T3a`;
   `board-moves.mjs` per bucket against `/tmp/laep-b0/`.
3. `npm run svg:survey`, then `verdict-diff.mjs <base>`: 0 lost in every engine. Any row that left another engine for
   this one is D3's over-acceptance: find the Java regex our port is looser than and fix it here.
4. Re-pin routing and refusal for rows that moved toward the jar, with the tools those gates name in their headers;
   lower `activity__probe-legacy` to its new count with the dss tool
   (`plans/style-mode-cascades/measurements/rows.mts`).
5. `npm test`. Every red test must be a count that moved toward the jar; re-pin it, journal it.

## Acceptance
- Given the full survey, then `verdict-diff` prints lost 0, and the journal lists every mover with its old and new
  verdict.
- Given the routing gate, then the 124 rows route to `ACTIVITY` through the legacy engine, and no row of another
  engine changed owner.

Observability: N/A — no new observable operations. Rollback: Reversible.
