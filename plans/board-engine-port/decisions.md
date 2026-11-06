# Decisions

All recorded unattended; the user audits them here.

## Auto-confirmed (unattended)

### D1 — Rewrite file for file, delete the old pipeline
`CLAUDE.md`: "A structural divergence IS the bug: re-mirror rather than patch", and "Rewriting a never-faithful local file is allowed." Upstream draws through `UGraphic` from `BoardDiagram#getTextBlock`, `Activity#drawMe` and `CardBox#drawU`; ours separates `parser.ts`, `layout.ts` and string templates in `renderer.ts`. **Evidence:** all 4 rows diverge on the first rect's `fill` (`#D3D3D3` hand-picked against `HColors.LIGHT_GRAY` `#C0C0C0`, `HColors.java:94`); labels are written with `dominant-baseline="hanging"` where the jar draws a creole sheet with `textLength`; cards draw in tree order where the jar iterates a `HashMap` (D3); and `renderer.ts:36-43` calls its own shadow filter "a not-yet-reconciled divergence". **Rejected:** patching `renderer.ts` row by row: no chrome, colour mapper or `TitledDiagram` reaches it, so title, `scale`, `reversecolor` and `!option handwritten` would each need a second path. Old code is deleted, not archived (`.claude/memory/delete-archived-code.md`).

### D2 — Substrate: packet's plugin shape on klimt
`BoardDiagram extends TitledDiagram`, as `packetdiag/PacketDiagram.ts` does. `index.ts` mirrors `packetdiag/index.ts` with `BOARD` and the style name `activityDiagram` substituted: `DiagramType.getStyleName()` has no `BOARD` arm and falls through to `SName.activityDiagram` (`DiagramType.java:295`), which the style-scope oracle confirms (`board__selector-activitydiagram.svg` is `background:#AAAAAA`). `board-skin-param.ts` mirrors `packet-skin-param.ts`. `BoardDiagramFactory.ts` mirrors `PacketDiagramFactory.ts`'s command loop, refusal shape and `CommonCommands.addCommonCommands1`. `core/assemble-svg.ts:320` moves `BOARD` from `finalizeGenericRootFragment` to `finalizeTitledDiagramFragment`, as pep journal row 16 did for `PACKET`; `cov-chrome-all` (jar 202×316 with title, caption, legend, header, footer) is the evidence. `FILES` stays where it is. **Rejected:** importing packet's modules: engines do not reach into each other (`tests/architecture/layering.test.ts`), and "do not refactor while porting" rules out a shared extraction here. **Rejected:** a new `UGraphic` adapter: `UGraphicSvg` already draws chart, packet, wbs, mindmap and salt.

### D3 — `BArray` iterates in Java `HashMap` order, through `core/java-hash-set.ts`
`BArray.iterator()` returns `data.values().iterator()` of a default `HashMap<String, BNode>` keyed `"" + x + ";" + y` (`BArray.java` `getKey`). `gasaxu-65-cipo396`'s oracle draws `America` (x=5, stage 1) after `Barcelone` and before `Pamplune`, which no tree order produces. A planning replay of Java `String.hashCode` and `HashMap` (`putVal`, resize at 12 entries) puts all 15 of gasaxu's cells in the oracle's `<rect>` order after the header card (`/tmp/bdp-plan`, 2026-11-05). Port the iteration with `javaHashSetOrder(keys, javaStringHashCode, ===)` from `src/core/java-hash-set.ts` over the keys in `put` order, then map keys to nodes: a `HashMap`'s value order is its key order. `javaStringHashCode` is `String.hashCode()` (`h = 31 * h + c`, as `core/tim/TFunctionSignature.ts:12` writes it), local to `BArray.ts` with `@see`. `put` throws on a duplicate key and keeps `maxX`/`maxY` as Java does. **Rejected:** tree order: it is today's mismatch. **Rejected:** a shared `javaStringHashCode` in `src/core/`: five inline copies already exist and consolidating them is a refactor outside this mission (journal it as a follow-on). `java-hash-set.ts` does not model red-black tree bins (nine keys in one bucket of a 64+ table); a board would need 49+ cells in one activity with colliding `"x;y"` hashes. T1a journals whether any probe comes near.

### D4 — Fixtures: the 4 cached rows, then authored probes
Upstream ships no `vega/board` and no board fixture beyond `DiagramTypeTest.java:116-118`, so `CLAUDE.md`'s "when a feature has no fixture, author `.puml` fixtures and generate oracles" applies. The 20 planning probes in `probes/` are the floor; T3b adds what they miss: each chrome element alone and with `scale 2`, `!theme` on two stdlib themes, `skinparam handwritten true`, `skinparam mode dark` (or `<style>` `@media dark`), a `<style> activityDiagram { ... }` that should and a `boardDiagram { ... }` that should not reach the document, a sprite reference, `\n` in an activity and a release, `{{board ... }}` inside a sequence note, a 49+ cell activity, an unknown line, `newpage`. **Rejected:** stopping at the 4 rows: four rows reach none of chrome, style, scale or errors.

