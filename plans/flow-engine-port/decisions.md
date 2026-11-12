# Decisions

Recorded unattended on 2026-11-11 so the user can audit them here.

## Auto-confirmed (unattended)

### D1 — Port file for file; four kinds of Java are not ported
`CLAUDE.md`: "Upstream architecture is authoritative", "Preserve upstream names". Two upstream packages are in scope:
- `flowdiagram/` (5 files, 577 lines): `FlowDiagram`, `FlowDiagramFactory`, `CommandLineSimple`, `CommandLink`,
  `ActivityBox`, all into `src/diagrams/flow/`.
- `golem/` (10 files, 963 lines): `TileGeometry`, `TileArea`, `Tile`, `Position`, `Path`, `MinMaxGolem` and `TilesField`,
  all into `src/core/golem/` (D2).

**These are not ported.** Nothing reachable from `@startflow` calls them, so no jar oracle can check a port:
- `golem/Square.java` and `golem/Magnet.java`: empty classes.
- `golem/MinMaxDouble.java`: its only importer is `klimt/drawing/visio/VisioGraphics.java`
  (`grep -rn "golem\." src/main/java/net --include=*.java`). SVG output never reaches Visio.
- The `TextBlock` half of `Tile` and `TilesField`. `FlowDiagram#drawU` draws `ActivityBox`es and reads only
  `TilesField#getPosition`/`getPaths`. So `Tile#drawU`, `Tile#calculateDimension`, `Tile`'s `SIZE`/`numberFont`/`fc`,
  `TilesField#drawU`, `getPoint2D`, `calculateDimensionSlow`, the private `getXmin`/`getYmin`/`getXmax`/`getYmax`
  (read only by those two), and the `TextBlockMemoized` base all go. Each class keeps its upstream name and its
  reachable members.
- `Position#hashCode`/`toString` and `FlowDiagram#getInnerPosition`/`getMinMax(StringBounder)`. The port keys maps by
  object identity (D4), so `hashCode` has no reader. The two `FlowDiagram` throwers are kept **only if** the port's
  `TextBlock` interface declares them; then they throw `UnsupportedOperationException` as upstream does.

T1a and T2a record the greps in the journal.
**Rejected:** porting the dead members with synthetic tests, which would ship code no source can reach (bpe D1).

### D2 — `golem` lives at `src/core/golem/`
Upstream keeps `golem` as a top-level package beside `klimt` and `regex`, not inside `flowdiagram`. This port puts those
packages under `src/core/` (`src/core/klimt`, `src/core/regex`, `src/core/style`). A `diagrams → core` import needs no
`ALLOWLIST` entry in `tests/architecture/layering.test.ts`. T3a confirms the test passes without one.
**Rejected:** `src/diagrams/flow/golem/`, which hides an upstream package boundary inside one diagram.

### D3 — No skinparam reaches the drawing; the export follows bpm's
`FlowDiagramFactory#initCommandsList` has only `CommandLineSimple` and `CommandLink`, with no `CommonCommands`. So
`title`, `skinparam`, `scale` and a blank line are not commands, and every one is `Syntax Error?` or Welcome (probes).
`ActivityBox` hard-codes everything it draws:
- `UFontFactory.serif(14)` with `FontConfiguration.blackBlueTrue`;
- a rounded rectangle, `CORNER = 25`, stroke 1.5, `HColors.MY_RED` on `HColors.MY_YELLOW` (`#A80036` on `#FEFECE`);
- a `MARGIN = 10` inset.

`FlowDiagram#drawU` draws the paths in `MY_RED`, each as a `ULine` plus a 7×7 `UEllipse` at the destination, translated
by `-3`.

