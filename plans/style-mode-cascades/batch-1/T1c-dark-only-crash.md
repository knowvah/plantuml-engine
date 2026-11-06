# T1c — A dark-only `@media` value with no dark mode crashes, as upstream

**State at planning:** `sequence__scope-media-dark-only` puts `document { BackgroundColor #111111 }` inside
`@media (prefers-color-scheme:dark)` with no `skinparam mode dark`. The stock jar crashes (exit 200) with
`java.lang.IllegalArgumentException: null/#111111` at `ValueImpl.asColor(ValueImpl.java:101)`, called from
`TitledDiagram.calculateBackColor`. We draw the diagram with no background (25 diffs).

**Read:** `ValueImpl.java:92-108`, `DarkString.java:50-72` (why the user's dark-only value does not merge with the
skin's regular `document` value), `TitledDiagram.java:280-289`. On our side: `ValueImpl.ts:130-139` (throws already),
`DarkString.ts#mergeWith`, `document-back-color.ts` (its catch at `:125` and its callers), and the crash page path in
`src/index.ts` (the `UgDiagram.ts` header names it).

**Do:** per D4. Red: `renderSync` on the row draws our crash page and fires the error-page observer. Find the
catch that turns the throw into "no background", and let the exception reach the crash page. Check first that our
`DarkString#mergeWith` really leaves `value1` null for this signature, as upstream's does. A difference there is a
port defect to fix first, with its quote. A legitimate dark-only value under `skinparam mode dark` must still draw
(`sequence__scope-dark-*` rows unchanged).

**Measure:** `rows.mts` prefix `sequence__scope-`. Survey the buckets whose corpus sources hold `prefers-color-scheme`
(three, all conformant at planning: activity `levuma-67`, class `zirori-93`, sequence `voruto-32`).

## Acceptance
- Given `sequence__scope-media-dark-only`, when the dss ratchet runs, then it is conformant through T1a's rule.
- Given the three corpus dark-mode rows, then each stays conformant.

Observability N/A. Rollback Reversible.
