# T2a: the `package` title wraps at the title style (M1, D1)

## Context

Upstream: `EntityImageDescription.java:201-202` → `BodyFactory.java:74-77` → `BodyEnhanced1.java:189-193` →
`MethodsOrFieldsArea.java:254-255`, `:263-264` (`create8(…, SIMPLE_LINE, style.wrapWidth())`, `style` = `styleTitle`).
Ours: `titleStyle` hard-codes `wrapWidth: LineBreakStrategy.NONE` (`EntityImageDescriptionName.ts:135`), and both
`measureShownFolderTitle` (`leaf-sizing-folder-title.ts:178`) and `buildEntityName` (`EntityImageDescriptionName.ts:196`)
go through it.

## Write-set

- `src/core/svek/image/EntityImageDescriptionName.ts`: `titleStyle` and `buildCreate2Name` take the wrap width;
  `EntityNamePaint` gains `wrapWidthTitle?: number | undefined`; `buildEntityName` passes it.
- `src/core/svek/image/EntityImageDescription.ts`: `EntityImageDescriptionPaint.wrapWidthTitle` (doc: `styleTitle
  .wrapWidth()`, `MethodsOrFieldsArea.java:255`), forwarded at the `buildEntityName` call (`:353`).
- `src/core/svek/image/LeafSizingSubject.ts`: `EntitySizing.wrapWidthTitle`.
- `src/diagrams/description/description-entity-style.ts#entitySizing`: `wrapWidthTitle:
  style.title.wrapWidth().getMaxWidth()` beside `minimumWidthTitle`.
- `src/diagrams/description/renderer-entity.ts`: paint `wrapWidthTitle` = `node.entitySizing?.wrapWidthTitle`, else
  `theme.wrapWidth` (the `:247-251` shape).
- `src/core/svek/image/leaf-sizing-folder-title.ts`: `measureShownFolderTitle` passes
  `node.entitySizing?.wrapWidthTitle ?? opts?.wrapWidth` (its signature takes what it needs; update the caller
  `leaf-sizing-folder.ts:135`).
- Tests: extend `tests/unit/core/svek/image/leaf-sizing-folder-title.test.ts`; the gate's ZERO/OPEN.

## Steps

1. Red: in `leaf-sizing-folder-title.test.ts`, assert the title block for code `A rather long empty package title` at
   wrap 100 is three lines high (`3 * 14 = 42`) and as wide as the jar's: the jar's svek node is `1.900694in =
   136.85px` wide, so the title block is `136.85 - 30` (`USymbolFolder` margin, `leaf-sizing-folder.ts` doc) =
   `106.85`. Derive the width from the jar svg's text runs, not by fitting. Assert wrap 0 keeps today's one line.
2. Green: thread the width as above. A width `> 0` becomes `new LineBreakStrategy(String(w))`
   (`EntityImageDescriptionDelegates.ts:372-375`); otherwise `LineBreakStrategy.NONE`.
3. Measure (contract step 5). Expected to 0: `ptw-issue`, `ptw-skinparam`, `ptw-element-style`, `ptw-fits`,
   `ptw-title-only`, `ptw-stereo`. `ptw-linked`, `ptw-nested`, `ptw-newline` drop but stay open (M2/M3).
4. Check the DOT: capture `ptw-issue`'s layout input with `setLayoutInputObserver` (`src/core/graph-layout.ts:74`)
   and compare the package node to the jar's `svek-1.dot` (`width=1.900694, height=0.902778`; re-render with
   `scripts/oracle-render.sh` into `/tmp` to get the dot).
5. Pin, commit (`fix(description): wrap a package title at its style width`), notes.

## Acceptance (Given/When/Then)

- Given `<style> package { MaximumWidth 100 }` and an empty `package "A rather long empty package title"`, when
  rendered, then the gate row `ptw-issue` has 0 diffs and the DOT node is `1.900694 x 0.902778` within tolerance.
- Given `skinparam wrapWidth 100` instead, then `ptw-skinparam` has 0 diffs (the width reaches `styleTitle` through
  `FromSkinparamToStyle.java:260`).
- Given `package { title { MaximumWidth 100 } }`, then titles wrap and `P`'s label stays one line (`ptw-title-only`).
- Given no wrap setting, then `ptw-control-nowrap` stays 0 and the title stays one `<text>` run.

## Interface contract (consumed by T2b, T2c)

`EntitySizing.wrapWidthTitle?: number` and `buildCreate2Name(code, font, atomOps, guillemet, minimumWidth?,
wrapWidth?)` (or an options object, if the parameter count would exceed 5 — the hook caps at 5).

Observability N/A. Rollback Reversible.
