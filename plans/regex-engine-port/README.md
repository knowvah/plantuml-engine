# regex-engine-port (rep)

**Read first, every start and after every compaction:**
`~/.claude/docs/reference/autonomous-execution.md`, then this file, then [decisions.md](decisions.md), then
[task-contract.md](task-contract.md), then the current batch's `overview.md`. Tail
[decision-journal.md](decision-journal.md) for where you stopped.

Source: GitHub issue #126. Planned unattended on 2026-11-10 at `feature/parity-queue` `e19963225`.

## Objective

Port `net/sourceforge/plantuml/regexdiagram/` (10 files, 1,317 Java lines) file for file into `src/diagrams/regex/`
(D1), on the railroad tiles eep already ported in `src/diagrams/ebnf/`, and register it at `PSystemBuilder.java:197`.
Take the **46 `@startregex` rows** to conformant or a named end (D8), author probes past them (D6), and pin everything
in a new `svg-regex` ratchet (D7). Lose no conformant row in any engine, and regenerate `docs/parity-report.md`.

## Starting state, measured 2026-11-10 on `e19963225`

No plugin registers `REGEX`: every `@startregex` source gets the "unknown diagram type" sentinel. All 46 rows are in the
**`regex`** bucket (`test-results/dot-cache/regex/`, `parity-regex.json`), and no other cached source opens
`@startregex` or embeds `{{regex`. `measurements/regex-rows.mjs` finds them (`measurements/planning-rows.json`):

| Rows | Oracle | Verdict today | First diff |
|---|---|---|---|
| 44 | the jar draws `data-diagram-type="REGEX"` | 44 diverged | `svg/@background` |
| 2 | `bakuza-41-bulo451`, `tajefa-31-pefi801`: jar error page, line 2 `Error parsing: Bad quantifier {([^{}`; both signed "jar errors, we draw" in `oracle/accepted-divergences.json` (D8) | 2 diverged | `error-page` |

Overall: 5,468 conformant, 110 structural-match, 346 diverged, 3 oracle-error, of 5,927; `regex` 0 / 0 / 46.

**Feature census of the 46** (sources): every source is 3 to 5 lines with one regex line, except `codoju-71-buko966`
(three regex lines, two of them `language de` and `useDescriptiveNames true`, which are regex text, D4). Groups `[…]`
in 21, alternation in 12, named groups or lookarounds in 6, braced quantifiers in 2, `title` in 4, `!option` in 3,
`!theme` once; no `scale`, `<style>`, `skinparam`, caption, legend, header or footer. The longest line is 1,498
characters (`zobaxa-88-gedu220`).

**Upstream tests:** none beyond `DiagramTypeTest.java`. **38 planning probes** are in [probes/](probes/), rendered with
`scripts/oracle-render.sh` on 2026-11-10 into `/tmp/rep-plan/oracle`: 26 draw `REGEX`, `cov-embedded` draws a
`SEQUENCE`, and 12 are jar error pages (D5). T3b copies them into `tests/fixtures/regex/`.

"Status" says what planning established. **Read** means planning read the Java. **Probe** means a jar render on
2026-11-10 showed it. Every task still opens the Java itself and finds the line.

