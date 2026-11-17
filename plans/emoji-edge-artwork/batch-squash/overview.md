# Squash

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T3 | Collapse the mission into one commit on the base | orchestrator | branch history | T2 | [x] |

## T3

`<base>` is the mission base sha named in the execution prompt.

1. Record each batch's close sha in the journal, then run `git tag emoji-edge-artwork/pre-squash`.
2. Build one commit with `git commit-tree` from the final tree, with `<base>` as its only parent. Move the branch to it
   with `git merge --ff-only` or `git reset --soft`. Never `rebase -r`.
3. Verify that `git diff emoji-edge-artwork/pre-squash HEAD` is empty and `git rev-list --count <base>..HEAD` prints 1.
4. Write the message in Conventional Commits, lines ≤80, for example
   `fix(creole): draw emoji artwork on an edge label as the jar does`.
   - The body explains why. Upstream's `Emoji.retrieve` is one global table (`Emoji.java:111-118`), so every creole
     line draws the artwork. Ours handed the store only to the desc path (`descAtomOps`), so `buildTextBlock` (edge
     labels, quantifiers, legacy activity) drew the platform glyph. The body names the filed follow-ons.
   - The footer says `Refs: #150`, not `Closes`: the issue closes when the branch merges.
   - End with the harness's `Co-Authored-By` trailer.
5. Leave the commit unsigned, and do not push. Keep `commit.gpgsign` as it is.

## Acceptance
- Given the squash, then `git diff emoji-edge-artwork/pre-squash HEAD` is empty, and exactly one commit sits on
  `<base>`.

Observability is N/A. Rollback is Reversible (`emoji-edge-artwork/pre-squash`).
