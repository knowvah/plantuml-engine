# Decisions

Recorded unattended on 2026-11-11 so the user can audit them here.

## Auto-confirmed (unattended)

### D1 — Port file for file at `src/diagrams/git/`; members with no caller are not ported
`CLAUDE.md` says "Upstream architecture is authoritative" and "Preserve upstream names". `gitlog/` has 10 Java files:
`Commit`, `CursorPosition`, `GNode`, `GNodeBuilder`, `GitCurve`, `GitDiagram`, `GitDiagramFactory`, `GitTextArea`,
`MagicBox` and `SmetanaForGit`. `src/diagrams/git/` mirrors them flat, plus `git-export.ts` (the bpm-export precedent,
D3) and `index.ts` (the plugin).

**Kept although they look redundant:**
- `GitDiagram`'s second `new GNodeBuilder(textArea.getAllCommits())` (`GitDiagram.java:58`), whose result is dropped.
  It has no observable effect, because any throw would already have happened on line 57. Keep it with a comment.
- `GNode#eatTheNextOne`'s `IllegalStateException` guards (`GNode.java:105-106,112-113`). They are unreachable from
  `merge`, which tests `canEatTheNextOne` first.
- `CursorPosition#getDownFromInternal`'s 23 rules, **in upstream order**. Some overlap: `"| "` + `" \\"` is tested four
  times with different third conditions, and the first match wins.

**Not ported, each with a grep in the journal at T1a:**
- `GitTextArea#charAt` and `#getCommitByName`, and `Commit#getPosition`, `#hashCode` and `#equals`. Nothing in
  `src/main/java/net` calls them (`grep -n 'charAt(\|getCommitByName\|getPosition' gitlog/*.java` finds only the
  definitions and `SmetanaForGit`'s own private `getPosition`).
- `GitTextArea.java:59`'s `if (TeaVM.a()) assert …`. The release jar runs with assertions off.
- `CursorPosition.java:210`'s `System.err.println`: `src/` has no console in rendering paths. The
  `UnsupportedOperationException` that follows it is ported.
- `package-info.java` and `readme.md`.

**`planning/mission-guide.md` Phase 5a** describes Mermaid's `gitGraph` (`commit id:`, `branch`, `checkout`,
`cherry-pick`, `order`, lane colours). None of it exists in `gitlog/`. T5 replaces the section with what the Java does.
**Rejected:** following the mission guide. The Java is the spec.

### D2 — Lay out through `core/graph-layout`, building `SmetanaForGit`'s graph attribute for attribute
`SmetanaForGit#initGraph`/`#createNode`/`#createEdge` (`SmetanaForGit.java:145-212`) build:
- the graph with `ranksep=0.35` and nothing else (no `nodesep`, no `rankdir`);
- per `GNode`, in collection order, a node `N<num>` with `shape=box`, `height=""+(h/72)`, `width=""+(w/72)` from
  `MagicBox#getBigDim`, and **no `fixedsize` and no `label`**;
- per node and per `getDowns()` entry, an edge child→parent with `arrowsize=.7`, `arrowtail=none`,
  `arrowhead=normal`.

`core/graph-layout-build.ts:145-153` emits every non-record node `fixedsize=true, label=""`, and `DotInputGraph`'s
`rankSep` goes through svek's floor. So **T1c adds one node kind**: a box with `width`/`height` as minimums and no
`fixedsize`/`label`, like `addRecordNode`, the json precedent (`graph-layout-build-special-nodes.ts:58-67`). It also adds
a raw `ranksep` with no `nodesep` line. Inch strings use Java's `"" + double`, full precision
(`SmetanaForGit.java:200-201`), not core's 6-dp `inches()`. That avoids json's accepted 6-dp residue
(`DIVERGENCES.md`, "6-dp inch strings").

**Measured at planning** on one node declared 70.53×17 pt (`dot` 16.1.0, and raw `@knowvah/dot-engine` with no
measurer set):

| Variant | real `dot` height | dot-engine height | jar height |
|---|---|---|---|
| no label (mirror) | 24.5 | 24.8 | 24 |
| `label=""` | 17 | 17 | 24 |

