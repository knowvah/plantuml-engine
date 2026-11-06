# T3a — Turn the port on

**Read:** `chart/index.ts`, `src/registered-plugins.ts:39,84`, `tests/unit/packetdiag/*.test.ts`, the chart journal rows 11 and 14 (`plans/chart-engine-port/decision-journal.md`), D2.

**Do, in one commit:**

1. Rewrite `packetdiag/index.ts` per D2, exporting `packetdiagPlugin` with `type: 'packetdiag'` so `registered-plugins.ts` needs no edit.
2. Delete `ast.ts`, `parser.ts`, `layout.ts`, `renderer.ts`. Grep first: `git grep -n "packetdiag/\(ast\|parser\|layout\|renderer\)"`.
3. Delete `tests/unit/packetdiag/{layout,renderer}.test.ts`. Rewrite `parser.test.ts`, `refusal.test.ts`, `annotations.test.ts`, `spanning-remainder-jar.test.ts` and `lengthadjust-lad-t2f.test.ts`'s surviving cases against the factory and the new draw, keeping a case per upstream behaviour they assert. Old assertions on old geometry are not a spec.
4. Chart's two seams, expected here too: `core/assemble-svg.ts` may route `PACKET` to `finalizeGenericRootFragment`, which drops a chromed body (cep journal row 11); and `tests/unit/core/assemble-svg-lad-t1a.test.ts` lists `PACKET` among generic-root engines (cep journal row 14). Move `PACKET` to `finalizeTitledDiagramFragment` if the chrome probe shows the loss.
5. `npm run catalog`.

**Expected fallout:**

- `oracle/goldens/document-background.json`'s `packet-black` (36) and `packet-gradient` (21) are shrink-only: re-measure and shrink them.
- `oracle/goldens/svg-lengthadjust/authored-baseline.json`'s four `packet-*` rows (the default row is 39 diffs, `textLength: baseline`): re-measure with that gate's tool. Adopt only the `packet-*` rows; cep found the tool also downgrades `files-*`, which is not adopted. A rise is stop 2.
- The routing gate logs 6 `[FIXED]` lines; T4 re-pins them.
- Coverage: the new files have tests from batches 1 and 2. Read the per-file report; 90/90/90 is the floor.

## Acceptance
- Given `renderSync` of `packet-tcp-header`, then the result carries `data-diagram-type="PACKET"` from the new engine, and `git grep -n "packetdiag/parser"` is empty.
- Given the survey, when `packet-moves` compares to b0, then lost is 0, and the journal has each row's verdict; any nonzero row has its mechanism and owner journaled.
- Given the gates, then they pass.

Observability N/A. Rollback Reversible.
