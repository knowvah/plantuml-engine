# Squash

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T4 | Collapse the mission into one commit on the base | orchestrator | branch history | T3 | [x] |

## T4

`<base>` is the mission base sha named in the execution prompt.

1. Record each batch's close sha in the journal, then run `git tag package-title-wrap/pre-squash`.
2. Build one commit with `git commit-tree` from the final tree, with `<base>` as its only parent. Move the branch to it
   with `git merge --ff-only` or `git reset --soft`. Never `rebase -r`.
3. Verify that `git diff package-title-wrap/pre-squash HEAD` is empty and `git rev-list --count <base>..HEAD`
   prints 1.
4. Write the message in Conventional Commits, lines ≤80, for example
   `fix(description): wrap an empty package's title at its style width`.
   - The body explains why: upstream draws an empty description `package` with `EntityImageDescription`, whose title
     is a `create2` block wrapped at the title style's `MaximumWidth` (`MethodsOrFieldsArea.java:255`) and whose
     label wraps at the body style's (`EntityImageDescription.java:185-188`). We wrapped neither title side and sized
     the label from `skinparam wrapWidth` only; and a `\n` in the name drew it twice (`equalsLike`,
     `EntityImageDescription.java:180-181`). Name the rows pinned and anything filed.
   - The footer says `Refs: #219`, not `Closes`: the issue closes when the branch merges.
   - End with the harness's `Co-Authored-By` trailer.
5. Leave the commit unsigned, and do not push. Keep `commit.gpgsign` as it is.

## Acceptance
- Given the squash, then `git diff package-title-wrap/pre-squash HEAD` is empty, and exactly one commit sits on
  `<base>`.

Observability is N/A. Rollback is Reversible (`package-title-wrap/pre-squash`).
