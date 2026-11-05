# Decisions

All recorded unattended; the user audits them here.

## Auto-confirmed (unattended)

### D1 — Scope: 81 `object` rows, by the survey's verdict
16 open rows go to conformant or end by D8, and the 30 conformant unpinned rows get pins. **Rejected:** trusting the issue's numbers. They are dated, though re-measured they still hold: fresh survey on `c10ae4f18` equals `parity-object.json`, 65/8/8. **Rejected:** treating `structural-match` as done: `compareSvg` reports geometry on those 8 and the done-when counts only conformant.

### D2 — T1a: stamp the linked map row where it is built, keep dense re-numbering
`renderer-uid.ts` sorts by `creationIndex` and numbers densely, so the row only needs its stamp in `class-map-commands.ts`. **Rejected:** a literal counter replay: `renderer-uid.ts`'s module doc records why the port does not. Upstream builds the map entity, then its links, in one `executeNow` (`CommandCreateMap.java`), so the stamp has to land before the next statement's entity.

### D3 — T2a: read the object header through the ported `StyleBuilder`
dss and c4dd established `currentStyleBuilderOf` as the seam for merged style: `root.element.objectDiagram.<kind>.header`, with the stereotype, one builder per render, stored for sizer and renderer alike. **Rejected:** a bare-`header` branch in `object-kind-style.ts`: it would re-derive the star-priority merge that already exists. `EntityImageObject.java` and `EntityImageMap.java` both read `getStyleHeader`, and `EntityImageJson.java` is T2a's to check. A top-level `header` selector also matches the page `header`, and that block is out of T2a's way as long as the page chrome reads its own signature.

### D4 — T2b: `objectAttribute*` converts onto the object's style, as `FromSkinparamToStyle` does
`FromSkinparamToStyle.java:200-202` sends both `objectFont*` and `objectAttributeFont*` to `SName.object`. Mirror the table. **Rejected:** a `lunike-70` theme special case, and keeping attribute font body-only because it looks like the name's font should not move: the jar moves it.

### D5 — T2c: floor text height where the object header block is measured, then prove reach
`AtomText.java:179-181` floors every atom at 10. `AtomTextUtils.ts:39` already cites it. T2c's probe grid decides whether the floor belongs in a shared build or the header only: object name, stereotype, field row, map cell, json cell at sizes 6, 8, 9, 10. **Rejected:** flooring inside `DeterministicMeasurer`: the bounder answers the font's real height, and `LimitFinder#drawText` reads it, which is exactly what produces 0.167.

### D6 — T3a: port the table trigger, and draw through the existing creole table
`CreoleParser.isTableLine` and `core/creole-table.ts` exist. `class-body-enhanced.ts:21-26` declines the trigger on a reach claim the #109 corpus disproves. **Rejected:** deferring on that claim, and a table path private to objects: the jar's `o1` and `table` have the same table geometry (cell text `x - rect.x` 13.85, 40.275 and 105.462 in both). T3a establishes how `OBJECT`, not `LIKE_CLASS`, reaches it (`BodierLikeClassOrObject.java:220` onward, then `MethodsOrFieldsArea`), and amends this decision if that route is not the same builder.

### D7 — T3c and T3d: reuse a builder that exists, or stop and split
T3c reuses the state engine's `EntityImageState` sizing and draw if its inputs can come from a class leaf, since `GeneralImageBuilder.java:130-143` is shared upstream. T3d reuses `core/EmbeddedDiagram.ts` as `class-body-enhanced-embeds.ts` does. Each may split into a further task past about 15 minutes. **Rejected:** a second sizing formula for either. **Evidence owed by the task:** reading the state module's signature, which planning did not open.

### D8 — What ends a row
In order: conformant; a named divergence with a forcing library; a `needs-ruling` issue naming the row; a separable `queue:ready` issue with a "Blocked by" line added to #136. **No row ends unnamed.** `oracle/accepted-divergences.json` is never edited here.

### D9 — Pins: the object ratchet renders as the class ratchet does, and admits ELK by the shared rule
`robitu-34-vupe367` is `!pragma layout elk`, so `dotEqual` is false and `renderFixtureClass` gives 333 diffs: it has no ELK backend. Measured with `pin-object.mts`: under `renderClassFixture` plus `censusClassFixtureOptions` and `prepareElkOnce`, all 30 candidates give 0 diffs. T4b moves `object.golden.ratchet.test.ts` to that render, as `class.golden.ratchet.test.ts:193-209` already did (cdd5-T2), and lets AC3 accept `isElkRow` (`description-eligibility.ts:39`). **Rejected:** leaving `robitu` out: issue #115's comment names it as a pin, and the ELK rule already exists. **Rejected:** a second render path for one row.

### D10 — Serial, main checkout, one commit per task
The tasks share `class-map-sizing`, `class-object-*` and the header; worktrees need symlinked assets and skip git hooks. **Rejected:** parallel worktrees (`.claude/memory/agents-write-main-via-serena.md`).

## Operational readiness (auto-confirmed)

| Question | Answer |
|---|---|
| SLIs and alerts | None: a browser-safe library with no runtime service. The survey, census and ratchets are the signal. |
| Traces and dashboards | N/A. `docs/parity-report.md` is regenerated, and `object`'s note in `scripts/parity-dashboard-notes.ts:121` is rewritten from measured numbers. |
| Rollback | **Reversible.** Revert the squashed commit. No migration. |
| Scale | Output only. The ratchet grows by at least 30 fixtures. CI's slowest shard was 506 s of 600 s on #146, and #113's 282 pins and c4dd's 7 are unmeasured there, so T5 names that risk again. |
| Likely failures | Survey under load writes `timeout`: rerun alone. T3a or T1c moves a class row: `verdict-diff` names it. A residual uncovered under a fix: `row-diffs`. |
| Compatibility | No public API change; `dist/*.d.ts` identical, checked at T5. SVG changes on purpose, and `plantuml-ts` has no consumers to protect (`.claude/memory/plantuml-ts-has-no-consumers.md`). |
