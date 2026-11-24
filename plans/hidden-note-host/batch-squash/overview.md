# Squash

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T4 | Collapse the mission into one commit on the base | orchestrator | branch history | T3 | [x] |

## T4

`<base>` is the mission base sha named in the execution prompt.

1. Record each batch's close sha in the journal, then run `git tag hidden-note-host/pre-squash`.
2. Build one commit with `git commit-tree` from the final tree, with `<base>` as its only parent. Move the branch to it
   with `git merge --ff-only` or `git reset --soft`. Never `rebase -r`.
3. Verify that `git diff hidden-note-host/pre-squash HEAD` is empty and `git rev-list --count <base>..HEAD`
   prints 1.
4. Write the message in Conventional Commits, lines ≤80, for example
   `fix(class): hide a note with its single-link host`.
   - The body explains why: upstream passes a note with one visible link the hidden flag of the entity at the other
     end (`CucaDiagram.java:778-794`, `:835-853`) and draws it under `UHidden` (`SvekResult.java:82-90`). We drew it
     in class, description and state. Name the three engines, the tips exception, the rows pinned and I1 to I7.
   - The footer says `Refs: #204`, not `Closes`: the issue closes when the branch merges.
   - End with the harness's `Co-Authored-By` trailer.
5. Leave the commit unsigned, and do not push. Keep `commit.gpgsign` as it is.

## Acceptance
- Given the squash, then `git diff hidden-note-host/pre-squash HEAD` is empty, and exactly one commit sits on `<base>`.

Observability is N/A. Rollback is Reversible (`hidden-note-host/pre-squash`).
