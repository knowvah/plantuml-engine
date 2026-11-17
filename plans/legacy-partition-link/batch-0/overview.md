# Batch 0: brief, baseline, oracles

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the start, render the oracles | orchestrator | this brief, `/tmp/lpl-oracle/` | none | [x] |

## T0

`<base>` is the mission base sha named in the execution prompt.

```sh
git status --porcelain   # only plans/legacy-partition-link/
git branch --show-current   # must print feature/parity-queue
git config --worktree --get commit.gpgsign   # must print false; if not, set it
git add plans/legacy-partition-link
git commit -m "docs(lpl): add the legacy-partition-link brief"
node -p "new Date().toISOString()"   # journal row 1: the mission start
```

Render each oracle alone, one out dir per slug:

```sh
scripts/oracle-render.sh /tmp/lpl-oracle/partition-link tests/fixtures/activity-legacy/partition-link.puml
scripts/oracle-render.sh /tmp/lpl-oracle/partition-link-to-partition plans/legacy-partition-link/fixtures/partition-link-to-partition.puml
```

and the same for the other nine `fixtures/*.puml`. Check that each out dir holds `<slug>.svg` and `svek-1.dot`, that
`/tmp/lpl-oracle/partition-link/partition-link.svg` equals the committed
`tests/fixtures/activity-legacy/partition-link.svg` (`cmp`), and journal any DOT that differs from what the README and
D5 quote (push-forward 3).

The every-engine baseline is the committed `tests/oracle/svg-conformance/parity-*.json` at `<base>`.
`verdict-diff.mjs` reads it from the ref, so T0 needs no survey.

Batch 0 closes with the README gates. `typecheck`, `build` and `format:check` were not run at planning, so this is
their first run on the base.

## Acceptance
- Given the driver has checked out `feature/parity-queue`, when T0 finishes, then `git log -1` is the brief commit and
  journal row 1 holds the start time.
- Given the 11 sources, when rendered, then `/tmp/lpl-oracle/<slug>/` holds one SVG and one `svek-1.dot` each.

Observability is N/A: there are no new observable operations. Rollback is Reversible.
