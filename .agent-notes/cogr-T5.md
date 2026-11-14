## Observation: a zero-diff class row can still fail the ratchet's DOT-EQUAL check
- **Context**: cogr T1, pinning the 111 zero-diff #109 class rows
- **Finding**: `fosufo-93-kozi113` was zero-diff in SVG but `dotEqual: false`; `class.golden.ratchet.test.ts` AC3 refused it. A multiline `usecase` was typed `descriptive`, so its DOT node was `shape=rect` while the drawn SVG was already right.
- **Impact**: before pinning class rows, check `dotEqual` in `parity-class.json`; the survey sets it, and #109-style rows without a golden dir are not reachable by `dot-sync-report.ts --slug` until pinned.
- **Confidence**: High

## Observation: `RenderFragment` is reachable from the public `.d.ts`
- **Context**: cogr T5, diffing `dist/*.d.ts` against the T0 snapshot
- **Finding**: a field added to `RenderFragment` (`src/core/dispatcher-types.ts`) appears in `dist/plantuml-engine.d.ts`, because `AssembledSvg = RenderFragment | CompleteSvg` is reachable from public types. An internal per-producer flag belongs on `ShellFragment` (`core/klimt/document-shell.ts`), carried by the finalizers' `{ ...fragment }` spreads.
- **Impact**: any mission with a "no d.ts change" rule should diff `dist` after every task that touches `dispatcher-types.ts`, not only at exit.
- **Confidence**: High

## Observation: nested entity comments use the qualified id (pre-existing, outside cogr's rows)
- **Context**: cogr T4f3 decoded potatu's embedded SVG
- **Finding**: `renderer-usymbol-entity.ts` names the `<!--entity …-->` comment by `classifier.id` (`c1.comp12.comp123.comp1234`); the jar writes the leaf name (`comp1234`). `compareSvg` reads neither comments nor embed payloads, so no row shows it.
- **Impact**: a dedicated fix needs care with custom namespace separators (`leafPortion` assumes `.`). Listed in `planning/next-missions.md` (cogr follow-on 5).
- **Confidence**: Medium (read from the agent's decode; not re-measured)

## Observation: description multiline openers drop `[[url]]` (pre-existing)
- **Context**: cogr T3d fixed the class twin (`class-multiline-element.ts#applyDecorations`)
- **Finding**: the description engine's `applyElementDecorations` also ignores the opener's url (`CommandCreateElementMultilines.java:216-220` adds it). No corpus row exercises it.
- **Impact**: follow-on for a description task; cogr follow-on 6.
- **Confidence**: Medium

## Issue comments (cogr T5)
Posted texts are in the mission journal; drafts were `/tmp/cogr-c{140,136,149,144}.md`.