The jar's 24 is Smetana's default-`\N` label, sized (0,16) and then padded by 8. It is the json entry's "label half",
already named under the Smetana ruling (`DIVERGENCES.md`, the paragraph after the U-REC table). Mirroring the attribute
set lands within 0.8 pt on every box with no comment. `label=""` is 7 pt short on all of them, and it would add an
attribute upstream does not set. The cost: a name narrower than graphviz's `"N<num>"` label plus padding (about
30 pt, so names of 1 to 2 characters) gets a wider box. No corpus row has one, since hashes are 7+ characters. No
warning was printed on either run.
**Rejected:**
- `label=""`: measured further from the jar, and not upstream's attribute set. json chose it only because there it
  *reproduced* Smetana's result (json-family-followons D2).
- Handing a hand-built DOT string straight to dot-engine from `src/diagrams/git/`: a second engine seam beside
  `core/graph-layout`.
- Porting Smetana: ruled out on 2026-08-09.

### D3 — Draw through klimt, as bpm does; port `jsondiagram/Arrow` where upstream keeps it
`GitCurve` imports `jsondiagram.Arrow` and `jsondiagram.Mirror` (`GitCurve.java:40-41`), and `SmetanaForGit` imports
`Mirror` (`SmetanaForGit.java:57`). `src/diagrams/json/Mirror.ts` already has `inv` and `invGit` (`Mirror.ts:57-59`).
No `Arrow.ts` exists: `JsonCurve.ts:60-113` re-derives `Arrow#getPoint`/`#drawArrow` as SVG path strings for json's
string renderer.

T2a ports `Arrow.java` as `src/diagrams/json/Arrow.ts`, drawing a klimt `UPath` through `UGraphic`. It is a new file:
`JsonCurve.ts` is not touched, so no json output can move. `GitCurve`, `MagicBox` and `SmetanaForGit` draw through
`UGraphic`, so `!option handwritten` reaches them through `UGraphicHandwritten` (`cov-option-handwritten` draws paths
for its rects). The export copies `src/diagrams/bpm/bpm-export.ts`:
- the `TitledDiagram` path with no chrome and no scale;
- style name `activityDiagram`, because `DiagramType.GIT` falls through `getStyleName` (`DiagramType.java:234-294`);
- `data-diagram-type="GIT"`.

T3a adds one `ALLOWLIST` entry, `src/diagrams/git/ → src/diagrams/json/`, quoting the `GitCurve.java` imports.
**Rejected:**
- Reusing `JsonCurve`'s string builders: they bypass `UGraphic`, so handwritten and the stroke stack would need
  re-deriving.
- Refactoring `JsonCurve` onto the new `Arrow.ts`. That is not needed here, and it would move json bytes inside a git
  mission.

### D4 — The skin is the diagram's own, and nothing can write to it
`GitDiagramFactory extends PSystemAbstractFactory` and hands every line to `GitTextArea`. There is no command list and
no `CommonCommands`. A line with no `*` is simply not a commit (`GitTextArea.java:58-61`). Probes `cov-skinparam`,
`cov-style`, `cov-theme`, `cov-pragma-dark`, `cov-title` and `cov-scale` each render byte-for-byte like the plain
two-commit source: 46×106, `#181818` lines, `#000` text. `!option handwritten true` does reach, through the
preprocessing artifact.

`GitDiagram` calls `TitledDiagram#getSkinParam()`, not a fresh one (`GitDiagram.java:67`). T2b uses the port's
`TitledDiagram` skin param, and asserts in a test that a `<style>` block in the source leaves the output unchanged.
**Rejected:** `SkinParamFresh`. Upstream does not build one here, and the preprocessing options must still reach it.

### D5 — Errors mirror the jar's, not its page
The rule is `.claude/memory/error-page-conformance-rule.md`: a pair of error pages counts as conformant.
1. **`IllegalArgumentException`** from the `Commit` constructor, when the `*` is followed by neither a space nor `-`
   (`Commit.java:52-53`): `cov-star-alone` (`*` alone), `cov-star-no-space` (`*a1`), `cov-tab` (`*\ta1`).
2. **`UnsupportedOperationException`** when no walk rule matches (`CursorPosition.java:211`): `cov-orphan-pipe` (a `|`
   under the last commit).
3. **`IllegalStateException`** in `GitCurve` when an edge has other than one bezier (`GitCurve.java:60-61`). Port the
   throw. If dot-engine ever returns zero splines for an edge, that is a D9 engine finding, not something to absorb.

**Not errors**, and mirrored as drawn: a stray non-grid character (`cov-bad-grid`), a blank line (`cov-blank-lines`) and
a lone `.` (`cov-ellipsis`). Each cuts the parent walk and leaves two unconnected boxes (85×57, no paths). An empty body
draws a 21×21 empty canvas (`cov-empty`).

