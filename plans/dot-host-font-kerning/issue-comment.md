Landed on `feature/parity-queue` (dot-host-font-kerning mission; unsigned, not pushed) per the 2026-11-16 ruling, option 1.

**Rows, signed as accepted host-font divergences** (re-measured 2026-11-21 on graphviz 16.1.1, single-file INSECURE oracles):
- `svg-dot/quoted-labels`: 18 diffs, weightedScore 18
- `svg-dot/skinparam-font-color`: 17 diffs, weightedScore 17

In both, node `a` (`Node A`) has `rx` 40.09 in ours and 39.58 in the jar. Native `dot -Tsvg` still equals the jar's SVG.

**What changed**
- `oracle/goldens/svg-dot/ratchet.json` pins both rows with a new `accepted` kind. `dot.golden.ratchet.test.ts` holds the score (it never rises), fails with GOOD NEWS if a row stops diverging, requires an in-force ledger entry with that exact id, and checks the passthrough. Corpus 60 -> 62.
- `oracle/accepted-divergences.json` has `svg-dot/quoted-labels` and `svg-dot/skinparam-font-color`, accepted by the maintainer on 2026-11-16, each with `surveyBlind`: the dot survey compares LEGACY captures since cfb9ecd55 and cannot see graphviz geometry.
- `DIVERGENCES.md`, under "DOT-passthrough diagrams": **@startdot labels are measured without the host font's kerning**. It is library-forced (host fonts) and cites `textspan.c:73-92`, `textspan_lut.c:19-21`, dot-engine 2.12.3 `textmeasure.ts:292-296`, the kern-pair table and the `Node X` control.
- Routing and refusal baselines each gain the 2 `goldens`/`svg-dot` twins.

No `src/` change and no dot-engine change. No other row's verdict moved.

**Follow-ups (not done here):** the dot survey is blind to every drawn `@startdot` row, because it surveys LEGACY captures. `PARITY-SVG.md`'s ledger table matches no ledger entry by design (`svg-parity-dashboard.ts:161-171`). Both are noted in `.agent-notes/dhk-T3.md`.
