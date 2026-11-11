# ebnf-engine-port (eep)

**Read first, every start and after every compaction:**
`~/.claude/docs/reference/autonomous-execution.md`, then this file, then [decisions.md](decisions.md), then
[task-contract.md](task-contract.md), then the current batch's `overview.md`. Tail
[decision-journal.md](decision-journal.md) for where you stopped.

Source: GitHub issue #125. Planned unattended on 2026-11-10 at `feature/parity-queue` `3deca6c92`.

## Objective

Port `net/sourceforge/plantuml/ebnf/` (33 files, 3,967 Java lines) file for file into `src/diagrams/ebnf/` (D1),
with the four upstream seams it needs at their own upstream homes (D3), and register it at `PSystemBuilder.java:196`.
Take the **44 `@startebnf` rows** to conformant or a named end (D8), author probes past them (D7), and pin everything
in a new `svg-ebnf` ratchet (D9). The five regex-only tiles are ported here too, because `regexdiagram/` imports them
and #126 is blocked by this issue (D4). Lose no conformant row in any engine, and regenerate `docs/parity-report.md`.

## Starting state, measured 2026-11-10 on `3deca6c92`

No plugin registers `EBNF`: every `@startebnf` source gets the "unknown diagram type" sentinel. All 44 rows are in the
**`ebnf`** bucket (`test-results/dot-cache/ebnf/`, `parity-ebnf.json`), and no other bucket opens a block with
`@startebnf`. `measurements/ebnf-rows.mjs` finds them (`measurements/planning-rows.json`):

| Rows | Oracle | Verdict today | First diff |
|---|---|---|---|
| 43 | the jar draws `data-diagram-type="EBNF"` | 43 diverged | `svg/@background` |
| 1 | `ladifa-97-keme950`: jar error page, line 5 `Syntax Error? (Assumed diagram type: ebnf)`: `?t? = 'chaud';` starts with `?`, which neither rule command's ID accepts (`oracle/goldens/stock-error-pages.json`) | diverged | `error-page` |

The routing baseline pins the 43 drawn rows `known-misroute`, `ourType: NONE`, and `ladifa` `jar-error`. The refusal
baseline lists 43 `ok` and 1 `jar-error`, all `engine: none`. `ladifa` is also a signed "jar errors, we draw" entry in
`oracle/accepted-divergences.json`, and the issue asks for a `needs-ruling` issue once the engine draws it (D8).
Overall: 5,423 conformant, 111 structural-match, 390 diverged, 3 oracle-error, of 5,927; `ebnf` 0 / 0 / 44.

**Outside the bucket:** `class/vamero-64-fore412` embeds `{{ebnf rep = {c}; }}` in a component, and is
`structural-match` today (`EmbeddedDiagram.ts:290` already maps `{{ebnf`). The `regex` bucket (46 rows, all diverged)
does not move: no regex factory is registered until #126.

**Feature census of the 44** (sources matching): `"…"` terminals 30, `|` 21, `(* *)` comments 20, `[ ]` 18, `{ }` 15,
`'…'` terminals 10, `title` 8, `? ?` special sequences 6, a rule spanning lines 6, `n * x` 5, `!pragma` 3 (all
`compact`), chrome 2, `scale`, `<style>`, `}-` once each, `-` (except) and notes 0. 19 sources are 3 lines long; the
longest is 46.

**Upstream tests:** none beyond `DiagramTypeTest.java`. **23 planning probes** are in [probes/](probes/), rendered
with `scripts/oracle-render.sh` on 2026-11-10 into `/tmp/eep-plan/oracle`. 18 draw `EBNF`; `cov-embedded` draws a
`SEQUENCE` with the EBNF inside a note; 4 are jar error pages: `cov-empty` (Welcome page), `cov-no-equals`
(`Syntax Error?`), `cov-unparsable` (`Unparsable expression`) and `cov-unterminated` (a Java `IllegalStateException`
crash page). T4b re-renders them into `tests/fixtures/ebnf/`.

"Status" says what planning established. **Read** means planning read the Java. **Probe** means a jar render on
2026-11-10 showed it. Every task still opens the Java itself and finds the line.

