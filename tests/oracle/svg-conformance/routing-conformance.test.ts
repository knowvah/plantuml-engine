/**
 * ROUTING-conformance gate — does each source reach the engine upstream gives
 * it to? (`sequence-engine-overclaims-nested-diagrams` / T1, 2026-08-23.)
 *
 * Every other gate here asks how CLOSE our bytes are once an engine has
 * drawn. None asks whether the RIGHT engine drew. 86 fixtures routed to a
 * different engine than the jar and survived indefinitely, because every one
 * still renders: `renderSync` never throws (it returns an error-diagram SVG,
 * `src/index.ts:250`), so absence of a throw proves nothing and no golden,
 * ratchet or census moved. This file is the missing comparison (D3,
 * `plans/sequence-engine-overclaims-nested-diagrams/decisions.md`).
 *
 * THE ORACLE IS THE JAR'S OWN ANSWER, read from each fixture's committed
 * golden: `TextBlockExporter.java:292-294` stamps
 * `withRootAttribute("data-diagram-type", ...)` on every document it exports.
 * Corpus DIRECTORY NAMES are explicitly NOT the oracle (D6):
 * `scripts/populate-corpus.py` over-selects — a bare `A -> B` anywhere makes
 * its sequence pattern match — so `object/zuvila-56-nuda425` is a CLASS
 * diagram and 70 files under `sequence/` are not sequence diagrams. The
 * directory name builds a path and does nothing else.
 *
 * A golden carrying no such attribute is legitimately `NONE`, not a skip:
 * upstream emits none for `@startdot` passthrough and some error pages, and
 * several of our engines (activity, board, chart, dot, ...) likewise return a
 * `RenderFragment` with no `diagramType`. `NONE` is a real answer on BOTH
 * sides and is compared like any other.
 *
 * THE GATE RATCHETS DOWN ONLY.
 *
 *   - a fixture pinned `agree` that now disagrees -> FAIL, naming the slug,
 *     its `jarType` and its `ourType`, with the whole jar->ours bucket table
 *     so a reader sees WHICH mechanism moved without re-running anything.
 *   - a fixture pinned `known-misroute` that now agrees -> PASS, logged
 *     `[FIXED]` with a note that the pin is stale. A fall must never fail;
 *     falls are this mission's entire point.
 *   - a fixture pinned `known-misroute` that lands on a DIFFERENT wrong
 *     engine -> PASS, logged `[CHANGED]`. It has not newly misrouted, and
 *     the gated quantity is the SET of misrouting fixtures, not which wrong
 *     engine each one reached.
 *   - a fixture on disk that is in no baseline entry -> FAIL. A corpus that
 *     grew under the gate is un-measured, and silently un-measured fixtures
 *     are how the original 86 survived.
 *
 * THE INCLUDE STORE IS PART OF THE MEASUREMENT, deliberately. Rendering
 * without one makes `renderSync` throw on any `!include` (`src/index.ts:213`)
 * and return `errorSvg`, which carries no `data-diagram-type` — so a
 * RESOLUTION failure reads as a routing answer of `NONE`. Measured both ways
 * over all 3158 fixtures: no store => 90 disagreements, the shared
 * `tests/helpers/fixture-include-store.ts` => 79, and the 79 are a STRICT
 * SUBSET (it fixes 11, breaks 0; all 11 are `!include` fixtures). The brief's
 * own 86 is the no-store number over the dot-cache tree alone and reproduces
 * exactly, so the tree has not moved. Pinning those 11 as `known-misroute`
 * would floor this mission's SLI above zero for a reason no routing change
 * can move — and that module's header already records that omitting it "was
 * measuring a different population than the census".
 *
 * THE MEASUREMENT IS SPLIT INTO PART FILES (2026-11-05). Vitest shards by file,
 * so one test over the whole corpus kept one shard busy for as long as it took.
 * `routing-conformance.part-N.test.ts` each render a stable slice of the corpus
 * through `routing-conformance-gate.ts`; this file keeps the checks that need
 * no render. A whole-corpus count is no longer logged in one place: each part
 * logs its own `[ROUTING SLI]`, and the baseline is the record of the total.
 *
 * Re-measure by hand:
 *   npx vitest run tests/oracle/svg-conformance/routing-conformance
 */
import { describe, it, expect } from 'vitest';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  CORPUS_WALK_BUDGET_MS,
  isJarErrorPage,
  expectedPartTestFiles,
  partTestFilesOnDisk,
} from './corpus-gate-part.js';
import {
  bucketTable,
  checkJarErrorClassification,
  checkNoNewMisroute,
  collectFixtures,
  diagramTypeOf,
  keyOf,
  manifest,
  pinnedAgree,
  pinnedJarErrors,
  pinnedMisroutes,
  progressNote,
  type BaselineFixture,
} from './routing-conformance-gate.js';

const HERE = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// AC2 -- corpus completeness in BOTH directions. A walk of the trees, with no
// render, so it stays in this file rather than in a part.
// ---------------------------------------------------------------------------

describe('routing conformance — corpus completeness', () => {
  it(
    'every fixture on disk is pinned, and every pin is on disk',
    () => {
      const seen = new Set(collectFixtures().map(keyOf));
      expect(manifest.fixtures.length, 'the baseline must not be empty').toBeGreaterThan(0);

      const pinnedKeys = new Set(manifest.fixtures.map(keyOf));
      const unpinned = [...seen].filter((k) => !pinnedKeys.has(k));
      expect(
        unpinned.slice(0, 10),
        `${unpinned.length} fixture(s) exist on disk with NO routing-baseline.json entry. ` +
          `An un-measured fixture is exactly how the original 86 misroutes survived: they ` +
          `all rendered, so nothing failed. Measure and pin them — do not narrow the walk.`,
      ).toEqual([]);

      const missing = manifest.fixtures.filter((f) => !seen.has(keyOf(f))).map(keyOf);
      expect(
        missing.slice(0, 10),
        `${missing.length} pinned fixture(s) are absent from the live walk. Both trees are ` +
          `committed, so this is a broken checkout, not a cache awaiting regeneration.`,
      ).toEqual([]);
    },
    CORPUS_WALK_BUDGET_MS,
  );

  it('every part of the corpus has its test file, so no slice goes unmeasured', () => {
    expect(partTestFilesOnDisk(HERE, 'routing-conformance')).toEqual(expectedPartTestFiles('routing-conformance'));
  });
});

// ---------------------------------------------------------------------------
// AC1 + AC3 + AC4 -- the jar-error split, derived from the goldens and
// checked against the pins in BOTH directions.
// ---------------------------------------------------------------------------

