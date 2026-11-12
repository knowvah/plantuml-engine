# Squash

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T6 | Collapse the mission to one commit on the base | orchestrator | branch history | T5 | [x] |

## T6

`<base>` is the mission base sha named in the execution prompt.

1. Record each batch's close sha in the journal, then run `git tag chen-eer-engine-port/pre-squash`.
2. Build one commit with `git commit-tree` from the final tree, with `<base>` as its only parent. Move the branch to it
   with `git merge --ff-only` or `git reset --soft`. Never `rebase -r`.
3. Verify that `git diff chen-eer-engine-port/pre-squash HEAD` is empty and that `git rev-list --count <base>..HEAD`
   prints 1.
4. Write the message in Conventional Commits, with lines ≤80 and no attribution, for example
   `feat(cheneer): port the chen eer engine from upstream`. The body explains why. The footer says `Refs: #133`, not
   `Closes`, because the issue closes when the branch merges.
5. Leave it unsigned and do not push: the user reviews the branch, signs all its commits together, and pushes. Keep
   `commit.gpgsign` as T0 set it, for the next mission.

## Acceptance
- Given the squash, then `git diff chen-eer-engine-port/pre-squash HEAD` is empty, and exactly one commit sits on
  `<base>`.

Observability is N/A: there are no new observable operations. Rollback is Reversible (`chen-eer-engine-port/pre-squash`).
