# dot-host-font-kerning (dhk)

**At every start and after every compaction, read these first:**
1. `~/.claude/docs/reference/autonomous-execution.md`
2. this file
3. [decisions.md](decisions.md)
4. [task-contract.md](task-contract.md)
5. the current batch's `overview.md`

Then tail [decision-journal.md](decision-journal.md) to see where you stopped.

**Source:** GitHub issue #186, which carries the maintainer's ruling (2026-11-16, option 1). Planned unattended on
2026-11-21 at `feature/parity-queue` `613a61649`.

## Objective

Two `@startdot` rows, `dot/quoted-labels` and `dot/skinparam-font-color`, differ from the jar only because the oracle
host's graphviz measures `Node A` with pango and Times New Roman's kern pairs (space + `A`). dot-engine's LUT measurer
stores per-glyph advances only. The ruling makes this a library-forced host-font divergence. The mission:

1. **pins** both rows in the svg-dot ratchet as `accepted` rows. Their score is held, they must keep diverging, and each
   must name its ledger entry (D2).
2. **signs** both rows in `oracle/accepted-divergences.json`, with `surveyBlind` (D3).
3. **records** the divergence in `DIVERGENCES.md` under "DOT-passthrough diagrams" (D5).

No `src/` change and no dot-engine change (D1).

## Starting state, measured 2026-11-21 on `613a61649`

- graphviz **16.1.1**, dot-engine **2.12.3**. The #186 evidence was taken on 16.1.0. Re-measured on 16.1.1 with
  [measure-accepted.mts](measurements/measure-accepted.mts) against single-file INSECURE renders: `quoted-labels`
  diffs 18, score 18; `skinparam-font-color` diffs 17, score 17. Node `a` has `rx` 40.09 in ours and 39.58 in the
  jar. Native `dot` equals the jar. The mechanism is unchanged.
- **Ratchet:** 60 pinned (52 zero-diff, 8 jar error pages). Neither #186 row is pinned.
- **Survey blind spot:** since the a720bdd re-pin (cfb9ecd55), `test-results/dot-cache/dot/*/in.svg` holds LEGACY
  captures. Every drawn row is `PSystemDot`'s "This feature has been suppressed" page, so `parity-dot.json` reads
  62/62 `conformant`, and `plans/dot-oracle-gap-rows/measurements/measure-rows.mts` reports these rows as zero-diff
  jar error pages. **Do not use either one to measure.** Use `measure-accepted.mts` (D3, D4).
- **Gate twins:** each row has one `dot-cache`/`dot` twin in `routing-baseline.json` (`agree`) and in
  `refusal-baseline.json` (`ok`), measured 2026-11-03. Neither row has a `goldens`/`svg-dot` twin yet.

## Branch

`feature/parity-queue` is the one branch every queue mission stacks on, and the driver has already checked it out.
- T0 commits this brief.
- One unsigned commit per task, in the main checkout, serially, with no worktrees (D6).
- Do not create another branch, and do not merge main into this one.
- Batch-squash collapses the mission into **one commit** on the mission base sha named in the execution prompt, and
  tags `dot-host-font-kerning/pre-squash`.
- Never push. The user reviews, signs and pushes.

## Quality gates (all of them at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

- Run `npm test`, never `vitest run tests/unit`.
- A `vitest run <paths>` that collects nothing exits 0, so read the count.
- `docs/parity-report.md` carries the svg-dot pinned count from `ratchet.json`, and its drift gate fails until
  `npm run parity:dashboard` is re-run (dogr journal row 5). `npm run svg:dashboard` rewrites `PARITY-SVG.md`,
  including the ledger table.
- Never write under `src/`, `tests/` or `docs/` while a gate is running.
- `npm run codeql` is not needed: this mission neither opens a PR nor pushes.

## Measurement commands

Type every command literally. Run producers **alone**, and never `cd` below the repo root.

