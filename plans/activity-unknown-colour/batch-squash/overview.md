# Squash

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T4 | Collapse the mission into one commit on the base | orchestrator | branch history | T3 | [x] |

## T4

`<base>` is the mission base sha named in the execution prompt.

1. Record each batch's close sha in the journal, then run `git tag activity-unknown-colour/pre-squash`.
2. Build one commit with `git commit-tree` from the final tree, with `<base>` as its only parent. Move the branch to it
   with `git merge --ff-only` or `git reset --soft`. Never `rebase -r`.
3. Verify that `git diff activity-unknown-colour/pre-squash HEAD` is empty and `git rev-list --count <base>..HEAD`
   prints 1.
4. Write the message in Conventional Commits, lines ≤80, for example
   `fix(activity): paint an unknown colour neutral where the jar errors`.
   - The body explains why: the jar's `getColor` throws at these sites (`HtmlColorAndStyle.java:100`,
     `CommandLink3.java:84`, `CommandSwimlane.java:98`, `Colors.java:103`) and errors; by the #143 ruling we draw and
     paint `#D3D3D3`. Arrows took the default colour and notes emitted the raw token. One line per site.
   - The footer says `Refs: #189`, not `Closes`: the issue closes when the branch merges.
   - End with the harness's `Co-Authored-By` trailer.
5. Leave the commit unsigned, and do not push. Keep `commit.gpgsign` as it is.

## Acceptance
- Given the squash, then `git diff activity-unknown-colour/pre-squash HEAD` is empty, and exactly one commit sits on
  `<base>`.

Observability is N/A. Rollback is Reversible (`activity-unknown-colour/pre-squash`).