| What the jar does | Java | Status | Task |
|---|---|---|---|
| `PSystemEbnf extends TitledDiagram`; each rule is an `EbnfExpression`, stacked by `mergeTB(…, LEFT)`, then `addBackcolor(result, null)`; no rules draws `EbnfEngine.syntaxError` | `PSystemEbnf.java:100-111` | Read | T3b |
| A rule: `TitleBox` (bold name) over the drawing with `withMargin(main, 0, 0, 10, 15)`; a comment above or below the name is a `FloatingNote` merged `CENTER` | `EbnfExpression.java:150-170` | Read + Probe (`cov-comment-above-below`) | T3a |
| Standalone `(* … *)`, multi-line `(* … *)` and `(** … **)`: notes through `addNote`, `FloatingNote` with `withMargin(f, 0, 0, 5, 15)` | `UBrexCommandComment`, `CommandCommentMultilines{,2}`, `PSystemEbnf.java:85-93` | Read + Probe (`cov-comment-standalone`) | T3b |
| Tokens: `-` NOT, letters/digits/`-`/`_` LITERAL, `*` REPETITION_SYMBOL, `,` `|` `=` `( ) [ ] { }`, `}-`, `;` or `\0` ends; `"…"`, `'…'`, `?…?` read to the same separator and `protect("")` gives `" "`; any other character clears every token | `EbnfExpression.java:69-131` | Read | T3a |
| An unparsable rule is `Unparsable expression`, a jar error page | `PSystemEbnf.java:76-80` | Read + Probe (`cov-unparsable`) | T3b |
| A rule that parses but builds no single tile draws the text `Syntax error!` in the diagram, not an error page | `EbnfEngine.java:141-152`, `EbnfExpression.java:150-173` | Read + Probe (`cov-syntax-error`, 100 × 49) | T3a |
| An unterminated string reads past the end: `CharInspectorImpl#jump` throws `IllegalStateException`, a crash page | `EbnfExpression.java` `readString`, `utils/CharInspectorImpl.java` `jump` | Read + Probe (`cov-unterminated`) | T1a, T3a |
| `a = ;` draws an `ETileEmpty` between the two circles | `EbnfExpression.java:158-160` | Read + Probe (`cov-empty-rule`, 81 × 60) | T2a, T3a |
| Operator precedence through `ShuntingYard`; comments inside a rule become `COMMENT_ABOVE`/`COMMENT_BELOW` on the tile at the top of the stack | `ShuntingYard.java`, `EbnfEngine.java:154-170` | Read + Probe (`cov-inline-comments`) | T3a |
| `n * x` is `ETileOneOrMore` labelled `n×` at `bigger(-2)`; `0 * x` wraps it in `ETileOptional2` | `EbnfEngine.java:99-106` | Read + Probe (`cov-repetition-symbol`) | T3a |
| Box: text + 10 each way, `rounded(10)`; style `root, element, ebnf` | `ETileBox.java:107-195`, `ETile.java` `getStyleSignature` | Read | T2a |
| `!option useDescriptiveNames true` renames a terminal `.`, `\d`, `\w` … through `I18n` (`AnyChar`, `Digit`; with `!option language fr`, `ToutCaractère`, `Chiffre`) | `ETileBox.java:78-90, 258-264`, `utils/I18n.java:61-82` | Read + Probe (`cov-descriptive-names{,-fr}`) | T1a, T2a |
| Start and end circles `SIZE = 8`, `deltax = 30`, stroke 1.5 / 2 / 1, arrows by `drawHlineDirected(…, 0.5, 25)` | `ETileWithCircles.java:49-80` | Read | T2b |
| `!pragma compact` is read into `isCompact` and never used | `PSystemEbnf.java:75`, `EbnfExpression.java:61-70` | Read + Probe (`cov-compact`) | T3a |
| Empty `@startebnf`: the Welcome page | factory empty-diagram path | Probe (`cov-empty`) | T3b |
| Title, caption, legend, header, footer, `scale`, `<style>`, handwritten through `TitledDiagram`; document background style name `ebnf` | `TitledDiagram.java`, `DiagramType.java:280-281` | Probe (`cov-chrome-all`, `cov-scale-2`, `cov-style-ebnf`, `cov-mode-dark`) | T4a, T4b |

