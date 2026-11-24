# ptw T2c — equalsLike over getWithNewlines(code) (#219)

## Observation: the display/code comparison crosses two Display parsers
- **Context**: `package "First line\nSecond line" {}` drew its name twice.
- **Finding**: the port's `entity.getDisplay()` seam is a string already split on real newlines, while the code
  keeps the two-character `\n` escape; a plain `===` never matched. `displayEqualsLikeCode`
  (`EntityImageDescriptionSupport.ts`) builds both `Display`s (`Display.create(split)` vs
  `Display.getWithNewlines(code)`) and calls the real `Display#equalsLike` (`Display.java:118-122`).
- **Impact**: any other `display === id` comparison standing in for `equalsLike` has the same defect; grep
  `display === ` before trusting one.
- **Confidence**: High

## Observation: the fcTitle branch is observable with a title style
- **Context**: checking non-package leaves whose code holds `\n` (T2c step 3).
- **Finding**: `component "First\nSecond"` with `component { title { FontStyle italic } }` was 2 diffs (body font)
  before the fix and 0 after: `EntityImageDescription.java:184-186` picks `fcTitle` when the display equalsLike the
  code. Without a title style both fonts are equal, so the default probe was already 0.
- **Impact**: a font-branch mechanism needs a probe whose two styles differ, or it is invisible.
- **Confidence**: High
