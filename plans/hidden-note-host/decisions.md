# Decisions

Each decision cites the evidence it rests on. A finding that contradicts one is stop condition 4: amend this file with
the date, then halt. Upstream line numbers are at the pinned oracle, upstream master `b066ee08c` (re-pinned in
`b513a99e6`). The issue body's numbers (`:769-776`, `:799-819`) predate that re-pin.

## D1. Port the upstream rule, not a renderer exception

The jar's rule has two halves, and each engine gets both:

1. **The flag.** `CucaDiagram#isHidden(leaf)` (`net/atmp/CucaDiagram.java:778-794`): a `NOTE` with exactly one
   non-invisible link whose other end is not a `NOTE` returns `isHidden(other)`. `other` is read through the
   **diagram's** `isHidden`, not `Entity#isHidden`, so the host's parents do not count (`hnh-host-in-hidden-package`:
   the jar draws the note while `P` hides `B`). With zero or several links, or a note at the other end, the note folds
   `hides2` by itself. `#isRemoved` (`:796-812`) is the same, without the `other != leaf` guard.
   `isNoteWithSingleLinkAttachedTo` (`:835-853`) skips only `link.getType().isInvisible()`. A `-[hidden]-` link sets
   `Link.hidden` (`decoration/WithLinkType.java:100-101`, `:149-150`), not the link style, so it **counts**
   (`hnh-hidden-link-to-note`: the jar draws `N`).
2. **The draw.** `SvekResult#drawU` draws every node through `UHidden` when `node.isHidden()`
   (`svek/SvekResult.java:82-90`). `SvekNode#isHidden` is `image.isHidden()` (`svek/SvekNode.java:408-410`), which is
   `entity.isHidden()` (`svek/AbstractEntityImage.java:64-66`). A hidden note therefore draws nothing, and an opale
   connector, drawn by the note's own image (`EntityImageNote.java:232-258`), goes with it. A non-opale connector is a
   `Link`: `Link#isHidden` is `hidden || cl1.isHidden() || cl2.isHidden()` (`abel/Link.java:458-459`), so it draws
   as its comment only (`SvekResult.java:97-101`).

- **Rejected:** a renderer-only skip ("don't draw a note whose `target` is hidden"). It misses the notes the jar keeps
  (`hide N` on a single-link note with a visible host: `hnh-hide-note-name`, `hnh-desc-hide-note-name`), and the ones
  it hides by their own fold (`hnh-hide-lone-note`, `hnh-hide-note-two-links`). The flag must be the upstream
  computation.
- **Class already has the flag** (`class-directives-removal.ts:336-349`, `computeHiddenIds`). T2a carries it to the
  note geo and the renderer. It reuses the existing set and does not recompute it.

## D2. Member tips keep drawing (D5 stays true for `TIPS`)

`isNoteWithSingleLinkAttachedTo` returns null for anything that is not `LeafType.NOTE` (`CucaDiagram.java:836-837`).
A tip is `LeafType.TIPS` and has no link, so it folds its own (empty) rule set and is never hidden by its host.
The oracle agrees: `hnh-tips-on-member` draws "a tip" while `B` is hidden. T2a rewrites the D5 comments
(`renderer-leaf.ts:165-170`, `renderer.ts:200-205`, `renderer-note-dispatch.ts:55-59`) to state both halves. It does
not delete them.

**Amended 2026-11-23 (T2a):** the jar hides a member tip by its **own** fold. With `hide *` and `show A`, a tip on
`A::m()` is not drawn while `A` is (`hnh-tips-hide-star-show-host`; `hnh-tips-hide-star` with `show B`). "Its own
(empty) rule set" is wrong for `hide *`; "never hidden by its host" stands (`hnh-tips-on-member`). Whether T2a should
carry a tip's own verdict onto its geo, against step 2's "never set it on a `'tips'` geo", is #277 (`needs-ruling`).
The two rows stay OPEN under #277 and the mission continues (execution prompt: a question that blocks only some rows
is filed, not a halt).

## D3. Three engines, one task each; activity-legacy and ELK are left alone

`CommandHideShow2` is registered by the class, description, state and legacy activity factories
(`classdiagram/ClassDiagramFactory.java`, `descdiagram/DescriptionDiagramFactory.java`,
`statediagram/StateDiagramFactory.java`, `activitydiagram/ActivityDiagramFactory.java`). The planning probes show:

| Engine | Note on a hidden host today | Task |
|---|---|---|
| class, object | drawn | T2a |
| description: component, usecase, actor | drawn | T2b |
| state | drawn | T2c |
| legacy activity | hidden already; the row's 4 diffs are I7 | none |
| class under `!pragma layout elk` | error page: notes unsupported (I2) | none |
| description under `!pragma layout elk` | drawn, and the jar draws it too | none (guard rows) |

- Upstream's ELK maker draws a hidden entity: `MyElkDrawing` checks only `isRemoved` (`elk/MyElkDrawing.java:163`),
  and `MyElkEdge` skips a hidden link (`elk/MyElkEdge.java:149`). So under ELK the note on a hidden host **is**
  drawn (`hnh-elk-hide-host`, `hnh-desc-elk-hide-host`). T2b's change to `effectiveHiddenIds` reaches the description
  ELK adapter's `isHidden(linkId)` (`description-elk-adapter.ts:483`, `:538`). That is faithful, because `Link#isHidden`
  reads `Entity#isHidden`, delegation included. It takes `hnh-desc-elk-hide-note-name` to 0 (the jar draws the
  `N .. B` link). `hnh-desc-elk-hide-host` must stay at 0.
- Smetana (`!pragma layout smetana`) draws through `UHidden` as svek does (`sdot/CucaDiagramFileMakerSmetana.java:298-299`).
  T2a fixes the drawing; the row's leftover geometry is not a target (ruling 2026-08-09).
- **Rejected:** class only, as the issue title says. Description and state draw the same note for the same missing
  rule, and CLAUDE.md says crossing a module boundary is the work. Each engine's fix is small and has its own task.

## D4. One authored gate, rendered as the survey renders

The 50 probes move to `tests/fixtures/hidden-note-host/<slug>.{puml,svg}`, held by a new
`tests/oracle/svg-conformance/hidden-note-host.authored.test.ts`. The gate is shaped like
`usecase-title-style.authored.test.ts` and `class-comment-bytes.authored.test.ts`:

- It renders with `renderSync` + `withJarCompatibleStyleInput` + `DeterministicMeasurer` + the survey asset and
  include stores + `filename: 'in.puml'` + the ELK backend from `prepareElkOnce()` (`render-fixture-class.ts:209`),
  awaited in `beforeAll`. That is exactly what `measurements/measure.mts` does. Planning checked that it gives the
  same numbers as `renderClassFixture` on every class row.
- A ZERO row has 0 `compareSvg` diffs **and** a comment sequence equal to the jar's (`svg-comments.ts`).
- An OPEN row has `{ maxDiffs, maxComments, reason }`, where the reason names `#204`, an I-issue number or the
  Smetana ruling. Neither number may rise.
- A manifest test: the rows are exactly the `.puml` files on disk, each listed once, each with its `.svg`.
- **Rejected:** spreading the rows over the class, description and state golden ratchets. Those hold corpus goldens
  under `oracle/goldens/`, and this is one cross-engine rule with one issue.

## D5. Comments are part of the target

`compareSvg` drops comments, and `class-comment-bytes` exists because the jar writes a hidden node's comment before
it checks the flag (`AbstractUGraphic.java:199-217`). A hidden note writes nothing (`EntityImageNote` has no
comment). A hidden link writes `link X to Y` and keeps its id (`SvekEdge.java:969`). The gate checks both, and no
task may trade a comment for a diff.

## D6. No public surface, no dependency, no divergence

`dist/*.d.ts` must not move, nothing is added to `package.json`, and no `DIVERGENCES.md` entry is written. The change
is Reversible: revert the squash commit.

## Side findings to file at T0 (I1 to I7)

Each one reproduces without the feature this mission ports. The note-free or hide-free control is in the last
column; each control's jar svg came from `scripts/oracle-render.sh`, rendered at planning into `/tmp`, so T0
re-renders it for the issue body. Each becomes a `queue:ready` issue labelled `parity`, its body shaped like #204's:
a measurement with date and sha, the mechanism with upstream `file:line`, and our origin.

