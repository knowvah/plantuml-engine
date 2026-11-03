## Observation: state leaf drawn by RoundedContainer when name != description
- **Context**: dss T3c, row `state__probe-zones`; `state.name|description` buckets had no reader.
- **Finding**: `EntityImageState.java:131-142` draws a leaf through `RoundedContainer` when the `name` and `description` BackGroundColor differ: north path, south path, transparent outline rect, two identical `<line>`s. The south `UPath` is uninset in `LimitFinder`, +1 px document height (`layout-ink-extent.ts` `southCapInk`, now also set on a zoned leaf by `state-sizing.ts#buildStateGeoTextFields`).
- **Impact**: any `<style> state { name { BackgroundColor } }` leaf. Equal zones keep one rect filled with the `state` colour, not a zone's.
- **Confidence**: High (probe rows `state__probe-zones`, scratch rows nm/ds/bd).

## Observation: layout-side reader skipped the state.body bucket
- **Context**: `state-composite-pass.ts#resolveSouthBackColor` answers "is the body drawn" for the ink reservation; it read `state`, not `state.body`.
- **Finding**: a `body`-only selector drew the body path but reserved no cap ink, so the canvas was 1 px short.
- **Impact**: readers in layout code (not renderers) skip buckets too: grep `elements?.['state']` in layout files when adding a bucket.
- **Confidence**: High.

## Observation: composite-scoped notes are not drawn
- **Context**: D7 follow-up; `buildFlatNoteGeos` takes `scopeId === ''` only.
- **Finding**: notes declared inside an autonom, cluster or concurrent composite are laid out (DOT node) and never materialised. Jar oracles (scratch, `scripts/oracle-render.sh`): autonom 32 diffs, cluster 47, concurrent 33; top-level note beside a composite 0.
- **Impact**: separate mission (needs a note GeoSpec per pass or per-pass posMap + edgePosMap); unrelated to colours.
- **Confidence**: High (measured).

## Observation: a correct added element can raise a row
- **Context**: `state/nimana-36-veco708` 95->97 and `state/sumiri-68-suvo696` 61->73 after the autonom body path.
- **Finding**: the jar draws that path; ours now does too. It inherits two pre-existing geometry errors (composite width +2.986 on nimana; FontSize 19 from `skin debug` on sumiri) that the header path/rect already carry, and compareSvg charges each coordinate where it charged the missing element once (childCount, weight 3).
- **Impact**: do not read these two as defects of the body path; their roots are the skin FontSize / width cascades.
- **Confidence**: High (diff-by-diff before/after).
