# Squash

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T6 | Collapse the mission into one commit on the base | orchestrator | branch history | T5 | [x] |

## T6

`<base>` is the mission base sha named in the execution prompt.

1. Record each batch's close sha in the journal, then run `git tag svg-dimension-style/pre-squash`.
2. Build one commit with `git commit-tree` from the final tree, with `<base>` as its only parent. Move the branch to it
   with `git merge --ff-only` or `git reset --soft`. Never `rebase -r`.
3. Verify that `git diff svg-dimension-style/pre-squash HEAD` is empty and `git rev-list --count <base>..HEAD` prints 1.
4. Write the message in Conventional Commits, lines ≤80, for example
   `fix(svg): honour svgDimensionStyle false in every engine as the jar does`.
   - The body explains why: `TextBlockExporter.java:418-421` hands `skinParam.svgDimensionStyle()` to the SVG option
     for every styled diagram (`UgDiagram.java:183-185`, `NewpagedDiagram.java:142-145`), and `SvgGraphics.java:795-799`
     then omits the root `style`, `width` and `height`. Only class and the unchromed description path returned it.
   - The footer says `Refs: #193`, not `Closes`: the issue closes when the branch merges.
   - End with the harness's `Co-Authored-By` trailer.
5. Leave the commit unsigned, and do not push. Keep `commit.gpgsign` as it is.

## Acceptance
- Given the squash, then `git diff svg-dimension-style/pre-squash HEAD` is empty, and exactly one commit sits on
  `<base>`.

Observability is N/A. Rollback is Reversible (`svg-dimension-style/pre-squash`).