- **Oracle, one row per run:** `PLANTUML_SECURITY_PROFILE=INSECURE scripts/oracle-render.sh /tmp/dhk/oracle <one.puml>`.
  Never pass two `@startdot` files in one run (D4).
- **The two rows:** `npx tsx plans/dot-host-font-kerning/measurements/measure-accepted.mts /tmp/dhk/oracle /tmp/dhk/src`,
  where `/tmp/dhk/src/<slug>.puml` is the cache's `in.puml`.
- **Dot ratchet:** `npx vitest run tests/oracle/svg-conformance/dot.golden.ratchet.test.ts`.
- **Native graphviz probe (evidence only, never an oracle):** `dot -Tsvg` on a row's DOT body.

## Stop conditions (halt, journal, report)

1. A measured score is not 18 and 17, and you cannot state why with `file:line`. Example: graphviz is not 16.1.1, or
   node `a`'s `rx` gap is no longer the only source of the diffs.
2. Any change under `src/` would be needed, or a write to `@knowvah/dot-engine`, `~/git/graphviz` or `~/git/plantuml`
   (D1; CLAUDE.md "Writing and write-sets").
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D6. Append a dated line to `decisions.md`, then halt.
5. A verdict moves in any row other than these two, or another pinned golden or baseline row has to change beyond the
   additive twins and counts.
6. The native `dot` probe no longer equals the jar's SVG. The ruling's premise has changed.

**These are not stops:**
- A file outside a task's write-set inside this repository. Change it and journal why.
- A running count in a test (routing/refusal totals, `pinnedAgree`, `pinnedRendering`) that moves by the 2 twins. Update
  it with a dated `dhk/T1` derivation comment in the test's existing pattern.
- Prose in `oracle/goldens/svg-dot/README.md` or the ratchet test header that the new row kind makes stale.

## Batches

| Batch | Tasks | Status |
|---|---|---|
| [batch-0](batch-0/overview.md) | T0: commit the brief, baseline, re-measure | [x] |
| [batch-1](batch-1/overview.md) | T1: pin the two rows as accepted, and sign them; T2: DIVERGENCES.md and docs | [x] |
| [batch-exit](batch-exit/overview.md) | T3: verify that no verdict moved, close-out | [x] |
| [batch-squash](batch-squash/overview.md) | T4: collapse to one commit | [x] |

## Index

- [decisions.md](decisions.md): D1 ruling, D2 to D6, auto-confirmed record
- [task-contract.md](task-contract.md): steps every task follows, batch close
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md)
- [measurements/measure-accepted.mts](measurements/measure-accepted.mts)
- [decision-journal.md](decision-journal.md)
- `.agent-notes/dhk-planning.md`: the planning observations (cache drift, multi-file oracle corruption)

## Mission summary (2026-11-21)

- **Tasks:** T0 to T3 done as planned; T4 (squash) follows. No `src/` change, and no dot-engine change.
- **Result:** `svg-dot/quoted-labels` (18 diffs, score 18) and `svg-dot/skinparam-font-color` (17/17) are pinned as
  `accepted` ratchet rows (corpus 60 -> 62), signed in the ledger with `surveyBlind`, and recorded in DIVERGENCES.md.
  The routing and refusal baselines gain 2 twins each.
- **Decisions journalled** (rows 1 to 6): the gpgsign config change was refused, but worktree scope already read false;
  the ledger was text-spliced; `docs/parity-report.md` moved into T1 to keep that commit green; PARITY-SVG.md was
  regenerated at batch 0 for pre-existing drift (ee541a778); a 1-line stale graphviz version in the svg-dot README was
  fixed; T2's "PARITY-SVG ledger lists the entries" acceptance cannot hold under the generator's design. None needs a
  ruling.
- **Gates:** green at every batch close (latest: 50709 tests passed, coverage 96.99/92.57/97.48/98.03).
- **Follow-ups:** the dot survey is blind to drawn rows (LEGACY captures), and the PARITY-SVG ledger join matches
  nothing (`.agent-notes/dhk-T3.md`).
