# Squash

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T4 | Collapse the mission into one commit on the base | orchestrator | branch history | T3 | [x] |

## T4

`<base>` is the mission base sha named in the execution prompt.

1. Record each task's commit sha in the journal, then run `git tag dot-host-font-kerning/pre-squash`.
2. Build one commit with `git commit-tree` from the final tree, with `<base>` as its only parent. Move the branch to it
   with `git merge --ff-only` or `git reset --soft`. Never `rebase -r`.
3. Verify that `git diff dot-host-font-kerning/pre-squash HEAD` is empty, and that `git rev-list --count <base>..HEAD`
   prints 1.
4. Write the message in Conventional Commits, with lines ≤80, for example
   `test(dot): sign the #186 rows as host-font kerning divergences`.
   - The body explains why: the oracle host's graphviz kerns with pango and Times New Roman, which a browser-safe engine
     cannot load (ruling 2026-11-16); the rows are pinned with a held score because the dot survey is blind to them.
   - The footer says `Refs: #186`, not `Closes`, because the issue closes when the branch merges.
   - End with the harness's `Co-Authored-By` trailer.
5. Leave the commit unsigned, and do not push. The user reviews the branch, signs all its commits together, and pushes.

## Acceptance
- Given the squash, then `git diff dot-host-font-kerning/pre-squash HEAD` is empty, and exactly one commit sits on
  `<base>`.

Observability is N/A: there are no new observable operations. Rollback is Reversible
(`dot-host-font-kerning/pre-squash`).
