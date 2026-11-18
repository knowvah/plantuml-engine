# Squash

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T3 | Collapse the mission into one commit on the base | orchestrator | branch history | T2 | [x] |

## T3

`<base>` is the mission base sha named in the execution prompt.

1. Record each batch's close sha in the journal, then run `git tag version-builtin/pre-squash`.
2. Build one commit with `git commit-tree` from the final tree, with `<base>` as its only parent. Move the branch to it
   with `git merge --ff-only` or `git reset --soft`. Never `rebase -r`.
3. Verify that `git diff version-builtin/pre-squash HEAD` is empty and `git rev-list --count <base>..HEAD` prints 1.
4. Write the message in Conventional Commits, lines ≤80, for example
   `fix(tim): return this port's version from %version()`.
   - The body explains why: the maintainer ruled on #155 that `%version()` returns the port's version, where upstream
     returns `Version.versionString()` (`GetVersion.java:63-66`) and the dev-build oracle prints `$version$`; the one
     affected row is ledgered as a signed divergence. Name any filed follow-ons.
   - The footer says `Refs: #155`, not `Closes`: the issue closes when the branch merges.
   - End with the harness's `Co-Authored-By` trailer.
5. Leave the commit unsigned, and do not push. Keep `commit.gpgsign` as it is.

## Acceptance
- Given the squash, then `git diff version-builtin/pre-squash HEAD` is empty, and exactly one commit sits on `<base>`.

Observability is N/A. Rollback is Reversible (`version-builtin/pre-squash`).