The port must throw in cases 1 to 3 and never return `undefined`. Java `String#substring`/`indexOf` semantics, such as
`matches` returning false when `x > line.length()`, are mirrored exactly. A JS `slice` past the end does not throw, so
the explicit guards in `CursorPosition#matches` (`:64-69`) must stay.

### D6 — Duplicate names follow `LinkedHashMap`
`GNodeBuilder`'s constructor `put`s each commit's node by name (`GNodeBuilder.java:53-59`). A repeated name keeps its
**first insertion slot** and replaces the value with the later node, and the earlier node is lost. Links then resolve
by name to the surviving node, once per commit, so a duplicate adds a second, parallel edge set. `cov-duplicate-name`
(`a1` twice over `r0`) draws 2 boxes and 2 edges. T1b mirrors this with a `Map` (`Map#set` on an existing key also
keeps its slot) and pins `cov-duplicate-name` in a unit test.

**Amended 2026-11-11 (T1b):** the 2 edges are not parallel `a1 → r0` links. The first `a1`'s parent walk stops on
the second `* a1` line, which resolves by name to the surviving node, so the edges are a **self-loop** `a1 → a1`, then
`a1 → r0` (the oracle draws a looping curve on the `a1` box and one straight edge). The decision itself (a `Map`,
first slot kept, value replaced) is unchanged and mirrors the jar, so this corrects the description, not the decision:
no halt.

### D7 — Fixtures: the 4 rows, the planning probes, then authored probes
Upstream ships no git test beyond `DiagramTypeTest.java`, so `CLAUDE.md`'s "author `.puml` fixtures" applies.
[probes/](probes/) holds 38 planning probes, rendered on 2026-11-11 into `/tmp/gip-plan/oracle`. T3b copies all 38
into `tests/fixtures/git/` with their oracles, then adds:
- **Walk rules:** one fixture per `getDownFromInternal` rule (`CursorPosition.java:119-209`) that no probe or row
  reaches. T1a's unit tests list which rules each source exercises; T3b fills the gaps.
- **Octopus:** `*-.` with 3, 4 and 5 parents, and `-` runs with no `.` (`Commit#getCandidatesForDown`).
- **Comments:** `(` with no `*` before it; two `(…)` groups; a comment on a node that later folds into a chain; a
  creole tag and `<U+…>` in a comment and in a name.
- **Folding:** chains that fold to 1, 2 and 3 boxes; a fold interrupted by a merge; a fold below an octopus.
- **Scale:** one generated source of about 200 commits, measured for render time against `figagi`.
**Rejected:** stopping at the 4 rows.

### D8 — Ratchet: `svg-git`, with a structural tier
The rows live in the `unknown` cache tree. So goldens go under `oracle/goldens/svg-git/unknown/<slug>/`, and authored
rows go under `oracle/goldens/svg-git/authored/`. Start from bpe's `bpm.golden.ratchet.test.ts`,
`bpm.diff-baseline.ratchet.test.ts` and `render-fixture-bpm.ts`, substituting `git`.

Under the Smetana ruling most drawn rows can end as `structural-match`, not conformant. So the ratchet has two tiers:
1. **conformant**: zero `compareSvg` diffs, as in `svg-bpm`.
2. **structural**: the survey's `structural-match` verdict (`scripts/svg-parity-survey.ts:201-220`: same elements and
   strings, numeric deltas only), plus a **per-row `maxDelta` ceiling that may only fall**. This is the shape of
   `json-family-positional.json`.

A row may move from structural to conformant, never back. T4 extends `pin-git.mts` to emit both tiers. It re-pins the 4
`known-misroute` routing rows as `agree`, `ourType: GIT`, and moves their refusal rows' `engine`, with
`repin-routing-refusal.mts`. `scripts/parity-dashboard-goldens.ts` adds `svg-git` to `unknown`'s list.
**Rejected:**
- A conformant-only ratchet: the structural rows would go unguarded.
- Extending `json-family-structural.ts`. It is wired to `renderFixtureJson` and json's corpus trees.
- A new survey bucket. It would re-classify the corpus for no fidelity gain (nwp D7).

### D9 — A remaining diff is a port defect until proven to be Smetana arithmetic
The proof standard is json-family-parity D3 (`plans/json-family-parity/decisions.md`). For each row left at
structural-match:
1. **Engine input equals upstream's.** The DOT our `SmetanaForGit` emits has `SmetanaForGit`'s graph, nodes, order,
   attributes and sizes (D2), checked against a hand trace of the Java on that source.
