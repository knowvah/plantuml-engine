# T2: stamp `styleTitle`, read it in the draw

**Context.** Decision D1. A class-diagram leaf that `GeneralImageBuilder` hands to `EntityImageDescription`
(`GeneralImageBuilder.java:162-180`: `CIRCLE`, `DESCRIPTION`, `USECASE`, `USECASE_BUSINESS`) reads `styleTitle`:
`{root, element, classDiagram, <symbol SNames>, title}` (`ACTOR_BUSINESS_TITLE` for a business actor) with the
stereotype, merged on `getEntity().getCurrentStyleBuilder()`, then `eventuallyOverride(colors)`
(`EntityImageDescription.java:142-151`). `forecolor`, `backcolor` and `stroke` come from it (`:159-168`). Ours reads
flat theme tiers (`renderer-usymbol-entity-style.ts#resolveForecolor` `:169-183`, `#resolveStroke` `:192-203`,
`#resolveBackcolor` `:121-135`), which have no surface for a bare `title` style or for the entity's own builder.

**Read-set.** `description-entity-style.ts` (`symbolSNames`, `descriptionEntityStyle`), `class-state-leaf.ts:108-122`,
`class/index.ts:84-95`, `renderer-usymbol-entity.ts:84-93,128-200,297-301`, `class-geo-builders.ts:143,372`,
`core/style/style-reads.ts`.

**Write-set (a plan).**
- `src/diagrams/class/class-usymbol-title-style.ts` (new): `annotateUSymbolTitleStyles(classifiers, styleBuilder,
  theme)`, stamping `usymbolTitleStyle` on every classifier `usesClassUSymbolEntity` accepts (move or share that
  predicate and `resolveSymbolKeyword` so both files read one copy; a geo and a classifier share `kind`/`usymbol`).
- `src/diagrams/description/description-entity-style.ts`: export `symbolSNames` (or move it beside `upstreamKeyword`
  in `src/core/decoration/symbol/usymbol-resolve.ts`, description importing it back). No behaviour change there.
- `src/diagrams/class/index.ts`: call it in `layoutSync` with `services.styleBuilder` (the generation-aware function,
  not its `()` result) so `style-after` reads the entity's builder.
- `class-classifier-ast.ts` + `class-geo-types.ts` + `class-geo-builders.ts`: the field and its copy, beside
  `styleGeneration`.
- `renderer-usymbol-entity-style.ts`: below each inline-colour tier, `resolveForecolor` returns `styleTitle`'s
  `LineColor`, `resolveStroke` its `getStroke()` (scaled), `resolveBackcolor` its `BackGroundColor`. Keep the flat
  path only as the answer when no style was stamped (no builder: `services` absent).
- `tests/unit/class/class-usymbol-title-style.test.ts` (new).

**Steps.**
1. Red: a unit test that renders `skin-title-allowmixing`'s source and asserts the usecase ellipse and the actor path
   carry `stroke="#F00"` and `stroke-width:2`, and a test on the annotator that asserts `stylePaint(style,
   'LineColor') === '#FF0000'` and `getStroke().getThickness() === 2`.
2. Green, as the write-set says. Stamp per classifier, never through module state (decisions.md D1, "Trap"):
   `embed-class`, `embed-group` and corpus `razefo-71-pice114` must stay at 0. The planning experiment (decisions.md "Evidence") took 12 of 17 probes to 0 with
   exactly these reads plus T3's sizer read; reproduce it from the Java, not from the experiment.
3. Push-forward: `deltaShadow` is `styleTitle.getShadowing()` (`EntityImageDescription.java:167`), today a literal `0`
   (`renderer-usymbol-entity.ts:176`). Read it from the stamped style if that moves no conformant row; the sizing half
   stays on #260 (`leaf-sizing-entity.ts:187`).
4. Measure (task contract step 5) and run the class, usecase, component and unknown surveys. Pin.

## Acceptance
- Given `skin-title-allowmixing`, when rendered, then both strokes are `#F00` at width 2 and the uts gate row's count
  falls (its size half is T3's).
- Given `style-after`, when rendered, then the usecase keeps the default `#181818` (entity's builder, `Entity.java:766-772`).
- Given `title-back` and `inline-back`, when rendered, then the fill is `#FF0` and the inline `#pink` still wins.
- Given every class survey row that was conformant at `<base>`, when re-surveyed, then it is still conformant.

Observability: N/A. Rollback: Reversible.
