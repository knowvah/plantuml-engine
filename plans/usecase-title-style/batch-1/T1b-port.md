# T1b: a usecase reads `EntityImageDescription`'s styles

**Writes:** `src/diagrams/description/description-entity-style.ts`, a unit test for `descriptionEntityStyle` /
`annotateEntityStyles` (find the existing one with `grep -rln "descriptionEntityStyle\|annotateEntityStyles" tests`;
create `tests/unit/description/description-entity-style.test.ts` only if none exists), the T1a gate.
**Reads:** `src/diagrams/description/renderer-entity.ts:140-240`, `src/core/style/` (`StyleSignatureBasic`),
`src/diagrams/description/layout-helpers.ts` and `leaf-sizing-*.ts` (what the sizer reads off `entitySizing`).

## The mechanism (verified at planning; re-read before acting)

- `GeneralImageBuilder.java:169-175`: `USECASE` and `USECASE_BUSINESS` build `EntityImageDescription`; the
  `EntityImageUseCase` constructions are commented out.
- `EntityImageDescription.java:142-153`: `styleTitle` signs `{root, element, getStyleName(), symbol.getSNames(),
  title}` on `getEntity().getCurrentStyleBuilder()`.
- `Entity.java:755-767`: that builder is the entity's own, or the diagram's last when `isSkinParamUsed()`.
- Ours: `description-entity-style.ts:161-164` (`title = style` for a usecase) and `:212-215` (a usecase reads the last
  builder). Both cite the dead `EntityImageUseCase`.

## Steps

1. **Red.** Unit tests, each asserting a probe oracle's value:
   - `skinparam titleBorderColor red` + `titleBorderThickness 2`: a `usecase` node's `entityStyle.title` gives
     `LineColor` `#F00` and stroke thickness 2 (jar: `skin-title.svg`, the `U` ellipse);
   - the same for `usecase-business` (`skin-title-business.svg`, `#FEE` fill from `titleBackgroundColor`);
   - `<style> usecase { LineColor blue }` declared after the usecase, no skinparam: the usecase's `title` keeps the
     default `#181818` (`style-after-usecase.svg`).
2. **Green.** Per D1: the usecase takes the same `title` signature as every other symbol, and the entity's builder.
   Remove `isUsecase`. Fix the two comments that cite `EntityImageUseCase` in this file to cite
   `EntityImageDescription.java:142-153` and `Entity.java:755-767`.
3. **Measure** per the contract, step 5. Expect `rows 6 zero 6`. If a row stays open, find its mechanism before any
   further edit (diagnosis mode): a sizer path that still reads the old reading belongs here; a different mechanism is
   D2.
4. **Pin.** Move each row at 0 to `ZERO` with a dated comment citing `EntityImageDescription.java:142-153`.
5. Push-forward: correct the `EntityImageUseCase` citations in `layout-dot-tree.ts:189-191` and
   `layout-helpers.ts:248-250`, comment-only.

## Acceptance
- Given `skinparam titleBorderColor red` / `titleBorderThickness 2`, when `skin-title.puml` renders, then the usecase
  ellipse has `stroke:#F00;stroke-width:2` and the gate row is `ZERO`.
- Given the `<style> title { }` form, when `style-title.puml` renders, then it compares at 0 diffs.
- Given a `<style>` block after the usecase and no skinparam, when `style-after-usecase.puml` renders, then the usecase
  keeps the default stroke and fill.
- Given the `usecase`, `component`, `c4` and `unknown` surveys, when re-run, then no row leaves `conformant`.

Observability is N/A. Rollback is Reversible.
