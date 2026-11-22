# T1 — diagnose the activity-3 arrow-label embed block

**Writes:** `.agent-notes/aae-T1.md`, `plans/activity-arrow-embed/measurements/java/*` (optional probe source),
`plans/activity-arrow-embed/decision-journal.md`, and `decisions.md` only to amend a contradicted decision (then stop).
**Reads:** the task-contract spine; `src/diagrams/activity/layout/compress/edge-label-anchor.ts:84-142`,
`src/diagrams/activity/activity-creole-sheet.ts`, `activity-text-sheet.ts`, `layout/tile-layout-inlabel.ts:100-130`,
`layout/canvas-origin-text-ink.ts:130-170`, `activity-draw-extent.ts`, `src/core/svek/edge-label-embed.ts`.

## Context

The README's measurements say the jar's `Snake#getTextBlockPosition` (`Snake.java:244-250`) receives a block 10 tall for
an embed-only label (both oracle and stock jar), that ours computes 27.111, that our `act3-open` origin moves 31.5, and
that every row's canvas is 1 px wider. `act3-mixed` (text line, then embed) already places the image right. None of
this is a mechanism yet.

## Task

Produce, for each of the three residuals, the artifact from `~/.claude/rules/diagnosis.md`: **mechanism**, **origin**
`file:line` (Java and ours), **causal chain**, **ruled out** with evidence.

1. **The 10-tall block.** Trace `getTextBlock(display)` for the label `{{\nclass X\n}}` and for `{{` through
   `Display#create7` → creole sheet → stripes → `calculateDimension`, with the activity's `StringBounder`. Find which
   object contributes the 10 (and the jar's width), and why the embed image's own size does not reach it. Explain
   why `act3-mixed` (text first) agrees with ours while embed-only does not.
2. **Our 27.111.** Instrument `edgeLabelBlockSize` (temporary logging or a scratch test, removed before commit) for the
   same labels: what lines, stripes and atoms our sheet builds, and which arithmetic yields 27.111.
3. **The 31.5 origin shift in `act3-open`.** Which consumer sees a 227-tall extent above the arrow, and what the jar
   does there instead (its `LimitFinder`/`FtileMargedRight`/margins). Quote the Java.
4. **The 1-px canvas width.** Same mechanism or separable (D1)? If separable, say why with evidence and file a
   `queue:ready` issue in T5.
5. **The reserve.** Confirm from `FtileFactoryDelegatorAssembly.java:58-63` why the jar's arrow stays 20 long for an
   embed-only label while a 3-line text label grows it, and check ours follows the same expression.

When reading cannot settle step 1, compile a throwaway probe in `/tmp` against `oracle/dist/plantuml-oracle.jar` that
calls the same API with the same `StringBounder` and prints the dimensions (README push-forward). Copy its source to
`measurements/java/` and the printed output into the note.

## Acceptance
- Given `.agent-notes/aae-T1.md`, when read, then each of the five steps has mechanism, origin `file:line`, causal chain
  and a non-empty "ruled out".
- Given the T2/T3 write-sets in batch 2, when T1 finds the origin elsewhere, then the journal names the real files and
  batch 2's overview is updated to match before T2 starts.
- Given the step 1 mechanism, when it implies a change in `src/core/` shared by other engines, then the journal lists
  which engines' gates T2 must also run.

Observability N/A. Rollback Reversible. Commit `docs(aae): diagnose the activity arrow-label embed block` with
`Refs: #188`.