### D5 — Ratchet: `svg-board`, mirroring `svg-packet`
Copy `packet.golden.ratchet.test.ts`, `packet.diff-baseline.ratchet.test.ts` and `render-fixture-packet.ts` with `board` substituted, reading `test-results/dot-cache/board` and `tests/fixtures/board`. `render-fixture-board.ts` defaults to the sprite + Twemoji + utility asset store, as the survey renders (pep journal row 31). No DOT eligibility: board has no svek stage. `pin-board.mts` writes goldens, `ratchet.json`, and `goldens` twins in the routing and refusal baselines. The 4 `dot-cache` routing rows are stale `known-misroute` pins with `ourType: NONE`: T4 re-pins them `agree`, moving the count assertions, as pep T4 did. A `diff-baseline.json` for the 4 is written **only if** a row stays nonzero. **Rejected:** a bespoke board gate.

### D6 — Mirror upstream's quirks
Port each of these as the jar does it, with a one-line comment quoting the Java:
- the root card drawn twice (`Activity#drawMe` draws `getBox()`, then every `BArray` cell including the root);
- the no-op `ug.apply(new UTranslate(dx, dy));` statement in `Activity#drawMe` (port it as a comment, since `apply` returns a new graphic and the result is discarded);
- separators drawn on the untranslated `ug`, from x=0, across the full width of every activity;
- `CardBox` reading no style, skinparam or theme (`skin rose` and `monochrome` probes stay `#C0C0C0`);
- `PostIt`'s unused constructor, `getCard` and fields, and `Activity`'s unused `boardDiagram` field, ported with names kept;
- `BNode.addChild`'s two `IllegalArgumentException` guards and `Activity.addRelease`'s `stage <= 0` guard, as thrown `Error`s.
The commented-out commands in `BoardDiagramFactory#initCommandsList` and the commented loop in `Activity#drawMe` are not ported. **Rejected:** honouring skinparams on the card: no forcing library, so an unruled divergence.

### D7 — What ends a row
In order: conformant; a jar error page where we also error (ruling 2026-10-10, `docs/svg-conformance.md`); a named divergence with a forcing library; a `needs-ruling` issue naming the row; a separable `queue:ready` issue with a "Blocked by" line added to #136. **No row ends unnamed.** `oracle/accepted-divergences.json` is never edited here. Planning found no forcing library anywhere in board.

### D8 — Hooks: split by upstream method, keep names
The hooks cap files at 500 lines, functions at 30 NLOC, CCN 10, 5 parameters. Board's methods are short; `BoardDiagramFactory.ts` is the one likely to grow, as packet's did. Break long functions into named helpers that keep the Java method's name on the entry point, with `@see` on each. Use `#lizard forgives` only for the tool quirk the repo already documents. Files written through the shell skip the hook: run `lizard` by hand (`.claude/memory/cep-status.md`).

### D9 — Serial, main checkout, one commit per task
The batches build one engine upward in one directory; worktrees need symlinked assets and skip git hooks (`.claude/memory/agents-write-main-via-serena.md`, `worktrees-skip-git-hooks.md`). New files sit unreferenced beside the old engine until T3a, so `npm test` stays green through batches 1 and 2. **Rejected:** parallel worktrees, and one big commit (the journal cites per-task commits through `pre-squash`).

### D10 — Errors mirror the jar's, not its page
A `+` line before any activity makes `getLastActivity()` throw on an empty list (`BoardDiagram.java` `addLine`): ours throws too, so the render is an error page. An empty `@startboard` is the jar's Welcome page: follow the factory's empty-diagram path the way `PacketDiagramFactory.ts` does. Per `.claude/memory/error-page-conformance-rule.md`, matching the page's text or geometry is not a target; journal the jar's message beside ours.

## Operational readiness (auto-confirmed)

| Question | Answer |
|---|---|
| SLIs and alerts | None: a browser-safe library with no runtime service. The survey, census and ratchets are the signal. |
| Traces and dashboards | N/A. `docs/parity-report.md` is regenerated; board's note in `scripts/parity-dashboard-notes.ts:96` is deleted once every row is conformant (pep precedent), else rewritten from measured numbers. |
| Rollback | **Reversible.** Revert the squashed commit. No migration. |
| Scale | Rendering is linear in cells, plus the `HashMap` replay (quadratic only in one bucket). The ratchet grows by 4 golden rows and the authored count; CI's slowest shard was 564 s on #153, with cep and pep rows added since, unmeasured in CI. T5 names the risk. |
| Likely failures | Survey under load writes `timeout`: rerun alone. A shared-seam edit (`assemble-svg`, `EmbeddedDiagram`) moves another row: `verdict-diff` names it. Coverage below 90 after deleting the old tests: T1 to T3 cover the new files. Re-pinning a moved activity row through the wrong tool (pep journal rows 27-28). |
| Compatibility | No public API change; `dist/*.d.ts` identical, checked at T5. SVG changes on purpose, and `plantuml-ts` has no consumers to protect (`.claude/memory/plantuml-ts-has-no-consumers.md`). Lines the old parser accepted and the jar refuses now error, which is the mirror. |

## Baseline

Measured on `3d5d09396`, 2026-11-05, at planning, load average about 16: `npm test -- --maxWorkers=4` 41999 passed, 4 expected fail, 7 skipped, 6 todo, in 2000 files (1 skipped); coverage 97.33/93.2/97.96 (statements, branches, functions), exit 0. `npm run typecheck`, `npm run lint`, `npm run format:check` exit 0; `npm run build` was not run at planning (T0's batch close runs it). `npm run svg:survey -- board --out /tmp/bdp-plan/parity-board.json`: 0/0/4, identical verdicts and first diffs to the committed file.
