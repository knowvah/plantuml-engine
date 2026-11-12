# Decisions

Recorded unattended on 2026-11-11 so the user can audit them here.

## Auto-confirmed (unattended)

### D1: A new engine, file for file, at `src/diagrams/cheneer/`, on our `CucaDiagram` port
`ChenEerDiagram extends AbstractEntityDiagram` (`cheneer/ChenEerDiagram.java:51`), which extends `CucaDiagram`. Our port has
no `AbstractEntityDiagram` class. Its members are `getDotStrings`, `getDescription` and `packSomePackage`
(`classdiagram/AbstractEntityDiagram.java:60-106`), and Chen reaches none of them through svek. So `ChenEerDiagram`
extends `src/core/cucadiagram/CucaDiagram.ts`, as `ActivityDiagram` does (laep D1). T1a quotes the grep that shows no
Chen path calls those three members, and adds a header line saying so.

The directory is `src/diagrams/cheneer/`, upstream's package name. It holds one TS file per Java file, with the names kept:
- `ChenEerDiagram` and `ChenEerDiagramFactory`;
- `command/{CommandCreateEntity,CommandCreateAttribute,CommandAssociate,CommandEndGroup,CommandSimpleSubclass,CommandMultiSubclass}`.

The plugin and block type is `chen`. That is the `@startchen` tag (`DiagramType.java:111-112`), and
`scripts/classify-corpus.ts:48` already maps it to the `chen` bucket.

**Amended 2026-11-12 (T1a):** one premise above is wrong. `getDotStrings` IS reached: `CucaDiagramFileMakerSvek.java:83` passes `diagram.getDotStringSkek()` to the image builder, and `net/atmp/CucaDiagram.java:399-415` builds it from `getDotStrings()` (`AbstractEntityDiagram.java:60-71`), keeping the `nodesep`/`ranksep`/`layout` entries; `DotStringFactory.java:140-144` then rewrites their values. `getDescription` and `packSomePackage` stay unreached. The decision stands (extend `CucaDiagram`, no `AbstractEntityDiagram` class); `ChenEerDiagram` ports `getDotStrings` itself and T2c reads `getDotStringSkek()`. No task changes, so the mission continues (journal row 3).

**Rejected options:**
- Drawing Chen through the description engine. It is a different diagram class from a different factory, and
  "a structural divergence IS the bug" (`CLAUDE.md`).
- Adding an `AbstractEntityDiagram` port for three members that no Chen path reaches.

### D2: Leaf images and the subset decor go in `src/core/svek/`; the pipeline is composed per engine
Upstream draws every cuca diagram through one svek pipeline (`CucaDiagramFileMakerSvek`, `GraphvizImageBuilder`).
Ours has no shared `GraphvizImageBuilder`: each cuca engine composes the shared pieces (laep D2). Chen does the same.

**Shared ports, at their upstream packages:**
- `svek/image/EntityImageChen{Entity,Relationship,Attribute,Circle}.java` (713 lines) go to
  `src/core/svek/image/`.
- `src/core/svek/GeneralImageBuilder.ts` gains the four `LeafType.CHEN_*` branches at upstream's position
  (`GeneralImageBuilder.java:222-232`).
- `svek/extremity/MiddleSubset.java` and `MiddleFactorySubset.java` go to `src/core/svek/extremity/`.
- `LinkMiddleDecor.ts` gains the `SUBSET`/`SUPERSET` arm of `getMiddleFactory` (`LinkMiddleDecor.java:49-69`). Its
  header lists that member as deferred, and the deferral ends here for those two values. `CIRCLE*` stays on
  `MiddleCircleDecor`.
- `SvekEdge.ts#drawMiddle` reaches the new factory (`SvekEdge.java:982-989`). `labelShield` is 7 for any middle decor
  (`SvekEdge.java:353-356`).

**Engine-local, adapted from `src/diagrams/activity-legacy/`:**
- `cheneer-skin-param.ts`, which follows `activity-legacy-skin-param.ts`: every engine carries its own slice (laep T1a, board).
- `common-commands-1.ts`.
- The DOT build, layout and renderer.

Copy only what Chen reaches. Chen has no groups, notes, partitions, autarkic groups or note-on-link commands (`ChenEerDiagramFactory.java:58-69`), so
`renderer-cluster`, `renderer-opale`, `GroupMakerActivity` and the simplifier have no Chen counterpart.

