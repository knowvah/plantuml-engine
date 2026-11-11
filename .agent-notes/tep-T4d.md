## Observation: WithLinkType.applyStyle dropped transparent, gradients and schemes
- **Context**: cov-message-transparent, `-[#transparent]>` in a timing message (jar: `stroke:none`, polygon `fill="none"`; ours drew white).
- **Finding**: `src/core/decoration/WithLinkType.ts` carried a local `getColorOrWhite` over `parseSimpleColor`, which answers `undefined` for
  `transparent`, `background`, `automatic`, `?a:b` and `c1-c2`, so all became white. Java's `HColorSet#getColorOrWhite`
  (HColorSet.java:58-63, parseColor java:78-120) answers `HColors.none()` for the first two. Now calls `HColorSet.instance().getColorOrWhite`.
- **Impact**: shared by state, activity-legacy, gantt and timing links; all consumers already accept `HColorSimple`/`HColorGradient`.
  state/gantt/activity/description/class ratchets unchanged.
- **Confidence**: High

## Observation: a state note does not draw a `{{ }}` embedded diagram
- **Context**: cov-embedded-state (timing diagram in a state note), the one T4d fixture left at a diff.
- **Finding**: the jar draws one `<image>` (qualified name `GMN2`); ours prints the block as note text (`state/renderer-note.ts`
  draws text lines, `state-note-layout.ts#measureNote` sizes through `buildNoteBody`, which has no nested renderer). Component, usecase,
  object, sequence and activity notes embed correctly. Needs an image line kind in the state note geometry plus the nested-render size.
- **Impact**: state-engine feature gap, not a timing defect; separable.
- **Confidence**: High (probe on six diagram types)

## Observation: ProtectedCommand's message prints the version
- **Context**: cov-states-clock (`P is low` on a clock): the jar throws UnsupportedOperationException from a command.
- **Finding**: both pages carry `(V<version>)` (ProtectedCommand.java:72); `fixtures.mts` now normalises it as the version-banner lines
  already are (ruling 2026-10-10). The row is an error pair.
- **Confidence**: High

## Observation: issue to file by hand (gh issue create denied 2026-11-10)
- **Context**: tep T4d close, residual `cov-embedded-state`.
- **Finding**: `gh issue create --label parity --label queue:ready` was denied by the auto-mode classifier (external system writes). Title: "State: an embedded {{ }} diagram in a state note draws as text, not an image". Body below, verbatim. Once filed, #136 needs a "Blocked by #<new>" line (D8).
- **Impact**: the only residual of 141 timing fixtures; no corpus timing row depends on it.
- **Confidence**: High

> From #127 (`timing-engine-port`, T4d). One authored probe and one corpus row.
>
> ## Measured 2026-11-10
>
> `tests/fixtures/timing/cov-embedded-state.puml` (a `robust` timing diagram inside `{{ … }}` in
> `note right of S1`), with its jar oracle beside it. The jar draws the embedded diagram as one `<image>` in the
> note (`svg/g[1]/g[2]` has 3 children); we draw the `{{ … }}` lines as note text (9 children). The block's type
> does not matter: a sequence diagram (`Alice -> Bob`) in the same state note also draws no `<image>`. The same
> `{{ }}` in a component, use case, object, sequence, activity or class note embeds correctly.
>
> Corpus row `state/xetase-70-zaza808` (`LexTop --> LexTop: {{` on a transition label) is diverged
> (`svg/g[1]/g[4]/text[1]`, viewBox 645 x 320 against our 121 x 130), probably for the same reason.
>
> ## Lead
>
> `src/diagrams/state/renderer-note.ts` draws note lines itself and `state-note-layout.ts#measureNote` sizes them
> through `buildNoteBody`, which has no nested renderer. Upstream builds every cuca note through one
> `EntityImageNote` (`svek/GeneralImageBuilder.java:118-119`), whose `Display` goes through the creole sheet, where
> `{{ }}` becomes an embedded-diagram atom (`EmbeddedDiagram.java`); the other engines reach that through
> `src/core/klimt/creole/SheetBuilder.ts` / `src/core/EmbeddedDiagram.ts`. The state note needs an image line kind in
> its geometry plus the nested render's size.
>
> ## Done when
>
> - `npx jiti plans/timing-engine-port/measurements/fixtures.mts cov-embedded-state` prints 0 diffs.
> - `state/xetase-70-zaza808` is re-measured and either conformant or named.
> - 0 conformant losses in every engine; the state ratchets stay green.
