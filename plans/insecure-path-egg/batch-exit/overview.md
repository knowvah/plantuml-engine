# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T3 | Docs, memory, issue comments; final gates | orchestrator | `DIVERGENCES.md`, `src/diagrams/version/PSystemVersion.ts` (comment only), `oracle/goldens/svg-factories/authored-baseline.json` (topics only), `docs/catalog.md`, `.claude/memory/*`, `plans/insecure-path-egg/{README,decision-journal}.md` | batch 2 | [x] |

## T3

1. **`DIVERGENCES.md`.** Add D5's entry beside "Ditaa is not included", citing:
   - #178 and the ruling date, 2026-11-13;
   - `PSystemBuilder.java:178-179`, `PSystemPath.java:60-63` and `GraphicsPath.java:66-88`;
   - the 285-byte PNG the jar writes for `-tsvg`;
   - D2's page and D3's error page;
   - that no corpus row reaches the factory;
   - the unit tests that pin it.

   Then reword the `version` entry's "the page cannot see `RenderOptions.securityProfile`" clause (D5). Behaviour does not
   change.
2. **`src/diagrams/version/PSystemVersion.ts:218-220`.** Make the same rewording of the comment. The port has no jar path
   and no Word mode, so `Loaded from` stays omitted.
3. **`oracle/goldens/svg-factories/authored-baseline.json`.** Change the three `cov-path-*` `topic` strings to say
   "registered under INSECURE only (#178)". Change no score. Run the factories ratchet test.
4. **`npm run catalog`.** Commit it if it changed.
5. **Memory.** Add `.claude/memory/ipe-status.md` and its `MEMORY.md` line: the gate mechanism (`registeredOnlyUnder`),
   and that `ParseOptions` now carries the profile.
6. **Gates.** Run all README gates and `npm run format:check`.
7. **Issue comment.** Comment on #178 with the summary and a link to `plans/insecure-path-egg/decisions.md`. If posting is
   denied, put the text in the journal and continue.
8. **README.** Fill the "Summary" and tick "Done when".
9. **Commit** `docs(ipe): close the insecure-path-egg mission` (`Refs: #178`).

## Acceptance

- Given the final tree, then all gates exit 0, and the three `cov-path-*` rows are at weightedScore 5.
- Given `DIVERGENCES.md`, then the new entry cites #178, and no sentence still says the version page cannot see the
  profile.

Observability: N/A, no new observable operations. Rollback: Reversible (revert the commit).
