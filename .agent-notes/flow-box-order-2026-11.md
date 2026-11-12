# flow-box-order (#174), 2026-11-12

## Observation: pin-flow.mts duplicates the golden twin of a multiset row

- **Context**: Pinning `unknown/bemixo-79-xulu250` into `oracle/goldens/svg-flow/ratchet.json` after ruling #174.
- **Finding**: `plans/flow-engine-port/measurements/pin-flow.mts` `appendTwins` (lines 58-77) appends a `goldens`
  twin to the routing and refusal baselines for every pin, with no check for an existing one. A row held by the
  multiset tier already has its golden directory and its twins (added at flp/T4), so the pin appended a second
  twin to each baseline. `refusal-coverage` and `routing-conformance` caught it as off-by-one counts.
- **Impact**: Reverting both baselines is the correct pin for a row that moves from `multiset.json` to
  `ratchet.json`, as `oracle/goldens/svg-flow/README.md` states. No flow corpus row remains in `multiset.json`,
  so the script is not expected to run again for flow; the same shape may exist in other missions' pin scripts.
- **Confidence**: High

## Observation: positional compare passes 10 of 38 multi-box flow fixtures by chance

- **Context**: Measuring whether the new real-data test in `flow-box-order.test.ts` proves anything.
- **Finding**: With the FLOW rule switched off (the reference's `data-diagram-type` renamed), 10 of the 38
  multi-box authored fixtures pass `compareSvg` against the oracle or a recorded layout; with it on, 38 of 38.
  This matches flow-engine-port's own measurement (10 positional by chance, 28 not).
- **Impact**: The test fails if the box-order rule regresses; it is not vacuous.
- **Confidence**: High
