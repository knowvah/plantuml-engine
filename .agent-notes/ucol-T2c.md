## Observation: element-scope buckets carried raw `<style>` colour values
- **Context**: ucol T2c, tracing why `<style> class { BackgroundColor zzblue }` emitted `fill="zzblue"`.
- **Finding**: the leak was not the class cascade (`style-cascade-class.ts#cascadeHex`, which left it unset) but
  `style-element-scope.ts#writtenColor`, which writes every engine's `theme.colors.elements[bucket]` through
  `paint.ts#parseColor` (keeps an unknown token); `renderer-classifier-scoped-colors.ts#scopedPaint` then printed it
  via `resolveColorToSvgHex` (also keeps it). Both now read through `HColorSet.ts#asColorToken`
  (`ValueImpl.java:92-108`).
- **Impact**: any new reader of a `<style>` colour should go through `asColorToken` (or `style-reads.ts#stylePaint`),
  never `parseColor`/`resolveColorToSvgHex` on the raw value: both pass an unparseable token through by design.
- **Confidence**: High
