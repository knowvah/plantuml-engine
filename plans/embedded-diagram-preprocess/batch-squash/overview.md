# Squash

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T3 | Collapse the mission into one commit on the base | orchestrator | branch history | T2 | [x] |

## T3

`<base>` is the mission base sha named in the execution prompt.

1. Record each batch's close sha in the journal, then run `git tag embedded-diagram-preprocess/pre-squash`.
2. Build one commit with `git commit-tree` from the final tree, with `<base>` as its only parent. Move the branch to it
   with `git merge --ff-only` or `git reset --soft`. Never `rebase -r`.
3. Verify that `git diff embedded-diagram-preprocess/pre-squash HEAD` is empty and `git rev-list --count <base>..HEAD`
   prints 1.
4. Write the message in Conventional Commits, lines ≤80, for example
   `test(embed): pin the #185 rows now that upstream preprocesses embeds`.
   - The body explains why. The #185 ruling said to re-measure once upstream shipped the fix. Upstream `58b9b3d53ee`
     (#3016) is in the pin `a720bdd`, so the rows conform and are pinned, and no divergence is recorded. Then mention
     the `group3015` fixtures (outer + nested compare), the `block` source label (`BlockUml.java:119-127`), and any
     filed follow-ons.
   - The footer says `Refs: #185`, not `Closes`: the issue closes when the branch merges.
   - End with the harness's `Co-Authored-By` trailer.
5. Leave the commit unsigned, and do not push. Keep `commit.gpgsign` as it is.

## Acceptance
- Given the squash, then `git diff embedded-diagram-preprocess/pre-squash HEAD` is empty, and exactly one commit sits
  on `<base>`.

Observability is N/A. Rollback is Reversible (`embedded-diagram-preprocess/pre-squash`).
