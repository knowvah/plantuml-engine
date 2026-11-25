# Squash

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T5 | Collapse the mission into one commit on the base | orchestrator | branch history | T4 | [x] |

## T5

`<base>` is the mission base sha named in the execution prompt.

1. Record each batch's close sha in the journal, then run `git tag actor-line-routing/pre-squash`.
2. Build one commit with `git commit-tree` from the final tree, with `<base>` as its only parent. Move the branch to it
   with `git merge --ff-only` or `git reset --soft`. Never `rebase -r`.
3. Verify that `git diff actor-line-routing/pre-squash HEAD` is empty and that `git rev-list --count <base>..HEAD`
   prints 1.
4. Write the message in Conventional Commits, lines ≤80, for example
   `fix(sequence): refuse a name:value participant colour as the jar does`.
   - The body explains why. `CommandParticipant` hands the whole `ColorParser.exp1()` capture to the throwing
     `getColor` (`CommandParticipant.java:183-185`), so the sequence factory fails on `actor X #line:red`, and the jar
     draws the description diagram. We stored the capture and kept sequence. Bare unknown colours keep the 2026-11-04
     neutral ruling. Name the bare-`create` routing fix, the rows pinned, the tests rewritten, and anything filed.
   - The footer says `Refs: #191`, not `Closes`: the issue closes when the branch merges.
   - End with the harness's `Co-Authored-By` trailer.
5. Leave the commit unsigned, and do not push. Keep `commit.gpgsign` as it is.

## Acceptance
- Given the squash, then `git diff actor-line-routing/pre-squash HEAD` is empty, and exactly one commit sits on
  `<base>`.

Observability: N/A. Rollback: Reversible (`actor-line-routing/pre-squash`).
