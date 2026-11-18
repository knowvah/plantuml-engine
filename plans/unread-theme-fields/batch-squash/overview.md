# Squash

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T3 | Collapse the mission into one commit on the base | orchestrator | branch history | T2 | [x] |

## T3

`<base>` is the mission base sha named in the execution prompt.

1. Record each batch's close sha in the journal, then run `git tag unread-theme-fields/pre-squash`.
2. Build one commit with `git commit-tree` from the final tree, with `<base>` as its only parent. Move the branch to it
   with `git merge --ff-only` or `git reset --soft`. Never `rebase -r`.
3. Verify that `git diff unread-theme-fields/pre-squash HEAD` is empty and `git rev-list --count <base>..HEAD` prints 1.
4. Write the message in Conventional Commits, lines ≤80, for example
   `refactor(theme): drop the unread business actor/usecase fills`.
   - The body explains why: the maintainer ruled option #1 on #156; upstream has no such field, the business symbols
     read their signature's `BackGroundColor` (`EntityImageDescription.java:163-165`), as ours has since dss T3a; the
     public `Theme` type loses two members (CHANGELOG, Removed). Name any filed follow-ons.
   - The footer says `Refs: #156`, not `Closes`: the issue closes when the branch merges.
   - End with the harness's `Co-Authored-By` trailer.
5. Leave the commit unsigned, and do not push. Keep `commit.gpgsign` as it is.

## Acceptance
- Given the squash, then `git diff unread-theme-fields/pre-squash HEAD` is empty, and exactly one commit sits on
  `<base>`.

Observability is N/A. Rollback is Reversible (`unread-theme-fields/pre-squash`).
