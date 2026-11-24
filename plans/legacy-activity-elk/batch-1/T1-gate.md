# T1: the gate

**Goal:** the ratchet holds every row this mission will move, at today's score, rendered the way the survey renders an
ELK row (D4, D5). After T1, a change in batch 2 or 3 shows as a score change on a named row.

## Steps

1. Copy each `plans/legacy-activity-elk/measurements/probes/elk-*.puml` to `tests/fixtures/activity-legacy/`, and its
   `probes/jar/<slug>.svg` beside it as `<slug>.svg`. Re-render the 19 oracles in place with
   `scripts/oracle-render.sh "$PWD/tests/fixtures/activity-legacy" tests/fixtures/activity-legacy/elk-*.puml` and
   check `git diff --stat` shows no change to the copied svgs (the oracle is deterministic); delete any `svek-N.dot`.
2. `render-fixture-activity-legacy.ts`: add `prepareElkOnce()` and pass `elk` once prepared, exactly as
   `render-fixture-cheneer.ts:60-72` does, with its JSDoc pointing there.
3. `activity-legacy.diff-baseline.ratchet.test.ts`: `beforeAll(() => prepareElkOnce())` in the authored describe
   blocks that render; add every `elk-*` slug to `OPEN_ROWS`.
4. `build-authored-baseline.mts`: await `prepareElkOnce()` before rendering; give the 19 rows a reason naming #158
   and the batch that owns them (README table), e.g. `#158: the ELK cluster half is not ported (T2b)`.
5. `npx jiti plans/legacy-activity-engine-port/measurements/build-authored-baseline.mts <HEAD sha> --write`. The two
   issue rows must keep 15/74 and 33/210; the 19 new rows must match `/tmp/lae-t0.json`.

## Read-set
`render-fixture-cheneer.ts`, `render-fixture-activity-legacy.ts`, `activity-legacy.diff-baseline.ratchet.test.ts`,
`build-authored-baseline.mts`, `oracle/goldens/svg-activity-legacy/authored-baseline.json`.

## Write-set
`tests/fixtures/activity-legacy/elk-*.{puml,svg}`, the four files above.

## Interface output (consumed by T2b, T3a, T3b)
`prepareElkOnce(): Promise<ElkBackend>` exported from `render-fixture-activity-legacy.ts`; `OPEN_ROWS` holds 22
slugs: the 2 issue rows, the 19 `elk-*` rows and `pragma-smetana`.

## Acceptance
- Given T1, when the legacy ratchet runs, then it collects 19 more authored rows than at `<base>` and passes.
- Given the rebuilt baseline, then `pragma-elk` is 15/74, `pragma-elk-if` 33/210, and each `elk-*` row equals its
  `/tmp/lae-t0.json` score.
- Given the DOT gate, when it runs, then its fixture count is unchanged.

Observability is N/A. Rollback is Reversible.
