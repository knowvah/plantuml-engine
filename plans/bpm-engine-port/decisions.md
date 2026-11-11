# Decisions

Recorded unattended on 2026-11-11 so the user can audit them here.

## Auto-confirmed (unattended)

### D1 — Port file for file at `src/diagrams/bpm/`; four kinds of Java are not ported
`CLAUDE.md` says "Upstream architecture is authoritative" and "Preserve upstream names". `bpm/` has 36 files and 3,312
lines. `src/diagrams/bpm/` mirrors it flat: `BpmDiagram`, `BpmDiagramFactory`, the seven `Command*`, `BpmElement`,
`BpmElementType`, `BpmBranch`, `BpmEvent`, `BpmEventAdd`, `BpmEventGoto`, `BpmEventResume`, `Cell`, `Coord`, `Line`,
`Col`, `Placeable`, `ConnectorPuzzle` (with `Where`), `AbstractConnectorPuzzle`, `ConnectorPuzzleEmpty`, `Chain`,
`ChainImpl`, `Navigator`, `Navigators`, `Grid`, `GridArray`, `GridCleaner`, `CleanerEmptyLine`,
`CleanerInterleavingLines` and `CleanerMoveBlock`.

**These are not ported.** Each has no caller, so no jar oracle can check a port of it:
- `FootPrint.java` (45 lines): one private field and no reader. `grep -rn FootPrint src/main/java/net src/test` finds only
  its own file.
- `Grid#cloneMe`, `Grid(Grid)` and `ChainImpl#cloneMe`: `grep -rn "cloneMe()" src/main/java/net/sourceforge/plantuml/bpm`
  finds only the definitions.
- `GridArray`'s private `drawArrow`, `getCenterOf`, `getCoord(Cell)` and `printMe`: nothing calls them, and the
  commented-out `addEdges` was their only caller. `tsc`'s unused-private check would reject them.
- Commented-out code: `BpmDiagram#getUDrawable` and `Grid`'s commented edge methods.

`CleanerMoveBlock` **is** ported, even though `tryBridge` is empty and `clean` always returns `false`.
`BpmDiagram#cleanGrid` calls it on every pass, and its `it2.next()` past the last column runs `ChainImpl#ensure`. That
call appends a `null` to the column list (`ChainImpl.java`, `ensureInternal`), so a later `insertAfter` sees a list of a
different length. T1c records the greps in the journal.
**Rejected:** porting the dead members with synthetic tests. No source can reach them, so they would ship in the bundle
for nothing.

