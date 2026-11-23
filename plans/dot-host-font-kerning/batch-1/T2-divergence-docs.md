# T2: DIVERGENCES.md entry and docs

**Why:** D1, D5. The ruling requires the entry. #186's "Mechanism", "Evidence" and "Ruled out" sections are the
source text, so read the issue (`gh issue view 186`) before writing.

## Read-set
- `DIVERGENCES.md:921-930`, the "DOT-passthrough diagrams" section.
- `DIVERGENCES.md:1484-1486`, the #169 `help font` entry, for the category wording of a host-font ruling.
- `oracle/goldens/svg-dot/README.md:1-35` (Current state) and `:75-100` (Add rule).
- T1's journal row, for the pinned scores.

## Steps

1. **Quote first.** Open and quote each citation before you write it:
   - `textspan.c:73-92` (`gvtextlayout` first, `estimate_textspan_size` as the fallback);
   - `textspan_lut.c:19-21` ("We could also store kerning metrics...");
   - dot-engine `src/common/textmeasure.ts:292-296` (version 2.12.3 in `node_modules`);
   - `PSystemDotFactory.java` `executeLine` and `PSystemDot.java`, the `allowDotSvg` gate and `createForSystemDot`,
     with line numbers at a720bdd (task contract step 1).
   If a line number has moved from #186's, cite the line you read and journal the shift.
2. **The entry.** Add `### @startdot labels are measured without the host font's kerning` under "DOT-passthrough
   diagrams", after the retired U2 entry. It holds:
   - **Category:** library-forced (host fonts), by maintainer ruling (2026-11-16, #186). It is the same family as #169
     and #170.
   - **Mechanism:** the jar hands graphviz the user's DOT unchanged. Native graphviz shapes text with pango/CoreText
     and Times New Roman's kern pairs. dot-engine's LUT stores per-glyph advances only. A browser-safe library cannot
     load the host's fonts.
   - **Evidence:** the kern-pair table from #186 (compact form), the `Node X` control, and native `dot` = jar on 16.1.0
     (#186) and again on 16.1.1 (dhk, 2026-11-21).
   - **Ruled out:** #186's three items.
   - **Rows:** `svg-dot/quoted-labels` (diffs, score) and `svg-dot/skinparam-font-color` (diffs, score), held by the
     dot ratchet's `accepted` block and signed in `oracle/accepted-divergences.json`. Note that the dot survey cannot
     see these rows (D3).
   - **Retire when:** dot-engine measures with real font shaping, or the oracle host's graphviz stops kerning. Then
     case (b) of the ratchet's `accepted` block fails.
3. In the retired U2 entry's "Library-forced remainder" paragraph (`DIVERGENCES.md:929`), make "node widths differ by up
   to 1 pt" point to the new entry.
4. In `oracle/goldens/svg-dot/README.md`, add a dated `dhk` line to "Current state" (62 pinned: 52 zero-diff, 8 jar
   error pages, 2 accepted). In the "Add rule", add a paragraph on accepted rows: the ledger entry first, the score
   held, and a single-file INSECURE render, never the cache (D4).
5. Run `npm run parity:dashboard` and `npm run svg:dashboard`. Commit what they rewrite, then run the
   `parity-dashboard` drift test (`npx vitest run tests/unit/scripts/parity-dashboard.test.ts`).
6. Commit: `docs(divergences): record @startdot host-font kerning (#186)`.

## Acceptance
- Given DIVERGENCES.md, then the new entry names both row ids, the ruling date, and every citation in D5, each one
  quoted from the file.
- Given `docs/parity-report.md` after the dashboard run, then its svg-dot pinned count is 62, and the drift test passes.
- Given `PARITY-SVG.md`, then the ledger table lists both new entries.

Observability is N/A: there are no new observable operations. Rollback is Reversible.