**Rejected options:**
- Hoisting `activity-legacy/common-commands-1.ts` and the skin param into `src/core/`. That would mirror
  `CommonCommands` better, but it refactors an engine with 124 pinned rows during a port. Journal it as a follow-on
  instead.
- Generalising activity-legacy's DOT and renderer into a shared `GraphvizImageBuilder`. That is the same refactor
  risk, and it is laep D2's own follow-on.

### D3: Register at upstream's slot, after regex
`PSystemBuilder.java:199` adds `ChenEerDiagramFactory` after `PSystemRegexFactory` (`:197`) and before
`CrashDiagramFactory` (`:200`). T3a does three things:
- adds `registry.register(chenPlugin); // java:199` after `regexPlugin`;
- adds `chen: 'chen'` to `block-extractor.ts#START_SUFFIX_MAP`;
- extends the `DiagramType` union.

The factory is `PSystemCommandFactory(DiagramType.CHEN_EER)`, so it only ever sees `@startchen` blocks, and no
`@startuml` row can move. The routing and refusal gates should not change. Any change to them is stop 1.

### D4: The printed type is `CHEN_EER`, and chrome follows the cuca path
The jar writes `data-diagram-type="CHEN_EER"` (planning oracles). `TitledDiagram.ts:56` already lists `'CHEN_EER'`.
T2d routes the fragment through `assemble-svg.ts` the way activity-legacy's is routed (laep D4), with a key that prints
`CHEN_EER`, and proves it on `cov-title-chrome`, `cov-scale` and `cov-skinparam`.

**Upstream quirk to mirror:** `DiagramType#getStyleName` has no `CHEN_EER` arm and falls through to
`SName.activityDiagram` (`DiagramType.java:234-296`). Our `diagram-type-style-name.ts` falls back the same way, so the
diagram-level style (arrow, title, document) is `activityDiagram`'s. Leaf styles are
`root/element/chenEerDiagram/<chenEntity|chenRelationship|chenAttribute|circle>`, each with a `title` child
(`EntityImageChen*.java`). `plantuml.skin` has no `chen*` block, so every default comes from `element`. The planning
oracles show `#F1F1F1`, `#181818` and stroke 0.5.

### D5: Graphviz geometry is a target; one-node diagrams skip graphviz; ELK is in scope
Chen goes through real graphviz: every planning probe with two or more leaves wrote one `svek-1.dot`. So the jar's DOT
is a target, and T4 adds a DOT-parity gate (`oracle/goldens/cheneer/`, `tests/oracle/cheneer-dot-parity.test.ts`) like
activity-legacy's.

**What planning observed in the jar's DOT** (`/tmp/cee-plan/po/*/svek-1.dot`):
- `nodesep=0.486111` and `ranksep=0.833333`, the non-`ACTIVITY` defaults. T2c reads `DotStringFactory.java:243-258`.
- Shapes: `rect` for an entity, `ellipse` for an attribute or circle, `diamond` for a relationship.
- An attribute link has `minlen=1`, because `LinkArg.build(..., 2)` (`CommandCreateAttribute.java`). The direction is
  attribute→owner.
- An associate or subclass link has `minlen=2` (length 3). A cardinality is a `TABLE` label.
- `rankdir=LR` under `left to right direction`.

**One-leaf diagrams** (`cov-entity-empty`, `cov-relationship`, `cov-entity-display`, `cov-title-chrome`) wrote **no**
DOT. T2c finds the svek short-circuit that skips graphviz for a single node, quotes it, and checks whether
activity-legacy already ports it.

**`!pragma layout elk`** (`cov-elk`) draws `CHEN_EER` with no DOT, through `CucaDiagramFileMakerElk`. ELK is
upstream's second engine and is supported here (ruling 2026-10-11, `ElkBackend`). Description has an adapter
(`src/diagrams/description/description-elk-adapter.ts`). T3d writes Chen's.

If T3d measures the ELK work as large and separable from the dot path, it files a `queue:ready` issue like #158 (which
covers legacy activity's ELK path). It also adds a "Blocked by" line to #136 and names `cov-elk` there. Effort alone is
not a reason (`CLAUDE.md`).