### D2 — BPM borrows activity's Ftiles: port them where upstream keeps them, and allowlist the edge
`BpmElement#toTextBlockInternal` (`BpmElement.java`) draws `FtileCircleStart`, `FtileDiamond` and `FtileBox` from
`net.sourceforge.plantuml.activitydiagram3.ftile.vertical`. This port's activity engine draws through its own `tiles/`
tree, so none of the three exists as a klimt `TextBlock` (`grep -rln "FtileCircleStart\|FtileDiamond\b" src` finds only
activity's own layout files). The precedent is `FtileBoxOld`. It is ported at its upstream path,
`src/diagrams/activity/ftile/vertical/FtileBoxOld.ts`, on `AbstractFtile.ts`, and mindmap and wbs import it under
`tests/architecture/layering.test.ts` `ALLOWLIST` entries.

So T1b ports `Hexagon` (`activitydiagram3/ftile/Hexagon.java`), `FtileCircleStart`, `FtileDiamondWIP`, `FtileDiamond`
and `FtileBox` into `src/diagrams/activity/ftile/` and `ftile/vertical/`, mirroring the Java layout. It extends
`AbstractFtile.ts` only as far as these reach. T3a adds one `ALLOWLIST` entry,
`src/diagrams/bpm/ → src/diagrams/activity/ftile/`, quoting the `BpmElement.java` imports. The existing
`src/core/svek/image/CircleStart.ts` is reused. Activity's `tiles/` engine is left alone: these are new files, and no
activity output can move.
**Rejected:** copying the three into `bpm/`, because upstream keeps them in one place and wbs/mindmap set the shared-path
precedent. Also rejected: drawing through activity's `tiles/` renderers, which are not `TextBlock`s and are built for a
different layout.

### D3 — A fresh `SkinParam`, with the preprocessing options
`BpmDiagram#getTextBlock` builds `SkinParam.create(getMd5map(), PathSystem.fetch(), getDiagramType(), getPragma(),
getPreprocessingArtifact().getOption())`. No command in `BpmDiagramFactory#initCommandsList` can set a skinparam, a
style or a pragma, because the factory has only the seven BPM commands and no `CommonCommands`. So the skin answers only
its defaults, plus the preprocessor's options. `src/core/skin/SkinParamFresh.ts` already models this for creole and help.

T1a extends it:
1. An optional options argument, read by `options()`. `FtileBox#drawU` reads `OptionKey.DEBUG`, and `cov-option-debug`
   draws the 2 px debug rectangle.
2. The members the three Ftiles reach, each answering `SkinParam`'s no-value default. One of them is the legacy
   `ColorParam` read `SkinParamUtils.getColor` → `Rose#getHtmlColor` makes for the diamond: `activityBackground`
   `#FEFECE` and `activityBorder` `#A80036` (every drawn probe).

Creole and help callers keep calling it with no options, so their output cannot move.

Probes: `cov-skinparam`, `cov-title`, `cov-scale` and `cov-pragma` are Welcome pages, because the first line is not a
command. `cov-style`, `cov-theme` (the theme's lines are not commands) and `cov-sprite` are `Syntax Error?`.
`cov-option-handwritten` jiggles through `TitledDiagram`, as regex and wire do.
**Rejected:** the diagram's own skin param, since nothing can write to it.

### D4 — Collection order: an insertion-ordered map, and the duplicate-id row is not an oracle
`Grid#cells` is a `HashMap<Coord, Cell>` whose `Coord#hashCode` is `line.hashCode() + col.hashCode()`. Those are
identity hashes, so iteration order changes from run to run. Four readers iterate it:
- `toArray`, `removeLine` and `usedColsOf` give the same result in any order.
- `addConnections` only unions `EnumSet`s. Any `ClassCastException` (`cov-goto-back`) is reached in every order.
- `getById` returns the **first** cell whose data has the id. With unique ids that cell is unique.

Measured at planning: `cov-duplicate-merge-id` (two `m:<+>`) rendered 6 times gives **two different SVGs** (5 against 1,
same 405×145 canvas, a different grid). `cov-interleave` and `cov-goto-forward-twice` rendered 6 times are byte-stable.

So the port keys `cells` by a per-grid `Coord` identity key in a `Map`, and iterates in insertion order. `getById`
therefore picks the earliest-inserted match, with a comment quoting `Grid.java` and the measurement.
`cov-duplicate-merge-id` stays a planning probe and does **not** become a fixture: an output the jar cannot reproduce
cannot be a target. A unit test pins our choice. The 7 corpus rows use unique ids.
**Rejected:** replaying Java identity hashes. They cannot be replayed, and the jar itself disagrees between runs.

### D5 — Errors mirror the jar's, not its page
The kinds below were probed at planning; the rule is `.claude/memory/error-page-conformance-rule.md`. A pair of error
pages counts as conformant, whatever their text or geometry.
1. **Welcome**, when the first line is not a BPM command or the body is empty: `cov-empty`, `cov-start-only`,
   `cov-title`, `cov-skinparam`, `cov-scale`, `cov-pragma`, `cov-merge-space` (`a <+>`: the regex allows no space). Two
   more show it even though the first line *is* a command: `cov-syntax-error` and `cov-end-orphan`.
2. **`Syntax Error?`**: `cov-blank-lines`. A blank line is not a command here, because there is no `CommonCommands`.
   Also `cov-style`, `cov-theme` and `cov-sprite`.
3. **A throw inside `getTextBlock` or a command** goes to the crash page:
   - `NullPointerException` from `grid.getCell(null)` when `getById` misses: `cov-resume-unknown`, `cov-goto-unknown`,
     and `cov-branch-no-else`, whose `$branchB` exit is never added.
   - `IllegalStateException`: `cov-goto-self-merge`, `cov-goto-resume-mixed`.
   - `ClassCastException` in `Grid#addPuzzle` when a route crosses an element's cell: `cov-goto-back`.
   - `NoSuchElementException` from `branches.getLast()` on an empty deque: `cov-else-orphan`.

The port must throw in each case and never return `undefined`. Then its error page and the jar's form a conformant pair.
`Deque#getLast`/`removeLast` on an empty `ArrayDeque` throw, and the port's array does not: wrap it so it throws.

### D6 — Fixtures: the 7 rows, the planning probes, then authored probes
Upstream ships no BPM test beyond `DiagramTypeTest.java`, and the 7 rows reach no creole, no error and no option. So
`CLAUDE.md`'s "author `.puml` fixtures" applies. [probes/](probes/) holds 55 planning probes, rendered on 2026-11-11 into
`/tmp/bpe-plan/oracle`. 34 draw `BPM`, `cov-embedded` draws a `SEQUENCE` (a `{{bpm` note is text, because
`EmbeddedDiagram#getEmbeddedType` has no `bpm` keyword), and 20 are error or Welcome pages.

T3b copies all except `cov-duplicate-merge-id` (D4) into `tests/fixtures/bpm/`, then adds:
- **Topology:** deeper and wider branch nesting (three levels; five arms), every `CleanerInterleavingLines#mergeable`
  pair (NS/NS, NS/NE, NS/NW, a puzzle against an element both ways, the SW case that moves NORTH to WEST), and a
  `resume` into each arm of a finished branch.
- **Routes:** routes that cross an element's cell, both a horizontal start and a vertical start. Also `goto` to a merge
  above and to one below.
- **Labels:** a docked event after a `goto`; `%newline()` and `\n` labels in a branch; creole size and colour tags;
  `<U+...>`; `:` inside a label; a label ending in `;;`.
- **Options:** `!option debug true` with a merge and a branch.
**Rejected:** stopping at the 7 rows.

### D7 — Ratchet: `svg-bpm`, laid out like `svg-nwdiag`
The rows live in the `unknown` cache tree. So goldens go under `oracle/goldens/svg-bpm/unknown/<slug>/`, and
`ratchet.json` entries are `{ slug, type: 'unknown', addedAt, source: 'dot-cache' }`, as nwp's are
(`measurements/pin-bpm.mts` is adapted from `pin-nwdiag.mts`). Copy `nwdiag.golden.ratchet.test.ts`,
`nwdiag.diff-baseline.ratchet.test.ts` and `render-fixture-nwdiag.ts`, substituting `bpm`. Authored rows are read from
`tests/fixtures/bpm`. There is no DOT eligibility, because BPM has no svek stage.

T4 re-pins the 7 `known-misroute` routing rows as `agree`, `ourType: BPM`, and moves the refusal rows' `engine`, using
`measurements/repin-routing-refusal.mts` (adapted from wrp's). It moves the count assertions by exactly the rows moved. A
`diff-baseline.json` is written **only if** a row stays nonzero. `scripts/parity-dashboard-goldens.ts` adds `svg-bpm`
to `unknown`'s list.
**Rejected:** a new survey bucket for BPM. It would re-classify the corpus and move every bucket's survey file for no
fidelity gain (nwp D7).

### D8 — Mirror upstream's quirks
Port each of these as the jar does it, with a one-line comment quoting the Java:
- **The grid has no closing lines.** `GridArray#drawInternalGrid` draws one hline per line *start* and one vline per
  column *start*, at full width and height, so the right and bottom edges are never drawn (`cov-merge-only`: no vline
  at x=114). The grid is drawn first, in black.
- **Cells draw line by line, column by column.** Each is centred in `width + 30` by `height + 30` (`margin = 30`).
- **Element stubs are red, puzzle stubs blue.** `BpmElement#toTextBlock` draws the raw block, then a red 10 px stub for
  each `Where` it has, in `NORTH, EAST, SOUTH, WEST` order. `ConnectorPuzzleEmpty#drawU` does the same in blue, inside a
  20×20 cell.
- **Branch ids.** `$branchA<uid>`/`$branchB<uid>`, where `uid = events.size()` when `new branch` runs. On the second
  arm, `elseBranch` adds the exit merge before the resume. Later arms `goto` the exit.
- **Grid moves.** `resume` and `goto` insert a new line after the target's line. A docked event inserts a new column
  after the current one.
- **`addConnections`:** a cell's first destination starts horizontally, and every later one starts vertically.
- **The cleaners** loop until none reports a change. `CleanerMoveBlock` never reports one.
- **`BpmElementType.END`** has no command, and its red serif-14 branch in `toTextBlockInternal` is unreachable. Keep it,
  with a comment.
- **`Cell#addConnectionTo2`** throws `IllegalArgumentException` for a non-`BpmElement`. Keep it.
- **`getDescription()`** is `(Bpm Diagram)`.
**Rejected:** tidying any of them. No library forces it, so it would be an unruled divergence.

### D9 — Java semantics
- `ArrayDeque#getLast`/`removeLast` on an empty deque throw `NoSuchElementException` (D5).
- `EnumSet` iterates in declaration order (`NORTH, EAST, SOUTH, WEST`), and `equals` is set equality
  (`checkDirections`).
- `ArrayList#remove(Object)` removes the first `equals` match. `ChainImpl` compares `Line`/`Col` by identity, and `null`
  padding never matches.
- `ChainImpl#ensure` pads with `null`, and `toList` skips nulls (D1).
- `%pLN` in `CommandGoto`/`CommandMerge`/`CommandResume` is the port's existing regex translation. Check
  `docs/catalog.md` for the helper that the other engines' `RegexLeaf` uses.
- `RegexLeaf.end()`: a trailing space after `;` is allowed if the shared helper allows it. Measure with a probe, and do
  not assume.

### D10 — Serial, main checkout, one commit per task
The batches build one engine upward. Worktrees need symlinked assets and skip git hooks
(`.claude/memory/agents-write-main-via-serena.md`, `worktrees-skip-git-hooks.md`). New files sit unreferenced until
T3a, so `npm test` stays green through batches 1 and 2.
**Rejected:** parallel worktrees. `BpmElement` needs both T1b and T1c, so there is nothing to run alongside.

### D11 — Hooks: split by upstream method, keep names
The hooks cap files at 500 lines, functions at 30 NLOC, CCN 10, and 5 parameters.
- `Grid#drawStartVertical`/`drawStartHorizontal` (CCN about 12) and `CleanerInterleavingLines#merge`/`mergeable` keep the
  Java method name on the entry point. Each branch gets a named helper, with its Java line in a comment.
- `FtileDiamondWIP`'s nine-argument constructor and `FtileDiamond`'s private eight-argument one take one args object, as
  `ETileBoxArgs` does (regex D13).
- `Grid.ts` (432 Java lines with comments) fits once the commented code is dropped.
- Files written through the shell skip the hook: run `lizard` by hand (`.claude/memory/cep-status.md`).

### D12 — What ends a row
In order:
1. Conformant.
2. A jar error page where we also error (ruling 2026-10-10).
3. A named divergence with a forcing library.
4. A `needs-ruling` issue naming the row.
5. A separable `queue:ready` issue with a "Blocked by" line added to #136.

**No row ends unnamed.** Planning found no forcing library: BPM never reaches graphviz, Smetana, KaTeX or the `{{ }}`
seam. None of the 7 rows is in `oracle/accepted-divergences.json` or `stock-error-pages.json`.

## Operational readiness (auto-confirmed)

| Question | Answer |
|---|---|
| SLIs and alerts | None. This is a browser-safe library with no runtime service. The survey, census and ratchets are the signal. |
| Traces and dashboards | N/A. `docs/parity-report.md` is regenerated, and the generated `unknown` sentence moves on its own (`unknownDetail`). |
| Rollback | **Reversible.** Revert the squashed commit. No migration. |
| Scale | Grid size is linear in events. The cleaners are about O(lines² × cols) per pass. The largest row (`jomege-63`) is 23 lines. The ratchet grows by 7 golden rows plus the authored count, and routing and refusal gain 7 twins each. |
| Likely failures | 1. A survey run under load writes `timeout`: rerun it alone. 2. A shared-seam edit (`SkinParamFresh`, `AbstractFtile`) moves creole, help, mindmap or wbs: `verdict-diff` names the row. 3. `getById` or an empty deque returns instead of throwing (D5). 4. Routing count assertions move by the wrong number. |
| Compatibility | No public API change. `dist/*.d.ts` is checked at T5. SVG changes on purpose, and `plantuml-ts` has no consumers to protect. |

## Baseline

Measured on `0046f6a8c`, 2026-11-11, at planning. Committed `parity-*.json`: the 7 BPM rows are `unknown` diverged, and
every first diff is `svg/@background`. Overall: 5,701 conformant, 120 structural-match, 103 diverged, 3 oracle-error,
of 5,927. Local `dot -V` is `16.1.0 (20260904.0139)`. The Phase 8 gate results are appended below.

**Phase 8, 2026-11-11 11:59-12:09 local, on `0046f6a8c`, load average 22-52 (outside processes): green.**
`npm test -- --maxWorkers=4` **exit 0**: 46,615 passed, 0 failed, 4 expected fail, 7 skipped, 6 todo, in 2,187 files
(2,186 passed, 1 skipped), 442.00 s. Coverage 97.14 / 92.87 / 97.73 / 98.12 (statements / branches / functions / lines).
`npm run typecheck`, `npm run lint`, `npm run build` and `npm run format:check` (with this brief in the tree) exit 0.
**This green run is the baseline.** The working tree held only this brief and the planning progress file. The adapted
`survey-moves.mjs`, `bpm-rows.mjs` and `row-diffs.mts` were smoke-run (`bibuka-01`: 11 diffs, first `svg/@background`).