| What the jar does | Java | Status | Task |
|---|---|---|---|
| Each source line not taken by a common command is its own regex, parsed onto one shared stack; only the top tile is drawn, at `(5, 5)`, sized `+10` | `CommandRegexfSingleLine.java`, `PSystemRegex.java:110-128` | Read + Probe (`cov-multi-line`, 96 × 89) | T2a, T2b |
| Tile style is merged in the constructor after `StyleExtractor#applyStyles` (`skin`, `<style>`), before any `skinparam` runs | `PSystemRegex.java:82-97` | Read + Probe (`cov-skinparam`, `cov-style-regex`, `cov-style-element`, `cov-theme`) | T2a |
| Tokenizer: 20 branches in a fixed order; `(?#…)` dropped; posix `[[:x:]]`, `\0nnn`, `\uXXXX`, `\p{…}`/`\x{…}` are `CLASS`; `\A \Z \z \G \b \B ^ $` are `ANCHOR` | `RegexExpression.java:45-112` | Read | T1a |
| Implicit concatenation, then a shunting yard; lookarounds and named groups pop when their `)` closes | `PSystemRegex.java:180-189`, `ShuntingYard.java:50-100`, `ReTokenType.java:58-74` | Read | T1b, T2a |
| Adjacent `TERMINAL_STRING1` boxes merge into one box | `PSystemRegex.java:324-366` | Read + Probe (`cov-merge-boxes`) | T2a |
| `{0,}` = `*`, `{0,1}` = `?`, `{0,N}` = optional around labelled one-or-more, `{N…}` = labelled one-or-more | `PSystemRegex.java:235-305` | Read + Probe (`cov-braced-all`) | T2a |
| `[^…]` is `ETileRegexGroupAllBut`, else `ETileRegexGroup`, split by `GroupSplitter` | `PSystemRegex.java:196-202`, `GroupSplitter.java` | Read | T1b, T2a |
| `!option useDescriptiveNames` / `language` rename `CLASS` and `ANCHOR` boxes through `I18n` | `ETileBox` (eep), `PSystemRegex.java:191-194` | Probe (`cov-descriptive-names{,-fr}`, `bafake-97`, `tuxova-21`) | T2a, T3a |
| `RegexParsingException` → `Error parsing: …`; any other throw → `ProtectedCommand`'s message; an empty stack → a crash page; empty → Welcome | `PSystemRegex.java:172-174`, `ProtectedCommand.java` | Read + Probe (12 error probes) | T2a, T2b |
| Title, caption, legend, header, footer, `scale`, handwritten through `TitledDiagram`; document style name `regex` | `TitledDiagram.java`, `DiagramType.java:283-284` | Probe (`cov-chrome-all`, `cov-scale-2`, `cov-mode-dark`) | T3a, T3b |
| `{{regex}}` inside another diagram | `EmbeddedDiagram` | Probe (`cov-embedded`, 361 × 233) | T3a |

## Branch

`feature/parity-queue`, the one branch every queue mission stacks on, already checked out by the driver. T0 commits
this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees** (D10). Do not create another
branch or merge main into this one. The squash batch collapses the mission to **one commit** on the mission base sha
named in the execution prompt, and tags `regex-engine-port/pre-squash`. Never push: the user reviews, signs and pushes.

## Quality gates (all at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

