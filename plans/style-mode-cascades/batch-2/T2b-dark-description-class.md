# T2b — Component, usecase, class, object and activity: boxes and notes

**State at planning:** with `skinparam mode dark` and no `<style>`: component boxes `#F1F1F1` against `#313139`
(`component__mode-dark` 10), usecase ellipses and text (`usecase__mode-dark` 7). The note in activity, class and
object is `#FEFFDD` against `#714137`, with text `#000` against `#FFF` (3 each). The dss `component__probe-dark` is
63, with a 1-2 px size delta beside the colours. `component__probe-dark-element` is 2 (text fill under an `element`
background).

**Read:** `EntityImageDescription.java` (constructor: the style signature and its colour reads),
`EntityImageNote.java` (note fill and font), `EntityImageClass.java`, `EntityImageObject.java`, activity's
`FtileBox`/note tiles, and `plantuml.skin`'s `@media` entries for `note`, `element` and `root`. Ours: the
`elements[sname]` readers in `src/diagrams/description/`, `src/diagrams/class/`, and the activity note renderer.
T2a's shared path is the input.

**Do:** per D2. Red first per engine, with values from the oracles. Route each reader that still takes a light default
through T2a's mapped theme value. For `component__probe-dark`'s size delta, find whether `database { FontSize 12 }`
or the dark path changes a font: read the diff before you touch geometry.

**Measure:** `rows.mts` prefixes `component__`, `usecase__`, `class__`, `object__`, `activity__mode-dark`; surveys of
component, usecase, class, object and activity.

## Acceptance
- Given `*__mode-dark` and `*__mode-dark-style` for component, usecase, class, object and activity, then each is
  conformant, or journaled with its remaining mechanism and owner.
- Given `component__probe-dark` and `component__probe-dark-element`, then each is conformant or journaled the same way.
- Given the survey of those five buckets, then 0 lost.

Observability N/A. Rollback Reversible.
