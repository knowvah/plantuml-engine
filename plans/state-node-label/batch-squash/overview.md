# Squash

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T8 | Collapse the mission into one commit on the base | orchestrator | branch history | T7 | [x] |

## T8

`<base>` is the mission base sha named in the execution prompt.

1. Record each batch's close sha in the journal, then run `git tag state-node-label/pre-squash`.
2. Build one commit with `git commit-tree` from the final tree, with `<base>` as its only parent. Move the branch to it
   with `git merge --ff-only` or `git reset --soft`. Never `rebase -r`.
3. Verify that `git diff state-node-label/pre-squash HEAD` is empty and that `git rev-list --count <base>..HEAD`
   prints 1.
4. Write the message in Conventional Commits, lines ≤80, for example
   `feat(state): draw node-style transition labels as the jar does`.
   - The body explains why: `CommandLinkStateCommon` turns a labelled transition into a `STATE_TRANSITION_LABEL` leaf
     and two links under `stateDiagramEdgeLabelStyle node` or `-[node]->`, and `nonode` is a `LINE_STYLE` key; the
     port drew the label on the edge and refused `nonode`. Name the seeded-clock id and the comparator normalisation
     (D1, D2), the orphan rule, the rows pinned, the tests rewritten, and anything filed.
   - The footer says `Refs: #235`, not `Closes`: the issue closes when the branch merges.
   - End with the harness's `Co-Authored-By` trailer.
5. Leave the commit unsigned, and do not push. Keep `commit.gpgsign` as it is.

## Acceptance
- Given the squash, then `git diff state-node-label/pre-squash HEAD` is empty, and exactly one commit sits on
  `<base>`.

Observability: N/A. Rollback: Reversible (`state-node-label/pre-squash`).