## Branch

`feature/parity-queue`, the one branch every queue mission stacks on, already checked out by the driver. T0 commits
this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees** (D11). Do not create another
branch or merge main into this one. The squash batch collapses the mission to **one commit** on the mission base sha
named in the execution prompt, and tags `ebnf-engine-port/pre-squash`. Never push: the user reviews, signs and pushes.

## Quality gates (all at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

`npm test`, never `vitest run tests/unit`. New exports need `npm run catalog` (drift-gated). A `vitest run <paths>`
that collects nothing exits 0: read the count. The baseline on `3deca6c92` is in [decisions.md](decisions.md#baseline).
Stay on graphviz 16.1.0 (`dot -V`); EBNF never calls `dot`, but other engines' gates do.

## Measurement commands

Tools are under `plans/ebnf-engine-port/measurements/`, adapted from nwp's, plus `verdict-diff.mjs` from
`plans/description-divergence-drive/measurements/`. Run with `node` or `npx jiti`. Type commands literally: the
allowlist has no `bash plans/...`, `date`, or shell-variable prefixes. Producers run **alone**
(`.claude/memory/parallel-surveys-fake-timeouts.md`). Never `cd` below the repo root.

- Survey, always with `--out`: `npm run svg:survey -- ebnf --out /tmp/eep-<task>/parity-ebnf.json`. A positional
  type with no `--out` clobbers `parity.json`.
- `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base> /tmp/eep-<task>`: exit 1 on a row that
  left conformant. `node plans/ebnf-engine-port/measurements/survey-moves.mjs /tmp/eep-b0/parity-ebnf.json /tmp/eep-<task>/parity-ebnf.json`:
  every moved row.
- `node plans/ebnf-engine-port/measurements/ebnf-rows.mjs /tmp/eep-<task> --json /tmp/eep-<task>/rows.json`: the 44
  rows with oracle kind, verdict and first diff, and a count.
- `npx jiti plans/ebnf-engine-port/measurements/row-diffs.mts plans/ebnf-engine-port/measurements/planning-rows.json /tmp/eep-<task>/diffs.json [slug ...]`:
  every diff, and our SVG beside the JSON.
- `npx jiti plans/ebnf-engine-port/measurements/fixtures.mts [slug ...]`: every `tests/fixtures/ebnf/<slug>.puml`
  against its `<slug>.svg`, one line each.
- `npx jiti plans/ebnf-engine-port/measurements/pin-ebnf.mts [--write]`: pin candidates, from T5 on.
- `npx jiti plans/ebnf-engine-port/measurements/build-authored-baseline.mts <commit> [--write]` and
  `build-diff-baseline.mts <commit> [--write]`: the authored and jar-error baselines, from T5 on.
- `npm run svg:survey`, then `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`: every
  engine, at batch close from batch 4. Exit 1 on a loss.
- `scripts/oracle-render.sh <out-dir> <puml...>` for an oracle, never a hand-typed `java -jar`.

## Stop conditions (halt, journal, report)

1. A conformant row leaves conformant and you cannot state its mechanism with `file:line`.
2. A ratchet pin would have to rise, or `--accept-rises` looks necessary.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D13: amend `decisions.md` with the date, then halt.

A row that needs a ruling is **not** a stop: it goes on a `needs-ruling` issue naming the row, and everything else
finishes. `oracle/accepted-divergences.json` gains or changes no acceptance here; the one move D8 allows is retiring
`ladifa`. A file outside a task's write-set is not a stop: change it and journal why.

## Push-forward (decide, journal, continue)

- Reordering tasks, merging two that turn out to share a mechanism, or splitting one that runs past about 15 minutes.
- A residual diff on these rows or fixtures: read the Java and fix it in the task that owns it, or add a task.
- More authored `.puml` fixtures and oracles where a branch has no row.
- Helper splits forced by the 500-line, NLOC, CCN or parameter hooks (D12).
- Rerunning a timed-out vitest or survey at lower load before calling it a finding.
- Fixing an adjacent defect a probe exposes in a shared klimt module (`Opale`, `SheetBlock2`, `TextBlockUtils`,
  `UPath`), with its Java quote. A gain in another bucket counts for that bucket's issue: T6 comments there, or leaves
  the text in `.agent-notes/` if the comment is denied.

## Blast radius

**Data model:** none. **API:** no public change; `dist/*.d.ts` checked at T6. `block-extractor.ts#DiagramType` gains
`'ebnf'`; it is internal, and `plantuml-ts` has no consumers. **Dependencies:** none; EBNF never reaches graphviz or
dot-engine. **SVG output** changes on purpose for `@startebnf` and `{{ebnf}}`. **Shared seams:** `core/utils/BlocLines.ts`
gains `inspector()`; `core/assemble-svg.ts` gains `EBNF` on the titled path; `core/block-extractor.ts`,
`core/document-back-color.ts` and `registered-plugins.ts` gain a row each; `tests/architecture/layering.test.ts` gains
one allowlist entry (D3).

| File | Action | Task |
|---|---|---|
| `src/core/utils/{CharInspector,CharInspectorImpl,I18n,i18n-bundles}.ts`, `src/core/utils/BlocLines.ts` | Create, Modify | T1a |
| `src/core/command/UBrexCommandMultilines2.ts` | Create | T1b |
| `src/diagrams/activity/ftile/vcompact/FloatingNote.ts`, `tests/architecture/layering.test.ts` | Create, Modify | T1c |
| `src/diagrams/ebnf/{ETile,CornerCurved,Zigzag,Brace,TextBlockable,ETileEmpty,ETileBox,TitleBox}.ts` | Create | T2a |
| `src/diagrams/ebnf/{ETileConcatenation,ETileAlternation,ETileOptional2,ETileOneOrMore,ETileZeroOrMore,ETileNot,ETileWithCircles}.ts` | Create | T2b |
| `src/diagrams/ebnf/{ETileOptional,ETileNamedGroup,ETileRegexGroup,ETileRegexGroupAllBut,ETileLookAheadOrBehind}.ts` | Create | T2c |
| `src/diagrams/ebnf/{Symbol,Token,ShuntingYard,EbnfEngine,EbnfExpression}.ts` | Create | T3a |
| `src/diagrams/ebnf/{PSystemEbnf,PSystemEbnfFactory,CommandEBnfSingleLine,UBrexCommandEbnfMultilines,UBrexCommandComment,CommandCommentMultilines,CommandCommentMultilines2,CommandNoteMultilines}.ts`, `ebnf-skin-param.ts` | Create | T3b |
| `src/diagrams/ebnf/index.ts`, `src/registered-plugins.ts`, `src/core/{block-extractor,document-back-color,assemble-svg}.ts` | Create, Modify | T4a |
| `tests/unit/ebnf/**`, `tests/unit/core/**` for the T1 seams | Create | T1a to T4a |
| `tests/fixtures/ebnf/**` | Create | T4b |
| `src/diagrams/ebnf/**`, shared klimt modules a residual reaches | Modify | T4c |
| `oracle/accepted-divergences.json` (retire `ladifa` only, D8) | Modify | T4a |
| `oracle/goldens/svg-ebnf/**`, `tests/oracle/svg-conformance/{ebnf.golden.ratchet.test.ts,ebnf.diff-baseline.ratchet.test.ts,render-fixture-ebnf.ts}` | Create | T5 |
| `oracle/goldens/svg-conformance/{routing,refusal}-baseline.json`, their count tests | Modify | T5 |
| `scripts/parity-dashboard-goldens.ts`, `scripts/parity-dashboard-notes.ts`, `docs/parity-report.md`, `tests/oracle/svg-conformance/parity-*.json`, `census-ebnf.json`, `DIVERGENCES.md`, `planning/next-missions.md`, `planning/mission-guide.md`, `docs/catalog.md` | Modify | T4a to T6 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0 — brief and baseline](batch-0/overview.md) | T0 | [x] |
| [1 — upstream seams](batch-1/overview.md) | T1a, T1b, T1c | [x] |
| [2 — railroad tiles](batch-2/overview.md) | T2a, T2b, T2c | [x] |
| [3 — expression, diagram, commands](batch-3/overview.md) | T3a, T3b | [x] |
| [4 — turn on, probes, residuals](batch-4/overview.md) | T4a, T4b, T4c | [x] |
| [5 — ratchet](batch-5/overview.md) | T5 | [x] |
| [exit](batch-exit/overview.md) | T6 | [x] |
| [squash](batch-squash/overview.md) | T7 | [x] |