### D6: Fixtures: the 4 upstream vega fixtures, the 48 planning probes, then authored ones
The corpus has no `@startchen` row: `grep -rl @startchen ~/git/pdiff tests/corpus` finds nothing. So every row in scope
is an authored fixture under `tests/fixtures/cheneer/`.

**Upstream's own fixtures come first** (`CLAUDE.md`: prefer upstream fixtures). The four
`src/test/resources/vega/migration/Chen*_Test.puml` files sit in [probes/](probes/) as `vega-chen-*.puml`, with their
YAML front matter stripped. Upstream ships an expected SVG beside each one. Our oracle is the pinned jar's render,
never that SVG. `CommandCreateEntityTest.java` becomes a unit test in T1b.

**The 48 planning probes** were rendered on 2026-11-11 with `scripts/oracle-render.sh` into `/tmp/cee-plan/po/<slug>/`:
- **38 draw `CHEN_EER`:** 33 through graphviz (the 4 vega fixtures among them), 4 with one leaf and no DOT, and `cov-elk`.
- **10 are error or Welcome pages.** See D7.

**The jar's output is stable.** `measurements/jar-variants.mjs` rendered `vega-chen-movieextended`, `cov-multi-U`,
`cov-attr-composite`, `cov-cardinality` and `cov-elk` 4 times each, and every one was byte-identical. Leaves iterate in
quark order, so there is no flow D4 identity-hash problem. T3b reruns the tool over every fixture, 3 runs each. A
fixture that is not `stable` is stop 5.

T3b then authors more fixtures, one per branch that no probe covers:
- creole and `\n` in an attribute display;
- `<<key>>` combined with `<<multi>>`;
- `<<derived>>` on a circle via `U`;
- a colour on an attribute line;
- a cardinality with a space, `(1, N)`;
- `Display` newlines in an entity name;
- a stereotype style that sets `LineStyle`;
- an attribute whose name is a common-command keyword (`title` inside an entity, which is first-match order);
- `skinparam` `ArrowColor` and `ArrowThickness`;
- `skinparam roundCorner` on an entity;
- `scale` and `title` together;
- an attribute on a relationship;
- an attribute on an attribute three levels deep;
- 10 or more entities, for rank spread.

### D7: Errors mirror the jar's text, not its page
Rule: `.claude/memory/error-page-conformance-rule.md`. A pair of error pages counts as conformant.

| Probe | Jar | Mechanism to quote |
|---|---|---|
| `err-attr-outside`, `err-no-brace`, `cov-empty` | Welcome page | first-line failure / empty diagram, `PSystemCommandFactory` |
| `cov-attr-after-close` | "Attribute must be inside an entity, relationship or another attribute" | `CommandCreateAttribute#executeArg`, `peekOwner() == null` |
| `cov-entity-relname` | "Bad name" | `CommandCreateEntity`, `muteToType` false on a CHEN_ENTITY → CHEN_RELATIONSHIP |
| `err-dup-attr` | "Attribute already exists" | `CommandCreateAttribute`, quark has data |
| `err-no-such-entity`, `err-multi-missing` | "No such entity: B" / "Q" | `CommandAssociate`, `CommandMultiSubclass` |
| `err-unbalanced` | "Unbalanced brackets" | `CommandEndGroup`, `popOwner()` false |
| `cov-port` | "Syntax Error?" | `NAME2` is `[%pLN_.-]+`, so `A::p` matches no command |

`cov-unclosed` (`entity A {` and no `}`) **draws**, because an owner left on the stack is never checked, and
`cov-redefine` draws one entity with both attributes. Both are mirrored.

`err-multi-missing` errors **after** `CommandMultiSubclass` has created the centre circle and the superclass link
(`CommandMultiSubclass.java`: `reallyCreateLeaf` comes before the subclass loop). Only the error page shows, so the
partial diagram never draws. Keep the Java's order anyway.

`getPortId` can never return a port here. The regexes admit no `::`, and `CucaDiagram#getPortId` returns `null` without
one (`net/atmp/CucaDiagram.java:310-317`). Port the calls as written.

### D8: Mirror upstream's quirks
- **Command order is first-match** (`ChenEerDiagramFactory.java:58-69`): common commands 1, `CommandRankDir`, create
  entity, create attribute, associate, end group, simple subclass, multi subclass. An attribute named `title` or
  `header` inside an entity is a title or header, not an attribute.
