# T2b: the folder label sizer reads the style's wrap first (M2, D2)

## Context

Upstream wraps `desc` at the body style's `style.wrapWidth()` (`EntityImageDescription.java:185`, `:188`). The
renderer reads `node.entitySizing?.wrapWidth ?? theme.wrapWidth` (`renderer-entity.ts:247-251`). The folder sizer
reads `opts?.wrapWidth` only (`leaf-sizing-folder.ts:138`), which is `theme.wrapWidth` (`layout.ts:315`,
`layout-dot-tree.ts:207`). This is the mechanism the issue body describes.

## Write-set

- `src/core/svek/image/leaf-sizing-folder.ts#folderBlockDims`: `folderTextBlock(…, node.entitySizing?.wrapWidth ??
  opts?.wrapWidth ?? 0)`. The ink walk (`measureFolderLeafInk`) shares `folderBlockDims`, so it follows.
- Tests: a new or extended `tests/unit/core/svek/image/leaf-sizing-folder-*.test.ts`; the gate's ZERO/OPEN.

## Steps

1. Red: a unit test with a `LeafSizingSubject` whose `entitySizing.wrapWidth` is 100 and `opts.wrapWidth` absent:
   `package "A rather long empty package title" as P` must size the label wrapped (jar `ptw-as-label`: read the
   node size from the jar's `svek-1.dot`, re-rendered into `/tmp`).
2. Green: the one-line change.
3. Measure. Expected to 0: `ptw-as-label`, `ptw-folder`, and (with T2a) `ptw-linked`, `ptw-nested`.
   `ptw-as-label-skinparam` must stay 0.
4. Push-forward check: `measureFolderLeaf` floors with `opts?.minimumWidth` (`leaf-sizing-folder.ts` `minContentW`)
   while the renderer uses `entitySizing.minimumWidth` first (`renderer-entity.ts:241`). Author a probe
   (`package { MinimumWidth 300 }` on an empty package `as P` with a short display) and, if it shows a diff with this
   origin, fix it here under the README's push-forward rule.
5. Pin, commit (`fix(description): size a folder label at its style wrap width`), notes.

## Acceptance (Given/When/Then)

- Given `<style> package { MaximumWidth 100 }` and `package "A rather long empty package title" as P {}`, when
  rendered, then `ptw-as-label` has 0 diffs.
- Given `<style> folder { MaximumWidth 100 }` and an empty long-titled `folder`, then `ptw-folder` has 0 diffs.
- Given `skinparam wrapWidth 100` only, then `ptw-as-label-skinparam` stays 0.

Observability N/A. Rollback Reversible.