| Id | Title (for the issue) | Mechanism and origin | Rows here | Control |
|---|---|---|---|---|
| I1 | Class: the opale choice skips note-to-note and package links when it counts a note's links | `GraphvizImageBuilder#onlyOneLink` (`svek/GraphvizImageBuilder.java:324-337`) counts **every** non-invis link containing the note; `isOpalisable` (`:132-147`) then refuses a note link or a group. Ours drops both kinds before counting (`note-freestanding.ts:95-97`), so `N1` with `N1 .. N2` and `N1 .. B` is opalised toward `B` | `hnh-note-to-note`, `hnh-note-to-note-visible`, `hnh-hidden-link-remove` | `hnh-note-to-note-visible` (nothing hidden): 95 diffs |
| I2 | Class: `!pragma layout elk` refuses any note | `assertSupported` throws "notes not yet supported in class diagrams" (`class-elk-adapter.ts:354-365`); the jar lays the note out with `CucaDiagramFileMakerElk` and draws it even on a hidden host (`MyElkDrawing.java:163`) | `hnh-elk-hide-host` | the same source without `hide B`: our error page |
| I3 | Description: a hidden entity writes no `entity X` comment | the jar writes the comment before the `UHidden` check (`AbstractUGraphic.java:199-217`, `EntityImageDescription.java:292`); class does this already (ccb D2) | the six description host rows, `hnh-desc-host-in-hidden-package`, `hnh-desc-hidden-link-to-note` | `component A`, `component B`, `A --> B`, `hide B`: ours `entity A, link A to B`, jar `entity A, entity B, link A to B` |
| I4 | Description: `hide @unlinked` hides nothing | `isApplyableEntity` does not build `@unlinked` for hide/show (`element-grammar.ts:280-296`, its doc); upstream `HideOrShow` + `Entity#isAloneAndUnlinked` (`abel/Entity.java:462-482`) | `hnh-desc-hide-unlinked-note` | `component A, B, C`, `A --> B`, `hide @unlinked`: jar hides `C`, ours draws it (15 diffs) |
| I5 | State: a hidden composite changes the document size | jar 181 high, ours 197 (viewBox width 72 against 104); mechanism not yet read | `hnh-state-host-in-hidden-composite` | `state A`, `state C { state B }`, `A --> B`, `hide C` |
| I6 | State: a note's link comment names `__note_N`, the jar `GMN<n>` | the jar names a note entity from `getUniqueSequence("GMN")` (`command/note/CommandFactoryNoteOnEntity.java:342`, `CucaDiagram.java:759-761`); ours uses its own id in `link … to …` | `hnh-state-two-notes` | the same source without `hide B`: ours `link __note_1 to B`, jar `link GMN7 to B` |
| I7 | Legacy activity: a hidden entity drops out of the document size | jar 184 high, ours 112, with the same comments and texts | `hnh-lap-hide-host` | `(*) --> "A"`, `"A" --> "B"`, `hide B` |

## Operational readiness

- **Observability:** N/A. A library render path; no service, SLI, trace or dashboard.
- **Rollback:** Reversible. Revert the commit; no data or contract migrates.
- **Scalability:** the delegation is one pass over the links per note, the same as the existing removal cascade.
  Not flagged.
- **On-call:** none. The likely failure is a corpus row whose note the jar draws and we stop drawing. The survey's
  verdict-diff catches that at every batch close (stop condition 1).
- **Backwards compatibility:** rendering only. A note on a hidden host is no longer drawn, as the jar draws it. No
  option, type or error changes.

## Auto-confirmed (unattended)

Planned with `/plan-mission --unattended next --branch feature/parity-queue` on 2026-11-23.

- **Selection:** no open `queue:planned` issue. #204 is the lowest-numbered `queue:ready` issue, with no
  "Blocked by" and no `needs-ruling` label.
- **Phase 1:** `docs/architecture/overview.md` is 64 commits stale, so a lightweight scan ran.
- **Phase 3:** D1 to D6, each with its rejected options above. A maintainer is most likely to revisit **D3** (the
  issue names class; the mission also fixes description and state) and **I1 to I7 filed, not fixed** (README
  push-forward lets a fix under ~20 lines in).
- **Phases 2, 4, 5, 6:** the README's blast radius, the readiness answers above, the batch files, the README's stop and
  push-forward lists.

## Pre-flight (Phase 8, 2026-11-23, `72dc9201f`)

- Working tree clean apart from this brief; `feature/parity-queue` checked out at `72dc9201f`.
- `npm run lint`: exit 0.
- `npm test -- --maxWorkers=4`: exit 0. 2352 files passed (1 skipped), 51017 tests passed (6 expected fail, 7
  skipped, 6 todo); coverage 97/92.59/97.49/98.04. Run at load ~11 to ~45: no timeouts.
- `measure.mts` on the probes: `rows 50 zero 18 open 32 throw 0` (`measurements/plan-baseline.txt`).
- Every Modify path in the README's file table exists; every Create path's parent exists.
- Every task spec carries observability (N/A) and a rollback classification (Reversible). Nothing is Irreversible.
- Both PlantUML diagrams render through the oracle jar with no syntax error.
