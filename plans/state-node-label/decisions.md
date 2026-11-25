# Decisions

## D1. The leaf id reads the injected clock, advancing once per synthesised leaf

**Context.** `generateTransitionNodeId` appends `System.currentTimeMillis()` (`CommandLinkStateCommon.java:388-395`).
The port's rendering paths may not read the wall clock (CLAUDE.md "Architecture"); `src/core/clock.ts` is "the one
injected clock", and the shared `ParseOptions` already carries it to `parseState` (`src/core/dispatcher-types.ts:42-46`,
`state/index.ts:23-25`). `snl-duplicate`
shows the jar's clock moving between two identical commands (ids `…288`, `…293`, two label nodes). With a frozen
clock the second `reallyCreateLeaf` would hit an occupied quark and throw (`net/atmp/CucaDiagram.java:223-224`).

**Decision.** `initParseState` keeps `options?.clock ?? DEFAULT_CLOCK` on `ParseState`, beside a leaf counter. The
id suffix is `clock.nowMillis() + n`, where `n` is the 0-based count of transition-label leaves this diagram has
synthesised so far: a seeded clock that strictly advances per call, as the jar's does in every measured run. Keep
upstream's string shape exactly: `"transition_" + source.getName() + "_" + target.getName() + "_" +
label.toString().replaceAll("[^a-zA-Z0-9_]", "_") + "_" + millis`, then `cleanId` (`CucaDiagram.java:196-200`) and
`quarkInContext(true, …)` (the current group). Read `Display#toString` before you port `label.toString()`: a
multi-line label's string form decides the id.

**Rejected.**
- *A frozen clock (`nowMillis()` only).* Collides on `snl-duplicate`, where the jar draws two nodes.
- *A bare counter with no clock.* Bypasses the one clock seam for an upstream wall-clock read.
- *Mirroring the collision throw.* The jar throws only in a same-millisecond race; no measured run does.

**Consequences.** Library output is deterministic (`transition_A_B__go__0`, `…__1`). Conformance compares through D2.

## D2. The comparator normalises the clock digits of a `transition_…` id, on both sides

**Context.** The jar's ids differ on every run, so no fixture can reach 0 by bytes. The issue's own sweep comment
asks for "a seeded clock and compare normalisation". `compareSvg` compares every attribute, `id` included
(`tests/oracle/svg-conformance/compare.ts:352-360`); `svgComments` compares `<!--link … to …-->` text.

**Decision.** In `normalize.ts` (attribute values) and `svg-comments.ts` (comment text), rewrite the trailing digit
run of a `transition_` token to one fixed token, on jar and port alike. Anchor it: `transition_` + non-space,
non-quote, non-`-` characters + `_` + digits, ending at a token boundary (`"`, `-`, space, end). Unit-test it on the
jar strings in `measurements/probes/jar/` (path ids `A-transition_…`, `transition_…-to-B`, `B-backto-transition_…`,
and comments `link *start* to transition_*start*_A__init__…`). It must be inert everywhere else: stop condition 8.

**Rejected.**
- *Seed the oracle jar's clock.* A new seam commit in `~/git/knowvah/plantuml` is outside the write-set and the
  maintainer's call (CLAUDE.md "Writing and write-sets").
- *Record the capture clock* (`oracle/capture-clock.json`). It is read before the jar runs, and each transition reads
  its own later millisecond.

## D3. Mirror upstream's structure: decide and synthesise at parse time, in a new state module

**Decision.** Node style is a command decision, as upstream's is. Create `src/diagrams/state/state-node-style.ts`
holding `shouldUseNodeStyle`, `containsStyleKeyword`, `createTransitionWithIntermediateNode` and
`generateTransitionNodeId`, upstream names, JSDoc `@see` to each Java line. The transition handler calls it where
`executeArg` would (`:190-196`): node style **and** a label whose `trim()` is not empty.

