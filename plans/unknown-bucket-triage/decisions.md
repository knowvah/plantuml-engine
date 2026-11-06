# Decisions

All recorded unattended; the user audits them here.

## Auto-confirmed (unattended)

### D1 — Scope: 18 rows, placed by the jar's own type
The issue counted 23 by the jar's `data-diagram-type`. Re-measured, 18 are this mission's. **Moved:** `bitabu-34`
(`(*)` syntax) and three lone-note rows to #123, `dijapi-54` to #121, which names it as item 15. The lone notes are
not activity3 rows: `PSystemBuilder.java:137` tries the legacy `ActivityDiagramFactory` before
`ActivityDiagramFactory3` (`:140`), the legacy factory has `CommandFactoryNoteActivity`
(`ActivityDiagramFactory.java:84-86`), and the jar SVG shows its svek output (`class="entity"`, a `start_entity`
the source never wrote). **Added:** `gazale-13` and `lazama-75`, `sudoku <seed>`, which no issue owned.
**Rejected:** porting enough of the legacy engine for the three notes: #123 ports that engine whole, and a partial
port would route sources `ActivityDiagramFactory3` must keep. **Rejected:** reopening `gubeca-19` and `jixibu-01`
(CLASS, structural-match): both are signed in `oracle/accepted-divergences.json` (nested `{{yaml}}`, Smetana).
**Evidence:** `scope.mjs` places all 203 open rows; the survey on `dbb996060` equals the committed file.

### D2 — Stereogroup colours: read them at every command upstream reads them
`Stereogroup#getInnerColors` is read by `CommandIf2`, `CommandElseIf2`, `CommandEndif3` and `CommandRepeat3` for the
three rows, and 18 command files name `optionalStereogroup` or `getInnerColors`
(`grep -l` over `activitydiagram3/command/`, 2026-11-05). T1a
reads each `executeArg`, ports every colour read we lack, and authors a fixture per command. Reuse
`dispatch-stereogroup.ts#stereogroupBackColor`, which already mirrors `Colors#mergeWith`'s last-wins. **Rejected:**
a post-parse pass that colours diamonds by stereotype text: it would skip the per-command target (`endif` colours
the closing diamond, `elseif` its own branch).

### D3 — Stereotype style on a box: one merged `Style`, read whole
`FtileBox.java:146` builds `getStyleSignature().withTOBECHANGED(stereotype).getMergedStyle(styleBuilder)`, and every
property the box uses comes from it: line and back colour, stroke (`style.getStroke()`), font configuration
(`:167`), padding, round corner, shadowing. Ours reads three of them one at a time
(`activity-scoped-colors.ts:78-105`). T1b builds the merged style once per stereotyped box and lets sizer and renderer
read the same value, the pattern ddd D2 and c4dd D4 used for `RoundCorner`. The per-property helpers stay only
where another caller still needs them. **Rejected:** adding `stereotypeThickness` and `stereotypeFontSize` helpers:
each would repeat the star-priority merge and still miss padding and wrap width. Notes and partitions read the same
helpers; T1b names in the journal any of them the change moves.

### D4 — Ambient stroke: carry the caller's `UStroke` where upstream does
Two rows draw with a stroke they inherit, not one they set: the sprite `circle` takes the partition's 1.5
(`SvgNanoParser.java:186-195` applies a stroke only when the element has `stroke-width`), and the composite state's
table rules take `drawUState`'s ug (`Cluster.java:450-502`). T2a and T2b each find the `ug` upstream draws with and
pass that stroke at the one call site. **Rejected:** changing `TABLE_RULE_WIDTH` or the nanoparser default: both are
right for the callers that set them today (`kinuca-03-nice683` is 1, jar-verified).

**Correction 2026-11-06 (T2b, citation only; the decision stands):** `lofabo-38` is an EMPTY `state X { }`, which the
jar draws as a leaf (`<g class="entity">`, no cluster), so its table is drawn by `EntityImageState#drawU`, not
`Cluster#drawUState`: `ug = ug.apply(stroke)` (`EntityImageState.java:130-132`, the state style's 0.5) and then the
fields with that `ug` (`:162`). `Cluster#drawUState` passes the root `ug` unchanged (`SvekResult.java:72-74`,
`Cluster.java:494-496`), which is why `kinuca-03` (composite with a child) is 1. D4's rule is unchanged: carry the
`UStroke` upstream's `ug` holds, at the call site; `TABLE_RULE_WIDTH` stays 1 for the cluster path.

### D5 — Serial, main checkout, one commit per task
The tasks share `src/diagrams/activity/` and the stereogroup helpers; worktrees need symlinked assets and skip git
hooks. **Rejected:** parallel worktrees (`.claude/memory/agents-write-main-via-serena.md`).

### D6 — Pins: an `unknown` source in the activity, sequence and state ratchets
Each says "NO `unknown` tree" in its doc comment, so no `unknown` row they draw is pinned. T3c adds one, the way
`class.golden.ratchet.test.ts` reads `tree: 'class' | 'unknown'` and `svg-description/ratchet.json` carries
`type: 'unknown'`. A row is pinned only when the ratchet's own render path gives 0 diffs; a row already pinned from
a byte-identical copy in its own bucket (`cmp` on `in.puml` and `in.svg`) counts as pinned and is journaled, not
pinned twice. Error pages stay unpinned: the low-level ratchet path refuses them (c4dd D6). **Rejected:** a new
`unknown` ratchet: the engines own the render path and their ratchets already run it.

### D7 — What ends a row
In order: conformant; a named divergence with a forcing library or a signed ruling; a `needs-ruling` issue naming
the row; a separable `queue:ready` issue with a "Blocked by" line added to #136. **No row ends unnamed.**
`oracle/accepted-divergences.json` is never edited here.

## Operational readiness (auto-confirmed)

| Question | Answer |
|---|---|
| SLIs and alerts | None: a browser-safe library with no runtime service. The survey, census and ratchets are the signal. |
| Traces and dashboards | N/A. `docs/parity-report.md` is regenerated; its `unknown` ratchet cell grows by T3c's pins. |
| Rollback | **Reversible.** Revert the squashed commit. No migration. |
| Scale | Output only. T3c adds up to about 90 pins across three ratchets; CI's slowest shard was 506 s of 600 s on #146, and the queue's pins since are unmeasured there, so T4 names that risk. |
| Likely failures | Survey under load writes `timeout`: rerun alone. T1b moves every stereotyped activity box and note: `verdict-diff` names each row. T2a's stroke reaches every sprite drawn in a group title. |
| Compatibility | No public API change; `dist/*.d.ts` identical, checked at T4. SVG changes on purpose, and `plantuml-ts` has no consumers to protect (`.claude/memory/plantuml-ts-has-no-consumers.md`). |
