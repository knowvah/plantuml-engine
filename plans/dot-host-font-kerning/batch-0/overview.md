# Batch 0: brief, baseline

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the start, re-measure both rows | orchestrator | this brief, `.agent-notes/dhk-planning.md` | — | [x] |

## T0

`<base>` is the mission base sha named in the execution prompt.

```sh
git status --porcelain   # only plans/dot-host-font-kerning/ and .agent-notes/dhk-planning.md may appear
git branch --show-current   # must print feature/parity-queue
dot -V   # must print 16.1.1
git config --worktree commit.gpgsign false
git add plans/dot-host-font-kerning .agent-notes/dhk-planning.md
git commit -m "docs(dhk): add the dot-host-font-kerning brief"
node -p "new Date().toISOString()"   # journal row 1: the mission start
mkdir -p /tmp/dhk/src /tmp/dhk/oracle
cp test-results/dot-cache/dot/quoted-labels/in.puml /tmp/dhk/src/quoted-labels.puml
cp test-results/dot-cache/dot/skinparam-font-color/in.puml /tmp/dhk/src/skinparam-font-color.puml
PLANTUML_SECURITY_PROFILE=INSECURE scripts/oracle-render.sh /tmp/dhk/oracle /tmp/dhk/src/quoted-labels.puml
PLANTUML_SECURITY_PROFILE=INSECURE scripts/oracle-render.sh /tmp/dhk/oracle /tmp/dhk/src/skinparam-font-color.puml
npx tsx plans/dot-host-font-kerning/measurements/measure-accepted.mts /tmp/dhk/oracle /tmp/dhk/src
```

- If `git config --worktree` is refused or is already `false` at worktree scope, journal that and carry on. dogr row 1
  had the same case.
- The measurer must print `quoted-labels diffs=18 score=18` and `skinparam-font-color diffs=17 score=17`, each with
  `rx-ours=[40.09,39.58] rx-jar=[39.58,39.58]`. Any other result is README stop 1.
- Each oracle must contain exactly one `class="edge"` group and no `syntax error` text
  (`grep -c 'class="edge"' /tmp/dhk/oracle/*.svg`). Otherwise re-render it alone (D4).

Batch 0 closes with the gates in the README. The planning baseline ran only `npm test` and `lint` (journal row 0), so
this is the first run of typecheck, build and `format:check` on the base.

## Acceptance
- Given the driver has checked out `feature/parity-queue`, when T0 finishes, then `git log -1` is the brief commit,
  and journal row 1 holds the start time.
- Given fresh single-file INSECURE oracles, when `measure-accepted.mts` runs, then it prints 18/18 and 17/17.

Observability is N/A: there are no new observable operations. Rollback is Reversible.