describe('routing conformance — jar-error classification', () => {
  it('the manifest splits into 4157 agree, 1053 known-misroute and 99 jar-error', () => {
    // 8, not the brief's 4: the brief scanned only WITHIN the original 79
    // disagreements, so the four `state/` banner pages -- which agree at
    // NONE == NONE and were therefore never disagreements -- went unexamined.
    // 3148/2, not the pre-repair 3075/75: routing-heuristic-repair batches
    // 2-5 re-routed 73 of the 75 known-misroute fixtures to agree (T8
    // re-pin, plans/routing-heuristic-repair/decision-journal.md). The
    // residual 2 were confirmed structural stop conditions THAT mission
    // could not reach: component/kokebo-27-vafi688 (no line-text
    // discriminator between ClassDiagramFactory and DescriptionDiagramFactory)
    // and sequence/nuvoja-46-dezu541 (!includedef preprocessor stop,
    // IncludeExecutor.ts:127). Both now agree: kokebo at T19, nuvoja at
    // sdd2 T8b (a missing `!includedef` file is an empty body).
    // 3148/2 until batch 4's sequence residual was censused. The 194 that
    // moved are ALL sequence sources the sequence engine cannot yet parse:
    // 163 where nothing claimed them (it refused and so did everything else)
    // and 31 where a later factory did. Every one carries the refusing LINE
    // and the unported command; see the `known-misroute` reason assertion.
    // 2954 -> 3050 agree and 196 -> 100 misroutes at
    // `sequence-command-coverage` batch 3, which ported the note factory,
    // grouping/autonumber/lifeline, misc and sprite command families and
    // rebuilt CommandArrow compositionally; then 3050 -> 3132 and 100 -> 18
    // at batch 4, which ported the exogenous arrow family that dominated
    // the batch-3 remainder.
    //
    // DERIVATION of 3133/17/8, re-measured over all 3158 at T19. 3132 -> 3133
    // and 18 -> 17 is ONE fixture: component/kokebo-27-vafi688, whose pin this
    // gate had been reporting STALE. It measures CLASS == CLASS and is
    // re-pinned `agree`. It is a CLASS routing repair, NOT a sequence closure,
    // and is excluded from this mission's bucket tally. The 17 that remain are
    // all sequence, and all still measure exactly as pinned.
    //
    // DERIVATION of 3133/367/31 over 3531, at `activity-oracle-harness` T0b
    // (D11). The activity cache tree (373 fixtures) was captured by T0 and
    // pinned here additively -- `git diff` on this baseline shows 4103
    // insertions and ZERO deletions, so no pre-existing pin moved. It splits
    // 350 `known-misroute` + 23 `jar-error`, and NONE agree, because the
    // ACTIVITY engine stamps no root diagram type at all: `renderActivity`
    // returns a `RenderFragment` with no `diagramType`
    // (`src/diagrams/activity/renderer.ts:221-226`), so every activity
    // document reads as `NONE` here while its golden says `ACTIVITY`
    // (`TextBlockExporter.java:293`). ONE mechanism covers all 350, and
    // `activity-oracle-harness` T5 removes it by routing activity through
    // the klimt document shell -- at which point all 350 fall to `agree`,
    // which this gate logs `[FIXED]`. The 23 jar errors are the same 23
    // whose goldens carry no `data-diagram-type` because the jar never
    // exported a diagram for them.
    //
    // DERIVATION of 3401/99/31 over the same 3531, at `activity-oracle-harness`
    // T6. T5 landed the klimt document shell for activity, and 268 of T0b's 350
    // activity `known-misroute` pins fell to `agree` -- re-pinned here, which
    // this baseline's own `$comment` sanctions ("a fall is re-pinned to `agree`,
    // never the reverse"). 3133 + 268 = 3401, 367 - 268 = 99.
    //
    // The other 82 did NOT fall, and were deliberately NOT re-pinned. T0b's
    // prediction that ALL 350 would flip rested on the root-attribute mechanism
    // being the only thing keeping them at `NONE`; on these 82 it is not. Our
    // ACTIVITY parser refuses those sources outright, so `renderSync` returns a
    // PSystemError page, which carries no root attribute either -- a DIFFERENT
    // mechanism reaching the same `NONE`. They are exactly the 82 fixtures
    // `oracle/goldens/svg-activity/diff-baseline.json` records as
    // `status: "error"` (D8); the two sets were verified identical at T6. Their
    // reasons were rewritten accordingly: the T0b text named a mechanism that no
    // longer applies to them and promised a re-pin that would have turned this
    // gate RED.
    //
    // DERIVATION of 3402/139/31 over 3572, at `parity-dashboard-refresh` T5.
    // Five never-captured families (board 4, chart 29, chronology 1, files 1,
    // packet 6 = 41) were captured with `scripts/capture-oracle-cache.ts` and
    // pinned here additively -- `git diff --numstat` shows 451 insertions and
    // ONE deletion, the rewritten `$comment` line, so no pre-existing pin
    // moved. 40 are `known-misroute` on ONE shared mechanism, the activity
    // T0b one again: each engine's renderer returns a `RenderFragment` with
    // no `diagramType` (`src/diagrams/board/renderer.ts:75-81`,
    // `chart/renderer.ts:336-341`, `files/renderer.ts:64-69`,
    // `packetdiag/renderer.ts:104-109`), so `assemble-svg.ts:496-497` never
    // stamps the root attribute `TextBlockExporter.java:292-294` writes --
    // NONE here, BOARD/CHART/FILES/PACKET in the golden. The 41st,
    // chronology/lenudo-53-nade902, AGREES at NONE == NONE: the pinned jar
    // has no factory for `DiagramType.CHRONOLOGY`, so `PSystemBuilder.java:284`
    // returns `PSystemUnsupported`, whose page (`PSystemUnsupported.java:62`)
    // carries no root attribute and is not a `PSystemError` page. 3401 + 1 =
    // 3402, 99 + 40 = 139, 31 unchanged.
    //
    // DERIVATION of 3424/987/73 over 4484, follow-on to `parity-dashboard-
    // refresh` (2026-09-20): the eleven buckets that had no oracle at all --
    // c4 11, ditaa 2, ebnf 44, gantt 265, mindmap 142, network 3, regex 46,
    // salt 51, timing 126, wbs 204, wire 18 = 912 -- captured with
    // `scripts/capture-oracle-cache.ts` and pinned additively (10011
    // insertions, one deletion: the `$comment`). Ten of the eleven have NO
    // engine in this port, so 848 pins share one mechanism: no plugin
    // registers their DiagramType, `DiagramRegistry#resolve` has zero
    // candidates and returns the error sentinel (`src/core/dispatcher.ts:
    // 317-342`) where upstream runs the factory `PSystemBuilder.java`
    // registers -- each reason names that factory line and the Phase D row
    // that ports it. The exceptions each carry their own cited mechanism:
    // c4's two preprocessor failures (`ReversePolishInterpretor.ts:74`, see
    // `.agent-notes/tim-nested-call-argcount.md`), network's two legacy
    // `(*) -->` activity sources (`CommandLinkActivity.java:73`), and the one
    // timing source STATE claimed. 22 agree (c4 7, ditaa 2, gantt 4, network
    // 1, regex 2, wbs 6 -- NONE == NONE, or the c4/network sources the jar
    // and this port both type CLASS/DESCRIPTION); 42 jar errors. 3402 + 22 =
    // 3424, 139 + 848 = 987, 31 + 42 = 73.
    //
    // 3424 -> 3425 / 987 -> 986 at unknown-bucket-routing-repair/T11
    // (2026-09-20): `sequence/recani-60-licu962` -- the multi-line
    // `rnote right` body now parses (`FactorySequenceNoteOnArrowCommand`
    // multi-line form, ported with `getLastEventWithNote`,
    // `SequenceDiagram.java:154-158`), so the fixture routes SEQUENCE, the
    // jar's answer. One `[FIXED]` retirement, re-pinned from a fresh
    // measurement.
    //
    // 3425 -> 3468 / 986 -> 943 at unknown-bucket-routing-repair/T10
    // (2026-09-20): 43 activity fixtures in this tree use the activity3
    // constructs the port gained (bullet lists, switch/case, backward,
    // if spellings, end while, partition/group -- ActivityDiagramFactory3
    // .java:110-160) and now route ACTIVITY; 43 `[FIXED]` retirements,
    // re-pinned from a fresh measurement.
    //
    // 3468 -> 4157 / 943 -> 1053 / 73 -> 99 over 4484 -> 5309 at
    // unknown-bucket-routing-repair/T14 (2026-09-20): the 825 `unknown`
    // fixtures pinned by `scripts/pin-corpus-tree.ts` from the ledger
    // fragments under `tests/oracle/svg-conformance/unknown-ledger/`:
    // 689 agree, 110 known-misroute, 26 jar error pages. Of the 157
    // disagreements batch 1 diagnosed, batch 2 FIXED 115 (class 66,
    // activity 34, sequence 9, description 6) and pinned the rest with
    // the refusing line or the missing factory named (no nwdiag/bpm/git/
    // flow/timing/help engine 96, files' missing root attribute 8, the
    // legacy `(*) -->` activity family 1, description's archimate/map/
    // embedded-diagram gaps 3, a class link fallback 1, a Tim function
    // gap 1). The same batch retired 43 activity + 1 sequence pins of the
    // existing tree (`[FIXED]`), already folded into 3468/943 above.
    //
    // 4157 -> 4276 / 5309 -> 5428 at class-divergence-drive/close-b1
    // (2026-09-21): 119 `goldens:svg-class/<slug>` rows appended when the
    // class ratchet pinned 119 fixtures; each is the clone of its
    // byte-identical dot-cache twin (all `agree`, CLASS/CLASS), exactly how
    // every prior svg-class golden row was pinned. Misroutes and jar errors
    // unchanged. Derivation: 4276 + 1053 + 99 = 5428.
    //
    // 4276 -> 4300 / 5428 -> 5452 at class-divergence-drive/close-b2
    // (2026-09-21): 24 more svg-class golden rows, same procedure.
    // Derivation: 4300 + 1053 + 99 = 5452.
    //
    // 4300 -> 4305 / 5452 -> 5457 at class-divergence-drive/close-b3
    // (2026-09-22): 5 more svg-class golden rows, same procedure.
    // Derivation: 4305 + 1053 + 99 = 5457.
    //
    // 4305 -> 4313 / 5457 -> 5465 at class-divergence-drive/close-b4
    // (2026-09-22): 8 more svg-class golden rows, same procedure.
    // Derivation: 4313 + 1053 + 99 = 5465.
    //
    // 4313 -> 4336 / 5465 -> 5488 at class-divergence-drive/close-b6
    // (2026-09-22): 23 more svg-class golden rows, same procedure.
    // Derivation: 4336 + 1053 + 99 = 5488.
    //
    // 4336 -> 4366 / 5488 -> 5518 at class-divergence-drive/close-b7
    // (2026-09-23): 30 more svg-class golden rows, same procedure.
    // Derivation: 4366 + 1053 + 99 = 5518.
    //
    // 4366 -> 4373 / 5518 -> 5525 at class-divergence-drive/close-b8
    // (2026-09-23): 7 more svg-class golden rows, same procedure.
    // Derivation: 4373 + 1053 + 99 = 5525.
    //
    // 4373 -> 4391 / 5525 -> 5543 at class-divergence-drive/close-b9
    // (2026-09-23): 18 more svg-class golden rows, same procedure.
    // Derivation: 4391 + 1053 + 99 = 5543.
    //
    // 4391 -> 4402 / 5543 -> 5554 at class-divergence-drive/close-b10
    // (2026-09-23): 11 more svg-class golden rows, same procedure.
    // Derivation: 4402 + 1053 + 99 = 5554.
    //
    // 4402 -> 4409 / 5554 -> 5561 at class-divergence-drive-2/close-b1
    // (2026-09-24): 7 more svg-class golden rows, same procedure.
    // Derivation: 4409 + 1053 + 99 = 5561.
    //
    // 4409 -> 4432 / 5561 -> 5584 at class-divergence-drive-2/close-b2
    // (2026-09-24): 23 more svg-class golden rows, same procedure.
    // Derivation: 4432 + 1053 + 99 = 5584.
    //
    // 4432 -> 4439 / 5584 -> 5591 at class-divergence-drive-2/close-b3
    // (2026-09-24): 7 more svg-class golden rows, same procedure.
    // Derivation: 4439 + 1053 + 99 = 5591.
    //
    // 4439 -> 4443 / 5591 -> 5595 at class-divergence-drive-2/close-b4
    // (2026-09-24): 4 more svg-class golden rows, same procedure.
    // Derivation: 4443 + 1053 + 99 = 5595.
    //
    // 4443 -> 4449 / 5595 -> 5601 at class-divergence-drive-2/close-b5
    // (2026-09-24): 6 more svg-class golden rows, same procedure.
    // Derivation: 4449 + 1053 + 99 = 5601.
    //
    // 4449 -> 4466 / 5601 -> 5618 at class-divergence-drive-3/close-b1
    // (2026-09-25): 17 more svg-class golden rows, same procedure.
    // Derivation: 4466 + 1053 + 99 = 5618.
    //
    // 4466 -> 4483 / 5618 -> 5635 at class-divergence-drive-3/close-b2
    // (2026-09-26): 17 more svg-class golden rows, same procedure.
    // Derivation: 4483 + 1053 + 99 = 5635.
    //
    // 4483 -> 4497 / 5635 -> 5649 at class-divergence-drive-3/close-b3
    // (2026-09-26): 14 more svg-class golden rows, same procedure.
    // Derivation: 4497 + 1053 + 99 = 5649.
    //
    // 4497 -> 4509 / 5649 -> 5661 at class-divergence-drive-3/close-b4
    // (2026-09-26): 12 more svg-class golden rows, same procedure.
    // Derivation: 4509 + 1053 + 99 = 5661.
    //
    // 4509 -> 4528 / 5661 -> 5680 at class-divergence-drive-3/close-b5
    // (2026-09-26): 19 more svg-class golden rows, same procedure.
    // Derivation: 4528 + 1053 + 99 = 5680.
    //
    // 4528 -> 4548 / 5680 -> 5700 at class-divergence-drive-4/close-b2
    // (2026-09-27): 20 more svg-class golden rows, same procedure.
    // Derivation: 4548 + 1053 + 99 = 5700.
    //
    // 4548 -> 4543 / 1053 -> 1052 / 99 -> 105 at cdd5-T0e (2026-09-27), total
    // unchanged. Six rows go agree -> jar-error: gantt/votofi-06-rolo321, four
    // wbs/WBS-*-def-* and unknown/zodude-13-tito074. Their jar was ALWAYS
    // erroring; the old goldens were captured in a minute where
    // PSystemError.java:218-228 adds a time-based donation banner, which hid
    // the error signature from the head-read. Recaptured in a plain minute.
    // One row goes known-misroute -> agree: sequence/soxata-16-kafi688 now
    // routes SEQUENCE (measured by repin-sequence-baselines.ts at the re-pin).
    // Derivation: 4543 + 1052 + 105 = 5700.
    //
    // 4543 -> 4665 / 5700 -> 5822 at cdd5/close-b1 (2026-09-28): 122 svg-class
    // golden rows, 2 class (besepi, sokevu) + 120 unknown-tree pins keyed
    // `unknown/<slug>` (D4; their goldens live at svg-class/unknown/<slug>/).
    // Derivation: 4665 + 1052 + 105 = 5822.
    //
    // 4665 -> 4719 / 5822 -> 5876 at cdd5/close-b3 (2026-09-28): 54
    // unknown-tree svg-class golden rows (`unknown/<slug>`, D4).
    // Derivation: 4719 + 1052 + 105 = 5876.
    //
    // 4719 -> 4749 / 5876 -> 5906 at cdd5/close-b4 (2026-09-28): 30
    // unknown-tree svg-class golden rows. Derivation: 4749 + 1052 + 105 = 5906.
    //
    // 4749 -> 4768 / 1052 -> 1051 / 5906 -> 5924 at cdd5/close-b5 (2026-09-28):
    // 18 unknown-tree svg-class golden rows, plus unknown/zolaza-45-sepi570
    // known-misroute -> agree (cdd5-T5d: CommandAddMethod.java:64-68 needs
    // spaces around ':', so it now routes STATE like the jar).
    // Derivation: 4768 + 1051 + 105 = 5924.
    //
    // 4768 -> 4770 / 5924 -> 5926 at cdd6/close-b0 (2026-09-28): 2
    // unknown-tree svg-class golden rows (racujo-01-veme537,
    // xicili-92-foke737), pin-eligible once the survey's dotEqual stopped
    // counting a commented `!pragma` / a second newpage page (cdd6-T0b, D9).
    // Derivation: 4770 + 1051 + 105 = 5926.
    //
    // 4770 -> 4771 / 1051 -> 1050 at cdd6/close-b1 (2026-09-28):
    // unknown/xuloxo-85-vibu502 known-misroute -> agree (cdd6-T1d ported the
    // `>>` head, LinkDecor.java:87 ARROW_TRIANGLE, so it routes CLASS like
    // the jar). Re-pinned from a fresh measurement.
    // Derivation: 4771 + 1050 + 105 = 5926.
    //
    // 4771 -> 4791 / 5926 -> 5946 at cdd6/close-b2 (2026-09-29): 20
    // unknown-tree svg-class golden rows (the batch-2 fixes: style
    // consumers, degenerate gate + queue cap, json/folder ink, creole edge
    // labels, and the residual-round leaf stereotype/thickness/stroke).
    // Derivation: 4791 + 1050 + 105 = 5946.
    //
    // 4791 -> 4812 / 5946 -> 5967 at cdd6/close-b3 (2026-09-29): 21
    // unknown-tree svg-class golden rows (the batch-3 fixes: empty-graph
    // delta, mainframe svek frame + ensureVisible canvas, cluster leaf
    // order, package visibility icon, collapsed legend, folder dash and
    // heading font, note separators/table alignment, reversecolor,
    // hyperlink and maximumwidth buckets, sprite paint none/transparent).
    // Derivation: 4812 + 1050 + 105 = 5967.
    //
    // 4812 -> 5090 / 1050 -> 909 / 5967 -> 6104 at the cdd6 <- main merge
    // (2026-09-30): main carries mindmap-engine-port's rows -- 139 mindmap
    // known-misroute -> agree (137 at its close-b5 + nukose/vacofo at close-b6),
    // 2 stale c4 pins (favasu, xizifu) -> agree, and 137 `goldens:svg-mindmap`
    // clone rows appended (see that mission's derivations in its own copy of
    // this comment block). Row-level three-way union, no row changed on both
    // sides. Derivation: 5090 + 909 + 105 = 6104.
    //
    // 5090 -> 5095 / 6104 -> 6109 at class-divergence-drive-7/close-b1
    // (2026-09-30): 5 `goldens:svg-class/unknown/<slug>` clone rows for the
    // batch-1 pins (bisefo, fepiko, josebu, kexaba, sejube), each the
    // byte-identical twin of its dot-cache row (all `agree`, CLASS/CLASS).
    // Derivation: 5095 + 909 + 105 = 6109.
    //
    // 5095 -> 5099 / 6109 -> 6113 at class-divergence-drive-7/close-b2
    // (2026-09-30): 4 more clone rows (bonaco, rojida, tefeco, xuloxo), same
    // shape. Derivation: 5099 + 909 + 105 = 6113.
    //
    // 5099 -> 5134 / 6113 -> 6148 at activity-divergence-drive/close-b1
    // (2026-09-30): 35 `goldens:svg-activity/<slug>` clone rows for the first
    // activity golden-ratchet pins, each the byte-identical twin of its
    // dot-cache row (all `agree`, ACTIVITY/ACTIVITY). Derivation:
    // 5134 + 909 + 105 = 6148.
    //
    // 5134 -> 5138 / 6148 -> 6152 at add1/close-b1b (2026-10-01): 4 more
    // svg-activity clone rows, same shape. Derivation: 5138 + 909 + 105 = 6152.
    //
    // 5138 -> 5154 / 6152 -> 6168 at add1/close-b2 (2026-10-01): 16 more
    // svg-activity clone rows, same shape. Derivation: 5154 + 909 + 105 = 6168.
    //
    // 5154 -> 5166 / 6168 -> 6180 at add1/close-b3 (2026-10-02): 12 more
    // svg-activity clone rows, same shape. Derivation: 5166 + 909 + 105 = 6180.
    //
    // 5166 -> 5175 / 909 -> 905 / 6180 -> 6185 at add2/close-b1p (2026-10-02):
    // the 4 `end merge` dot-cache rows (jevofu, mepeze, xoreko, zokuni) now
    // render as ACTIVITY and are re-pinned `agree` (CommandForkEnd3.java:57-81),
    // plus 5 svg-activity clone rows. Derivation: 5175 + 905 + 105 = 6185.
    //
    // 5175 -> 5187 / 6185 -> 6197 at add2/close-b1 (2026-10-03): 12 more
    // svg-activity clone rows, same shape. Derivation: 5187 + 905 + 105 = 6197.
    //
    // 5187 -> 5234 / 905 -> 871 / 6197 -> 6210 at add2/close-b2 (2026-10-03):
    // the 34 remaining activity parser-gap dot-cache rows render as ACTIVITY
    // and are re-pinned `agree` (T2e/T2g), plus 13 svg-activity clone rows.
    // Derivation: 5234 + 871 + 105 = 6210.
    //
    // 5234 -> 5343 / 6210 -> 6319 at add2/close-b3w1 (2026-10-03): 109 more
    // svg-activity clone rows, same shape. Derivation: 5343 + 871 + 105 = 6319.
    //
    // 5343 -> 5361 / 6319 -> 6337 at add2/close-b3 (2026-10-03): 18 more
    // svg-activity clone rows, same shape. Derivation: 5361 + 871 + 105 = 6337.
    //
    // 5361 -> 5360 / 6337 -> 6336 at add3/T0a (2026-10-06): `tmp1` retired (D9), a byte-identical duplicate of
    // ruzazu-94-meso880 (pinned since 9524864ff); its dot-cache row is removed.
    // Derivation: 5360 + 871 + 105 = 6336.
    //
    // 5360 -> 5373 / 6336 -> 6349 at add3/close-b1 (2026-10-06): 13
    // svg-activity clone rows, same shape. Derivation: 5373 + 871 + 105 = 6349.
    //
    // 5373 -> 5409 / 6349 -> 6385 at add3/close-b2 (2026-10-06): 36
    // svg-activity clone rows, same shape. Derivation: 5409 + 871 + 105 = 6385.
    //
    // 5409 -> 5420 / 6385 -> 6396 at add3/close-b3w1 (2026-10-07): 11
    // svg-activity clone rows, same shape. Derivation: 5420 + 871 + 105 = 6396.
    //
    // 5420 -> 5437 / 6396 -> 6413 at add3/close-b3 (2026-10-07): 17
    // svg-activity clone rows, same shape. Derivation: 5437 + 871 + 105 = 6413.
    //
    // 5437 -> 5507 / 871 -> 875 / 105 -> 110 / 6413 -> 6492 at add4/T0b
    // (2026-10-07): the 79 uncaptured tests/corpus/activity fixtures captured
    // (tmp1, retired at add3/T0a, excluded). 66 agree ACTIVITY/ACTIVITY, 4
    // agree NONE/NONE (jar ErrorUml past the head window), 4 known-misroute
    // (activity parser gaps: page, link, hide footbox, hide stereotype --
    // ledger unknown-ledger/add4-T0b-activity.json), 5 jar-error pages.
    // Derivation: 5507 + 875 + 110 = 6492.
    //
    // 5507 -> 5518 / 6492 -> 6503 at add4/close-b0 (2026-10-07): 11
    // svg-activity clone rows (new captures pinned zero-diff), same shape.
    // Derivation: 5518 + 875 + 110 = 6503.
    //
    // 5518 -> 5520 / 6503 -> 6505 at add4/merge-T1a (2026-10-07): 2
    // svg-activity clone rows (sisate, vatame pinned zero-diff).
    // Derivation: 5520 + 875 + 110 = 6505.
    //
    // 5520 -> 5525 / 6505 -> 6510 at add4/merge-T1c: 5
    // svg-activity clone rows (zero-diff pins). Derivation: 5525 + 875 + 110 = 6510.
    //
    // 5525 -> 5531 / 6510 -> 6516 at add4/merge-T1b: 6
    // svg-activity clone rows (zero-diff pins). Derivation: 5531 + 875 + 110 = 6516.
    //
    // 5531 -> 5533 / 6516 -> 6518 at add4/merge-T1g: 2
    // svg-activity clone rows (zero-diff pins). Derivation: 5533 + 875 + 110 = 6518.
    //
    // 5533 -> 5537 / 6518 -> 6522 at add4/merge-T2c: 4
    // svg-activity clone rows (zero-diff pins). Derivation: 5537 + 875 + 110 = 6522.
    //
    // 5537 -> 5544 / 6522 -> 6529 at add4/merge-T2a: 7
    // svg-activity clone rows (zero-diff pins). Derivation: 5544 + 875 + 110 = 6529.
    //
    // 5544 -> 5566 / 6529 -> 6551 at add4/merge-T2d: 22
    // svg-activity clone rows (zero-diff pins). Derivation: 5566 + 875 + 110 = 6551.
    //
    // 5566 -> 5567 / 6551 -> 6552 at add4/merge-T2e: 1
    // svg-activity clone rows (zero-diff pins). Derivation: 5567 + 875 + 110 = 6552.
    //
    // 5567 -> 5568 / 6552 -> 6553 at add4/merge-T2d-2: 1
    // svg-activity clone rows (zero-diff pins). Derivation: 5568 + 875 + 110 = 6553.
    //
    // 5568 -> 5573 / 6553 -> 6558 at add4/merge-T2f: 5
    // svg-activity clone rows (zero-diff pins). Derivation: 5573 + 875 + 110 = 6558.
    //
    // 5573 -> 5584 / 6558 -> 6569 at add4/merge-T2b: 11
    // svg-activity clone rows (zero-diff pins). Derivation: 5584 + 875 + 110 = 6569.
    //
    // 5584 -> 5585 / 6569 -> 6570 at add4/merge-T2f-2: 1
    // svg-activity clone rows (zero-diff pins). Derivation: 5585 + 875 + 110 = 6570.
    //
    // 5585 -> 5587 / 6570 -> 6572 at add4/merge-T2g: 2
    // svg-activity clone rows (zero-diff pins). Derivation: 5587 + 875 + 110 = 6572.
    //
    // 5587 -> 5593 / 6572 -> 6578 at add4/merge-T3a: 6
    // svg-activity clone rows (zero-diff pins). Derivation: 5593 + 875 + 110 = 6578.
    //
    // 5593 -> 5594 / 6578 -> 6579 at add4/merge-T3d: 1
    // svg-activity clone rows (zero-diff pins). Derivation: 5594 + 875 + 110 = 6579.
    //
    // 5594 -> 5596 / 6579 -> 6581 at add4/merge-T3a-2: 2
    // svg-activity clone rows (zero-diff pins). Derivation: 5596 + 875 + 110 = 6581.
    //
    // 5596 -> 5598 / 6581 -> 6583 at add4/merge-T3c: 2
    // svg-activity clone rows (zero-diff pins). Derivation: 5598 + 875 + 110 = 6583.
    //
    // 5598 -> 5599 / 6583 -> 6584 at add4/merge-T3c-2: 1
    // svg-activity clone rows (zero-diff pins). Derivation: 5599 + 875 + 110 = 6584.
    //
    // 5599 -> 5602 / 6584 -> 6587 at add4/merge-T3d-3: 3
    // svg-activity clone rows (zero-diff pins). Derivation: 5602 + 875 + 110 = 6587.
    //
    // 5602 -> 5605 / 6587 -> 6590 at add4/merge-T3gates-2: 3
    // svg-activity clone rows (zero-diff pins). Derivation: 5605 + 875 + 110 = 6590.
    //
    // 5605 -> 5606 / 6590 -> 6591 at add4/merge-T3b: 1
    // svg-activity clone rows (zero-diff pins). Derivation: 5606 + 875 + 110 = 6591.
    //
    // 5606 -> 5607 / 875 -> 874 at add4/merge-T3e-2 (2026-10-07): `[FIXED]`
    // retirement -- dot-cache activity/fukika-81-gite897, pinned known-misroute
    // on 2026-09-02, has routed ACTIVITY since add1 b3; re-pinned agree from a
    // fresh measurement. Derivation: 5607 + 874 + 110 = 6591.
    //
    // 5607 -> 5608 / 6591 -> 6592 at add4/merge-T3e-2: 1
    // svg-activity clone rows (zero-diff pins). Derivation: 5608 + 874 + 110 = 6592.
    //
    // 5608 -> 5609 / 6592 -> 6593 at add4/merge-T3f: 1
    // svg-activity clone rows (zero-diff pins). Derivation: 5609 + 874 + 110 = 6593.
    //
    // 5609 -> 5611 / 6593 -> 6595 at add4/merge-T3g: 2
    // svg-activity clone rows (zero-diff pins). Derivation: 5611 + 874 + 110 = 6595.
    //
    // 5611 -> 5613 / 6595 -> 6597 at add4/merge-T3h: 2
    // svg-activity clone rows (zero-diff pins). Derivation: 5613 + 874 + 110 = 6597.
    //
    // 5613 -> 5617 / 874 -> 870 at add4/merge-T3k (2026-10-08): `[FIXED]`
    // retirements -- bopele/cebuci/fugoko/tidoda (the 4 add4-T0b activity
    // parser gaps: CommandPage, CommandLink3, CommandFootboxIgnored,
    // CommandHideShowByGender) now route ACTIVITY; re-pinned agree from a
    // fresh measurement. Derivation: 5617 + 870 + 110 = 6597.
    //
    // 5617 -> 5620 / 6597 -> 6600 at add4/merge-T3k: 3
    // svg-activity clone rows (zero-diff pins). Derivation: 5620 + 870 + 110 = 6600.
    //
    // 5620 -> 5621 / 6600 -> 6601 at add4/fix-jucidi: 1
    // svg-activity clone rows (zero-diff pins). Derivation: 5621 + 870 + 110 = 6601.
    //
    // 5621 -> 5625 / 6601 -> 6605 at lgm/close-b1e: 4 svg-activity clone rows
    // (zero-diff pins after oracle seam #3). Derivation: 5625 + 870 + 110 = 6605.
    // 5625 -> 5626 / 6605 -> 6606 at lgm/close-b1e: 1 svg-class clone row
    // (xadado-92-lazo250). Derivation: 5626 + 870 + 110 = 6606.
    // 5626 -> 5650 / 110 -> 86 at isw/T1b: oracle seam #4 gives U+0020 its
    // width, so 24 goldens (18 activity, 6 unknown) stopped being SlotFinder
    // crash pages and route ACTIVITY on both sides (re-pinned from a fresh
    // measurement, plans/instrument-space-width/measurements/repin-jar-error.mts).
    // Derivation: 5650 + 870 + 86 = 6606.
    // 5650 -> 5668 / 6606 -> 6624 at isw/close: 18 svg-activity clone rows
    // (the former crash pages, now zero-diff pins). Derivation: 5668 + 870 + 86 = 6624.
    // 5668 -> 5670 / 870 -> 868 at isw/close: sequence licole-34-vejo527 (`+ XXX`) and loteba-26-konu854 (`& return`) render after the batch-2 sequence ports; re-pinned from a fresh measurement by scripts/repin-sequence-baselines.ts.
    // Derivation: 5670 + 868 + 86 = 6624.
    // 5670 -> 5671 / 6624 -> 6625 at aepp/exit: 1 svg-activity clone row
    // (tidoda-12-juxu745, zero-diff pin). Derivation: 5671 + 868 + 86 = 6625.
    // 5671 -> 5675 / 6625 -> 6629 at cdd8/T0b: 4 svg-class unknown-tree clone
    // rows (vakovo-25, fakone-16, japode-92, tikiti-02; zero-diff pins after the
    // pragma-stripped re-capture). Derivation: 5675 + 868 + 86 = 6629.
    // 5675 -> 5680 / 6629 -> 6634 at cdd8/close-b1: 5 svg-class clone rows
    // (dezobu-62, sapofa-97, semutu-45, xagomi-49 unknown-tree; gadufu-56),
    // zero-diff pins. Derivation: 5680 + 868 + 86 = 6634.
    // 5680 -> 5687 / 6634 -> 6641 at cdd8/close-b3: 7 svg-class clone rows (the
    // !pragma layout elk class fixtures, D12-eligible zero-diff pins).
    // Derivation: 5687 + 868 + 86 = 6641.
    // 5687 -> 5787 / 868 -> 818 / 6641 -> 6691 at sep/close-b4: the salt
    // plugin registers (sep T4a), so the 50 `dot-cache/salt` known-misroute
    // rows (SALT -> NONE) re-pin `agree` in place; 47 svg-salt golden clone
    // rows + 3 svg-class embed clone rows (bixogo-47, roxosu-00, unknown-tree
    // lubicu-73, the `{{salt}}` seed rows) appended, all zero-diff pins
    // (plans/salt-engine-port/measurements/repin-salt-routing.mts).
    // Derivation: 5787 + 818 + 86 = 6691.
    // 5787 -> 5790 / 6691 -> 6694 at sep/close-b5-wave1: 3 svg-salt clone rows
    // (mejeki-64, vuxibo-96 after the chrome-margin fix; neguge-98 after the
    // CommandCreoleSpace port), zero-diff pins. Derivation: 5790 + 818 + 86 = 6694.
    // 5790 -> 6134 / 818 -> 642 / 6694 -> 6862 at wep/close-b4: the wbs
    // plugin registers (wep T4a), so the 176 `dot-cache/wbs` known-misroute
    // rows (WBS -> NONE) re-pin `agree` in place; 168 svg-wbs golden clone
    // rows appended, all zero-diff pins
    // (plans/wbs-engine-port/measurements/repin-wbs-routing.mts).
    // Derivation: 6134 + 642 + 86 = 6862.
    // 6134 -> 6142 / 6862 -> 6870 at wep/close-b5-wave1: 8 svg-wbs clone rows
    // (facibu-72, keloxe-59, link-URL-tooltip-1/-2, xasinu-75, zeneno-39 after
    // T5a; fipina-75, xakubu-65 after T5b), zero-diff pins.
    // Derivation: 6142 + 642 + 86 = 6870.
    // 6142 -> 6156 / 6870 -> 6884 at ufp/close-b2: 14 svg-utility clone rows
    // (the utility plugins register, ufp T2a; every pinned row already routed
    // NONE -> NONE `agree`), zero-diff pins
    // (plans/utility-factories-port/measurements/repin-utility-routing.mts).
    // Derivation: 6156 + 642 + 86 = 6884.
    // 6156 -> 6157 / 6884 -> 6885 at ufp/close-b3: 1 svg-utility clone row
    // (xucoma-93-jeko861, SpriteImage ported by ufp T3a), zero-diff pin.
    // Derivation: 6157 + 642 + 86 = 6885.
    // 6157 -> 6158 / 6885 -> 6886 at the dot-engine 2.4.0 bump: 1 svg-class
    // clone row (nugecu-04-tona107, conformant once dot-engine fixed
    // TRACKER 23), zero-diff pin. Derivation: 6158 + 642 + 86 = 6886.
    // 6158 -> 6195 / 6886 -> 6923 at description-svek-wrappers T6 (b4): 37
    // svg-description clone rows (DESCRIPTION -> DESCRIPTION `agree`),
    // zero-diff pins (measurements/pin-description.mts). Derivation:
    // 6195 + 642 + 86 = 6923.
    // 6195 -> 6196 / 6923 -> 6924 at description-svek-wrappers T10 (b5): 1
    // svg-description clone row (depabo-06-kato214, conformant after T9's
    // inverted links). Derivation: 6196 + 642 + 86 = 6924.
    // 6196 -> 6459 / 6924 -> 7187 at component-divergence-drive T11 (b5): 263
    // svg-description clone rows (component 117, usecase 31, unknown 115; all
    // DESCRIPTION -> DESCRIPTION `agree`), zero-diff pins under T1a's per-type
    // eligibility. Derivation: 6459 + 642 + 86 = 7187.
    // 6459 -> 6474 agree at description-url-wrappers T6 (b4): +15 svg-description
    // golden clones (component 8, usecase 4, unknown 3) of agree-classified
    // dot-cache rows. Derivation: 6474 + 642 + 86 = 7202.
    // 6474 -> 6475 agree at gtc T1: +1 svg-description golden
    // clones (unknown 1: rufopi-30-roro642) of agree-classified dot-cache rows.
    // Derivation: 6475 + 642 + 86 = 7203.
    // 6475 -> 6486 agree at gtc T2: +11 svg-description golden
    // clones (component 4, unknown 7) of agree-classified dot-cache rows.
    // Derivation: 6486 + 642 + 86 = 7214.
    // 6486 -> 6521 agree at gtc S (state lane close): +35 svg-state golden
    // clones (35 state rows) of agree-classified dot-cache rows.
    // Derivation: 6521 + 642 + 86 = 7249.
    // 6521 -> 6523 agree at gtc T2b: +2 svg-description golden
    // clones (component 1, unknown 1) of agree-classified dot-cache rows.
    // Derivation: 6523 + 642 + 86 = 7251.
    // 6523 -> 6525 agree at gtc T3: +2 svg-description golden
    // clones (component 1, usecase 1) of agree-classified dot-cache rows.
    // Derivation: 6525 + 642 + 86 = 7253.
    // 6525 -> 6531 agree at gtc T3b: +6 svg-description golden
    // clones (component 4, usecase 2) of agree-classified dot-cache rows.
    // Derivation: 6531 + 642 + 86 = 7259.
    // 6531 -> 6537 agree at gtc T4: +6 svg-description golden
    // clones (component 5, unknown 1) of agree-classified dot-cache rows.
    // Derivation: 6537 + 642 + 86 = 7265.
    // 6537 -> 6538 agree at gtc T5a: +1 svg-description golden
    // clones (component 1: zosaxo-93-nici652) of agree-classified dot-cache rows.
    // Derivation: 6538 + 642 + 86 = 7266.
    // 6538 -> 6540 agree at gtc T5b: +2 svg-description golden
    // clones (unknown 1, usecase 1) of agree-classified dot-cache rows.
    // Derivation: 6540 + 642 + 86 = 7268.
    // 6540 -> 6546 agree at gtc T6b: +6 svg-description golden
    // clones (component 4, unknown 2) of agree-classified dot-cache rows.
    // Derivation: 6546 + 642 + 86 = 7274.
    // 6546 -> 6553 agree at gtc T6d: +7 svg-description golden
    // clones (component 4, unknown 3) of agree-classified dot-cache rows.
    // Derivation: 6553 + 642 + 86 = 7281.
    // 6553 -> 6555 agree at gtc T6e: +2 svg-description golden
    // clones (unknown 2) of agree-classified dot-cache rows.
    // Derivation: 6555 + 642 + 86 = 7283.
    // 6555 -> 6556 agree at gtc T6f: +1 svg-description golden
    // clones (component 1: rekisu-47-pesa949) of agree-classified dot-cache rows.
    // Derivation: 6556 + 642 + 86 = 7284.
    // 6556 -> 6557 agree at gtc T6g: +1 svg-description golden
    // clones (unknown 1: fefeza-33-xute344) of agree-classified dot-cache rows.
    // Derivation: 6557 + 642 + 86 = 7285.
    // 6557 -> 6559 agree at gtc T6h: +2 svg-description golden
    // clones (component 1, usecase 1) of agree-classified dot-cache rows.
    // Derivation: 6559 + 642 + 86 = 7287.
    // 6559 -> 6560 agree at gtc T6j: +1 svg-description golden
    // clones (unknown 1: deroxu-29-gude369) of agree-classified dot-cache rows.
    // Derivation: 6560 + 642 + 86 = 7288.
    // 6560 -> 6927 agree at sdd1 close-b2: +367 svg-sequence golden clones
    // (pin round 1) of agree-classified dot-cache rows.
    // Derivation: 6927 + 642 + 86 = 7655.
    // 6927 -> 6979 agree at sdd1 close-b3: +52 svg-sequence golden clones
    // (pin round 2). Derivation: 6979 + 642 + 86 = 7707.
    // 6979 -> 6988 agree at sdd2 close-b1: +7 sequence rows that rendered
    // (known-misroute -> agree: dolice-60, jiliba-03, junide-55, ladiro-50,
    // nidozi-08, tegasu-93, vubato-50) and +2 svg-sequence golden clones
    // (ladiro-50, pucini-86). Derivation: 6988 + 635 + 86 = 7709.
    // 6988 -> 7080 agree at sdd2 close-b2: +3 sequence rows render (fojomu-60,
    // nizuzi-32, zoturo-25: CommandLinkAnchor, T2e) and +89 svg-sequence golden
    // clones (pin round 2). Derivation: 7080 + 632 + 86 = 7798.
    // 7080 -> 7257 agree at sdd2 close-b3: +177 svg-sequence golden clones
    // (pin round 3). Derivation: 7257 + 632 + 86 = 7975.
    // 7257 -> 7370 at sdd2/close-b4: +113 svg-sequence golden clones.
    // 7370 -> 7479 at sdd2/close-b5: +109 svg-sequence golden clones.
    // 7479 -> 7532 at sdd2/close-b6: +53 svg-sequence golden clones.
    // 7532 -> 7599 at sdd2/close-b7: +67 svg-sequence golden clones.
    // 7599 -> 7606 at sdd2/close-b8: +4 svg-sequence golden clones and +3
    // sequence rows that render (known-misroute -> agree): fonudu-70 (YAML
    // front matter, T8a), nuvoja-46 (missing `!includedef`, T8b), bomino-39
    // (`<style src=>`, T8c). Derivation: 7606 + 629 + 86 = 8321.
    // 7606 -> 7607 at sdd2/close-exit: +1 svg-sequence golden clones.
    // 7607 -> 7615 at sdd3-prereqs: +8 svg-sequence golden clones.
    // 7615 -> 7631 at sdd3/close-b1: +16 svg-sequence golden clones.
    // 7631 -> 7656 at sdd3/close-b2: +25 svg-sequence golden clones.
    // 7656 -> 7676 at sdd3/close-b3 (2026-10-23): +20 svg-sequence golden clones.
    // 7676 -> 7706 at sdd3/close-b4 (2026-10-23): +30 svg-sequence golden clones.
    // 7706 -> 7707 at sdd3/close-b5 (2026-10-23): +1 svg-sequence golden clone (jexavi).
    // 7707 -> 7709 at sdd3/close-b6 (2026-10-23): +2 svg-sequence golden clones (tifube, fifasu).
    // 7709 -> 7710 at sdd3/close-b7 (2026-10-23): +1 svg-sequence golden clone (mefeke).
    // 7710 -> 7716 at sdd3/close-b8 (2026-10-24): +6 svg-sequence golden clones (the last open rows).
    // 7716 -> 7970 at gep/close-b7 (2026-10-26): gantt turned on, 254 known-misroute rows now agree.
    // 7970 -> 7971 at gep/close-b7: +1 svg-activity golden clone (bozido-07-geze049 promoted).
    // 7971 -> 8222 at gep/close-b7 capture: +251 svg-gantt golden clones.
    // 8222 -> 8223 at gep/close-b8: +1 svg-gantt golden clone (ribupo-71-poku778 promoted, T8c).
    // 8223 -> 8224 at gdd/close-b1 (2026-10-27): +1 svg-gantt golden clone (xureco-57-lene839 promoted, T1a).
    // 8224 -> 8225 at gdd/close-b2 (2026-10-28): +1 svg-gantt golden clone (xikovo-87-rosu902 promoted, T2a).
    // 8225 -> 8233 at ddc/T0c (2026-10-28): +8 dot-cache/files rows, all agree (FILES == FILES).
    // 8233 -> 8234 at ddc/close-b0 (2026-10-28): files/files-directory-tree-with-note re-pinned agree
    // (the files engine stamps data-diagram-type since lad batch 2; repin-files-routing.mts).
    // 8234 -> 8247 at ddc/close-b1 (2026-10-28): +13 golden clones (9 svg-files, 3 svg-json, 1 svg-yaml).
    // 8247 -> 8248 at ddc/close-b2 (2026-10-28): +1 svg-json golden clone (babico-87-soxo095).
    // 8248 -> 8249 at dss/close-b2 (2026-11-02): +1 svg-state golden clone (lonuti-97-voko521), renders.
    // 8275 -> 9043 at ogc/T5 (2026-11-04): #109's 1016 uncaptured manifest fixtures captured by jar type (D2) and pinned additively from the stage: +768 agree (activity 301, class 149, dot 49, hcl 12, object 1,
    // sequence 93, state 26, unknown 133, yaml 4). Derivation: 8275 + 768 = 9043.
    // 9043 -> 9187 at ogc/T6: +144 svg-activity golden clones (the new activity rows that render
    // zero-diff, frozen by pin-goldens.mts as ogc-b2). Derivation: 9043 + 144 = 9187.
    // 9187 -> 9198 at stdd/T0b (2026-11-04): +11 svg-state golden clones (the rows #109 captured that
    // the census reads at zero, pin-state.mjs). Derivation: 9187 + 11 = 9198.
    // 9198 -> 9257 at stdd/close-b1 (2026-11-04): +59 svg-state golden clones (batch 1: link ids, border
    // points, SvekResult draw order, dotted parents). Derivation: 9198 + 59 = 9257.
    // 9257 -> 9272 at stdd/close-b2 (2026-11-04): +15 svg-state golden clones (batch 2: link style,
    // inverted links, link labels). Derivation: 9257 + 15 = 9272.
    // 9272 -> 9318 at stdd/close-b3 (2026-11-04): +46 svg-state golden clones (batch 3: state colours,
    // line thickness, composite zones, small reads). Derivation: 9272 + 46 = 9318.
    // 9318 -> 9334 at stdd/close-b4 (2026-11-04): +16 svg-state golden clones (batch 4: scale/dpi, text).
    // 9334 -> 9341 at stdd/close-b5 (2026-11-04): +7 svg-state golden clones (batch 5: hidden, skin, notes).
    // 9341 -> 9370 at stdd/close-b6 (2026-11-04): +29 svg-state golden clones (batch 6: layout inputs, residue).
    // 9370 -> 9371 (2026-11-04): +1 svg-state golden clone, viroxo-69 (border-point anchor fix).
    // Derivation: 9341 + 29 + 1 = 9371.
    // 9371 -> 9448 at ddd/T0b (2026-11-04): +77 svg-description golden clones. Derivation: 9371 + 77 = 9448.
    // 9448 -> 9456 at ddd/T1a (2026-11-04): 8 rows flip to agree, CommandCreateElementFull's full forms. Derivation: 9448 + 8 = 9456.
    // 9456 -> 9461 at ddd/T1b (2026-11-04): 5 rows flip to agree, the class factory refuses what upstream's refuses. Derivation: 9456 + 5 = 9461.
    // 9461 -> 9464 at ddd/T1c (2026-11-04): 3 rows flip to agree, ported commands. Derivation: 9461 + 3 = 9464.
    // 9464 -> 9480 at ddd/close-b1 (2026-11-04): +16 svg-description golden clones. Derivation: 9464 + 16 = 9480.
    // 9480 -> 9584 at ddd/close-b3 (2026-11-04): +104 svg-description golden clones. Derivation: 9480 + 104 = 9584.
    // 9584 -> 9635 at b4 (2026-11-04): ddd batch 4 close: flips and pins. Derivation: 9584 + 51 = 9635.
    // 9635 -> 9669 at b5 (2026-11-04): ddd batch 5 close: flips and pins. Derivation: 9635 + 34 = 9669.
    // 9669 -> 9676 at c4dd/T4b (2026-11-05): +2 svg-class under c4/, +5 svg-description. Derivation: 9669 + 7 = 9676.
    // 9676 -> 9722 at odd/T4b (2026-11-05): +46 svg-object. Derivation: 9676 + 46 = 9722.
    // 9722 -> 9723 (2026-11-05): +1 svg-description golden clone, zodela-36 (dot-engine 2.10.3, issue 36).
    // 9723 -> 9781 at cep/T5 (2026-11-05): the 29 chart misroutes flip to agree, +29 svg-chart golden clones. Derivation: 9723 + 29 + 29 = 9781.
    // 9781 -> 9793 at pep/T4 (2026-11-05): the 6 packet misroutes flip to agree, +6 svg-packet golden clones. Derivation: 9781 + 6 + 6 = 9793.
    // 9793 -> 9801 at bep/T4 (2026-11-05): the 4 board misroutes flip to agree, +4 svg-board golden clones. Derivation: 9793 + 4 + 4 = 9801.
    // 9801 -> 9806 at ubt/T1a (2026-11-06): +5 svg-activity golden clones. Derivation: 9801 + 5 = 9806.
    // 9806 -> 9812 at ubt/T1b (2026-11-06): +6 svg-activity golden clones. Derivation: 9806 + 6 = 9812.
    // 9812 -> 9918 at ubt/T3c (2026-11-06): +106 golden clones under unknown/ (49 svg-activity, 52 svg-sequence, 5 svg-state), all agree. Derivation: 9812 + 106 = 9918.
    // 9918 -> 9920 at smc/T3a (2026-11-06): gigefo-15-cami497 flips to agree, plus its golden clone.
    // 9920 -> 9922 at smc/T4c (2026-11-06): +2 svg-activity golden clones (finadu-74-duvi890, titope-07-cixa052).
    // 9922 -> 9924 at smc/T4c (2026-11-06): +2 svg-activity golden clones (ronovu-01-voku005, vifiba-70-repa468).
    // 9924 -> 9940 at aar/T1b (2026-11-06): 10 dot-cache/activity rows flip to agree, +6 svg-activity golden clones.
    // 9940 -> 9971 at aar/T2a (2026-11-06): +31 svg-activity golden clones.
    // 9971 -> 9982 at aar/T2b (2026-11-06): +11 svg-activity golden clones.
    // 9982 -> 9987 at aar/T3a (2026-11-06): +5 svg-activity golden clones.
    // 9987 -> 9996 at aar/T3b (2026-11-06): +9 svg-activity golden clones.
    // 9996 -> 10000 at aar/T4a (2026-11-06): +4 svg-activity golden clones.
    // 10000 -> 10004 at aar/T4b (2026-11-06): +4 svg-activity golden clones.
    // 10004 -> 10005 at aar/T4c (2026-11-06): +1 svg-activity golden clone.
    // 10005 -> 10008 at aar/T6a (2026-11-06): +3 svg-activity golden clones.
    // 10008 -> 10012 at aar/T6a (2026-11-06): +2 svg-activity golden clones, dadelu-44/tusaxu-17 flip to agree.
    // 10012 -> 10018 at aar/T6a (2026-11-06): +6 svg-activity golden clones.
    // 10018 -> 10027 at aar/T6a (2026-11-06): +9 svg-activity golden clones (8 activity, 1 unknown tree), all rendering.
    // 10027 -> 10028 at aar/T6a (2026-11-06): +1 svg-activity golden clone (bofaxe-86), rendering.
    // 10028 -> 10044 at aar/T6a (2026-11-06): +16 svg-activity golden clones, all rendering.
    // 10044 -> 10045 at aar/T6a (2026-11-06): +1 svg-activity golden clone (denono-78), rendering.
    // 10045 -> 10057 at aar/T6a (2026-11-06): +12 svg-activity golden clones, all rendering.
    // 10057 -> 10067 at aar/T6a (2026-11-06): +10 svg-activity golden clones, all rendering.
    // 10067 -> 10073 at aar/T6a (2026-11-06): +6 svg-activity golden clones, all rendering.
    // 10073 -> 10074 at aar/T6a (2026-11-06): +1 svg-activity golden clone (dovoda-34, conformant since b0, pinnable once the ratchet renders with the survey's asset store), rendering.
    // 10074 -> 10083 at aar/T6a (2026-11-06): +9 svg-activity golden clones, all rendering.
    // 10083 -> 10194 at laep/T3a (2026-11-07): 111 legacy `(*) -->` rows flip to agree, the legacy
    // ActivityDiagramFactory is registered at PSystemBuilder.java:137. Derivation: 10083 + 111 = 10194.
    // 10194 -> 10198 at laep/T3b-1 (2026-11-07): the 4 note-on-link rows flip to agree. Derivation: 10194 + 4 = 10198.
    // 10198 -> 10200 at laep/T3b-2 (2026-11-07): the 2 swimlane rows flip to agree. Derivation: 10198 + 2 = 10200.
    // 10200 -> 10201 at laep/T3b-4 (2026-11-07): radute-87-nize199 flips to agree. Derivation: 10200 + 1 = 10201.
    // 10201 -> 10325 at laep/T4 (2026-11-09): +124 svg-activity-legacy golden clones of agree rows. Derivation: 10201 + 124 = 10325.
    // 10325 -> 10453 at nwp/T4 (2026-11-10): the 64 nwdiag rows flip to agree, plus their 64 svg-nwdiag golden
    // clones. Derivation: 10325 + 64 + 64 = 10453.
    // 10453 -> 10539 at eep/T5 (2026-11-10): the 43 ebnf rows flip to agree, plus their 43 svg-ebnf golden
    // clones. Derivation: 10453 + 43 + 43 = 10539.
    // 10539 -> 10627 at rep/T4 (2026-11-10): the 44 regex rows the jar draws flip to agree (REGEX/REGEX), plus their
    // 44 svg-regex golden clones. Derivation: 10539 + 44 + 44 = 10627.
    // 10627 -> 10931 at tep/T5 (2026-11-11): the 152 timing rows the jar draws flip to agree (TIMING/TIMING,
    // PSystemTimingFactory registered), plus their 152 svg-timing golden clones. Derivation: 10627 + 152 + 152 = 10931.
    // 10931 -> 10967 at wrp/T4 (2026-11-11): the 18 wire rows flip to agree, +18 svg-wire golden clones.
    // 10967 -> 10989 at cmf/T4 (2026-11-11): the 5 help rows flip to agree (HELP/HELP), +17 svg-factories golden
    // clones. Derivation: 10967 + 5 + 17 = 10989.
    // 10989 -> 11003 at bpe/T4 (2026-11-11): the 7 bpm rows flip to agree (BPM/BPM, BpmDiagramFactory registered at
    // PSystemBuilder.java:141), +7 svg-bpm golden clones. Derivation: 10989 + 7 + 7 = 11003.
    expect(pinnedAgree.length).toBe(11003);
    // 629 -> 375 at gep/close-b7: the same 254 gantt rows.
    // 375 -> 374 at ddc/close-b0 (2026-10-28): the files authored row above.
    // 374 -> 546 at ogc/T5: +172 known-misroute, every one with a ledger reason (ogc-T4a/b/c):
    // activity 128 (114 legacy `(*) -->` + 13 activity3 + 1 legacy we draw as CLASS), class 2,
    // sequence 1, timing 19, unknown 22 (16 DESCRIPTION + 6 head-window error pages we draw).
    // Derivation: 374 + 172 = 546.
    // 546 -> 538 at ddd/T1a (2026-11-04): 8 rows flip to agree, CommandCreateElementFull's full forms. Derivation: 546 - 8 = 538.
    // 538 -> 533 at ddd/T1b (2026-11-04): 5 rows flip to agree, the class factory refuses what upstream's refuses. Derivation: 538 - 5 = 533.
    // 533 -> 530 at ddd/T1c (2026-11-04): 3 rows flip to agree, ported commands. Derivation: 533 - 3 = 530.
    // 530 -> 501 at cep/T5 (2026-11-05): the 29 chart rows flip to agree, the port stamps diagramType. Derivation: 530 - 29 = 501.
    // 501 -> 495 at pep/T4 (2026-11-05): the 6 packet rows flip to agree, the port stamps diagramType. Derivation: 501 - 6 = 495.
    // 495 -> 491 at bep/T4 (2026-11-05): the 4 board rows flip to agree, the port stamps diagramType. Derivation: 495 - 4 = 491.
    // 491 -> 490 at smc/T3a (2026-11-06): gigefo-15-cami497 flips to agree.
    // 490 -> 480 at aar/T1b (2026-11-06): 10 activity3 parser gaps close (fuficu-36 ... zugoco-10).
    // 480 -> 478 at aar/T6a (2026-11-06): dadelu-44, tusaxu-17 (stale ubt pins) flip to agree.
    // 478 -> 367 at laep/T3a (2026-11-07): the same 111 legacy rows. Derivation: 478 - 111 = 367.
    // 367 -> 363 at laep/T3b-1 (2026-11-07): the same 4 rows. Derivation: 367 - 4 = 363.
    // 363 -> 361 at laep/T3b-2 (2026-11-07): the same 2 rows. Derivation: 363 - 2 = 361.
    // 361 -> 360 at laep/T3b-4 (2026-11-07): the same row. Derivation: 361 - 1 = 360.
    // 360 -> 296 at nwp/T4 (2026-11-10): the 64 nwdiag rows flip to agree (NwDiagramFactory registered at
    // PSystemBuilder.java:155). Derivation: 360 - 64 = 296.
    // 296 -> 253 at eep/T5 (2026-11-10): the 43 ebnf rows flip to agree (PSystemEbnfFactory registered at
    // PSystemBuilder.java:196). Derivation: 296 - 43 = 253.
    // 253 -> 209 at rep/T4 (2026-11-10): the 44 regex rows flip to agree. Derivation: 253 - 44 = 209.
    // 209 -> 57 at tep/T5 (2026-11-11): the 152 timing rows flip to agree (139 timing + 13 unknown). Derivation: 209 - 152 = 57.
    // 57 -> 39 at wrp/T4 (2026-11-11): the 18 wire rows flip to agree.
    // 39 -> 34 at cmf/T4 (2026-11-11): the 5 help rows flip to agree (the help engine registers).
    // 34 -> 27 at bpe/T4 (2026-11-11): the 7 bpm rows flip to agree (the bpm engine registers).
    expect(pinnedMisroutes.length).toBe(27);
    // 86 -> 162 at ogc/T5: +76 jar error pages whose signature sits in the head window
    // (dot 8, unknown 68). Derivation: 86 + 76 = 162.
    expect(pinnedJarErrors.length).toBe(162);
    // 7202 -> 7203 at gtc T1 (see the agree derivation above).
    // 7203 -> 7214 at gtc T2 (see the agree derivation above).
    // 7214 -> 7249 at gtc S (state lane close) (see the agree derivation above).
    // 7249 -> 7251 at gtc T2b (see the agree derivation above).
    // 7251 -> 7253 at gtc T3 (see the agree derivation above).
    // 7253 -> 7259 at gtc T3b (see the agree derivation above).
    // 7259 -> 7265 at gtc T4 (see the agree derivation above).
    // 7265 -> 7266 at gtc T5a (see the agree derivation above).
    // 7266 -> 7268 at gtc T5b (see the agree derivation above).
    // 7268 -> 7274 at gtc T6b (see the agree derivation above).
    // 7274 -> 7281 at gtc T6d (see the agree derivation above).
    // 7281 -> 7283 at gtc T6e (see the agree derivation above).
    // 7283 -> 7284 at gtc T6f (see the agree derivation above).
    // 7284 -> 7285 at gtc T6g (see the agree derivation above).
    // 7285 -> 7287 at gtc T6h (see the agree derivation above).
    // 7287 -> 7288 at gtc T6j (see the agree derivation above).
    // 7288 -> 7655 at sdd1 close-b2 (see the agree derivation above).
    // 7655 -> 7707 at sdd1 close-b3 (see the agree derivation above).
    // 7707 -> 7709 at sdd2 close-b1 (+2 golden clones, see agree above).
    // 7709 -> 7798 at sdd2 close-b2 (+89 golden clones, see agree above).
    // 7798 -> 7975 at sdd2 close-b3 (+177 golden clones, see agree above).
    // 7975 -> 8088 at sdd2/close-b4: +113 svg-sequence golden clones.
    // 8088 -> 8197 at sdd2/close-b5: +109 svg-sequence golden clones.
    // 8197 -> 8250 at sdd2/close-b6: +53 svg-sequence golden clones.
    // 8250 -> 8317 at sdd2/close-b7: +67 svg-sequence golden clones.
    // 8317 -> 8321 at sdd2/close-b8: +4 svg-sequence golden clones.
    // 8321 -> 8322 at sdd2/close-exit: +1 svg-sequence golden clones.
    // 8322 -> 8330 at sdd3-prereqs: +8 svg-sequence golden clones.
    // 8330 -> 8346 at sdd3/close-b1: +16 svg-sequence golden clones.
    // 8346 -> 8371 at sdd3/close-b2: +25 svg-sequence golden clones.
    // 8371 -> 8391 at sdd3/close-b3 (2026-10-23): +20 svg-sequence golden clones.
    // 8391 -> 8421 at sdd3/close-b4 (2026-10-23): +30 svg-sequence golden clones.
    // 8421 -> 8422 at sdd3/close-b5 (2026-10-23): +1 svg-sequence golden clone (jexavi).
    // 8422 -> 8424 at sdd3/close-b6 (2026-10-23): +2 svg-sequence golden clones (tifube, fifasu).
    // 8424 -> 8425 at sdd3/close-b7 (2026-10-23): +1 svg-sequence golden clone (mefeke).
    // 8425 -> 8431 at sdd3/close-b8 (2026-10-24): +6 svg-sequence golden clones (the last open rows).
    // 8431 -> 8432 at gep/close-b7 (2026-10-26): +1 svg-activity golden clone (bozido-07-geze049).
    // 8432 -> 8683 at gep/close-b7 capture: +251 svg-gantt golden clones.
    // 8683 -> 8684 at gep/close-b8: +1 svg-gantt golden clone (ribupo-71-poku778).
    // 8684 -> 8685 at gdd/close-b1 (2026-10-27): +1 svg-gantt golden clone (xureco-57-lene839 promoted, T1a).
    // 8685 -> 8686 at gdd/close-b2 (2026-10-28): +1 svg-gantt golden clone (xikovo-87-rosu902 promoted, T2a).
    // 8686 -> 8694 at ddc/T0c (2026-10-28): +8 dot-cache/files rows (the pdiff @startfiles bucket, all agree).
    // 8694 -> 8707 at ddc/close-b1 (2026-10-28): +13 golden clones (9 svg-files, 3 svg-json, 1 svg-yaml promoted).
    // 8707 -> 8708 at ddc/close-b2 (2026-10-28): +1 svg-json golden clone (babico-87-soxo095 promoted, T2a).
    // 8708 -> 8709 at dss/close-b2 (2026-11-02): +1 svg-state golden clone (lonuti-97-voko521), renders.
    // 8735 -> 9751 at ogc/T5: +1016 dot-cache rows (activity 429, unknown 223, class 151,
    // sequence 94, dot 57, state 26, timing 19, hcl 12, yaml 4, object 1).
    // Derivation: 8735 + 1016 = 9751 = 9043 + 546 + 162.
    // 9751 -> 9895 at ogc/T6: +144 svg-activity golden clones. Derivation: 9187 + 546 + 162 = 9895.
    // 9895 -> 9906 at stdd/T0b (2026-11-04): +11 svg-state golden clones. Derivation: 9198 + 546 + 162 = 9906.
    // 9906 -> 9965 at stdd/close-b1 (2026-11-04): +59 svg-state golden clones. Derivation: 9257 + 546 + 162 = 9965.
    // 9965 -> 9980 at stdd/close-b2 (2026-11-04): +15 svg-state golden clones. Derivation: 9272 + 546 + 162 = 9980.
    // 9980 -> 10026 at stdd/close-b3 (2026-11-04): +46 svg-state golden clones. Derivation: 9318 + 546 + 162 = 10026.
    // 10026 -> 10042 at stdd/close-b4 (2026-11-04): +16 svg-state golden clones. Derivation: 9334 + 546 + 162 = 10042.
    // 10042 -> 10049 at stdd/close-b5 (2026-11-04): +7 svg-state golden clones. Derivation: 9341 + 546 + 162 = 10049.
    // 10049 -> 10078 at stdd/close-b6 (2026-11-04): +29 svg-state golden clones. Derivation: 9370 + 546 + 162 = 10078.
    // 10078 -> 10079 (2026-11-04): +1 svg-state golden clone, viroxo-69 (border-point anchor fix).
    // 10079 -> 10156 at ddd/T0b (2026-11-04): +77 svg-description golden clones.
    // 10156 -> 10172 at ddd/close-b1 (2026-11-04): +16 svg-description golden clones. Derivation: 10156 + 16 = 10172.
    // 10172 -> 10276 at ddd/close-b3 (2026-11-04): +104 svg-description golden clones. Derivation: 10172 + 104 = 10276.
    // 10276 -> 10327 at b4 (2026-11-04): ddd batch 4 close: flips and pins. Derivation: 10276 + 51 = 10327.
    // 10327 -> 10361 at b5 (2026-11-04): ddd batch 5 close: flips and pins. Derivation: 10327 + 34 = 10361.
    // 10361 -> 10368 at c4dd/T4b (2026-11-05): +2 svg-class under c4/, +5 svg-description. Derivation: 10361 + 7 = 10368.
    // 10368 -> 10414 at odd/T4b (2026-11-05): +46 svg-object. Derivation: 10368 + 46 = 10414.
    // 10414 -> 10415 (2026-11-05): +1 svg-description golden clone, zodela-36 (dot-engine 2.10.3, issue 36).
    // 10415 -> 10444 at cep/T5 (2026-11-05): +29 svg-chart golden clones. Derivation: 10415 + 29 = 10444.
    // 10444 -> 10450 at pep/T4 (2026-11-05): +6 svg-packet golden clones. Derivation: 10444 + 6 = 10450.
    // 10450 -> 10454 at bep/T4 (2026-11-05): +4 svg-board golden clones. Derivation: 10450 + 4 = 10454.
    // 10454 -> 10459 at ubt/T1a (2026-11-06): +5 svg-activity golden clones. Derivation: 10454 + 5 = 10459.
    // 10459 -> 10465 at ubt/T1b (2026-11-06): +6 svg-activity golden clones. Derivation: 10459 + 6 = 10465.
    // 10465 -> 10571 at ubt/T3c (2026-11-06): +106 golden clones under unknown/ (49 svg-activity, 52 svg-sequence, 5 svg-state). Derivation: 10465 + 106 = 10571.
    // 10571 -> 10572 at smc/T3a (2026-11-06): +1 svg-activity golden clone (gigefo-15-cami497).
    // 10572 -> 10574 at smc/T4c (2026-11-06): +2 svg-activity golden clones (finadu-74-duvi890, titope-07-cixa052).
    // 10574 -> 10576 at smc/T4c (2026-11-06): +2 svg-activity golden clones (ronovu-01-voku005, vifiba-70-repa468).
    // 10576 -> 10582 at aar/T1b (2026-11-06): +6 svg-activity golden clones.
    // 10582 -> 10613 at aar/T2a (2026-11-06): +31 svg-activity golden clones.
    // 10613 -> 10624 at aar/T2b (2026-11-06): +11 svg-activity golden clones.
    // 10624 -> 10629 at aar/T3a (2026-11-06): +5 svg-activity golden clones.
    // 10629 -> 10638 at aar/T3b (2026-11-06): +9 svg-activity golden clones.
    // 10638 -> 10642 at aar/T4a (2026-11-06): +4 svg-activity golden clones.
    // 10642 -> 10646 at aar/T4b (2026-11-06): +4 svg-activity golden clones.
    // 10646 -> 10647 at aar/T4c (2026-11-06): +1 svg-activity golden clone.
    // 10647 -> 10650 at aar/T6a (2026-11-06): +3 svg-activity golden clones.
    // 10650 -> 10652 at aar/T6a (2026-11-06): +2 svg-activity golden clones.
    // 10652 -> 10658 at aar/T6a (2026-11-06): +6 svg-activity golden clones.
    // 10658 -> 10667 at aar/T6a (2026-11-06): +9 svg-activity golden clones (8 activity, 1 unknown tree), all rendering.
    // 10667 -> 10668 at aar/T6a (2026-11-06): +1 svg-activity golden clone (bofaxe-86), rendering.
    // 10668 -> 10684 at aar/T6a (2026-11-06): +16 svg-activity golden clones, all rendering.
    // 10684 -> 10685 at aar/T6a (2026-11-06): +1 svg-activity golden clone (denono-78), rendering.
    // 10685 -> 10697 at aar/T6a (2026-11-06): +12 svg-activity golden clones, all rendering.
    // 10697 -> 10707 at aar/T6a (2026-11-06): +10 svg-activity golden clones, all rendering.
    // 10707 -> 10713 at aar/T6a (2026-11-06): +6 svg-activity golden clones, all rendering.
    // 10713 -> 10714 at aar/T6a (2026-11-06): +1 svg-activity golden clone (dovoda-34, conformant since b0, pinnable once the ratchet renders with the survey's asset store), rendering.
    // 10714 -> 10723 at aar/T6a (2026-11-06): +9 svg-activity golden clones, all rendering.
    // 10723 -> 10847 at laep/T4 (2026-11-09): +124 svg-activity-legacy golden clones, all rendering.
    // 10847 -> 10911 at nwp/T4 (2026-11-10): +64 svg-nwdiag golden clones, all agree. Derivation: 10847 + 64 = 10911.
    // 10911 -> 10954 at eep/T5 (2026-11-10): +43 svg-ebnf golden clones, all agree. Derivation: 10911 + 43 = 10954.
    // 10954 -> 10998 at rep/T4 (2026-11-10): +44 svg-regex golden clones, all agree. Derivation: 10954 + 44 = 10998.
    // 10998 -> 11150 at tep/T5 (2026-11-11): +152 svg-timing golden clones, all agree. Derivation: 10998 + 152 = 11150.
    // 11150 -> 11168 at wrp/T4 (2026-11-11): +18 svg-wire golden clones.
    // 11168 -> 11185 at cmf/T4 (2026-11-11): +17 svg-factories golden clones, all agree.
    // 11185 -> 11192 at bpe/T4 (2026-11-11): +7 svg-bpm golden clones, all agree.
    expect(manifest.fixtures.length).toBe(11192);
  });

  it('every jar-error entry carries jarErrored: true, and no other entry does', () => {
    expect(pinnedJarErrors.filter((f) => f.jarErrored !== true)).toEqual([]);
  });

  it('every known-misroute pin cites the upstream mechanism that explains it', () => {
    // Same bar as the refusal gate's known-gap pins: a specific, locatable
    // upstream origin. Two pins predate the field (the pair this mission
    // inherited); everything censused since must carry one.
    const censused = pinnedMisroutes.filter((f) => f.reason !== undefined);
    // 194 -> 98 at `sequence-command-coverage` batch 3, then 98 -> 16 at
    // batch 4. Still 16 after T19, now exactly ONE short of `pinnedMisroutes`
    // rather than two: kokebo-27-vafi688 left the set by being re-pinned
    // `agree`, and the one remaining uncensused pin is
    // sequence/nuvoja-46-dezu541. It stays uncensused deliberately -- this
    // field means "a locatable UPSTREAM origin", and nuvoja's origin is this
    // repo's fixture include store (`!includedef macro`), so any `.java:`
    // citation here would be false. Its mechanism is recorded in the sibling
    // refusal gate's header and in the T20 close-out instead.
    // All 16 reasons were re-probed at HEAD by T19; seven named a refusing
    // line this port now parses and were rewritten.
    //
    // 16 -> 366 at `activity-oracle-harness` T0b (D11): the 350 activity pins
    // added there all carry a reason, and all carry the SAME one, because one
    // mechanism explains every one of them -- activity stamps no root
    // `data-diagram-type` (`src/diagrams/activity/renderer.ts:221-226` vs
    // `TextBlockExporter.java:293`). The uncensused remainder is still exactly
    // sequence/nuvoja-46-dezu541, for the reason given above.
    //
    // 366 -> 98 at `activity-oracle-harness` T6: 268 of those 350 activity pins
    // left the misroute set entirely by being re-pinned `agree`, and an `agree`
    // entry carries no `reason` (no other one in this file does). The 82 that
    // remain still carry one, now citing the refusal each reproduces plus the
    // upstream stamp they are measured against (`TextBlockExporter.java:293`).
    // The uncensused remainder is STILL exactly sequence/nuvoja-46-dezu541:
    // 99 - 1 = 98.
    //
    // 98 -> 138 at `parity-dashboard-refresh` T5: the 40 board/chart/files/
    // packet pins all carry the same cited mechanism (see the derivation
    // above). The uncensused remainder is STILL exactly
    // sequence/nuvoja-46-dezu541: 139 - 1 = 138.
    //
    // 138 -> 986 at the parity-dashboard-refresh follow-on (2026-09-20): all
    // 848 new pins carry a reason (see the derivation above). The uncensused
    // remainder is STILL exactly sequence/nuvoja-46-dezu541: 987 - 1 = 986.
    // 986 -> 985 at unknown-bucket-routing-repair/T11: recani retired.
    // 985 -> 942 at unknown-bucket-routing-repair/T10: 43 activity retirements.
    // 942 -> 1052 at unknown-bucket-routing-repair/T14: 110 unknown misroutes.
    // 1052 -> 1051 at cdd5-T0e: sequence/soxata-16-kafi688 now agrees.
    // 1051 -> 1050 at cdd5/close-b5: unknown/zolaza-45-sepi570 now agrees.
    // 1050 -> 1049 at cdd6/close-b1: unknown/xuloxo-85-vibu502 now agrees.
    // 1049 -> 908 at the cdd6 <- main merge: 141 mindmap/c4 retirements.
    // 908 -> 904 at add2/close-b1p: 4 `end merge` activity retirements.
    // 904 -> 870 at add2/close-b2: 34 activity parser-gap retirements.
    // 870 -> 874 at add4/T0b: 4 activity parser-gap misroutes (CommandPage,
    // CommandLink3, CommandFootboxIgnored, CommandHideShowByGender).
    // 874 -> 873 at add4/merge-T3e-2: fukika's stale misroute retired.
    // 873 -> 869 at add4/merge-T3k: the 4 add4-T0b activity parser gaps fixed.
    // 869 -> 867 at isw/close: licole-34 and loteba-26 (sequence) now agree.
    // 867 -> 817 at sep/close-b4: the 50 salt "no engine (D7 todo)" misroutes
    // re-pinned agree once the salt plugin registered (sep T4a).
    // 817 -> 641 at wep/close-b4: the 176 wbs "no engine (D3 todo)" misroutes
    // re-pinned agree once the wbs plugin registered (wep T4a).
    // 641 -> 634 at sdd2/close-b1: the 7 sequence rows above now agree.
    // 634 -> 631 at sdd2/close-b2: fojomu-60, nizuzi-32, zoturo-25 now agree.
    // 631 -> 629 at sdd2/close-b8: fonudu-70 and bomino-39 now agree. The
    // uncensused nuvoja-46 also agrees (T8b), so the uncensused remainder is
    // now EMPTY: censused === pinnedMisroutes.
    // 629 -> 375 at gep/close-b7: 254 gantt rows now agree.
    // 375 -> 374 at ddc/close-b0 (2026-10-28): files/files-directory-tree-with-note now agrees.
    // 374 -> 546 at ogc/T5: the 172 new misroutes all carry a ledger reason (the pin tool
    // refuses one without), so censused still equals pinnedMisroutes.
    // 546 -> 538 at ddd/T1a (2026-11-04): 8 rows flip to agree, CommandCreateElementFull's full forms. Derivation: 546 - 8 = 538.
    // 538 -> 533 at ddd/T1b (2026-11-04): 5 rows flip to agree, the class factory refuses what upstream's refuses. Derivation: 538 - 5 = 533.
    // 533 -> 530 at ddd/T1c (2026-11-04): 3 rows flip to agree, ported commands. Derivation: 533 - 3 = 530.
    // 530 -> 501 at cep/T5 (2026-11-05): the 29 chart rows flip to agree. Derivation: 530 - 29 = 501.
    // 501 -> 495 at pep/T4 (2026-11-05): the 6 packet rows flip to agree. Derivation: 501 - 6 = 495.
    // 495 -> 491 at bep/T4 (2026-11-05): the 4 board rows flip to agree. Derivation: 495 - 4 = 491.
    // 491 -> 490 at smc/T3a (2026-11-06): gigefo-15-cami497 flips to agree.
    // 490 -> 480 at aar/T1b (2026-11-06): 10 activity3 parser gaps close.
    // 480 -> 478 at aar/T6a (2026-11-06): dadelu-44, tusaxu-17 flip to agree.
    // 478 -> 367 at laep/T3a (2026-11-07): 111 legacy rows flip to agree.
    // 367 -> 363 at laep/T3b-1 (2026-11-07): the same 4 rows.
    // 363 -> 361 at laep/T3b-2 (2026-11-07): the same 2 rows.
    // 361 -> 360 at laep/T3b-4 (2026-11-07): the same row.
    // 360 -> 296 at nwp/T4 (2026-11-10): the 64 nwdiag rows flip to agree.
    // 296 -> 253 at eep/T5 (2026-11-10): the 43 ebnf rows flip to agree.
    // 253 -> 209 at rep/T4 (2026-11-10): the 44 regex rows flip to agree.
    // 209 -> 57 at tep/T5 (2026-11-11): the 152 timing rows flip to agree.
    // 57 -> 39 at wrp/T4 (2026-11-11): the 18 wire rows flip to agree.
    // 39 -> 34 at cmf/T4 (2026-11-11): the 5 help rows flip to agree.
    // 34 -> 27 at bpe/T4 (2026-11-11): the 7 bpm rows flip to agree.
    expect(censused.length).toBe(27);
    expect(censused.length).toBe(pinnedMisroutes.length);
    for (const m of censused) {
      expect(m.reason ?? '', `${keyOf(m)} must cite its upstream origin`).toMatch(/\w+\.java:\d+/);
    }
    expect([...pinnedAgree, ...pinnedMisroutes].filter((f) => f.jarErrored !== undefined)).toEqual([]);
  });

  it('no jar-error fixture is counted in the misroute total', () => {
    const misrouteKeys = new Set(pinnedMisroutes.map(keyOf));
    expect(pinnedJarErrors.filter((f) => misrouteKeys.has(keyOf(f)))).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// AC3 + AC4 + AC5 -- branch discrimination. In-memory only: fabricated
// fixtures and fabricated live readings, never a baseline edit. A branch
// nobody has seen fire is not a gate.
// ---------------------------------------------------------------------------

const SAMPLE: BaselineFixture = {
  tree: 'dot-cache',
  type: 'sequence',
  slug: 'branch-probe',
  jarType: 'SEQUENCE',
  ourType: 'SEQUENCE',
  status: 'agree',
  measuredAt: '2026-08-23',
  measuredAgainstCommit: 'f66f6abb',
};

describe('routing conformance — branch discrimination', () => {
  it('a fixture that agrees passes', () => {
    expect(checkNoNewMisroute(SAMPLE, { jarType: 'SEQUENCE', ourType: 'SEQUENCE' }).ok).toBe(true);
  });

  it('a newly-disagreeing fixture fails, naming the slug, the jar type and ours', () => {
    const { ok, message } = checkNoNewMisroute(SAMPLE, {
      jarType: 'SEQUENCE',
      ourType: 'DESCRIPTION',
    });
    expect(ok).toBe(false);
    expect(message).toContain('branch-probe');
    expect(message).toContain('SEQUENCE');
    expect(message).toContain('DESCRIPTION');
    expect(message).toContain('NEWLY MISROUTES');
  });

  it('a pinned fixture missing from the live walk fails rather than passing vacuously', () => {
    const { ok, message } = checkNoNewMisroute(SAMPLE, undefined);
    expect(ok).toBe(false);
    expect(message).toContain('ABSENT');
  });

  it('NONE on both sides is an agreement, not an unmeasured fixture', () => {
    expect(checkNoNewMisroute(SAMPLE, { jarType: 'NONE', ourType: 'NONE' }).ok).toBe(true);
  });

  it('a fall to the jar type is reported [FIXED] and never fails', () => {
    const pinned: BaselineFixture = { ...SAMPLE, ourType: 'DESCRIPTION', status: 'known-misroute' };
    const note = progressNote(pinned, { jarType: 'SEQUENCE', ourType: 'SEQUENCE' });
    expect(note).toContain('[FIXED]');
    expect(note).toContain('STALE');
    expect(checkNoNewMisroute(pinned, { jarType: 'SEQUENCE', ourType: 'SEQUENCE' }).ok).toBe(true);
  });

  it('a misroute that moves to a different wrong engine is [CHANGED], not a regression', () => {
    const pinned: BaselineFixture = { ...SAMPLE, ourType: 'DESCRIPTION', status: 'known-misroute' };
    const note = progressNote(pinned, { jarType: 'SEQUENCE', ourType: 'JSON' });
    expect(note).toContain('[CHANGED]');
    expect(note).not.toContain('[FIXED]');
  });

  it('a misroute that has not moved is reported as neither', () => {
    const pinned: BaselineFixture = { ...SAMPLE, ourType: 'DESCRIPTION', status: 'known-misroute' };
    expect(progressNote(pinned, { jarType: 'SEQUENCE', ourType: 'DESCRIPTION' })).toBeUndefined();
  });

  it('the bucket table counts each jar->ours pair, ordered by size', () => {
    const table = bucketTable([
      { jarType: 'SEQUENCE', ourType: 'DESCRIPTION' },
      { jarType: 'SEQUENCE', ourType: 'DESCRIPTION' },
      { jarType: 'CLASS', ourType: 'SEQUENCE' },
    ]);
    expect(table).toContain('SEQUENCE -> DESCRIPTION: 2');
    expect(table).toContain('CLASS -> SEQUENCE: 1');
    expect(table.indexOf('SEQUENCE -> DESCRIPTION')).toBeLessThan(table.indexOf('CLASS ->'));
    expect(table).toContain('3 disagreeing');
  });

  it('recognises the version-banner error page, whole text element only', () => {
    const banner =
      '<text x="5" y="17" fill="#33FF02" font-size="12" font-style="italic">' +
      'PlantUML version $version$ / $git.commit.id$ [Unknown compile time]</text>';
    expect(isJarErrorPage(banner)).toBe(true);
    // The same phrase INSIDE a longer label is a diagram, not a banner.
    expect(isJarErrorPage('<text x="5">Upgrade to PlantUML version 1.2024 [see wiki] now</text>')).toBe(false);
  });

  it('recognises the crash page, and does not fire on a label that merely mentions it', () => {
    expect(isJarErrorPage('<text x="5" y="14">An error has occurred : java.lang.NullPointerException</text>')).toBe(
      true,
    );
    expect(isJarErrorPage('<text x="5">Retry when An error has occurred : then log</text>')).toBe(false);
  });

  it('a plain diagram with no root attribute is NOT an error page', () => {
    expect(isJarErrorPage('<svg width="10"><text x="5">Alice</text><text x="5">Bob</text>')).toBe(false);
  });

  const JAR_ERROR_SAMPLE: BaselineFixture = {
    ...SAMPLE,
    type: 'class',
    jarType: 'NONE',
    ourType: 'CLASS',
    jarErrored: true,
    status: 'jar-error',
  };

  it('a jar-error pin whose golden is still an error page passes', () => {
    expect(
      checkJarErrorClassification(JAR_ERROR_SAMPLE, {
        jarType: 'NONE',
        ourType: 'CLASS',
        jarErrored: true,
      }).ok,
    ).toBe(true);
  });

  it('a jar-error pin whose golden stopped erroring FAILS, so a jar fix is never silent', () => {
    const { ok, message } = checkJarErrorClassification(JAR_ERROR_SAMPLE, {
      jarType: 'CLASS',
      ourType: 'CLASS',
      jarErrored: false,
    });
    expect(ok).toBe(false);
    expect(message).toContain('NO LONGER an upstream error page');
    expect(message).toContain('branch-probe');
  });

  it('an agree pin whose golden IS an error page fails, naming it', () => {
    const { ok, message } = checkJarErrorClassification(SAMPLE, {
      jarType: 'NONE',
      ourType: 'NONE',
      jarErrored: true,
    });
    expect(ok).toBe(false);
    expect(message).toContain('IS an upstream error page');
    expect(message).toContain('jarErrored: true');
  });

  it('a known-misroute pin whose golden IS an error page fails too', () => {
    const pinned: BaselineFixture = { ...SAMPLE, status: 'known-misroute', ourType: 'CLASS' };
    expect(
      checkJarErrorClassification(pinned, {
        jarType: 'NONE',
        ourType: 'CLASS',
        jarErrored: true,
      }).ok,
    ).toBe(false);
  });

  it('an absent fixture is left to the completeness gate rather than failed twice', () => {
    expect(checkJarErrorClassification(JAR_ERROR_SAMPLE, undefined).ok).toBe(true);
  });

  it('a document with no root attribute reads as NONE, and one with it reads that value', () => {
    expect(diagramTypeOf('<svg xmlns="http://www.w3.org/2000/svg" width="10">')).toBe('NONE');
    expect(diagramTypeOf('<svg data-diagram-type="SEQUENCE" width="10">')).toBe('SEQUENCE');
  });
});
