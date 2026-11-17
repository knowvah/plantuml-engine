# Decisions (ccb)

## Auto-confirmed (unattended)

Planned with nobody present (`/plan-mission --unattended next --branch feature/parity-queue`, 2026-11-16). `next`
resolved to #151: no issue was `queue:planned`, #136 is blocked by open issues (#151 among them), and #151 has no
"Blocked by" and no `needs-ruling` label. Each decision lists what was rejected and the evidence, so the user can audit
it.

**Scope finding.** The issue names 6 rows because T2c compared *link* comments only. Planning compared every comment
(`measure-ccb.mts`) over all 1234 class/object ratchet pins: **154 differ**. The issue's "Done when" reads "Comments of
every conformant class and object row equal the jar's bytes", so all 154 are in scope. Three mechanisms cover every
one of them (D1, D2, D3). None needs a ruling.

### D1: An entity writes a comment only when its upstream image does

**Upstream.** Only two entity images write a comment: `EntityImageClass#drawU` (`svek/image/EntityImageClass.java:141-142`,
`"class " + getEntity().getName()`) and `EntityImageDescription#drawU` (`EntityImageDescription.java:295`,
`"entity " + …`). `grep -rln UComment svek/image/` returns exactly those two files. `GeneralImageBuilder` picks the image
per leaf type (`svek/GeneralImageBuilder.java:107-242`): class family → `EntityImageClass` (`:111`), `OBJECT` →
`EntityImageObject` (`:181`), `MAP` → `EntityImageMap` (`:184`), `JSON` → `EntityImageJson` (`:187`), `STATE` →
`EntityImageState` (`:142`), USymbol kinds → `EntityImageDescription` (`:158-174`, `:203`). Object, map, json, state,
note, association and lollipop images write nothing.

**Ours.** `renderClassifierLeaf` wraps every remaining classifier with `withComment = true`
(`src/diagrams/class/renderer-leaf.ts:139-141`), so objects, maps, json entities and an `allow_mixing` `state` write
`<!--class X-->`. That is bucket C: 89 rows (74 in `svg-object`, 15 class-routed).

**Decision.** Port the dispatch as one pure predicate beside `wrapEntity` (`renderer-group.ts`), named for its origin,
for example `entityImageCommentKind(classifier): 'class' | 'entity' | undefined`, with a JSDoc `@see` to
`GeneralImageBuilder.java:107-242`. `renderClassifierLeaf` passes its result as `withComment`. The USymbol path
(`renderer-usymbol-entity.ts#renderClassUSymbolEntity` → `core/svek/DecorateEntityImage.ts`) already writes `entity`;
leave its emitter where it is and make it consult the same predicate only if a probe shows it must.

**Rejected.** *Strip the comment in the object/map/json renderers.* The decision is upstream's dispatch, not each
image's; one predicate is also what D2 needs for a hidden leaf.

### D2: A hidden entity or link writes its comment and nothing else

**Upstream.** `SvekResult#drawU` draws every node and every edge, the hidden ones through `UHidden.HIDDEN`
(`svek/SvekResult.java:85`, `:98`). `AbstractUGraphic#draw` writes a `UComment` before it looks at the hidden flag
(`klimt/drawing/AbstractUGraphic.java:128-131`, the hidden check is `:141`). The SVG back end suppresses shapes itself
(`UGraphicSvg.java:97,103`, `SvgGraphics.java` `if (hidden == false)` at every shape), and drops the group that is left
empty (`SvgGraphics.java:1190-1195`, `if (element.getFirstChild() != null)`). So a hidden class writes
`<!--class X-->`, a hidden link writes `Link#commentForSvg` (`abel/Link.java:116-121`), and neither writes a `<g>`.
- `Link#isHidden` is `hidden || cl1.isHidden() || cl2.isHidden()` (`abel/Link.java:458-459`). `-[hidden]-` sets
  `hidden` (`decoration/WithLinkType.java:100-101,149-150`), **not** `invis`.
