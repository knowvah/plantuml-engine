# smc-T4 — cascades (skin rose, late skinparam, !theme)

## Observation: the port keeps skinparam and <style> values in two tiers
- **Context**: T4b/T4c, a later declaration must win by the builder's counter (`ValueImpl.java:51-55`).
- **Finding**: a `<style>` run writes cascade fields, a skinparam writes flat fields/buckets, and readers prefer one tier, so order is lost. Patched per measured key with two tables in `skinparam-supersedes-cascade.ts` (`SUPERSEDED_BY_KEY`, `SUPERSEDED_BY_STYLE`), the `withoutSupersededArrowCascade` pattern. Siblings (`classBorderThickness` vs later style, `*BackgroundColor`, `*FontName`, class `Shadowing`, activity corner vs an earlier `<style>`) are unmapped: no row measures them.
- **Impact**: any new cascade row may expose another pair; the structural fix is reading one merged `Style` per element (D7).
- **Confidence**: High

## Observation: readers that ignored a plain skinparam altogether
- **Finding**: `skinparam roundCorner` never reached activity boxes, state boxes, class/state notes; `skinparam arrowThickness` never reached activity arrows; `class { Shadowing }`/`state { Shadowing }` never drew a filter; rose shadows were never drawn on notes, activity circles or plain boxes — with or without a `<style>`. The brief's "gate drops it" hypothesis for M5 was false.
- **Impact**: "cascade" rows mostly exposed plain reader gaps; probe the no-`<style>` twin first.
- **Confidence**: High

## Observation: activity boxes capture the builder at their command
- **Finding**: `ActivityDiagram3.java:114-117` → `InstructionSimple` keeps the builder current at `:label;`, so a late skinparam does not reach an earlier box. Ported for plain boxes only (`activity-box-builder-at.ts`); `InstructionIf/Repeat/While`, repeat-inline and `backward:` also capture it.
- **Confidence**: High

## Observation: `opale-rounded-path` delta does scale under dpi
- **Finding**: the jar's note notch half-depth is 4.167 = 4 × 100/96 under cerulean's dpi; the old header claiming `delta` does not scale was wrong (corrected in T4c).
- **Confidence**: High
