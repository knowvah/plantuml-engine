# Decisions

All recorded unattended; the user audits them here.

## Auto-confirmed (unattended)

### D1 — Scope: 11 `c4` rows, by the survey's verdict
Three rows go to conformant, `gikaju-64` stays signed, and `xetego-25` gets a pin. **Rejected:** reopening `gikaju-64`. The jar errors (`allowmixing`) and we draw, which the signed entry in `oracle/accepted-divergences.json` (ruling 2026-10-10) accepts, and only the user changes a signature. **Evidence:** the survey on `ad66196f6` equals the committed file.

### D2 — Stdlib sprite compile: mark lines at the stdlib read, fold them when building `dataLines`
**Question:** the jar's `BlockUml#data` holds `sprite $ma_x #material2.1.19#x:ma_x`, because its `puml.spm` was compiled from the stdlib source at build time. `assets/stdlib` is the source, byte-verbatim (`scripts/vendor-stdlib.ts`), so our seed hashes the whole block.

The rule, read off 4,500 sprite lines the jar emitted for 43 probes and checked against every stdlib file, applies to **raw stdlib file lines**, before TIM:
- `sprite <$>name [WxH/16] {` or `[WxH/16z] {` through its `}` becomes `sprite <$>name #<lib>#<path>:name`.
- `sprite <$>name <svg ...` through its `</svg>` becomes `sprite <$>name :<lib>:<path>:name`.
- `<lib>` and `<path>` are lower-case, `<path>` is relative to the bundle with no `.puml`. `name` is any non-space token: `sprite $b##$name##Icon <svg` in a procedure reaches the jar as `sprite $bActivityIcon :edgy:edgy2:bActivityIcon`, so the name is taken from the **emitted** line.
- One-line `[WxH/16z] Ow0V...` stays verbatim (`eip`, `ibm`). A line built by a function stays verbatim: 99 `sprite Callout_N <svg` from `awslib20`'s `!$header =`.

**Option A:** a post-pass over the TIM result by line text. Rejected, measured: it would rewrite those 99 `Callout_N` lines the jar keeps raw. **Option B:** run TIM twice, compiled for the seed and verbatim for the parsers. Rejected: double cost on every sprite include, and doubled side effects. **Option C:** feed TIM the jar's compiled lines and port `CommandSpriteStdlib`, `CommandSpriteStdlibSvg` and `Stdlib.readSprite`. The truest mirror, but every engine's sprite parse and the asset store change for a row that needs only a hash; rejected for now as disproportionate, and T1a records it in the journal as the known route if a later row needs `lines` compiled too. **Option D, decided:** `IncludeExecutor`'s stdlib branch scans the raw lines and records, per line `LineLocation`, a mark of head or continuation with `<lib>:<path>`. `TContextSubstitution.ts:86` keeps the location through substitution. `preprocessor.ts#resultOf` folds marked lines when it builds `dataLines` and leaves `lines` as it is, so no parser moves.

**Reversible:** one read seam, one fold. **Blast:** `dataLines` feeds the seed and five readers (`PSystemSingleLineFactory`, `dot/parser.ts`, `json/StyleExtractor.ts`, `description/index.ts:67`, and `error-diagrams.ts:153`'s line count), all of which mirror `BlockUml#data`, so each moves toward the jar. Only `biluko-70` in the corpus has a stdlib include and a seeded def in its jar SVG (a scan of the 65 cached rows with `!include <`). **Evidence:** `seed-probe.mts` today prints `equal 2/45`; T1a's bar is every probe equal or a named residual.

### D3 — Baseline: reach `Sea`, do not add a second formula
`creole-sea-line.ts` already holds `layoutLineThroughSea`, "the one place" a line's atoms meet `Sea`, and its contract says a mixed-size line carries each run's own descent. `EntityImageDescriptionTextBlock.ts:159` predates it and uses one descent per line. T1b routes `drawAtoms` through the per-atom rule. **Rejected:** special-casing edge labels: `buildTextBlock` serves every description text. It may move other rows, and `verdict-diff.mjs` names them.

### D4 — `RoundCorner` comes from the merged style at each site that hard-codes it
`currentStyleBuilderOf` with `skinparam roundcorner 8` already answers 8 for `root.document.legend`, `root.document.classDiagram.legend`, `root.element.classDiagram.group` and `…group.package`, measured 2026-11-04. So the seam exists, and two readers skip it. **Rejected:** a flat `roundcorner` handler per annotation element and per class site, because it would re-derive the star-priority merge and get `skinparam legendBorderRoundCorner` order wrong. Same pattern as ddd D2: new reads only, one builder per render, stored for sizer and renderer alike. `PACKAGE_ROUND_CORNER` survives only as a fixture-less default if nothing else reads it, otherwise it is deleted. `Cluster.java:323-324` keeps `strictuml` at 0.

### D5 — Serial, main checkout, one commit per task
The tasks share `svek/image`, `annotations` and `class`; worktrees need symlinked assets and skip git hooks. **Rejected:** parallel worktrees (`.claude/memory/agents-write-main-via-serena.md`).

### D6 — Pins: extend each ratchet's eligibility, never hand-edit
`rosoga-84` and `xetego-25` are CLASS-routed; `class.golden.ratchet.test.ts` knows `tree: 'class' | 'unknown'`, so T4b adds `'c4'` the same way. `vakasu-51` has no DOT stage; the class ratchet's cdd8 D12 rule (`oracleBlind` plus `!pragma layout elk`) is the precedent, and `description-eligibility.ts#dotEligibility` gets the same rule, shared with `pin-description.mts`. `kipive-74` stays unpinned as an error page: the low-level ratchet path refuses it, and T4b names that in the journal. **Rejected:** a new `c4` ratchet: two engines already own these rows.

### D7 — What ends a row
In order: conformant; a named divergence with a forcing library; a `needs-ruling` issue naming the row; a separable `queue:ready` issue with a "Blocked by" line added to #136. **No row ends unnamed.** `oracle/accepted-divergences.json` is never edited here.

## Operational readiness (auto-confirmed)

| Question | Answer |
|---|---|
| SLIs and alerts | None: a browser-safe library with no runtime service. The survey, census and ratchets are the signal. |
| Traces and dashboards | N/A. `docs/parity-report.md` is regenerated, and its `c4` ratchet cell stops printing `n/a`. |
| Rollback | **Reversible.** Revert the squashed commit. No migration. |
| Scale | Output only. D2's marks are per include read. Ratchets grow by 3 or 4 fixtures. CI's slowest shard was 506 s of 600 s on #146, and #113's 282 pins are still unmeasured there, so T5 names that risk again. |
| Likely failures | Survey under load writes `timeout`: rerun alone. `buildTextBlock` or the legend read moves another engine: `verdict-diff` names it. A seed change on a row with defs: T1a's probe and `verdict-diff`. |
| Compatibility | No public API change; `dist/*.d.ts` identical, checked at T5. SVG changes on purpose, and `plantuml-ts` has no consumers to protect (`.claude/memory/plantuml-ts-has-no-consumers.md`). |
