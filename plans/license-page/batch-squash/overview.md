# Squash

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T4 | Collapse the mission into one commit on the base | orchestrator | branch history | T3 | [x] |

## T4

`<base>` is the mission base sha named in the execution prompt.

1. Record each batch's close sha in the journal, then run `git tag license-page/pre-squash`.
2. Build one commit with `git commit-tree` from the final tree, with `<base>` as its only parent. Move the branch to it
   with `git merge --ff-only` or `git reset --soft`. Never `rebase -r`.
3. Verify that `git diff license-page/pre-squash HEAD` is empty and `git rev-list --count <base>..HEAD` prints 1.
4. Write the message in Conventional Commits, lines ≤80, for example
   `feat(version): describe plantuml-engine on the license page`.
   - The body explains why: the user ruled on 2026-11-12 (#179) that the page must describe this distribution, not
     the jar; it keeps upstream's `License` structure and order and replaces the header, copyright, MIT first line,
     images paragraph, GraphViz lines and credits, and drops the donation and advertising blocks. Name the signed rows,
     the `DIVERGENCES.md` entry, and the ELK outcome (and the issue filed, if any).
   - The footer says `Refs: #179`, not `Closes`: the issue closes when the branch merges.
   - End with the harness's `Co-Authored-By` trailer.
5. Leave the commit unsigned, and do not push. Keep `commit.gpgsign` as it is.

## Acceptance
- Given the squash, then `git diff license-page/pre-squash HEAD` is empty, and exactly one commit sits on `<base>`.

Observability is N/A. Rollback is Reversible (`license-page/pre-squash`).