2. **Engine equals graphviz.** dot-engine's positions and splines equal real `dot -Tdot` 16.1.0 on that DOT. A mismatch
   is stop 5.
3. **The residue maps to a named Smetana-vs-graphviz mechanism**, cited on both sides: the Smetana transpile
   (`gen/lib/...`, read through the C at `~/git/graphviz/lib/`) and the graphviz C. The candidates are the four already
   named for json (U-REC rounding, U-CLIP, U-ARROW, U-NS) and the default-`\N` label half (D2). A box is
   `poly_init`, not `record_init`. If 2.38's `poly_init` rounds the declared size to points where modern graphviz does
   not (the jar draws 71 for a declared 70.53), name it as the box analog of U-REC, with its own Smetana and C cites
   and the graphviz commit that changed it.

**Never emulate Smetana arithmetic in the port.** That means no pre-rounding of declared sizes and no shrinking of a
label to reproduce Smetana's numbers. json-family-parity faced exactly this choice for U-REC (amendment F2,
`plans/json-family-parity/decisions.md:112-126`), and the outcome is the U-REC row in `DIVERGENCES.md`. `CLAUDE.md`:
"Never chase a Smetana-specific number".

A row that passes 1 to 3 gets a line in a new **git row table** under `DIVERGENCES.md`'s existing Smetana entry, with
its residue (node / path / dw / dh) and mechanisms. That is the json format. The entry's "node sizing … remain held to
upstream" sentence gets a git carve-out quoting `SmetanaForGit.java:129-134`: the drawn box is the engine's size, read
back. A residue that fits none of the named mechanisms is a port defect: fix it. If you cannot say which it is, open a
`needs-ruling` issue for that row. The standing ruling already covers these mechanisms, so nothing here is a new
divergence.
**Rejected:** naming a residue as Smetana delta on the strength of its size alone. Most chased defects in this repo were
measurement artifacts (`.claude/memory/measurement-artifacts-outnumber-defects.md`).

### D10 — Serial, in the main checkout
The tasks share `src/diagrams/git/` and build on each other's types, and Serena edits the main checkout from a worktree
(`.claude/memory/agents-write-main-via-serena.md`). Run one writer at a time, in the main checkout, with one unsigned
commit per task. T6 squashes them all into one commit.

### D11 — Hooks: split by upstream method, keep names
The hooks cap files at 500 lines, functions at 30 NLOC, CCN 10, and 5 parameters.
- `CursorPosition#getDownFromInternal` has 23 rules (CCN far above 10). Keep the method name on the entry point. The
  rules become an **ordered array of `{ test, dx, dy }` entries**, each with its Java line in a comment, evaluated
  first-match in upstream order, with the `UnsupportedOperationException` after the array. One unit test per entry
  proves the order holds where the rules overlap.
- `Commit#getCandidatesForDown` and `MagicBox#drawBorder` fit as written.
- Files written through the shell skip the hook: run `lizard` by hand (`.claude/memory/cep-status.md`).

## Operational readiness

- **Observability:** N/A. A browser-safe library with no service, SLI or telemetry. The quality signal is the survey and
  the ratchet.
- **Rollback:** Reversible. Revert the squashed commit; no data or schema is involved.
- **Scale:** `figagi-40` is the size envelope at 665 boxes and 857 edges. Its render time is measured at T3a against
  the survey's 60 s per-row timeout and the CI per-test budgets (`tests/helpers/ci-test-budgets.ts`).
- **Failure modes:**
  1. A source with an unparseable grid throws (D5) and draws the error page.
  2. A large log renders slowly. T3a measures it, and the ratchet test's per-test budget catches a regression.
  3. A core `graph-layout` change moves another engine. Stop 1 catches it, through the batch-close full survey.
- **Backwards compatibility:** no public API change; `@startgit` output goes from the unknown-type page to a drawing.

## Baseline

Measured at planning on `d136df2eb`, 2026-11-11, load average about 8. Every gate was green, so there is no known
failure to carry:
- `npm test -- --maxWorkers=4`: exit 0. 2,194 test files passed and 1 skipped; 46,836 tests passed, with 4 expected
  fail, 7 skipped and 6 todo.
- `npm run typecheck`, `npm run lint` and `npm run build`: exit 0 each.

Survey state, from the committed `parity-unknown.json`: the 4 git rows are `diverged`, with first diff
`svg/@background`.
