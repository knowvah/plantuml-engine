# Squash

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T6 | Collapse the mission into one commit on the base | orchestrator | branch history | T5 | [x] |

## T6

`<base>` is the mission base sha named in the execution prompt.

1. Record each batch's close sha in the journal, then run `git tag description-entity-images/pre-squash`.
2. Build one commit with `git commit-tree` from the final tree, with `<base>` as its only parent. Move the branch to it
   with `git merge --ff-only` or `git reset --soft`. Never `rebase -r`.
3. Verify that `git diff description-entity-images/pre-squash HEAD` is empty and `git rev-list --count <base>..HEAD`
   prints 1.
4. Write the message in Conventional Commits, lines ≤80, for example
   `feat(description): draw json, map, domain and requirement entities`.
   - The body explains why: description registers these four commands (`DescriptionDiagramFactory.java:129-137`) and
     draws them with their own images (`GeneralImageBuilder.java:183-186,235-255`); we had neither, so each source was
     a Syntax Error page. One line per image family, and one for D1 (core ports, class and state untouched).
   - The footer says `Refs: #147`, not `Closes`: the issue closes when the branch merges.
   - End with the harness's `Co-Authored-By` trailer.
5. Leave the commit unsigned, and do not push. Keep `commit.gpgsign` as it is.

## Acceptance
- Given the squash, then `git diff description-entity-images/pre-squash HEAD` is empty, and exactly one commit sits on
  `<base>`.

Observability is N/A. Rollback is Reversible (`description-entity-images/pre-squash`).
