# T2: refuse a non-bare colour capture

**Goal.** `actor X #line:red` makes the sequence factory fail, as `CommandParticipant.java:183-185` does, so the port's
factory chain hands the source to description (or class), or to the jar's error page.

**Write-set:** `src/diagrams/sequence/command-participant.ts` (`declareParticipant`),
`src/diagrams/sequence/sequence-parse-helpers.ts` (`ParseState`), `src/diagrams/sequence/parser.ts` (`:294`, `:515`),
`tests/unit/sequence/command-participant.test.ts`, the gate, `DIVERGENCES.md`.
**Read-set:** `decisions.md#d2…`, `#d3…`, `#d4…`; `command-participant.ts:28-54`; `parser.ts:283-296`;
`sequence-parse-helpers.ts:60-75`; `description/parse-state.ts:100-115`; `src/core/klimt/color/HColorSet.ts:380-394`.

## Steps

1. **Red.** In `command-participant.test.ts`, assert that parsing `actor X #line:red` refuses with `kind: 'execution'`,
   `line` 2 (or the engine's own line convention, as the file's other refusal tests use), message `badColor()`'s, and
   `commandScore` 10. Assert also that `actor X\nactor X #line:red` does **not** refuse, that
   `participant X #line:red [\nA\n]` does not refuse (D4), and that `actor X #zzblue` does not refuse (D2).
2. **Green.** In `declareParticipant`, after the existing-CODE branch and before `ensureParticipant`: when `color` is
   defined and `refusesAsBareColor(color)`, set `state.executionError` and `state.executionErrorScore` from
   `CommandExecutionResult.badColor()`, and return without creating the participant. The return shape must not let
   `createCommand` file a CREATE event for it. Add `executionErrorScore?: number` to `ParseState` and pass it at
   `parser.ts:294`. Keep `parser.ts` and `sequence-parse-helpers.ts` no longer than they are (README gates).
3. Rewrite any unit test that asserted the over-accept (README "These are not stops"). Journal each one.
4. `DIVERGENCES.md`, neutral-ruling paragraph ("We draw where the jar errors"): extend the sentence that names the
   `object`/`json` sites with the sequence participant (`CommandParticipant.java:183-185`, #191). That adds no divergence.
5. Measure (task contract step 5), then pin: the 23 DESCRIPTION/CLASS rows to ZERO; `alr-participant`, `-create`,
   `-create-bare` to ERROR_PAGE if they pass D7; `alr-seq-only` OPEN on #283 with D7 items 1 to 4 asserted;
   `alr-order` OPEN on #284; `alr-dashed` OPEN with reason `T4 files it`.

## Acceptance
- Given `actor X #line:zzblue` (the issue), when rendered, then ours equals the jar's description diagram: 0 diffs,
  0 comment mismatches.
- Given `participant X #line:red`, then ours is an error page labelled `No such color (Assumed diagram type: sequence)`
  at line 2, with the Welcome block.
- Given `actor X` then `actor X #line:red`, then the diagram stays sequence, at 0 diffs.
- Given `participant X #line:red [` … `]`, then the diagram stays sequence, at 0 diffs (D4).
- Given `actor X #zzblue`, then the row is unchanged: drawn, with `fill="#D3D3D3"`.

Observability: N/A. Rollback: Reversible (revert the T2 commit).
