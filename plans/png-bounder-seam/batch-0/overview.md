# Batch 0 — brief and baseline

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the survey baseline | orchestrator | `plans/png-bounder-seam/**` | — | [x] |

## T0

1. Check that `git status` is clean apart from this brief, and that the branch is `feature/parity-queue` at the base sha
   named in the execution prompt.
2. Record the reference jar: `md5 -q oracle/dist/plantuml-oracle.jar` must print `7066a3b4e28e696791a4bfc617efd85f`.
   Run `git -C ~/git/plantuml rev-parse dot-output` (expect `eb0f3cff7df…`).
3. At `uptime` below about 10, run a bare `npm run svg:survey` alone. It rewrites the tracked
   `tests/oracle/svg-conformance/parity-*.json`. Then run `node plans/description-divergence-drive/measurements/verdict-diff.mjs
   HEAD`: it should list no moves, meaning the committed surveys are fresh, so `<base>` is the 0-losses base for every later
   `verdict-diff`. If rows moved, journal them as pre-existing drift (not this mission's), keep the list in
   `measurements/b0-drift.txt`, and restore the tracked files with `git checkout -- tests/oracle/svg-conformance/`.
4. Record #170's eight rows' verdicts and first diffs from the survey in the journal.
5. Commit `docs(pbs): add the png-bounder-seam mission brief` (`Refs: #170`).

## Acceptance

- Given the base sha, when T0 ends, then the brief is committed, the base survey's freshness is journaled, and the journal has
  row 1 with the eight rows' verdicts.
- Given the reference jar md5 differs from the brief's, then stop: the oracle is not the one this brief was planned
  against.

Observability: N/A, no new observable operations. Rollback: Reversible (revert the commit).
