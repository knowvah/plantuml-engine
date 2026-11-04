# Decisions — oracle-gap-capture

## Auto-confirmed (unattended)

Planned with `/plan-mission --unattended next`, which resolved to #109. Nobody reviewed these. Each
records the rejected options and the evidence so the user can audit it. Trial data is in
`measurements/trial-rows.json`: every row rendered by the pinned jar one JVM per fixture, then the
pin tool's `--dry`, the survey, the census and the oracle tests over a throwaway copy.

### D1 — The mechanism: no capture pass could select these rows

- **Mechanism:** every pass admits a fixture only when two independent classifiers agree, and these
  rows lost one of the two. The jar was never asked about most of them, or was asked and its answer
  matched no pass.
- **Origin, three selection paths:**
  - class, component, usecase, state, object read the manifest, filtered by jar stamp:
    `scripts/dot-sync-report.ts:297-303` (`if (!slugs.has(f.slug)) { skipped.push(...)`) with
    `EXPECTED_TAG` at `scripts/dot-parity-rows.ts:43-49`.
  - sequence (g1h T0) and activity (aoh T0, add4 T0b) read `tests/corpus/<type>/`, not the manifest.
    That tree comes from `scripts/populate-corpus.py`, whose `r"--|>"` at line 22 is an unescaped
    alternation: it sends any line holding `--` or `>` to `class`.
  - dot, hcl and yaml hold manifest rows no pass ever read. `oracle-freshness.test.ts` says the dot
    cache "gates nothing". The yaml `-N` rows are per-block splits by `classify-corpus.ts`; the cache
    holds the whole-file form.
- **Causal chain:** a fixture labelled `sequence` by `classify-corpus.ts`, with `A --> B`, went to
  `tests/corpus/class/`. The sequence pass never saw it. The class pass reads `class.json`, not that
  directory, so nothing rendered it. Rows the jar stamped differently from their manifest bucket were
  dropped by the filter with no other pass to catch them.
- **Measured:** of the 238 rows in the filtered buckets, 1 carries its bucket's tag (0 of 50 class,
  0 of 82 component, 0 of 96 usecase, 0 of 6 state, 1 of 4 object). Of 332 activity rows, 291 are
  ACTIVITY by the jar, 285 of those in `tests/corpus/class/` and 6 absent from the corpus. Of 373
  sequence rows, 63 are SEQUENCE, 39 in `tests/corpus/class/` and 24 absent.
- **Not traced:** `object/robitu-34-vupe367` carries its bucket's tag and still has no cache row. T4b
  reads why it errors on our side; why the filter dropped it is not established.
- **Ruled out:**
  - The jar cannot draw them: 1,015 of 1,016 wrote one usable SVG, none timed out, none is non-XML.
    `xobebi-29-jilu859` wrote two pages (D4).
  - A deliberate exclusion: no list exists. The nearest, the sequence admission gate (g1h D3
    amendment), rejected 285 candidates by jar stamp and recorded no destination for them.
  - An oracle elsewhere: 7 match an `oracle/goldens` source by markup and 0 by slug; those are
    different slugs, so they are captured. 2 hcl slugs exist in `tests/fixtures/hcl/` with different
    source (D6).
  - Stale manifests: 4,830 of 4,839 covered rows match their cached source. The other 9 are
    `colour`→`color` normalisation from `434e805dc` or a stray trailing token. Recorded in T9's note.

### D2 — Rows land by the jar's type, not the manifest's bucket

`routeBucket(manifestBucket, jarType, jarErrored)`, a pure function:

| Condition | Bucket | Why |
|---|---|---|
| manifest bucket is `dot`, `hcl` or `yaml` | that bucket | its `@start` keyword decided it, not a guess |
| manifest bucket is `object` and jar type is CLASS | `object` | `EXPECTED_TAG.object`: no separate engine upstream (`ClassDiagramFactory.java`) |
| jar error page | `unknown` | the accounting bucket; existing rows live there |
| jar type SEQUENCE, ACTIVITY, CLASS, STATE, TIMING | that bucket | the bucket's engine |
| anything else (DESCRIPTION, no type) | `unknown` | |

Trial placement: activity 429, unknown 223, class 151, sequence 94, dot 57, state 26, timing 19,
hcl 12, yaml 4, object 1.

- **Evidence:** existing buckets are homogeneous by jar type (sequence 1143 of 1143 SEQUENCE, object
  80 of 80 CLASS, usecase 94 of 94 DESCRIPTION) and `unknown` already holds every mix (285 CLASS,
  225 DESCRIPTION, 76 none, 21 error pages). The census forces an engine by bucket
  (`scripts/svg-conformance-census.ts:181-192`), so 310 non-SEQUENCE rows in `sequence` would be
  measured through `parseSequence`. Precedents: the routing baseline's "Corpus directory names are
  NOT the oracle (D6)", the g1h D3 amendment, and aepp/T1e moving two teoz rows by jar stamp.