- `SvekEdge#drawU` returns before the comment only for `opale` and `link.isInvis()` (`svek/SvekEdge.java:833-837`,
  comment at `:844`).
- A hidden cluster writes nothing: `Cluster#drawU` returns at `group.isHidden()` (`svek/Cluster.java:298-300`) before
  its comment (`:309-311`). Its member nodes are still hidden nodes, so they comment (`senece-96`: `<!--class util1-->`).
- A removed leaf never becomes a node (`GeneralImageBuilder.java:107`); the `remove-class` probe is already equal.

**Ours.** `renderClassifierLeaf` returns at `classifier.hidden` (`renderer-leaf.ts:108`), and `drawEdge` returns for a
hidden endpoint or `edge.hidden` (`renderer.ts:246-247`), so neither writes its comment. Bucket A: 23 rows, plus the
probes. `class-relationship-ast.ts:192-200` cites `SvekEdge.java:835-836` (the `isInvis` return) for `-[hidden]-`;
that citation is wrong and is corrected in T1c.

**Decision.** At those two returns, push the comment the visible path would have written, through `escapeComment`
(the lint rule requires it), and nothing else: D1's predicate for a leaf, `linkCommentOf(edge, syntheticNames)` for a
link. Order is unchanged, because both loops already run in jar order (`renderer.ts` steps 2 and 3). The description
engine already does this (`src/diagrams/description/layout-helpers-types.ts:275-284`, `renderer-draw-sequence.ts
#drawEdges`); follow its shape.
- Keep every uid and id effect of a hidden link as it is today. `SvekEdge#drawU` also calls `setSharedIds` and
  builds the link id for a hidden link; check whether `linkIds` (`renderer.ts`, `Link#idCommentForSvg` suffixes) must
  see the hidden link before you skip `renderEdge`. If a probe shows a suffix moves, that is the same mechanism: fix it
  in T1c and journal it.
- `consumedByOpaleNote` keeps returning first, with no comment (`SvekEdge.java:833-834`, `opale`).

**Rejected.** *Render the hidden element and strip its shapes after.* It reimplements `SvgGraphics`' hidden flag at
string level, for output that is only ever the comment.

### D3: Comment names are `Entity#getName()`, the quark's own name, fixed when the quark is made

**Upstream.** Every comment uses `getName()`: the class comment (`EntityImageClass.java:142`), the link comment's ends
(`Link.java:118-120`) and the cluster comment (`Cluster.java:309`, `group.getName()`). `Entity#getName()` is
`getQuark().getName()` (`abel/Entity.java:686-688`, `plasma/Quark.java:84-86`): the last path segment under the
separator active when the quark was made, the whole string under `set separator none`, and the code or alias rather than
the display label. Read `plasma/Plasma.java` and `net/atmp/CucaDiagram.java:244-283` (`quarkInContext`) before you
port it.

**Ours.** The class comment uses `leafPortion(classifier.id)`, a fixed `.` split (`renderer-group.ts:72-75`, its doc
comment calls it "best-effort"). The cluster comment uses `ns.label`, the display text (`renderer.ts:185` →
`wrapCluster`, `renderer-group.ts:115`). The USymbol entity comment uses the dotted id. Bucket B: 42 rows.

| Shape | Rows (examples) | Ours → jar |
|---|---|---|
| class name under another separator | `lobofa-60`, `dacixi-46`, `fokudo-49`, `kibinu-30`, `mocoda-55`, `rixeje-01`, `zecate-11` | `Name1::ClassA` → `ClassA`, `a/b/c/js/Object` → `Object` |
| class name under `separator none` | `pexivi-54`, `momoba-92` | `Z` → `X.Y.Z`, `BaseClass` → `.BaseClass`, `Person` → `net.dummy.Person` |
| cluster name | `curuju-86`, `jaxadi-58`, `tufuru-60`, `satabo-94`, `sugifi-33`, `sumule-00`, `pijugo-91`, `zasuxe-15` | `Purchase` → `Pu`, `A.B.C.D` → `D`, `<<profile>> profile` → `profiles` |
| entity (USymbol) name | `cokavo-95`, `fuboto-82`, `sijisi-94`, `catana-32`, `tefeco-12` | `a.b` → `b`, `r1.r2` → `r2` |