The export copies `src/diagrams/bpm/bpm-export.ts` with `FLOW` substituted (`TitledDiagram`'s `TextBlockExporter` path).
`FlowDiagram#getDefaultMargins` is `same(0)`, so `cov-single` is 200×70 plus the SVG's one pixel (201×71).
`FlowDiagram#getBackcolor` returns `null`; the oracle background is `#FFFFFF`. T2b reads `TitledDiagram`,
`TextBlockExporter` and `DiagramType#getStyleName` for `FLOW` before choosing the background source, and quotes them.
`!option handwritten` reaches through `TitledDiagram#isHandwritten` (`cov-option-handwritten` draws `path`/`polygon`).

### D4 — Iterate in insertion order; a jar output that changes run to run is a ruling, not a target
This is the mission's main finding. Planning measured it on 2026-11-11 with `measurements/jar-variants.mjs`.

**The jar.** `FlowDiagram#tilesBoxes` is a `HashMap<Tile, ActivityBox>` and `TilesField#positions` is a
`HashMap<Tile, Position>`. `Tile` does not override `hashCode`, so both iterate in Java identity-hash order, which
changes from run to run. Three readers depend on that order:
1. **`FlowDiagram#drawU`** draws the boxes in map order. `bemixo-79-xulu250` rendered 6 times gave **6 different
   SVGs**. Every one was multiset-equal (`measurements/multiset.mjs`), with the same tags and coordinates, and only the
   order of the 9 `rect`+`text` pairs differed. The same holds for every probe with two or more boxes. The paths are
   an `ArrayList` and keep source order.
2. **`TilesField#moveAllToEast`** collects `positions.values()`, moves each one 2 east, and finds its tile again with
   `getTileAt(p)`. That is the first entry *in map order* at that position. After an earlier move, two tiles can share
   `p`, so map order decides which tile moves twice. `cov-shift-east` gave 2 layouts in 6 renders, and
   `cov-many-shift` gave 3 in 4 (4 in 6 in another set).
3. **`FlowDiagram#getTileById`** returns the first box with the id, so a duplicate id is order-dependent too
   (`cov-duplicate-id` crashed in all 4 renders).

**The port** uses JS `Map`s, which iterate in insertion order, for all three. One order then governs drawing,
`getTileAt` and `getTileById`, as one hash order does in a given jar run. So the port's output is always one the jar
can produce:
- an insertion-ordered table is one possible `HashMap` order;
- a `put` on an existing key keeps its slot, in both `HashMap` and `Map`.

Each of the three sites gets a comment that quotes the Java and this measurement. A unit test pins the choice.
**Never fit the order to a frozen oracle**: matching `bemixo`'s cached box order would be fitting a value.

**The consequence.** `compareSvg` compares children by position (`tests/oracle/svg-conformance/compare.ts`). So a row
whose jar output has two or more boxes matches only if the frozen oracle happened to draw in insertion order. That
covers the 1 corpus row and every multi-box fixture. A ruling, not this mission, decides how such a row counts.
`roadmap.md`: an accepted divergence is "forced by a library or signed by the maintainer, never decided by the agent".
The force here is the JVM, not a library. T3c files one `needs-ruling` issue, drafted below, and the mission does
**not**:
- add an acceptance, or a `DIVERGENCES.md` entry that claims one;
- change `compare.ts`, the survey or its verdicts.

**Measured instead.** Every multi-box row and fixture must be **multiset-equal** to its oracle: for a `geometry`
fixture, to at least one of its recorded jar variants. The `svg-flow` ratchet enforces that as a regression tier (D7).
It is a test of our output, not a verdict, and the parity report does not count it as conformant.

**Draft of the `needs-ruling` issue** (T3c files it; adjust the counts to the measured ones):
> *Ruling needed: `@startflow` output follows Java identity-hash order.* `FlowDiagram#tilesBoxes` and
> `TilesField#positions` are `HashMap`s keyed by `Tile`, which has no `hashCode`, so the jar draws boxes, and after a
> `moveAllToEast` shift places them, in an order that changes per run (bemixo-79: 6 renders, 6 SVGs, 1 multiset). The
> port uses insertion order, always one of the jar's possible outputs, and every row is multiset-equal to its oracle.
> Positional `compareSvg` cannot pass these rows except by chance. Options: (1) sign an acceptance per row in
> `oracle/accepted-divergences.json`, naming the JVM as the cause; (2) a FLOW-only order-insensitive compare in the
> survey; (3) leave them open. Rows: bemixo-79-xulu250 plus N authored fixtures. Blocks: #132's close for those rows only.

Label it `needs-ruling` and `parity`, and add its "Blocked by" line to #136, or leave the text in
`.agent-notes/flp-T3c.md` if denied.

### D5 — Errors mirror the jar's, not its page
Rule: `.claude/memory/error-page-conformance-rule.md`. A pair of error pages counts as conformant.
1. **`Syntax Error?` or Welcome:**
   - `cov-blank-line`;
   - `cov-title`, `cov-title-after`, `cov-skinparam` and `cov-scale`;
   - `cov-no-space` (`10"A"`): the regex needs `spaceOneOrMore` before the label;
   - `cov-label-guillemets` (`«A»`), because `%g` does not match a guillemet here (T2a reads the port's `%g` table and
     the Java's to confirm);
   - `cov-empty`.
2. **`IllegalArgumentException`** goes to the crash page:
   - `getTileById` misses: `cov-link-unknown`, and `cov-link-first`, a link before any box;
   - `TilesField#buildPath` gets an area that does not adjoin and is not a same-row WEST→EAST pair:
     `cov-collision-vertical`, `cov-link-nonadjoining`, `cov-duplicate-id`.

   `cov-link-first` reaches `getTileById` on an empty map before `field.addPath` ever sees the `null` field.
3. **Drawn, though it looks like an error:**
   - `cov-link-self`: `isAdjoining` returns true for the same position with different geometries;
   - `cov-link-same-row-far`: the WEST/EAST same-row exception in `buildPath`;
   - `cov-orientation-only` (`s "A"`): `s` is the id, and there is no orientation.

The port throws in each case and never returns `undefined`. `IllegalStateException` in `Position#getCenterX`/
`getCenterY`, `movePoint`'s default and `TileGeometry#opposite` on `CENTER` are kept with comments, even though no
command can reach them (every position is 2 wide and moved by 2).

### D6 — Fixtures: the corpus row, the planning probes, then authored probes
Upstream ships no flow test beyond `DiagramTypeTest.java`, and the corpus has 1 row. `CLAUDE.md`'s "author `.puml`
fixtures" applies.

[probes/](probes/) holds 41 planning probes, rendered on 2026-11-11 into `/tmp/flp-plan/oracle`:
- 27 draw `FLOW`;
- `cov-embedded` draws `CLASS`, because `EmbeddedDiagram` has no `flow` keyword;
- 13 are error or Welcome pages.

`jar-variants.mjs` over 4 renders found:
- 14 `error`: the 13 error pages plus `cov-embedded`, which the tool counts because it is not `FLOW`;
- 14 rows that looked `stable`. Only the 10 one-box ones are truly stable: a two-box row has 2 orders and can repeat in
  4 renders by chance (`cov-east`, `cov-north`, `cov-upper-orientation`, `cov-leading-space`);
- 11 probes `order-only`, plus `bemixo`;
- 2 `geometry` (`cov-shift-east`, `cov-many-shift`).

**Classify by box count from the source, not by observed stability:**
- one box or an error page → an equality target;
- two or more boxes → a multiset target (D4).

T3b copies every probe into `tests/fixtures/flow/`, then authors more:
- **Layout:** chains in each direction from a non-root tile; a `moveAllToEast` shift that moves one tile, then three; a
  north-west excursion that makes `minX`/`minY` negative; a ring that links back to the root; a wide label (more than
  200 units) next to its neighbour, both sides.
- **Links:** an explicit `s` link that equals the creation path; a link to each of the four neighbours; two links to the
  same tile.
- **Labels:** `%newline()` with two and three lines (box height); creole size, colour, `<U+...>`, `<&...>` openiconic,
  `<$sprite>` (an error or a sprite, measured); a label that contains `"`; the `“…”` curly quotes that `%g` accepts.
- **Options:** `!option handwritten true` with a link.

For every `geometry` fixture, keep each distinct jar layout `jar-variants.mjs` finds over 8 renders as
`<slug>.svg`, `<slug>.v2.svg`, ….
**Rejected:** stopping at the 1 row.

### D7 — Ratchet: `svg-flow`, laid out like `svg-bpm`, plus a multiset tier
The row lives in the `unknown` cache tree. So goldens go under `oracle/goldens/svg-flow/unknown/<slug>/`, and
`ratchet.json` entries are `{ slug, type: 'unknown', addedAt, source: 'dot-cache' }`. Copy bpm's
`bpm.golden.ratchet.test.ts`, `bpm.diff-baseline.ratchet.test.ts` and `render-fixture-bpm.ts`, substituting `flow`. The
measurement tools in `measurements/` are bpm's, adapted by substitution, and T3a reads each before trusting it.

The tiers:
1. **Equality pins:** every conformant row and fixture, meaning the one-box ones and the error pairs.
2. **Multiset tier** (`flow.multiset.ratchet.test.ts`, new): every multi-box row and fixture is multiset-equal to its
   oracle, or to one of its `vN` variants. It reuses `multiset.mjs`'s comparison as a test helper under
   `tests/oracle/svg-conformance/` (keep it a small pure function), and a broken label must fail it.
3. **`diff-baseline.json`**, written only if a row ends nonzero for any reason other than order.

T4 re-pins `bemixo-79-xulu250`'s `known-misroute` routing row as `agree`, `ourType: FLOW`, and moves its refusal row's
`engine`, with `measurements/repin-routing-refusal.mts`. It moves the count assertions by exactly the rows moved, and
`scripts/parity-dashboard-goldens.ts` adds `svg-flow` to `unknown`'s list.
**Rejected:** a new survey bucket, which would move every bucket's survey file for no fidelity gain (nwp D7, bpe D7).

### D8 — Mirror upstream's quirks
Port each of these as the jar does it, with a one-line comment quoting the Java:
- **The first line is always the root.** `lineSimple` ignores the orientation while `field == null`, so `s 10 "A"` as
  the first line is the root.
- **A new tile goes 2 units from `lastTile`**, and `moveAllToEast` shifts everything whose `xmax ≥ p.xmin` and
  `ymax ≥ p.ymin` until `p` is free. The commented-out `p.move(EAST, 2)` stays a comment in the port.
- **`createTile` adds the creation path**, `lastTile` to new, in the given direction. `linkSimple` adds a path from
  `lastTile` and does **not** move `lastTile`.
- **Box centring.** Each box is centred in a 200×70 cell (`SINGLE_SIZE_X = 100`, `SINGLE_SIZE_Y = 35`, times 2), and a
  wide box overflows its cell (`bemixo`'s "Can the buffer accommodate?" at x=395.981).
- **The path end-points** are cell centres moved by half the box size (`movePoint`), not cell edges. The ellipse is at
  `dest - 3`, 7×7.
- **The label is one `Display` line.** `\n` stays literal (`cov-label-newline` draws `line1\nline2`), and
  `%newline()` splits (`cov-label-newline-fn`, two `text`s). Creole runs (`cov-label-creole`). `(.*)` is greedy, so
  inner quotes stay (`cov-label-quotes`).
- **`TileGeometry.fromString`** upper-cases the first character, and the regex is case-insensitive
  (`cov-upper-orientation`). Confirm the port's regex flag, and do not assume it.
- **`getDescription()`** is `(Flow Diagram)`. `DiagramDescription`'s wrapping: read how `BpmDiagram` returns
  `(Bpm Diagram)`.

**Rejected:** tidying any of them. No library forces it, so it would be an unruled divergence.

### D9 — Serial, main checkout, one commit per task
Worktrees need symlinked assets and skip git hooks (`.claude/memory/agents-write-main-via-serena.md`,
`worktrees-skip-git-hooks.md`). New files sit unreferenced until T3a, so `npm test` stays green through batches 1 and 2.
**Rejected:** parallel worktrees. T1a and T1b are independent, but each is minutes of work, and serial costs less than
the worktree setup.

### D10 — Hooks: split by upstream method, keep names
The hooks cap files at 500 lines, functions at 30 NLOC, CCN 10, and 5 parameters.
- `TilesField#isAdjoining`, with a switch and a guard, can reach CCN 10: keep the name on the entry point and put each
  `case` in a named helper, with its Java line.
- `FlowDiagram#drawU` keeps the box loop and the path loop as two named helpers.
- Files written through the shell skip the hook, so run `lizard` by hand (`.claude/memory/cep-status.md`).

### D11 — What ends a row
In order:
1. Conformant.
2. A jar error page where we also error (ruling 2026-10-10).
3. A named divergence with a forcing library.
4. A `needs-ruling` issue naming the row: the D4 issue for every multi-box row, which must be multiset-equal.
5. A separable `queue:ready` issue, with a "Blocked by" line added to #136.

**No row ends unnamed.** Planning found no forcing library. Flow never reaches graphviz, Smetana, KaTeX or the `{{ }}`
seam. `bemixo-79-xulu250` is in neither `oracle/accepted-divergences.json` nor `stock-error-pages.json`.

## Operational readiness (auto-confirmed)

| Question | Answer |
|---|---|
| SLIs and alerts | None. This is a browser-safe library with no runtime service. The survey, census and ratchets are the signal. |
| Traces and dashboards | N/A. `docs/parity-report.md` is regenerated, and the generated `unknown` sentence moves on its own. |
| Rollback | **Reversible.** Revert the squashed commit. No migration. |
| Scale | `moveAllToEast` loops while occupied; each pass is O(tiles), and a run of k collisions is O(k × tiles). The corpus row has 9 tiles. The ratchet grows by about 60 authored rows, and routing and refusal gain 1 twin each plus authored twins. |
| Likely failures | 1. A survey run under load writes `timeout`: rerun it alone. 2. A shared seam (`block-extractor`, `assemble-svg`, `registered-plugins`) moves another engine's routing: `verdict-diff` names the row. 3. `getTileById` or `buildPath` returns instead of throwing (D5). 4. Someone fits the box order to the frozen oracle (D4 forbids it; the multiset tier would not catch it, review does). |
| Compatibility | No public API change. `block-extractor.ts#DiagramType` gains `'flow'` (internal). `dist/*.d.ts` is checked at T5. SVG changes on purpose, for `@startflow` only. |

## Baseline

Measured on `14ccdcbba`, 2026-11-11, at planning:
- Committed `parity-unknown.json`: 969 conformant, 16 structural-match and 63 diverged, of 1,048.
- `bemixo-79-xulu250` is `diverged`, `firstDiff svg/@background`, `maxDelta` 361.
- Routing: `known-misroute`, `jarType FLOW`, `ourType NONE`. Refusal: `engine none`.
- `dot -V`: `16.1.0 (20260904.0139)`.

The Phase 8 gate results are appended below.

**Phase 8, 2026-11-11 18:30-18:40 local, on `14ccdcbba`, load average 7-17: green.**
- `npm test -- --maxWorkers=4` **exit 0**: 47,023 passed, 0 failed, 4 expected fail, 7 skipped and 6 todo, in 2,204
  files (2,203 passed, 1 skipped), 548.32 s. Coverage 97.09 / 92.83 / 97.68 / 98.06 (statements / branches /
  functions / lines).
- `npm run typecheck`, `npm run lint`, `npm run build` and `npm run format:check`, with this brief in the tree: exit 0.

**This green run is the baseline.** The working tree held only this brief and the planning progress file. The adapted
tools were smoke-run:
- `flow-rows.mjs` and `row-diffs.mts`: `bemixo-79-xulu250`, 11 diffs, first `svg/@background`.
- `multiset.mjs`: two jar renders and the cached oracle, multiset-equal.
- `jar-variants.mjs`: the 41 probes plus `bemixo`, 4 renders.

`fixtures.mts`, `pin-flow.mts`, the baseline builders and `repin-routing-refusal.mts` need `render-fixture-flow.ts`
and were not run.