- **Consequence:** the dashboard's `corpus` column (manifest) and `oracle` column (cache) differ
  further. T8 says so on the page. The issue's per-manifest table is replaced by per-bucket counts.
- **Rejected:** the manifest bucket, which puts 310 non-SEQUENCE rows in `sequence` and corrupts its
  census, as above. Rewriting the manifests to match the jar: six consumers read them and
  `classify-corpus.ts` would undo it. DESCRIPTION rows to `component`: no basis for component over
  usecase, and #113 already owns `unknown` DESCRIPTION rows.

### D3 — The gate: coverage by slug across every bucket, with a reasons file

`scripts/lib/oracle-coverage.ts` is pure over manifest rows, oracle slugs and reasons.
`tests/oracle/svg-conformance/oracle-coverage.test.ts` runs it on the real trees. An oracle is any
`test-results/dot-cache/<bucket>/<slug>/` with `.done`, `in.puml` and `in.svg`, the shape
`listFixtureDirs` requires. A reason is an entry in `oracle/no-oracle-reasons.json`, keyed
`<manifest bucket>/<slug>`, and must name what the jar did. The test fails on a row with neither, and
on a stale reason (no such row, or the row has an oracle). Its failure message names the capture
command.

- **Evidence:** the issue's own definition is "under any bucket", and 210 covered rows sit outside
  their manifest bucket. #136 reads the same two lists.
- **Known limit:** a slug in two manifests (9 today, one of them with two different sources,
  `style-node-background`) passes once either has an oracle. D4 captures both; the gate cannot tell.
- **Rejected:** requiring the manifest bucket, which contradicts D2. Comparing markup, which fails 9
  covered rows on spelling, and is a different question.

### D4 — A new script stages the capture, then installs it

`scripts/capture-missing-oracles.ts`: `--stage <dir>` renders every coverage gap through
`oracle-render.sh` (one JVM per fixture, `runInPlainMinute`, cwd a scratch directory), classifies the
output, routes it (D2) into `<dir>/<bucket>/<slug>/` and writes `<dir>/capture-report.json`.
`--install <dir>` moves each row to `test-results/dot-cache/<bucket>/<slug>/` and records a clock row
for any clock-dependent source. `classifyOutput` also adopts `<name>.svg` beside `<name>_NNN.svg`.

- **Evidence:** `pin-corpus-tree.ts` measures every fixture in `--tree` and appends, so it needs a
  tree of only the new rows (add4 T0b used a staged copy). `scripts/oracle-render.sh` records a clock
  only for paths in `dot-cache`, so a staged render writes nothing and the install step owns it.
  `!pragma svek_trace on` writes `svek.svg` to the JVM's cwd (12 trial rows), which is the repo root
  under the existing script. The trial found no clock-reading source, by token only: T5's
  `capture-clock.test.ts` is the real check.
- **`xobebi-29-jilu859`:** `@startuml file4` plus `newpage` writes `file4.svg` and `file4_001.svg`.
  g1h left it uncaptured because `classifyOutput` calls that ambiguous. Pages are the jar's real
  output; other rows keep `in_NNN.svg` beside `in.svg` (4 existing files, 10 in the trial).
- **Rejected:** extending `capture-oracle-cache.ts`, whose unit is one manifest type written in place;
  a third mode would hide two control flows in one CLI. Rendering twice, once to learn the type and
  once in place: about 50 extra minutes.

### D5 — Pins stay additive, with an excuse that cites the Java

`pin-corpus-tree.ts` per bucket from the stage, excuses in new fragments
`tests/oracle/svg-conformance/unknown-ledger/ogc-T4{a,b,c}.json`. Its `checkAdditive` refuses a change
to an old row. Hard-coded counts in both gates are re-derived with a comment, never bumped.

- **Evidence:** the tool's `--dry` reports 193 rows needing an excuse: activity 128, unknown 41,
  timing 19, class 3, object 1, sequence 1. 113 of the activity rows use legacy `(*)` and 19 are
  timing, two uniform mechanisms (`PSystemBuilder.java:137`, `:187`). 24 of the unknown rows are jar
  error pages past the 4096-byte head window, the add4 precedent (`PSystemError.java:217-218`).
- **Rejected:** narrowing the walk, which both gates forbid in their failure text. `fix-candidate`
  rows and fixing the parser here: the issue says to count them.

### D6 — Grow the baselines the tests force, and only those

The merged-tree trial names them, and only these fail: routing and refusal completeness, activity text
and swimlane populations, json-family structural and positional, and the dashboard drift gate.

