# Decisions

Each decision cites the evidence it rests on. A finding that contradicts one is stop condition 4: amend this file with
the date, then halt. Upstream line numbers are at the pinned oracle checkout `~/git/knowvah/plantuml` (upstream
master, re-pinned in PR #269).

## D1. The `package` title wraps at the title style, through the one `create2` owner

`EntityImageDescription` builds `name` with `BodyFactory.create2(…, codeDisplay, …, styleTitle)`
(`svek/image/EntityImageDescription.java:201-202`). `create2` is `new BodyEnhanced1(align, display, skinParam,
entity, style)` (`cucadiagram/BodyFactory.java:74-77`). `BodyEnhanced1#buildTextBlock` makes each line a
`MethodsOrFieldsArea(display, skinParam, align, entity, style)` (`cucadiagram/BodyEnhanced1.java:188-193`), and that
creates every line with `create8(…, CreoleMode.SIMPLE_LINE, style.wrapWidth())` (`MethodsOrFieldsArea.java:254-255`,
`:263-264`). `style` there is `styleTitle`, the merged `{root, element, <styleName>, package, title}` style
(`:144-151`), so `package { MaximumWidth }`, `element { MaximumWidth }` and `skinparam wrapWidth` (converted onto
`element`, `FromSkinparamToStyle.java:260`) all reach it.

The port already shares one builder between sizer and renderer: `buildCreate2Name`
(`src/core/svek/image/EntityImageDescriptionName.ts:150-166`), called by `measureShownFolderTitle`
(`leaf-sizing-folder-title.ts:178`) and `buildEntityName` (`EntityImageDescriptionName.ts:189-203`). It hard-codes
`wrapWidth: LineBreakStrategy.NONE` in `titleStyle` (`:135`). T2a gives `buildCreate2Name` a wrap-width parameter and
feeds it from:

- the renderer: a new `EntityNamePaint.wrapWidthTitle` / `EntityImageDescriptionPaint.wrapWidthTitle`, set in
  `renderer-entity.ts` from `node.entitySizing?.wrapWidthTitle`, else `theme.wrapWidth` (the same fallback shape as
  the existing desc wrap, `renderer-entity.ts:247-251`);
- the sizer: `node.entitySizing?.wrapWidthTitle ?? opts?.wrapWidth`;
- `EntitySizing.wrapWidthTitle` = `style.title.wrapWidth().getMaxWidth()` in `description-entity-style.ts#entitySizing`
  (`:179-198`), next to `minimumWidthTitle`.

A positive width becomes `new LineBreakStrategy(String(w))`, as `buildDesc` already does
(`EntityImageDescriptionDelegates.ts:372-375`).

- **Rejected:** reading the body wrap (`entitySizing.wrapWidth`) for the title. `ptw-title-only`
  (`package { title { MaximumWidth 100 } }`) wraps the jar's titles and leaves `P`'s label at one line
  (`textLength="204.4"`), so the two widths are distinct reads.
- **Rejected:** wrapping only in the sizer, as the issue's fix shape says. The renderer draws the title unwrapped too
  (`ptw-issue` port svg: one `<text … textLength="204.4">`; jar: eight word atoms over three lines).

## D2. The folder label sizer reads the style's wrap first, as the renderer does

The renderer wraps `desc` at `node.entitySizing?.wrapWidth ?? theme.wrapWidth` (`renderer-entity.ts:247-251`), which
is upstream's `style.wrapWidth()` (`EntityImageDescription.java:185`, `:188`). Every non-folder leaf already sizes with
that value (`leaf-sizing-entity.ts:264`, `sizedFromStyle`). Only `folderBlockDims` reads `opts?.wrapWidth`
(`leaf-sizing-folder.ts:138`), which is `ctx.wrapWidth = theme.wrapWidth` (`layout.ts:315`), so a style-only width
never reaches it. T2b makes it `node.entitySizing?.wrapWidth ?? opts?.wrapWidth ?? 0`.

- **Rejected:** changing `ctx.wrapWidth` in `layout-dot-tree.ts:207`. It feeds every symbol, and the entity route
  already overrides it from `entitySizing`; a second source would double-handle the same value.

## D3. M3 (`equalsLike`) is fixed in this mission

Upstream compares `entity.getDisplay().equalsLike(Display.getWithNewlines(pragma, entity.getName()))`
(`EntityImageDescription.java:180-181`; `Display.equalsLike` is list equality, `klimt/creole/Display.java:118-122`).
The port compares strings: `labels.displayText === labels.codeName` (`EntityImageDescriptionDelegates.ts:352`) and
`node.display === node.id` (`leaf-sizing-folder.ts:137`). The display is already split on real newlines, while the
code keeps the two-character `\n` escape, so a package named `"First line\nSecond line"` draws its name twice
(`ptw-ctl-newline`: 25 diffs, height 100 against the jar's 78). The fix compares
`Display.getWithNewlines(Pragma.createEmpty(), code)` lines with the display's lines, in both places.

- **Why in-mission rather than filed:** it is a two-site change with a `file:line` origin on the same symbol and
  construction this mission rewrites, and `ptw-newline` (the issue's subject with a newline) cannot reach 0 without it.
- **Rejected:** filing it as a separate queue issue. That adds a queue round-trip for a change smaller than its issue.

## D4. One authored gate, rendered as the survey renders

The 17 probes move to `tests/fixtures/package-title-wrap/<slug>.{puml,svg}`, held by a new
`tests/oracle/svg-conformance/package-title-wrap.authored.test.ts`, shaped like
`hidden-note-host.authored.test.ts`: `renderSync` + `withJarCompatibleStyleInput` + `DeterministicMeasurer` + the
survey asset and include stores + `filename: 'in.puml'` + `prepareElkOnce()`. ZERO rows have 0 `compareSvg` diffs and
the jar's comment sequence; OPEN rows have a `maxDiffs`/`maxComments` ratchet and a `reason`. A test also checks every
`.puml` on disk is in exactly one of ZERO or OPEN.

## D5. Reuse the hidden-note-host measurer

`plans/hidden-note-host/measurements/measure.mts` takes a directory argument and renders exactly as D4's gate does.
No new measurement script. If that file ever moves, copy it into `measurements/` unchanged and journal it.

## Operational readiness (Phase 4, auto-confirmed)

- **Observability:** N/A. A pure rendering library; no new operations, services or logs.
- **Rollback:** Reversible. Revert the squash commit; `package-title-wrap/pre-squash` keeps per-task history.
- **Scale:** one extra `LineBreakStrategy` per package title. No measurable cost.
- **On-call:** none. Failure mode is a wrong geometry, caught by the gate and the survey.
- **Compatibility:** no public API or `dist/*.d.ts` change (stop condition 5). Output changes only toward the jar.

## Auto-confirmed (unattended)

Planned with `/plan-mission --unattended next --branch feature/parity-queue` on 2026-11-23.

| Decision | Chosen | Rejected | Evidence |
|---|---|---|---|
| Scope | M1 + M2 + M3 | M2 only (the issue's text) | `measurements/plan-baseline.txt`: M2 alone leaves `ptw-issue`, `ptw-skinparam` open (title unwrapped on both sides) |
| Title wrap source | `styleTitle` | body style | `ptw-title-only` jar svg |
| M3 | fix in-mission | file separately | `ptw-ctl-newline` (no wrap setting) reproduces; two sites |
| Gate | new authored gate | unit tests only | hnh/usecase-title-style precedent; the issue asks for the DOT node size checked against the jar |
| Measurer | reuse hnh `measure.mts` | new script | it is directory-parameterised |

The issue's mechanism paragraph ("the port's renderer wraps it", "with `skinparam wrapWidth` the row is conformant")
does not hold on `7f359ac55`: `ptw-skinparam` is 59 diffs, the same as `ptw-issue`. T3's comment on #219 says so.

## Pre-flight (Phase 8)

Run 2026-11-23 on `7f359ac55`, working tree clean apart from this brief.

- [x] Every Modify path in the write-sets exists; `tests/fixtures/` and `tests/oracle/svg-conformance/` exist for the
      Create paths.
- [x] `npm test -- --maxWorkers=4`: exit 0, 2356 files passed (1 skipped), 51096 tests passed, coverage
      97 / 92.6 / 97.51 / 98.04.
- [x] `npm run lint`: exit 0.
- [x] `--branch feature/parity-queue` is checked out; no other branch is created.
- [x] Every task spec states observability (N/A) and rollback (Reversible). Nothing Irreversible.
- `typecheck`, `build` and `format:check` were not run at planning; T0's batch close runs them first.