`npm test`, never `vitest run tests/unit`. New exports need `npm run catalog` (drift-gated). A `vitest run <paths>`
that collects nothing exits 0: read the count. The baseline on `e19963225` is in [decisions.md](decisions.md#baseline).
Stay on graphviz 16.1.0 (`dot -V`); regex never calls `dot`, but other engines' gates do.

## Measurement commands

Tools are under `plans/regex-engine-port/measurements/`, adapted from eep's, plus `verdict-diff.mjs` from
`plans/description-divergence-drive/measurements/`. Run with `node` or `npx jiti`. Type commands literally: the
allowlist has no `bash plans/...`, `date`, or shell-variable prefixes. Producers run **alone**
(`.claude/memory/parallel-surveys-fake-timeouts.md`). Never `cd` below the repo root.

- Survey, always with `--out`: `npm run svg:survey -- regex --out /tmp/rep-<task>/parity-regex.json`. A positional
  type with no `--out` clobbers `parity.json`.
- `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base> /tmp/rep-<task>`: exit 1 on a row that
  left conformant. `node plans/regex-engine-port/measurements/survey-moves.mjs /tmp/rep-b0/parity-regex.json /tmp/rep-<task>/parity-regex.json`:
  every moved row.
- `node plans/regex-engine-port/measurements/regex-rows.mjs /tmp/rep-<task> --json /tmp/rep-<task>/rows.json`: the 46
  rows with oracle kind, verdict and first diff, and a count.
- `npx jiti plans/regex-engine-port/measurements/row-diffs.mts plans/regex-engine-port/measurements/planning-rows.json /tmp/rep-<task>/diffs.json [slug ...]`:
  every diff, and our SVG beside the JSON.
- `npx jiti plans/regex-engine-port/measurements/fixtures.mts [slug ...]`: every `tests/fixtures/regex/<slug>.puml`
  against its `<slug>.svg`, one line each.
- `npx jiti plans/regex-engine-port/measurements/pin-regex.mts [--write]`: pin candidates, from T4 on.
- `npx jiti plans/regex-engine-port/measurements/build-authored-baseline.mts <commit> [--write]` and
  `build-diff-baseline.mts <commit> [--write]`: the authored and jar-error baselines, from T4 on.
- `npm run svg:survey`, then `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`: every
  engine, at batch close from batch 3. Exit 1 on a loss.
- `scripts/oracle-render.sh <absolute-out-dir> <puml...>` for an oracle, never a hand-typed `java -jar`.

`row-diffs.mts`, `fixtures.mts`, `pin-regex.mts` and the two baseline builders import `render-fixture-regex.ts`, which
T4 creates; before T4, run them only after creating that file early (T3a may), or use `renderSync` directly.

## Stop conditions (halt, journal, report)

1. A conformant row leaves conformant and you cannot state its mechanism with `file:line`.
2. A ratchet pin would have to rise, or `--accept-rises` looks necessary.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D13: amend `decisions.md` with the date, then halt.

A row that needs a ruling is **not** a stop: it goes on a `needs-ruling` issue naming the row, and everything else
finishes. `oracle/accepted-divergences.json` gains or changes no acceptance here; the only moves D8 allows are retiring
bakuza and tajefa. A file outside a task's write-set is not a stop: change it and journal why.

## Push-forward (decide, journal, continue)

- Reordering tasks, merging two that turn out to share a mechanism, or splitting one that runs past about 15 minutes.
- A residual diff on these rows or fixtures: read the Java and fix it in the task that owns it, or add a task.
- More authored `.puml` fixtures and oracles where a branch has no row.
- Helper splits forced by the 500-line, NLOC, CCN or parameter hooks (D11).
- Rerunning a timed-out vitest or survey at lower load before calling it a finding.
- Fixing an adjacent defect a probe exposes in a tile (D13) or a shared klimt module, with its Java quote. A gain in
  another bucket counts for that bucket's issue: T5 comments there, or leaves the text in `.agent-notes/` if denied.

## Blast radius

**Data model:** none. **API:** no public change; `dist/*.d.ts` checked at T5. `block-extractor.ts#DiagramType` gains
`'regex'`; it is internal, and `plantuml-ts` has no consumers. **Dependencies:** none; regex never reaches graphviz or
dot-engine. **SVG output** changes on purpose for `@startregex` and `{{regex}}`. **Shared seams:**
`src/diagrams/json/StyleExtractor.ts` may gain `applyStyles` (D3); `core/assemble-svg.ts` gains `REGEX` on the titled
path; `core/block-extractor.ts`, `core/document-back-color.ts` and `registered-plugins.ts` gain a row each;
`tests/architecture/layering.test.ts` gains two allowlist entries (D1, D3). `src/diagrams/ebnf/` changes only under D13.

| File | Action | Task |
|---|---|---|
| `src/diagrams/regex/{ReTokenType,ReToken,RegexParsingException,RegexExpression}.ts` | Create | T1a |
| `src/diagrams/regex/{ShuntingYard,GroupSplitter}.ts` | Create | T1b |
| `src/diagrams/regex/{PSystemRegex,regex-skin-param}.ts`, `src/diagrams/json/StyleExtractor.ts`, `tests/architecture/layering.test.ts` | Create, Modify | T2a |
| `src/diagrams/regex/{CommandRegexfSingleLine,PSystemRegexFactory,regex-common-commands,regex-style-dispatch}.ts` | Create | T2b |
| `src/diagrams/regex/index.ts`, `src/registered-plugins.ts`, `src/core/{block-extractor,document-back-color,assemble-svg}.ts` | Create, Modify | T3a |
| `oracle/accepted-divergences.json` (retire bakuza and tajefa only, D8) | Modify | T3a |
| `tests/unit/regex/**` | Create | T1a to T3a |
| `tests/fixtures/regex/**` | Create | T3b |
| `src/diagrams/regex/**`, a tile or klimt module a residual reaches | Modify | T3c |
| `oracle/goldens/svg-regex/**`, `tests/oracle/svg-conformance/{regex.golden.ratchet.test.ts,regex.diff-baseline.ratchet.test.ts,render-fixture-regex.ts}` | Create | T4 |
| `oracle/goldens/svg-conformance/{routing,refusal}-baseline.json`, their count tests, `scripts/parity-dashboard-goldens.ts` | Modify | T4 |
| `scripts/parity-dashboard-notes.ts`, `docs/parity-report.md`, `tests/oracle/svg-conformance/parity-*.json`, `census-regex.json`, `DIVERGENCES.md`, `planning/next-missions.md`, `planning/mission-guide.md`, `docs/catalog.md` | Modify | T3a to T5 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0 — brief and baseline](batch-0/overview.md) | T0 | [x] |
| [1 — tokens and operator order](batch-1/overview.md) | T1a, T1b | [x] |
| [2 — diagram, command, factory](batch-2/overview.md) | T2a, T2b | [x] |
| [3 — turn on, probes, residuals](batch-3/overview.md) | T3a, T3b, T3c | [x] |
| [4 — ratchet](batch-4/overview.md) | T4 | [x] |
| [exit](batch-exit/overview.md) | T5 | [x] |
| [squash](batch-squash/overview.md) | T6 | [x] |

