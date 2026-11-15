# Squash

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T5 | Collapse the mission into one commit on the base | orchestrator | branch history | T4 | [x] |

## T5

`<base>` is the mission base sha named in the execution prompt.

1. Record each batch's close sha in the journal, then run `git tag unresolved-colour/pre-squash`.
2. Build one commit with `git commit-tree` from the final tree, with `<base>` as its only parent. Move the branch to it
   with `git merge --ff-only` or `git reset --soft`. Never `rebase -r`.
3. Verify that `git diff unresolved-colour/pre-squash HEAD` is empty and `git rev-list --count <base>..HEAD` prints 1.
4. Write the message in Conventional Commits, lines ≤80, for example
   `fix(colour): resolve unknown colour tokens as the jar does`.
   - The body explains why. The jar answers an unparseable token per call site: `WithLinkType.java:162` and
     `ValueImpl.java:103` give white, and `Colors.java:113` gives null, which means the default. Class and description
     stored the raw token, which reached `fill`/`stroke`. Write one line per mechanism and engine.
   - The footer says `Refs: #145`, not `Closes`: the issue closes when the branch merges.
   - End with the harness's `Co-Authored-By` trailer.
5. Leave the commit unsigned, and do not push. Keep `commit.gpgsign` as it is.

## Acceptance
- Given the squash, then `git diff unresolved-colour/pre-squash HEAD` is empty, and exactly one commit sits on `<base>`.

Observability is N/A. Rollback is Reversible (`unresolved-colour/pre-squash`).
