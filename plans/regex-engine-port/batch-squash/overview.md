# Squash

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T6 | Collapse the mission to one commit on the base | orchestrator | branch history | T5 | [x] |

## T6

`<base>` is the mission base sha named in the execution prompt.

1. Record each batch's close sha in the journal, then `git tag regex-engine-port/pre-squash`.
2. Build one commit with `git commit-tree` from the final tree, with `<base>` as its only parent, and move the branch to
   it with `git merge --ff-only` or `git reset --soft`. Never `rebase -r`.
3. Verify `git diff regex-engine-port/pre-squash HEAD` is empty and `git rev-list --count <base>..HEAD` prints 1.
4. The message follows Conventional Commits, lines ≤80, no attribution, for example
   `feat(regex): port the regex engine from upstream`. The body explains why, and the footer says `Refs: #126`, not
   `Closes`: the issue closes when the branch merges.
5. Leave it unsigned and do not push. The user reviews the branch, signs all its commits together, and pushes. Keep
   `commit.gpgsign` as T0 set it for the next mission.

## Acceptance
- Given the squash, then `git diff regex-engine-port/pre-squash HEAD` is empty and exactly one commit sits on `<base>`.

Observability: N/A — no new observable operations. Rollback: Reversible (`regex-engine-port/pre-squash`).