## Done when (issue #126)

- [x] Every row in scope is conformant, or named in `DIVERGENCES.md` or `oracle/accepted-divergences.json` with its
  mechanism.
- [x] A new divergence has a forcing library or a signed ruling. A row that needs a ruling is on a `needs-ruling` issue.
- [x] bakuza and tajefa re-rendered once the engine draws, and a `needs-ruling` issue asks the maintainer to re-sign or
  retire each, naming what the jar and the port now do (D8); neither re-signed here.
- [x] 0 conformant losses in every engine, baseline survey against final survey.
- [x] Conformant rows are pinned in a ratchet, and `docs/parity-report.md` is regenerated.
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass.

## Documents

- [decisions.md](decisions.md) — D1 to D13, operational readiness, baseline.
- [task-contract.md](task-contract.md) — what every task does and how it closes.
- [decision-journal.md](decision-journal.md) — appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).
- [probes/](probes/) — the 38 planning probe sources.
- [measurements/](measurements/) — the tools above and `planning-rows.json`.

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief (`node`, `npx jiti`,
`npm`, `scripts/oracle-render.sh`, `gh issue`); it was deliberately not regenerated (the SessionStart hook compares it
with the live `.claude/settings.json`).

## Summary (2026-11-10)

**Tasks:** T0–T5 done as planned (T6, the squash, follows); no task added, none split. T3a pulled forward three pieces
of later tasks (the probe copy from T3b, `render-fixture-regex.ts` and the refusal re-pin from T4), as the brief allows.

**Verdicts:** `regex` 0 / 0 / 46 → **46 / 0 / 0**; no other bucket moved. Overall 5,468 / 110 / 346 / 3 →
**5,514 / 110 / 300 / 3** of 5,927. `verdict-diff` against `e19963225`: lost 0. 44 rows byte-identical and pinned in
`svg-regex`; bakuza and tajefa are jar error pages where we also error, pinned by score (D8 end 2).

**Authored:** 94 fixtures in `tests/fixtures/regex/` (38 planning probes, 46 for D6, 10 layer-crossing probes): 74 at 0
diffs, 20 jar error pages where we also error (D8 end 2; error-page text is not a target, D5). Every fixture the jar
draws is at 0.

**Rows left:** none open. bakuza-41-bulo451 and tajefa-31-pefi801 end as error pairs; their signed acceptances moved to
`retired`, unsigned, and **#167** (`needs-ruling`) asks the maintainer to confirm (journal 13).

**Gates (final, journal 21):** `npm test -- --maxWorkers=4`, typecheck, lint, build, format:check all exit 0;
`dist/*.d.ts` byte-identical to a build of the base.

**Decisions to review:** D2 clarified (journal 5: `regex-skin-param.ts` re-exports ebnf's `SkinParam`, which the tiles
type nominally); `applyStyles` added to `StyleExtractor.ts` on helpers moved from `json-skin-param.ts` (journal 6);
`PreprocessorResult.warnings` (journal 12, a shared preprocessor change); bakuza/tajefa pinned `known-gap` in the
refusal baseline because the gate's 4096-byte head misses their banner (journal 14, the wbs precedent).

**Follow-ons:** `planning/next-missions.md` "regex-engine-port (rep)". Issue comments for #126 and #136 were denied:
the text is in `.agent-notes/rep-T5.md`, with #136's "Blocked by #167" line.

**CI risk:** the last PR run (42708661656) took 8 m 07 s on its slowest shard (shard 3); its `vitest-blob-*` artifacts
have expired, so the routing/refusal part times cannot be read. This mission adds 44 golden twins to each of the
routing and refusal gates (+0.4 % of 10,998 rows) and two ratchet files that run in 0.6 s locally.

