# Squash

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T5 | Collapse the mission into one commit on the base | orchestrator | branch history | T4 | [x] |

## T5

`<base>` is the mission base sha named in the execution prompt.

1. Record each batch's close sha in the journal, then run `git tag legacy-activity-elk/pre-squash`.
2. Build one commit with `git commit-tree` from the final tree, with `<base>` as its only parent. Move the branch to it
   with `git merge --ff-only` or `git reset --soft`. Never `rebase -r`.
3. Verify that `git diff legacy-activity-elk/pre-squash HEAD` is empty and `git rev-list --count <base>..HEAD`
   prints 1.
4. Write the message in Conventional Commits, lines ≤80, for example
   `feat(activity-legacy): lay out !pragma layout elk with the elk maker`.
   - The body explains why: the jar picks `CucaDiagramFileMakerElk` for a diagram with the pragma
     (`CucaDiagram.java:478-479`) and never runs the activity simplifier on that path; we laid it out with
     dot-engine. Name the adapter, the no-fallback rule, the rows pinned and any issues filed.
   - The footer says `Refs: #158`, not `Closes`: the issue closes when the branch merges.
   - End with the harness's `Co-Authored-By` trailer.
5. Leave the commit unsigned, and do not push. Keep `commit.gpgsign` as it is.

## Acceptance
- Given the squash, then `git diff legacy-activity-elk/pre-squash HEAD` is empty, and exactly one commit sits on
  `<base>`.

Observability is N/A. Rollback is Reversible (`legacy-activity-elk/pre-squash`).
