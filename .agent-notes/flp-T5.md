# flp-T5 — close-out comments to post by hand

## Observation: gh issue comment denied for #132 and #136
- **Context**: T5's close-out comments. The auto-mode classifier denied `gh issue comment 132` (and T3c's #136
  comment), so per the brief neither was retried.
- **Finding**: Post these two comments by hand.
- **Impact**: #132 and #136 do not yet record the outcome or the #174 dependency.
- **Confidence**: High

### For #132

> flow-engine-port (flp) finished on `feature/parity-queue` as one unsigned commit on `14ccdcbba` (not pushed;
> per-task history on the local tag `flow-engine-port/pre-squash`).
>
> - `flowdiagram/` (5 files) is ported into `src/diagrams/flow/`, and the reachable part of `golem/` into
>   `src/core/golem/`. Flow is registered at `PSystemBuilder.java:185`.
> - `bemixo-79-xulu250` no longer hits the unknown-type sentinel. It is multiset-equal to its oracle (605×421,
>   `data-diagram-type="FLOW"`) but stays `diverged`: the jar draws boxes in Java identity-hash order (6 renders gave
>   6 SVGs), so the positional compare can only pass by chance. **Ruling #174** asks how such rows count.
> - 69 authored fixtures:
>   - 17 one-box fixtures plus `cov-embedded` are zero-diff;
>   - 13 are error pairs, and all 13 also error on release 1.2026.8;
>   - 38 multi-box fixtures are each multiset-equal to the oracle or to a recorded layout.
> - New `svg-flow` ratchet with a multiset tier. The routing row is re-pinned to `agree`.
> - 0 conformant rows lost in any engine, and no bucket's counts moved. No divergence or acceptance was added, and
>   `dist/*.d.ts` is unchanged.

### For #136

> flow-engine-port (#132): overall conformant unchanged (no bucket moved, 0 lost). `unknown/bemixo-79-xulu250` is
> `diverged` only by the jar's identity-hash box order and is multiset-equal to its oracle. Blocked by #174 (the
> ruling on how identity-hash-ordered `@startflow` rows count: bemixo plus 38 multi-box authored fixtures).

## Observation: CI risk from flow is low
- **Context**: T5's CI-risk check on the latest PR run, 43056792224 (PR #171, 2026-11-11), with its vitest blobs merged.
- **Finding**: The slowest shard took 10m21s (shard 3). The heaviest files are the routing/refusal part files: routing
  part-2 took 152.4 s and part 1-4 sum to 417.4 s; refusal part-2 took 146.0 s and part 1-4 sum to 407.8 s. Flow adds
  1 golden row to each walker, and about 190 ratchet tests that render diagrams of 1-12 boxes.
- **Impact**: There is no new hot spot; the routing/refusal parts remain the shard-time risk, as they were before flp.
- **Confidence**: Medium (the run predates bpm/git/flow; their rows add milliseconds each)
