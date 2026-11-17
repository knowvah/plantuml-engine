# Squash

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T3 | Collapse the mission into one commit on the base | orchestrator | branch history | T2 | [x] |

## T3

`<base>` is the mission base sha named in the execution prompt.

1. Record each batch's close sha in the journal, then run `git tag usymbol-group-scale/pre-squash`.
2. Build one commit with `git commit-tree` from the final tree, with `<base>` as its only parent. Move the branch to it
   with `git merge --ff-only` or `git reset --soft`. Never `rebase -r`.
3. Verify that `git diff usymbol-group-scale/pre-squash HEAD` is empty and `git rev-list --count <base>..HEAD` prints 1.
4. Write the message in Conventional Commits, lines ≤80, for example
   `fix(class): draw a scaled usymbol group in layout units as the jar does`.
   - The body explains why. Upstream multiplies every number at format time (`SvgGraphics.java:467-474`), so the
     literals inside `USymbol#asBig` scale with the cluster. Ours drew the pre-scaled geo at scale 1, and the
     pre-formatted header stereo was never scaled. The body names the filed follow-ons.
   - The footer says `Refs: #149`, not `Closes`: the issue closes when the branch merges.
   - End with the harness's `Co-Authored-By` trailer.
5. Leave the commit unsigned, and do not push. Keep `commit.gpgsign` as it is.

## Acceptance
- Given the squash, then `git diff usymbol-group-scale/pre-squash HEAD` is empty, and exactly one commit sits on
  `<base>`.

Observability is N/A. Rollback is Reversible (`usymbol-group-scale/pre-squash`).
