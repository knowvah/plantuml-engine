# Squash

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T4 | Collapse the mission to one commit on the base | orchestrator | branch history | T3 | [x] |

## T4

`<base>` is the mission base sha named in the execution prompt.

1. Record each batch's close sha in the journal, then run `git tag png-bounder-seam/pre-squash`.
2. Build one commit with `git commit-tree` from the final tree, with `<base>` as its only parent. Move the branch to it
   with `git reset --soft` or `git merge --ff-only`. Never use `rebase -r`.
3. Verify that `git diff png-bounder-seam/pre-squash HEAD` is empty and that `git rev-list --count <base>..HEAD` prints 1.
4. The message:
   - follows Conventional Commits, lines ≤80, for example `fix(oracle): make the PNG bounder deterministic (seam #5)`;
   - has a body that explains why (#170 option 3; D1's wire consequence; the user applies `0005` to the fork);
   - has the footer `Refs: #170`, not `Closes`, because the issue closes when the branch merges;
   - ends with the session's attribution trailer.
5. Leave it unsigned and do not push. The user reviews the branch, signs all its commits together, and pushes. The queue
   driver swaps #170's labels (`.claude/mission-driver.sh:305`).

## Acceptance

- Given the squash, then `git diff png-bounder-seam/pre-squash HEAD` is empty and exactly one commit sits on `<base>`.

Observability: N/A, no new observable operations. Rollback: Reversible (`png-bounder-seam/pre-squash`).
