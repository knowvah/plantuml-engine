# Squash

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T5 | Collapse the mission into one commit on the base | orchestrator | branch history | T4 | [x] |

## T5

`<base>` is the mission base sha named in the execution prompt.

1. Record each batch's close sha in the journal, then run `git tag class-usymbol-title-style/pre-squash`.
2. Build one commit with `git commit-tree` from the final tree, with `<base>` as its only parent. Move the branch to it
   with `git merge --ff-only` or `git reset --soft`. Never `rebase -r`.
3. Verify that `git diff class-usymbol-title-style/pre-squash HEAD` is empty and that `git rev-list --count
   <base>..HEAD` prints 1.
4. Write the message in Conventional Commits, lines ≤80, for example
   `fix(class): read a mixed-in leaf's title style as the jar does`.
   - The body explains why. `EntityImageDescription` strokes, fills and sizes every description leaf from `styleTitle`,
     `{root, element, classDiagram, <symbol SNames>, title}` merged on the entity's own builder
     (`EntityImageDescription.java:142-168`, `Entity.java:760-772`); the class engine read flat theme tiers that have
     no surface for a bare `title` style (`FromSkinparamToStyle.java:166-169`) or for a style block after the leaf.
     Name the rows pinned and anything filed.
   - The footer says `Refs: #195`, not `Closes`: the issue closes when the branch merges.
   - End with the harness's `Co-Authored-By` trailer.
5. Leave the commit unsigned, and do not push. Keep `commit.gpgsign` as it is.

## Acceptance
- Given the squash, then `git diff class-usymbol-title-style/pre-squash HEAD` is empty, and exactly one commit sits on
  `<base>`.

Observability: N/A. Rollback: Reversible (`class-usymbol-title-style/pre-squash`).
