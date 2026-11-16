# Squash

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T3 | Collapse the mission into one commit on the base | orchestrator | branch history | T2 | [x] |

## T3

`<base>` is the mission base sha named in the execution prompt.

1. Record each batch's close sha in the journal, then run `git tag usecase-title-style/pre-squash`.
2. Build one commit with `git commit-tree` from the final tree, with `<base>` as its only parent. Move the branch to it
   with `git merge --ff-only` or `git reset --soft`. Never `rebase -r`.
3. Verify that `git diff usecase-title-style/pre-squash HEAD` is empty and `git rev-list --count <base>..HEAD` prints 1.
4. Write the message in Conventional Commits, lines ≤80, for example
   `fix(description): sign a use case's title style as the jar does`.
   - The body explains why: upstream builds `EntityImageDescription` for a use case (`GeneralImageBuilder.java:169-175`;
     `EntityImageUseCase` is never constructed), so its border reads `{…, usecase, title}` on the entity's builder
     (`EntityImageDescription.java:142-153`, `Entity.java:755-767`). Ours read the dead class: no `title`, last builder.
   - The footer says `Refs: #148`, not `Closes`: the issue closes when the branch merges.
   - End with the harness's `Co-Authored-By` trailer.
5. Leave the commit unsigned, and do not push. Keep `commit.gpgsign` as it is.

## Acceptance
- Given the squash, then `git diff usecase-title-style/pre-squash HEAD` is empty, and exactly one commit sits on
  `<base>`.

Observability is N/A. Rollback is Reversible (`usecase-title-style/pre-squash`).