What it builds, and in this order (the uid and `lnk` ticks depend on it):
1. The leaf: `StateKind` `'transitionLabel'` (mirrors `LeafType.STATE_TRANSITION_LABEL`), display = the label,
   stereotype `<<transition>>` (`:338`), created in the current group. It burns one entity uid (`ent0003` in
   `snl-issue`).
2. Link 1: source → leaf, decors NONE/NONE, length 2 (minlen 1), no label (`:342-349`).
3. Link 2: leaf → target, the original decors, length 2 (`:353-358`).
4. `left`/`up`: both are inverted, each `getInv()` burning a `Link` ctor tick (`:361-364`; precedent
   `state-link-add.ts#emitTransition`).
5. The style, filtered of `node` by upstream's three regexes verbatim (`:369-379`), applied to both links when not
   empty. Neither link gets the transition's stereotype.
6. Both links go through `emitTransition` (the `-[single]->` dedup and the creation index).

Do **not** carry `setWeight(10.0)` into DOT: it has no reader (README "Upstream", `Link.java:320`). Record it on the
transition only if a reader appears; say so in a comment with the grep.

Correct P4's doc comment in `ast.ts`. Keep `state/parser.ts` under 500 lines: only `initParseState` reads the clock
there, and nothing else grows.

**Rejected.** *Interpret `node` at layout time* (what P4's comment proposed). That breaks the uid and `lnk` numbering,
the hide/remove cascade (which works on leaves and links) and #236's reuse.

## D4. The label image is a shared core svek image

**Decision.** Port `EntityImageTransitionLabel` to `src/core/svek/image/EntityImageTransitionLabel.ts`, beside the
other images, because upstream's is shared svek code and #236 (component) draws the same leaf. State uses it for
sizing (text + `MARGIN` 4 each side, `:59`, `:89-98`) and drawing: an unfilled, unstroked `URectangle` rounded 5,
then the text centred, **no** entity group (`:117-133`). The DOT node is `shape=rect` from `getShapeType()`
RECTANGLE (`:135-138`). The font is the merged `StyleQueries.ARROW.add(SName.stateDiagram).withStereotype(stereo)`
(`:65-70`); T4 may start from the state arrow-label font the edge label uses today, and T5 makes the full merge
exact. Reuse the existing style-merge and creole text-block APIs (check `docs/catalog.md`); do not write a new font
resolver.

The diagram type in the style query is state's here. #236 will need the description one: take the `SName` from the
caller, not a literal inside the image.

## D5. Orphan rule as upstream writes it; the hide-without-edges fact is T6's to explain

**Decision.** A `'transitionLabel'` leaf is hidden when one of its links' other end is hidden or removed, and removed
when one is removed or hidden (`CucaDiagram.java:778-831`, both `isHidden` and `isRemoved` consult
`isOrphanedTransitionLabel`, which checks `other.isRemoved() || other.isHidden()`). Note the cross: a hidden host
makes the label **removed** too. That likely explains `snl-hide-label-host` (no edge, no comment): a removed leaf's
links leave the graph. T6 confirms it from the Java (who drops a link whose end is removed: read `getLinks()`
filtering and `GraphvizImageBuilder`) before writing code. `remove` then `restore` must bring everything back.

**Smetana** (`snl-vega-smetana-hide`): under the 2026-08-09 ruling the geometry is not a target. The gate asserts the
element set (which entities and links are drawn, the label hidden with `Faulted`) and holds the row OPEN with
`maxDiffs` and reason "dot-engine ruling 2026-08-09 (Smetana geometry)". Record the delta, never chase it.

## D6. Rows outside dot: Smetana held by ruling, ELK fixed or filed

- **Smetana:** D5.
- **ELK** (`snl-elk`): upstream's second engine and a target (CLAUDE.md "ELK"). After T6, measure it. If the label
  node already lands right, pin it. If not and the mechanism is under ~20 lines with a `file:line`, fix it; otherwise
  file a `queue:ready` + `parity` issue with the measurement and hold the row OPEN with that issue as reason.
- **#236 (component).** Do not implement description node style here. T2's grammar change makes `-[nonode]->` parse
  there (it draws a plain link, as the jar does: `snl-nonode-desc`). Comment on #236 at exit with what it can reuse
  (D4's image, D5's rule if it lands in a shared module, D2's normalisation).

## Operational readiness (auto-confirmed)

- **Observability:** N/A. A pure library parse/layout/render change with no runtime operations.
- **Rollback:** Reversible. Revert the squash commit. No data or contract change.
- **Scalability:** N/A. One leaf and two links per node-style transition; the same DOT size class as today.
- **On-call:** N/A (library). Likely failures: (1) D2 matches something outside a transition id: a survey row's diff
  count moves (stop 8); (2) the shared grammar's `nonode` changes an engine's parse: verdict-diff shows it (stop 1).
- **Backwards compatibility:** sources using node style now draw the jar's node layout; `-[nonode]->` stops being a
  syntax error. Both are conformance changes, not published API changes. `dist/*.d.ts` must not move (stop 5).

## Auto-confirmed (unattended)

| Phase | Decision | Rejected | Evidence |
|---|---|---|---|
| 0 | Fresh run; `#235` selected | none: no `queue:planned` issue; #235 is the lowest `queue:ready` with no `Blocked by` | `gh issue list` 2026-11-24 |
| 1 | Lightweight scan | reuse `docs/architecture/overview.md` | overview last touched 12 days and far more than 50 commits before HEAD |
| 2 | Blast radius = README table, incl. the shared `LINE_STYLE` key list | state-only grammar | upstream's `nonode` lives in `CommandLinkElement.java:82-86`, read by 11 commands |
| 3 | D1 advancing seeded clock | frozen clock; bare counter; mirror the throw | `snl-duplicate` jar ids `…288`/`…293`; `CucaDiagram.java:223-224` |
| 3 | D2 symmetric id normalisation | seed the oracle jar; capture clock | issue sweep comment; write-set rule; per-transition millis |
| 3 | D3 parse-time synthesis in a new module | layout-time interpretation | `CommandLinkStateCommon.java:323-386`; uid/lnk numbering in the jar svg |
| 3 | D4 shared core image | state-local image | `GeneralImageBuilder.java:218-219` is shared; `CommandLinkElement.java:462` creates the same leaf type |
| 3 | D5 upstream orphan rule; Smetana held | chase Smetana geometry | `CucaDiagram.java:778-831`; ruling 2026-08-09 |
| 3 | D6 ELK fix-or-file; #236 untouched | implement component node style | #236 is a separate queue issue |
| 4 | Reversible, observability N/A | none | library-only change |
| 5 | T0 … T8, serial | merge T4/T5 | T5's style merge is a separate mechanism (`fc7def70a`) with its own rows |
| 6 | README stop and push-forward lists | none | precedent `object-colour-refusal` |

No Irreversible change, so no acknowledgement is needed.

## Pre-flight (planning, 2026-11-24, `e0fe775a5`)

- [x] Every Modify path in the write-sets exists; the parent of every Create path exists (`src/core/svek/image/`,
      `src/diagrams/state/`, `tests/unit/state/`, `tests/unit/core/svek/image/`, `tests/fixtures/`,
      `tests/oracle/svg-conformance/`).
- [x] `npm test -- --maxWorkers=4`: exit 0, 2363 files / 51285 tests passed, coverage gate met.
- [x] `npm run lint`: exit 0.
- [x] `feature/parity-queue` is checked out (`--branch` mode; no new branch is created).
- [x] Working tree clean apart from this brief, `.agent-notes/snl-plan.md` and the planner's progress file (deleted at
      hand-off).
- [x] Every task spec states observability (N/A) and rollback (Reversible).
- [x] No Irreversible change, so no acknowledgement is needed.
- [x] Both diagrams render through this port with no error page (ACTIVITY, DESCRIPTION).