- **`CommandCreateAttribute`'s `CODE` admits spaces and `:`** (`[%pLN%s_.:]+`), so `Born : DATE` is one attribute
  whose id is `Born : DATE`, trimmed. Its id is `owner/idShort` (`CommandCreateAttribute.java`).
- **`CommandMultiSubclass`'s centre quark** is `superclass/<symbol><subclasses>/center`, with `reuse=false`. The `U`
  symbol puts the superset decor on the superclass link. `d` and `o` put it on each subclass link instead.
- **Colours:**
  - `CommandCreateEntity` and `CommandMultiSubclass` parse `ColorType.BACK`. `CommandCreateAttribute`,
    `CommandAssociate` and `CommandSimpleSubclass` parse `ColorType.LINE`.
  - An attribute's colours go on both the attribute and its link.
- **Stereotypes:**
  - Each image checks the shape stereotype with `toString().contains("<<weak>>")`, a substring test, so `<<weak>>`
    combined with `<<big>>` still matches.
  - `setStereostyle(stereo)` feeds `withTOBECHANGED`.
- **Geometry:**
  - The relationship diamond is sized by `(w + 2h)/sqrt(5) + 2*MARGIN`, scaled by `sqrt(5)` and `sqrt(5)/2`.
  - The attribute ellipse is sized by `TextBlockInEllipse`.
  - The circle is a fixed 25×25.
  - `<<derived>>` sets a `UStroke(10, 10, thickness)` dash.
  - `<<multi>>` and `<<weak>>` add an inner shape at `+3,+3`, `delta(-6)`. `<<identifying>>` adds one at `+10,+5`,
    `delta(-20, -10)`.

### D9: Java semantics
- `String#split(",")` drops trailing empty strings, so `{ A, }` gives `[A]`. JS `split` keeps them: port Java's
  behaviour with a comment.
- `trim()` is Java's (code points ≤ U+0020).
- `Stack` is LIFO, the same as a JS array with `push`/`pop`.

### D10: Serial work in the main checkout, one commit per task
The batches build one engine upward in one directory. Worktrees need symlinked assets and skip git hooks
(`.claude/memory/agents-write-main-via-serena.md`, `worktrees-skip-git-hooks.md`). The new files sit unreferenced until
T3a, so `npm test` stays green through batches 1 and 2, measured by unit tests.

### D11: Hooks: split by upstream method, keep names
The hooks cap files at 500 lines, functions at 30 NLOC, CCN at 10 and parameters at 5. Keep the Java method's name on
the entry point, and put a `@see` on each helper. Files written through the shell skip the hook, so run `lizard` by hand.

### D12: What ends a row
A fixture is done when one of these holds:
1. It has 0 diffs.
2. It is an error pair (D7).
3. It is named in `DIVERGENCES.md` with a forcing library (KaTeX, elkjs geometry under ELK, platform glyphs).
4. It is on a `needs-ruling` issue.

`oracle/accepted-divergences.json` is never edited here, because the user signs acceptances. A Chen-specific
dot-engine geometry difference is filed in `docs/graphviz-issues/` with a `TRACKER.md` line, after `dot -Tdot` on the
jar's own `svek-1.dot` proves it (`.claude/memory/dot-engine-blame-needs-real-dot.md`).

## Operational readiness (auto-confirmed)

- **Observability:** N/A. This is a browser-safe library with no service, SLI or trace. The measures are the fixture
  ratchet, the DOT-parity gate and the survey verdicts.
- **Rollback:** Reversible. Revert the squashed commit. No data, schema or published contract changes.
- **Scale:** one more plugin in the dispatch loop, reached only by `@startchen`. CI risk is the new ratchet and DOT
  gate, about 70 fixtures. T4 journals their local wall time.
- **On-call:** N/A. The failure mode is a misroute, which the routing and refusal gates catch.
- **Compatibility:** no public API change is expected. `block-extractor.ts#DiagramType` gains `'chen'`; it is internal,
  and `plantuml-ts` has no consumers. T5 compares `dist/*.d.ts` with a base build.

## Baseline

See the README's "Baseline" section, measured at planning on `03efe4694`: npm test and lint green.
