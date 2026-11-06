# T3b — Probe past the rows

The rows are the work queue, not the ceiling (`CLAUDE.md`), and green brief rows have hidden defect families
before (`.claude/memory/probe-past-authored-rows.md`). For each mechanism batches 1 and 2 fixed, author sources the
corpus lacks and compare them with their oracles:

- T1a: each colour-reading command inside a swimlane, inside a `partition`, and nested (an `if` in a `repeat`).
- T1b: a stereotype style inside a swimlane, a note on a stereotyped box, `skinparam` and `<style>` both setting
  the same property, `!theme` plus a class.
- T2a: a PNG-backed sprite (`sprite $x [16x16/16] {…}`) and an `<img>` as the group name.
- T2b: a table in a composite state's description under `!pragma layout elk` and inside a concurrent region.
- T2c: whatever its diagnosis named.

Fix what fails, each with its Java quote, in this task or a new one; journal anything separable per D7.

**Write:** `tests/fixtures/ubt-T3b/` (sources and oracles), the fixes, their tests.

**Measure:** every bucket a fix touches.

## Acceptance
- Given each authored source, when compared with its oracle, then 0 diffs, or a journal line with the mechanism and
  its owner (a task here or an issue).
- Given every surveyed bucket, then 0 conformant lost against T0.

Observability N/A. Rollback Reversible.
