# T3: the sizer reads the same stroke

**Context.** `EntityImageDescription#calculateDimension` draws through the `Fashion` built from `styleTitle`'s stroke
(`EntityImageDescription.java:168,177`), so the leaf's size and an actor's ink grow with `LineThickness`.
`measureEntityLeaf` already adds it when `entitySizing.thickness` is set (`leaf-sizing-entity.ts:187-190,263`), as
the description engine passes it (`description-entity-style.ts#entitySizing`). The class sizer passes only
`titleAlignment` (`class-layout-leaf-shapes.ts:65`) and `roundCorner` (`class-layout-generic-classifier.ts:92`).
The planning experiment showed one more reader: an actor's `measureUsecaseOrActorLeafInk` walk
(`class-layout-leaf-shapes.ts:117-120`) still used the default stroke, which left the three plain-actor rows 1–1.5 px
low. Open the ink walk and `ActorStickMan.java` and port how the stroke reaches it.

**Read-set.** `class-layout-leaf-shapes.ts:52-140`, `class-layout-generic-classifier.ts:80-125`,
`src/core/svek/image/leaf-sizing-entity.ts`, `ActorStickMan.java`, `EntityImageDescription.java:177-260`.

**Write-set (a plan).** `class-layout-leaf-shapes.ts`, `class-layout-generic-classifier.ts`, the unit test from T2,
both gates.

**Steps.**
1. Red: assert the measured box of a usecase and of an actor under `titleBorderThickness 2` equals the jar's
   (`skin-title-allowmixing.svg`: `svg/@width` 126, `@height` 177 after layout).
2. Green: pass `usymbolTitleStyle.getStroke().getThickness()` as `entitySizing.thickness` on both paths, and thread
   the stroke into the actor ink walk.
3. Measure and pin. `issue`, `style-title`, `usecase-border` and the uts `skin-title-allowmixing` row should reach 0;
   any residual gets a mechanism with `file:line` or a filed issue (D2).

## Acceptance
- Given `skin-title-allowmixing`, then the uts gate holds it in `ZERO`.
- Given `usecase-border` (`usecaseBorderThickness 1` on the usecase, `title` on the actor), then each leaf sizes with
  its own thickness.
- Given every class survey row conformant at `<base>`, then it is still conformant.

Observability: N/A. Rollback: Reversible.
