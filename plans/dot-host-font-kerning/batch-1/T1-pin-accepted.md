# T1: pin both rows as accepted, and sign them

**Rows:** `quoted-labels`, `skinparam-font-color`. **Why:** D2, D3, D4.

## Read-set
- `tests/oracle/svg-conformance/dot.golden.ratchet.test.ts` (all 264 lines; the `jarErrors` pattern is :88-89, :147-196).
- `tests/oracle/svg-conformance/emitter.golden.test.ts:95-160`, the ledger schema and the "now conformant" gate.
- `oracle/accepted-divergences.json`: the `comment` and the last 3 entries, for the shape.
- `oracle/goldens/svg-conformance/routing-baseline.json` and `refusal-baseline.json`: the `dot-cache` twin rows of both
  slugs, and one `goldens`/`svg-dot` row (for example `chain-expansion`) for the clone shape.
- `routing-conformance.test.ts:1100-1149`, `:747`, `:914`, and `refusal-coverage.test.ts:1166` and its total, for the
  running counts and their derivation-comment pattern.

## Steps

1. **Red, test first.** In `dot.golden.ratchet.test.ts`:
   - Add `accepted?: string` to `RatchetFixture`, with a doc comment that cites D2 and #186.
   - Split the rows into `drawn` (no `jarError`, no `accepted`), `jarErrors` and `accepted`.
   - Add a `describe('svg-dot accepted divergences (#186 ruling, 2026-11-16)')` block. For each row:
     (a) the score never rises above its pin;
     (b) `diffs.length > 0`, with a failure message saying GOOD NEWS and that the ledger entry and the pin must be
     retired;
     (c) `accepted` equals `svg-dot/<slug>` and is an in-force `match.id` in `oracle/accepted-divergences.json`;
     (d) the passthrough is byte-exact, as for `drawn` (graphviz's document, no `<marker>`).
   - Rewrite `only a jar error-page row carries a score...` so a score is allowed on `jarErrors` and `accepted` rows
     only, and each such row carries both halves.
   - Raise the corpus count from 60 to 62 with the dated derivation comment: `62 at dhk/T1 (2026-11-..): +2 #186
     accepted rows. Derivation: 60 + 2 = 62.`
   - Update the header comment with a paragraph on the accepted kind. Run the file and confirm that it fails on the
     count only.
2. **Goldens.** Create `oracle/goldens/svg-dot/<slug>/in.puml` (copied from `test-results/dot-cache/dot/<slug>/in.puml`)
   and `golden.svg` (copied from `/tmp/dhk/oracle/<slug>.svg`, the T0 single-file INSECURE render). Check
   `grep -c 'id="graph0"'` = 1 and `grep -c 'class="edge"'` = 1 on each golden. Never take `golden.svg` from the cache
   (D4).
3. **Ratchet entries.** Append to `ratchet.json`:
   `{ "slug", "addedAt": "<today>", "source": "dhk-T1", "accepted": "svg-dot/<slug>", "weightedScore", "diffCount" }`,
   with the numbers T0 measured (expected 18/18 and 17/17).
4. **Ledger.** Append two entries to `oracle/accepted-divergences.json`, in the newest entries' key order:
   - `match.id` `svg-dot/<slug>`.
   - `scope`: "svg-dot ratchet `accepted` rows (oracle/goldens/svg-dot/ratchet.json) -- host-font kerning (ruling
     2026-11-16, #186)".
   - `acceptedAt` "2026-11-16", `acceptedBy` "maintainer (ruling 2026-11-16, #186)".
   - `reason`: quote the ruling. Name the mechanism with `textspan.c:73-92` and dot-engine `textmeasure.ts:292-296`.
     Give this row's measurement: diffs, score, node `a` `rx` 40.09 vs 39.58, first diff `svg/@viewBox[2]`, graphviz
     16.1.1, and the T1 date. Point to the DIVERGENCES.md heading from D5.
   - `surveyBlind`, per D3. It names `parity-dot.json`'s LEGACY `dot-cache` capture (cfb9ecd55, `PSystemDot.java:77-84`)
     and says that `dot.golden.ratchet.test.ts`'s `accepted` block holds the row. It must be longer than 40 characters.
5. **Gate twins.** For each slug, clone the `dot-cache`/`dot` row in `routing-baseline.json` and in
   `refusal-baseline.json` into a `goldens`/`svg-dot` row, placed after the existing svg-dot rows. Keep the
   statuses (`agree`, `ok`). Set `measuredAt` to today and `measuredAgainstCommit` to `<base>` (8 hex). Add a dated
   `dhk/T1` sentence to each file's `$comment` in its existing re-pin pattern.
6. Run task contract step 5. Raise each running count by 2 (the manifest totals, `pinnedAgree`, `pinnedRendering`, and
   any per-type count that names svg-dot), each with a dated derivation comment. Every case passes.
7. Commit: `test(dot): pin the #186 rows as accepted host-font divergences`.

## Acceptance
- Given `ratchet.json` after T1, then it has 62 entries, and the two new ones carry `accepted`, `weightedScore` and
  `diffCount`, measured on the INSECURE path.
- Given an in-memory edit that makes an accepted row's golden equal to our render, then case (b) fails with the
  GOOD NEWS message. Check this by hand once and journal it; do not commit the edit.
- Given an `accepted` id with no in-force ledger entry, then case (c) fails. Check by hand in memory; journal it.
- Given `emitter.golden.test.ts`, then both ledger tests pass, with the new entries `surveyBlind`.
- Given the routing and refusal tests, then both pass with totals raised by 2.

Observability is N/A: there are no new observable operations. Rollback is Reversible.
