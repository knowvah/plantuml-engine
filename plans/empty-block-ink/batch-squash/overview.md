# Squash

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T4 | Collapse the mission into one commit on the base | orchestrator | branch history | T3 | [x] |

## T4

`<base>` is the mission base sha named in the execution prompt.

1. Record each batch's close sha in the journal, then run `git tag empty-block-ink/pre-squash`.
2. Build one commit with `git commit-tree` from the final tree, with `<base>` as its only parent. Move the branch to it
   with `git merge --ff-only` or `git reset --soft`. Never `rebase -r`.
3. Verify that `git diff empty-block-ink/pre-squash HEAD` is empty and `git rev-list --count <base>..HEAD` prints 1.
4. Message in Conventional Commits, lines ≤80, for example
   `fix(json): end an empty block's ink at x+w-1 as LimitFinder does`.
   - The body explains why: the #187 ruling; the jar's `LimitFinder` records an empty block's rectangle only; the
     label half is a named Smetana delta.
   - Footer `Refs: #187`, not `Closes`: the issue closes when the branch merges.
   - End with the harness's `Co-Authored-By` trailer.
5. Leave the commit unsigned and do not push. Keep `commit.gpgsign` as it is.

## Acceptance

- Given the squash, then `git diff empty-block-ink/pre-squash HEAD` is empty and exactly one commit sits on `<base>`.

Observability is N/A. Rollback is Reversible (`empty-block-ink/pre-squash`).
