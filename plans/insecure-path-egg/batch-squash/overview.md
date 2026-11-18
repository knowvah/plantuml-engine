# Squash

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T4 | Collapse the mission to one commit on the base | orchestrator | branch history | T3 | [x] |

## T4

`<base>` is the mission base sha named in the execution prompt.

1. Record each batch's close sha in the journal, then run `git tag insecure-path-egg/pre-squash`.
2. Build one commit with `git commit-tree` from the final tree, with `<base>` as its only parent. Move the branch to it
   with `git reset --soft` or `git merge --ff-only`. Never use `rebase -r`.
3. Verify that `git diff insecure-path-egg/pre-squash HEAD` is empty, and that `git rev-list --count <base>..HEAD`
   prints 1.
4. The message:
   - follows Conventional Commits with lines ≤80, for example `feat(eggs): draw path under the insecure profile (#178)`;
   - has a body that says why: #178 option 2, D1's registration gate, and the library-forced SVG page;
   - has the footer `Refs: #178`, not `Closes`, because the issue closes when the branch merges;
   - ends with the session's attribution trailer.
5. Leave it unsigned and do not push. The user reviews the branch, signs it, and pushes. The queue driver swaps #178's
   labels.

## Acceptance

- Given the squash, then `git diff insecure-path-egg/pre-squash HEAD` is empty and exactly one commit sits on `<base>`.

Observability: N/A, no new observable operations. Rollback: Reversible (`insecure-path-egg/pre-squash`).
