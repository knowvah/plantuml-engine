# T3a — Register the plugin and measure the 4 rows

**Read:** D3, D8; `PSystemBuilder.java:189-192`; `src/diagrams/bpm/index.ts`; `src/registered-plugins.ts:113-116`;
`src/core/block-extractor.ts` (`'bpm'` rows); `src/core/diagram-type-set.ts:61,122` (`GIT` already exists);
`tests/architecture/layering.test.ts` (the json `ALLOWLIST` entries at about :110-122 and :203).

**Write-set:** `src/diagrams/git/index.ts`, `src/registered-plugins.ts`, `src/core/block-extractor.ts`,
`src/core/assemble-svg.ts` (only if the titled path needs `GIT`), `tests/architecture/layering.test.ts`,
`docs/catalog.md`; `tests/unit/git/**`.

**Do:**
1. `gitPlugin`: a `SyncPlugin` of type `'git'` whose `parse` is `GitDiagramFactory#createSystem`, plus layout and
   render through T2b. Register it between `jsonPlugin` (java:190) and `filesPlugin` (java:192), with
   `// java:191`.
2. `block-extractor.ts`: `DiagramType` gains `'git'` and the `@startgit` tag maps to it.
3. `ALLOWLIST`: `src/diagrams/git/ → src/diagrams/json/`, quoting `GitCurve.java:40-41` and `SmetanaForGit.java:57`.
4. `npm run catalog`.
5. Measure, alone (task contract step 5): `git-rows.mjs`, `row-diffs.mts` on all 4 rows, and `survey-moves.mjs`
   against `/tmp/gip-b0`. Journal each row's verdict, `maxDelta`, `firstDiff`, and its render time (`figagi-40` vs
   the 60 s timeout). A row that diverges *structurally* (a different element count, order, text, font or colour) is a
   port defect for T3c. A row at `structural-match` goes to T3c for the D9 proof.
6. Run the routing and refusal gates. The 4 rows now route to `GIT`, so those gates go red until T4 re-pins them
   (`.claude/memory/new-corpus-tree-trips-two-gates.md`). Journal the exact failing assertions, and leave them for T4
   only if nothing else fails.

## Acceptance
- Given `renderSync` on each of the 4 rows, then the root has `data-diagram-type="GIT"` and no row errors.
- Given `survey-moves.mjs`, then the only moved rows are the 4, none lost, and the journal has each one's verdict and
  time.
- Given the layering test, then it passes with the one new entry.

Observability N/A. Rollback Reversible.
