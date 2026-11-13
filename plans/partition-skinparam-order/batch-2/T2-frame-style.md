# T2: the field and the reader

**Why:** `FtileGroup.java:99-102` reads the frame's title colour, fill and line off `stylePartition`, the one merged,
positional style. Our renderer reads them off flat theme tiers, which have no order and no position (D1). The style
already reaches every frame node as `compositeStyle`. This task makes its resolver a declared Theme field (D4) and adds
the three colour reads (D2).

**Read-set:**
- `src/core/activity-box-style.ts:181-227`, `src/core/activity-circle-style.ts:60-83`;
- `src/core/theme-graph-colors-b.ts:392-410`, `src/core/build-theme.ts:120-140`;
- `src/diagrams/activity/activity-composite-theme.ts`;
- `src/diagrams/activity/activity-renderer-composite.ts:84-260`, `activity-renderer-composite-symbols.ts`;
- `src/diagrams/activity/activity-scoped-colors.ts`, `tiles/gtile-group.ts:120-160`,
  `layout/tile-coordinates-group.ts:80-90`;
- `tests/unit/activity/dss-T3d-scoped-fills.test.ts`, `dss-T4a-scoped-lines.test.ts` (the harness pattern).

**Write-set:**
- `src/core/activity-box-style.ts`, `src/core/theme-graph-colors-b.ts`;
- `src/diagrams/activity/activity-composite-theme.ts`, `src/diagrams/activity/activity-renderer-composite.ts`;
- `src/diagrams/activity/activity-renderer-composite-symbols.ts` (only if it reads a frame colour itself);
- `tests/unit/activity/pso-T2-frame-style-colors.test.ts` (new);
- `oracle/goldens/diagram-style-scope.json` (lowering only), `docs/catalog.md`.

## Interface contract (D4)

```ts
// theme-graph-colors-b.ts, inside `activity?: { ... }`, beside `boxStyleOf`
// pso-T2: a group frame's ONE merged style (`activity-box-style.ts#withActivityCompositeStyle`); set by `build-theme.ts`.
compositeStyleOf?: ActivityCompositeStyleResolver;

// activity-box-style.ts, unchanged signature
export type ActivityCompositeStyleResolver = (
  symbol: string, // 'group' | 'partition' | 'package' | 'rectangle' | 'card'
  stereotype: string | undefined,
  position: number | undefined, // the command's document line
) => Style | undefined;
```

`COMPOSITE_STYLE_KEY` and `ThemeWithCompositeStyle` go. Keep the `BOX_STYLE_AT_KEY` symbol: it is not part of this
issue.

## Steps

1. **Red.** Write `pso-T2-frame-style-colors.test.ts`. It renders through `renderSync` with the jar-compatible
   options, as the dss tests do. Assert the jar's frame `fill`, `stroke` (both the rect and the tab path) and title
   `fill` for:
   - `rectangle`, `card` and `package` in both orders of each of the three keys;
   - `group` with `packageBackgroundColor` and `packageBorderColor`;
   - `frame-then-own` (`none`), `own-then-frame-then-partition` (`#AAA`) and `partition-then-own-transparent` (`none`).

   Take every expected value from the row's oracle under `tests/fixtures/diagram-style-scope/`. Add one hand-built
   theme case with no resolver, which keeps the flat tiers (D2 fallback).
2. **The field.** Move the resolver onto `graph.activity.compositeStyleOf` in `withActivityCompositeStyle`, and make
   `compositeStyleOf` in `activity-composite-theme.ts` read it. Run the activity unit tests: output must not change
   yet.
3. **The reads** (`FtileGroup.java:99-102`). In `activity-renderer-composite.ts`, a `node.compositeStyle` paint goes
   between the gated tiers and the flat tiers (D2):
   - `compositeFill`: after `compositeBack`, before `graph.partitionBackground` and `flatFill`, from
     `BackGroundColor`;
   - `compositeInk.stroke`: after `compositeLine`, before `graph.partitionBorder`, `sym.stroke` and the base, from
     `LineColor`;
   - `compositeTitleColor`: after the bucket font, before `flatTitleColor`, from `FontColor`, via
     `style.getFontConfiguration` as `FtileGroup.java:99` does.

   Convert with `paintOf(style, name, isDark)` (`activity-circle-style.ts:73-83`). Read `isDark` as
   `SkinParam.isDark` does (`SkinParam.java:114-116`), from whatever theme flag `skinparam mode dark` already sets;
   find it, never add a new one. `#00000000` must print `none`, as the flat `base.backColor` does today.
4. **Measure** the 43 rows (contract step 5). All 43 must be at 0. Then lower the pins:
   `npx jiti plans/style-mode-cascades/measurements/rows.mts tests/fixtures/diagram-style-scope --json /tmp/pso-T2/rows.json`
   (every row, no prefix), then `node plans/partition-skinparam-order/measurements/pin-rows.mjs /tmp/pso-T2/rows.json`.
   It must print 14 `lower` lines, no `RISE` and no `GONE`.
5. **Every pinned row:** the same full measure must show no rise anywhere in the 1215 rows (stop 1, stop 2).
6. Run `npm run catalog` if the catalog drifts. Commit
   `fix(activity): read frame colours off the merged partition style`, with a body that says why (the last-wins order,
   position) and the footer `Refs: #138`.

## Acceptance
- Given `skinparam PartitionBackgroundColor #BBBBBB` then `skinparam rectangleBackgroundColor #AAAAAA` on
  `rectangle F { :a; }`, when rendered, then the frame rect's `fill` is `#AAA`. In the opposite order it is `#BBB`
  (likewise `BorderColor` on the rect and tab `stroke`, and `FontColor` on the title).
- Given `skinparam rectangleBackgroundColor #AAAAAA` declared after the frame, when rendered, then the fill is `none`.
- Given a hand-built theme with no `compositeStyleOf`, when a frame renders, then it reads the flat tiers exactly as
  before.
- Given the full `diagram-style-scope` measure, then the 43 `__frameorder-` rows are at 0, and no other row rose.
- Given `npm run build`, then `dist/*.d.ts` differs from `/tmp/pso-base-dts/` only by the field, its resolver type
  export and their JSDoc.

**Observability:** N/A, a pure render path. **Rollback:** Reversible. Revert the commit; the pins return with it.
