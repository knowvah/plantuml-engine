# Squash

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T4 | Collapse the mission into one commit on the base | orchestrator | branch history | T3 | [x] |

## T4

`<base>` is the mission base sha named in the execution prompt.

1. Record each batch's close sha in the journal, tick T4 in this file and the README, commit, then run
   `git tag legacy-partition-link/pre-squash`.
2. Build one commit with `git commit-tree` from the final tree, with `<base>` as its only parent. Move the branch to it
   with `git reset --soft <squash>` on a clean tree (`git merge --ff-only` cannot apply: the squash is not a
   descendant of HEAD). Never `rebase -r`.
3. Verify that `git diff legacy-partition-link/pre-squash HEAD` is empty and `git rev-list --count <base>..HEAD`
   prints 1.
4. Write the message in Conventional Commits, lines ≤80, for example
   `fix(activity-legacy): draw a link to a partition through its cluster`.
   - The body explains why: the jar routes a group end to the `zaent` special point inside the cluster
     (`ClusterDotString.java:148-149`, `Bibliotekon.java:135`) and clips the spline to the cluster box
     (`SvekEdge.java:671-672`); the swimlane wrapper branch in the shared core; the fixtures added; any follow-on
     filed.
   - The footer says `Refs: #157`, not `Closes`: the issue closes when the branch merges.
   - End with the harness's `Co-Authored-By` trailer.
5. Leave the commit unsigned, and do not push. Keep `commit.gpgsign` as it is.

## Acceptance
- Given the squash, then `git diff legacy-partition-link/pre-squash HEAD` is empty, and exactly one commit sits on
  `<base>`.

Observability is N/A. Rollback is Reversible (`legacy-partition-link/pre-squash`).