## Done when (issue #125)

- [x] Every row in scope is conformant, or named in `DIVERGENCES.md` or `oracle/accepted-divergences.json` with its
  mechanism. *(44/44 conformant, journal 13, 16.)*
- [x] A new divergence has a forcing library or a signed ruling. A row that needs a ruling is on a `needs-ruling` issue.
  *(No divergence added; `ladifa` is on #166, journal 13.)*
- [x] `ladifa-97-keme950` re-rendered once the engine draws, and a `needs-ruling` issue asks the maintainer to re-sign
  or retire it, naming what the jar and the port now do (D8). *(#166, journal 13.)*
- [x] 0 conformant losses in every engine, baseline survey against final survey. *(journal 16, 18.)*
- [x] Conformant rows are pinned in a ratchet, and `docs/parity-report.md` is regenerated. *(journal 17, 19.)*
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass. *(journal 19.)*

## Summary (2026-11-10)

**Tasks:** 13 of 13 planned (T0, T1a-c, T2a-c, T3a-b, T4a-c, T5, T6), plus T7's squash. Each ran in the main
checkout, one commit per task and batch close, history under `ebnf-engine-port/pre-squash`.

**Port:** `src/diagrams/ebnf/` holds all 32 upstream classes, the five regex-only tiles included (D4), plus four
port-only helpers (`ebnf-skin-param.ts`, `ebnf-klimt.ts`, `ebnf-common-commands.ts`, `ebnf-style-dispatch.ts`). The
seams went to their upstream homes (D3): `CharInspector`/`CharInspectorImpl`/`BlocLines#inspector`, `I18n` and its
eight bundles in `src/core/utils/`, `UBrexCommandMultilines2` in `src/core/command/`, `FloatingNote` in
`src/diagrams/activity/ftile/vcompact/`, and `UText#getDescent`/`#calculateDimension`. Every command runs inside
`ProtectedCommand`, as `AbstractDiagram` does (journal 11).

**Verdicts:** `ebnf` 0 / 0 / 44 → **44 / 0 / 0**; `class` 833 / 20 / 21 → 834 / 19 / 21 (`vamero-64-fore412`).
Overall 5,423 / 111 / 390 / 3 → **5,468 / 110 / 346 / 3** of 5,927, 0 lost in any engine.

**Pins:** 43 rows in `oracle/goldens/svg-ebnf/ratchet.json`, `ladifa` by score in `diff-baseline.json`, 70 authored
fixtures in `authored-baseline.json` (64 zero-diff, 6 jar-error pairs). Routing: agree 10,453 → 10,539, misroutes
296 → 253. Refusal: erroring 316 → 317, rendering 10,595 → 10,637.

**Rows left and their ends:** none open. `ladifa-97-keme950` and six authored fixtures are jar error pages where we
also error (D8 end 2); `ladifa`'s old acceptance is retired pending #166.

**Gates:** every batch close green (journal 5, 9, 12, 16, 18, 19); the last run is in journal 19.

**Unposted:** the #126 and #136 comments (including #136's "Blocked by #166") were denied by the session's permission
classifier; their text is in `.agent-notes/eep-T6.md`.

**CI risk:** low. The latest PR run (42708661656) took 8 min 7 s on its slowest shards (3 and 4). The routing,
refusal and both ebnf ratchet files run in 4.2 s locally (236 tests), and the 70 fixtures add no `npm test` cost
beyond the authored-baseline file.

## Documents

- [decisions.md](decisions.md) — D1 to D13, operational readiness, baseline.
- [task-contract.md](task-contract.md) — what every task does and how it closes.
- [decision-journal.md](decision-journal.md) — appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).
- [probes/](probes/) — the 23 planning probe sources.
- [measurements/](measurements/) — the tools above and `planning-rows.json`.

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief (`node`, `npx jiti`,
`npm`, `scripts/oracle-render.sh`, `gh issue`); it was deliberately not regenerated (the SessionStart hook compares it
with the live `.claude/settings.json`).