**Decision.** Stamp the quark name on the AST node when the parser creates it, with the separator active at that
moment, and carry it unchanged to `ClassifierGeo` and `NamespaceGeo` (a field such as `quarkName`, copied like
`syntheticIdName`, `class-geo-types.ts:81-84`). The three emitters read it. `leafPortion` is then removed, or kept only
where a caller still needs a dotted split (grep its callers first). Reuse `src/core/plasma/Quark.ts` /
`namespace-groups.ts` if they already compute the name; check `docs/catalog.md` before writing a helper.

**Rejected.**
- *Recompute at render from `id` and the final `ast.namespaceSeparator`.* `set separator` can change mid-diagram, and
  the quark keeps the name it was made with. The `separator none` rows (`momoba-92`: `net.dummy.Person` inside a
  namespace) show the name is not a function of the final id alone.
- *Keep `leafPortion` and special-case `::` and `\\`.* That is fitting, and misses `none`, `/`, `-` and aliases.

### D4: The byte gate lives in the class and object golden ratchets

`compareSvg` drops comments (`.agent-notes/c4dd-T2c.md`), so a byte assertion is needed. The ratchets
(`tests/oracle/svg-conformance/class.golden.ratchet.test.ts:198-216`, `object.golden.ratchet.test.ts:109-120`) already
render every pin. Each `it` gains a second assertion on the same render: the comment sequence equals the golden's. A row
listed in `oracle/goldens/svg-class/comment-open.json` (or the object twin) instead asserts that its mismatch count
(the multiset difference, as `measure-ccb.mts` counts it) never rises, and fails when it reaches 0, so the list
shrinks with each task. Each entry carries `{ slug, tree?, reason }`, where `reason` names D1, D2, D3 or a filed issue.
A shared `svgComments(svg)` helper goes in `tests/oracle/svg-conformance/` (check `compare.ts`/`normalize.ts` for an
existing one first).

The probes move to `tests/fixtures/class-comment-bytes/` with an authored gate,
`tests/oracle/svg-conformance/class-comment-bytes.authored.test.ts`, modelled on
`emoji-edge-artwork.authored.test.ts`: comment-sequence equality for `ZERO` rows, never-rises for `OPEN` rows. The
issue's own fixture, `tests/fixtures/c4dd-T2c/class-namespace-separator-comment.puml`, joins that gate as a row read in
place.

**Rejected.** *A separate test that renders all 1234 pins again.* It doubles the ratchets' CI cost for the same renders.

### D5: No new divergence, no public d.ts change

Nothing here is library-forced. `DIVERGENCES.md` and `oracle/accepted-divergences.json` stay unchanged. The AST and geo
types are internal: `dist/plantuml-engine.d.ts` mentions `ClassifierGeo` only inside doc comments at planning. T0
snapshots `dist/*.d.ts` and T2 diffs them; any change is stop 5. Comments are invisible to `compareSvg`, so no verdict
can move, and the batch-close survey must prove it.

## Operational readiness

- **Observability:** N/A. A browser-safe library with no service, SLIs or traces. The gates are the monitors.
- **Rollback:** Reversible. Revert the squash commit; `class-comment-bytes/pre-squash` keeps the per-task history.
- **Scalability:** N/A. One regex pass per ratchet render already being made, plus about 9 gate renders.
- **On-call:** N/A (library). The failure mode is a lost conformant row or a moved uid, which `verdict-diff.mjs`, the
  ratchets and the censuses catch.
- **Backwards compatibility:** no API, d.ts or data contract change (D5). Only SVG comment bytes change, towards the
  jar. A consumer parsing `<!--class X-->` sees the jar's names.
- **Irreversible changes:** none.
