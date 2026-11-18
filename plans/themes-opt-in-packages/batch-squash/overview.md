# Squash

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T4 | Collapse the mission to one commit on the base | orchestrator | branch history | T3 | [x] |

## T4

`<base>` is the mission base sha named in the execution prompt.

1. Record each batch's close sha in the journal, then run `git tag themes-opt-in-packages/pre-squash`.
2. Build one commit with `git commit-tree` from the final tree, with `<base>` as its only parent. Move the branch to it
   with `git reset --soft` or `git merge --ff-only`. Never use `rebase -r`.
3. Verify that `git diff themes-opt-in-packages/pre-squash HEAD` is empty, and that `git rev-list --count <base>..HEAD`
   prints 1.
4. The message:
   - follows Conventional Commits with lines ≤80, for example
     `feat(themes): move non-mit themes into opt-in packages (#180)`;
   - has a body that says why: the #180 ruling, D1's `withThemes` seam, and the licence-forced `Cannot load theme`;
   - has a `BREAKING CHANGE:` footer: `!theme` on the 9 moved themes needs `withThemes` and the package;
   - has the footer `Refs: #180`, not `Closes`, because the issue closes when the branch merges;
   - ends with the session's attribution trailer.
5. Leave it unsigned and do not push. The user reviews the branch, signs it, and pushes. The queue driver swaps #180's
   labels.

## Acceptance

- Given the squash, then `git diff themes-opt-in-packages/pre-squash HEAD` is empty and exactly one commit sits on
  `<base>`.

Observability: N/A, no new observable operations. Rollback: Reversible (`themes-opt-in-packages/pre-squash`).