- Activity baselines gain rows by the add4 T0b route: seed `error` or `jar-error`, then
  `repin-activity-baselines.ts --write` promotes. Worked example: commit `a8d6b3b70`.
- json-family pins gain 16 rows with `plans/json-family-followons/tools/residue.mts`. Smetana paths:
  the delta is recorded, never chased (ruling 2026-08-09).
- `tests/fixtures/hcl/{array-values,function-call}` become `-authored`, because
  `json-family-structural.test.ts:51` forbids an authored slug colliding with a corpus row, and the two
  manifest rows hold different source.
- `oracle/goldens/stock-error-pages.json` is regenerated: without it the 74 new error rows are compared
  exactly and read diverged. It grows from 114 to 214 in the trial, dropping none.

- **Rejected:** seeding sequence, class or state baselines, which no test requires.

### D7 — New conformant rows are counted, not pinned

No ratchet changes. Each owning issue's done-when already says "conformant rows are pinned in a
ratchet", and T9 files issues for the buckets that have none.

- **Evidence:** the issue's done-when asks for capture, reasons and counts. Each family has its own
  pin tool and count tests, so pinning 554 rows is a mission of its own. Routing and refusal pin every
  new row today, so the gap is geometry only, and only until the owning issue runs.
- **Rejected:** pinning here, as add4 T0b did: add4 was an activity drive, and this mission touches ten
  buckets.

**Amended 2026-11-04 (T6):** "no ratchet changes" does not hold for activity. `activity.diff-baseline.ratchet.test.ts:540-546`
asserts that no `baseline` row has `diffCount: 0` ("a 0-diff entry is a promotion candidate, not a promotion"), so the 144 new
rows that render zero-diff must be frozen into the svg-activity golden ratchet with
`plans/activity-divergence-drive/tools/pin-goldens.mts`, which also clones them into the routing and refusal baselines. This is
the D6 worked example's own route (add4 T0b, `a8d6b3b70`, "11 zero-diff rows pinned"). Every other family keeps D7: counted,
not pinned.

### D8 — Counts go on the owning issue; a bucket with none gets a new one

`new-rows.mjs` assigns each new row a cohort and owner:

| Cohort | Owner |
|---|---|
| activity with legacy `(*)` | #123 |
| other activity | #121 |
| state | #112 |
| object | #115 |
| timing | #127 |
| unknown, jar DESCRIPTION | #113 |
| unknown, other | #119 |
| unknown, draws where the jar errors | new `needs-ruling` issue |
| sequence, class, dot, hcl + yaml | new `parity` + `queue:ready` issues |

- **Evidence:** the queue has no open sequence, class, dot, hcl or yaml issue. The 26 rows need the
  release-jar check and a signature (ruling 2026-10-10, signed per row), and the agent never decides a
  divergence alone. A `queue:ready` issue numbered after #136 needs a "Blocked by" line on #136, or
  the final check runs first.
- **Rejected:** one catch-all issue, which cannot be planned as one mission and hides engine ownership.
  Signing the 26 rows, which is reserved for the maintainer.

### D9 — Serial in the main checkout, one commit per task, one commit at the end

Each queue mission stacks on `feature/parity-queue` and collapses to one commit. T3 and the measure
runs must run alone. The only parallel step is T4a–c, three read-only adjudications writing three
different ledger files: subagents may do them, in this checkout, with no Serena edit tools.

- **Evidence:** batch 2 tasks all touch the cache or a baseline. The survey is load-sensitive. Worktrees
  lack gitignored `assets/stdlib`, `oracle/dist` and hooks.
- **Rejected:** worktrees and parallel capture: a shared `capture-clock.json`, and the known hazards.

## Operational readiness (auto-confirmed)

| Question | Answer |
|---|---|
| SLIs and alerts | None: developer tooling, no runtime operation. The new coverage test is the signal. |
| Traces and dashboards | N/A. `docs/parity-report.md` is regenerated; activity, class, sequence, state and unknown visibly fall. That is the point. |
| Rollback | **Reversible.** Revert the commit: the cache, pins and report go with it. No migration. |
| Scale | The committed cache grows from 84 MB by about 14 MB. Routing and refusal walk 8,735 rows today and 9,750 after, about 12% more. CI measured 277 s against a 600 s budget and a 12-minute step cap (`routing-conformance.test.ts:457-462`), and activity adds 429 per-fixture tests. **CI cannot be measured here (no push), so T10 flags it for the first PR run.** |
| Likely failures | Survey under load writes `timeout`: rerun alone. A new fixture with no oracle: the coverage test names it and the command. Stock jar absent: `run-stock-verify.mjs` says so and T7 stops. |
| Compatibility | No published API changes, nothing under `src/`. Manifests are untouched. |
