# Squash

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T4 | Collapse the mission into one commit on the base | orchestrator | branch history | T3 | [x] |

## T4

`<base>` is the mission base sha named in the execution prompt.

1. Record each batch's close sha in the journal, then run `git tag dot-oracle-gap-rows/pre-squash`.
2. Build one commit with `git commit-tree` from the final tree, with `<base>` as its only parent. Move the branch to it
   with `git merge --ff-only` or `git reset --soft`. Never `rebase -r`.
3. Verify that `git diff dot-oracle-gap-rows/pre-squash HEAD` is empty, and that
   `git rev-list --count <base>..HEAD` prints 1.
4. Write the message in Conventional Commits, with lines ≤80, for example
   `test(dot): pin the 55 #109 dot rows and diagnose the node a width`.
   - The body explains why: #109 captured oracles no gate held; 8 of them are jar error pages held under the
     2026-10-10 rule; T2's outcome in one line.
   - The footer says `Refs: #141`, not `Closes`, because the issue closes when the branch merges.
   - End with the harness's `Co-Authored-By` trailer.
5. Leave the commit unsigned, and do not push. The user reviews the branch, signs all its commits together, and pushes.
   Keep `commit.gpgsign` as T0 set it, for the next mission.

## Acceptance
- Given the squash, then `git diff dot-oracle-gap-rows/pre-squash HEAD` is empty, and exactly one commit sits on
  `<base>`.

Observability is N/A: there are no new observable operations. Rollback is Reversible
(`dot-oracle-gap-rows/pre-squash`).
