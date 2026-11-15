# Squash

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T5 | Collapse the mission into one commit on the base | orchestrator | branch history | T4 | [x] |

## T5

`<base>` is the mission base sha named in the execution prompt.

1. Record each batch's close sha in the journal, then run `git tag edge-label-embed/pre-squash`.
2. Build one commit with `git commit-tree` from the final tree, with `<base>` as its only parent. Move the branch to it
   with `git merge --ff-only` or `git reset --soft`. Never `rebase -r`.
3. Verify that `git diff edge-label-embed/pre-squash HEAD` is empty and `git rev-list --count <base>..HEAD` prints 1.
4. Write the message in Conventional Commits, lines ≤80, for example
   `fix(svek): draw a {{ }} edge label as an embedded diagram`.
   - The body explains why: `SvekEdge.java:299` builds every link label through `create0`, whose `CreoleParser`
     turns a `{{` line into an `EmbeddedDiagram` atom; state, description and legacy activity measured and drew it
     as text. One line per engine.
   - The footer says `Refs: #144`, not `Closes`: the issue closes when the branch merges.
   - End with the harness's `Co-Authored-By` trailer.
5. Leave the commit unsigned, and do not push. Keep `commit.gpgsign` as it is.

## Acceptance
- Given the squash, then `git diff edge-label-embed/pre-squash HEAD` is empty, and exactly one commit sits on `<base>`.

Observability is N/A. Rollback is Reversible (`edge-label-embed/pre-squash`).
