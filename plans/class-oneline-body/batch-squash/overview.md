# Squash

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T4 | Collapse the mission into one commit on the base | orchestrator | branch history | T3 | [x] |

## T4

`<base>` is the mission base sha named in the execution prompt.

1. Record each batch's close sha in the journal, then run `git tag class-oneline-body/pre-squash`.
2. Build one commit with `git commit-tree` from the final tree, with `<base>` as its only parent. Move the branch to it
   with `git merge --ff-only` or `git reset --soft`. Never `rebase -r`.
3. Verify that `git diff class-oneline-body/pre-squash HEAD` is empty and that `git rev-list --count <base>..HEAD`
   prints 1.
4. Write the message in Conventional Commits, lines ≤80, for example
   `fix(class): refuse a one-line classifier body as the jar does`.
   - The body explains why. `CommandCreateClass` takes only an empty `{ }` tail
     (`CommandCreateClass.java:117-119`), and `CommandCreateClassMultilines` opens only on a trailing `{` (`:140`). So
     the jar reports `Syntax Error?` on `class A { x : int }`. Our `extractBody` accepted any brace body and rule 7
     claimed the line. Name the rows pinned, the unit tests rewritten, and anything filed.
   - The footer says `Refs: #223`, not `Closes`: the issue closes when the branch merges.
   - End with the harness's `Co-Authored-By` trailer.
5. Leave the commit unsigned, and do not push. Keep `commit.gpgsign` as it is.

## Acceptance
- Given the squash, then `git diff class-oneline-body/pre-squash HEAD` is empty, and exactly one commit sits on
  `<base>`.

Observability is N/A. Rollback is Reversible (`class-oneline-body/pre-squash`).
