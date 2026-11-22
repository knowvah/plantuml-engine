# T1b: upstream `group3015` fixtures, outer and nested (D3)

## Context

Upstream's fix landed with five Vega cases in `src/test/resources/vega/nonreg/group3015/`:
- three one-line shapes that were broken before it (`mono_line_note_theme`, `mono_line_arrow_theme`,
  `mono_line_arrow_variable`);
- two that already worked (`mono_line_arrow_plain`, `multi_line_note_theme`).

Planning rendered all five through the pinned jar and through `renderSync`. They matched at n=0 at top level, and at
n=0 when the decoded nested payloads were compared. No test in this repository holds that.

## Steps

1. Copy the five `.puml` files verbatim from `git -C ~/git/plantuml show 58b9b3d53ee:<path>` into
   `tests/fixtures/embedded-diagram-3015/`, keeping upstream's file names.
2. Render oracles with `scripts/oracle-render.sh /abs/tests/fixtures/embedded-diagram-3015 <puml…>`. For the two
   `!pragma layout smetana` sources, render from a `/tmp` copy with that line removed (D3, capture policy) and name the
   output after the original. Delete the `svek-N.dot` files.
3. Write `tests/unit/core/embedded-diagram-preprocess-3015.test.ts` in the shape of
   `tests/unit/class/class-command-package-2846.test.ts`:
   - a header citing `58b9b3d53ee`, `EmbeddedDiagram.java:89-103`, `BlockUml.java:149-160`, the oracle jar
     (1.2026.11beta1, `a720bdd`) and the pragma strip;
   - one case per fixture: `compareSvg(renderSync(src, { measurer: new DeterministicMeasurer() }), jar,
     'deterministic').diffs` is `[]`;
   - one case per fixture: `nestedPayloads(ours)` and `nestedPayloads(jar)` have the same length, and each pair
     compares with no diffs;
   - one authored case for the outer variable (`!$who = "Carol"` before a one-line embed that uses `$who`), with its
     own `.puml` and oracle beside the others: both draw `Carol`. This pins that the outer pass substitutes before
     the embed is collected; the commit message's "a one-line embed still does not see the outer diagram's variables"
     refers to the nested pass only.
4. If the test reads a fixture through a pragma strip, say so in the header.
5. Update `src/core/EmbeddedDiagram.ts`'s module JSDoc: the constructor at the pin (`EmbeddedDiagram.java:89-103`,
   `noDefinitions` at its read span) preprocesses the body. The port gets the same effect because the nested
   `renderSync` (`src/index.ts:321`) preprocesses its source. Correct any other stale `java:N` in the lines you touch.
   Run `npm run catalog` if the first header sentence changed.
6. Commit, for example `test(embed): port upstream's group3015 one-line embed fixtures`.

## Write-set
- `tests/fixtures/embedded-diagram-3015/*.puml`, `*.svg` (create)
- `tests/unit/core/embedded-diagram-preprocess-3015.test.ts` (create)
- `src/core/EmbeddedDiagram.ts` (JSDoc only); `docs/catalog.md` if regenerated

## Read-set
- `git -C ~/git/plantuml show 58b9b3d53ee` (all of it)
- `tests/unit/class/class-command-package-2846.test.ts:1-60`, `tests/oracle/svg-conformance/compare.ts:360-380,579-616`

## Interface contracts
Produces `nestedPayloads(svg: string): string[]` and the fixture directory URL for T1c (batch overview).

## Acceptance
- Given each `group3015` fixture, when rendered and compared to its jar oracle, then there are 0 diffs.
- Given each fixture's nested payloads, when compared pairwise, then the counts are equal and there are 0 diffs.
- Given the outer-variable probe, when rendered, then both nested payloads draw `Carol` with 0 diffs.
- Given a temporary revert of the nested preprocessing (journal how), when `mono_line_note_theme` runs, then the test
  fails. This proves the test sees the mechanism. Restore before committing.

Observability: N/A. Rollback: Reversible.
