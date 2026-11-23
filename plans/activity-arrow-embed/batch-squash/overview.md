# Squash

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T6 | Collapse the mission into one commit on the base | orchestrator | branch history | T5 | [x] |

## T6

`<base>` is the mission base sha named in the execution prompt.

1. Record each batch's close sha in the journal, then run `git tag activity-arrow-embed/pre-squash`.
2. Build one commit with `git commit-tree` from the final tree, with `<base>` as its only parent. Move the branch to it
   with `git merge --ff-only` or `git reset --soft`. Never `rebase -r`.
3. Verify that `git diff activity-arrow-embed/pre-squash HEAD` is empty and `git rev-list --count <base>..HEAD`
   prints 1.
4. Write the message in Conventional Commits, lines ≤80, for example
   `fix(activity): place a {{ }} arrow label as the jar's snake does`.
   - The body explains why: `FtileFactoryDelegator.java:103-112` builds the arrow label through `create7`, and
     `Snake.java:250` centres it on the block's own dimension; state T1's mechanism in one or two lines, then one line
     per consumer that now reads it.
   - The footer says `Refs: #188`, not `Closes`: the issue closes when the branch merges.
   - End with the harness's `Co-Authored-By` trailer.
5. Leave the commit unsigned, and do not push. Keep `commit.gpgsign` as it is.

## Acceptance
- Given the squash, then `git diff activity-arrow-embed/pre-squash HEAD` is empty, and exactly one commit sits on
  `<base>`.

Observability N/A. Rollback Reversible (`activity-arrow-embed/pre-squash`).
