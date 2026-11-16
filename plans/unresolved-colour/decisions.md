# Decisions (ucol)

## Auto-confirmed (unattended)

Planned without a person present (`/plan-mission --unattended next`, 2026-11-15). Each decision lists what was
rejected and the evidence, so the user can audit it.

### D1: Scope is every probe where the jar draws and the residual is M1, M2 or M3

**Decision.** The 17 open probes in the README table, in class (batch 2) and description (batch 3), plus the 10 zero
probes as guards. Each mechanism-engine pair is its own task and commit.

**Rejected.**
- *The issue's 6 probes only.* The other 11 are the same three upstream calls at sibling sites (the README table). For
  example, `class-line-override` is `Colors.java:113`'s null replacing an earlier value. CLAUDE.md: "The corpus is the
  work queue and not a ceiling".
- *The jar-error probes too (`act-arrow`, `obj-line`, `class-arrow-multi`).* The issue covers only cases where the jar
  draws: "The neutral grey from #143 doesn't apply: it's only for places where the jar errors". Where the jar errors,
  the 2026-10-10 rule makes our drawing a per-row maintainer signature, not a mirror task. The exit files them.
- *`uc-actor-line`.* It routes to sequence with a valid colour too (10 diffs with `#line:red`), so the cause is routing,
  not colour resolution. Separable.

**Separable residual.** A probe whose remaining diffs after its mechanism lands come from something else gets measured
and filed as a `queue:ready` issue with `file:line`, then moves to `OPEN` naming it. "Hard" is not separable; a
mechanism exposed by the task's own change belongs to the task.

### D2: Fix at each parse or cascade site with the `HColorSet` method upstream calls there

**Decision.** At each site, resolve the token through the existing `core/klimt/color/HColorSet.ts` with the same method
the Java calls there:
- M1: `getColorOrWhite`, at `WithLinkType.java:162`;
- M2: `getColorOrNull`. A null still claims the key, so it clears an earlier value (`Colors.java:111-113`);
- M3: `getColorOrWhite`, through `ValueImpl.asColor` (`ValueImpl.java:103`).

Resolvable tokens keep their current representation, so resolvable output is byte-identical.

**Rejected.**
- *A sanitiser at SVG emission (`fixColor`) that maps any invalid value to one colour.* The jar's answer differs by
  site (white, default, or a cleared earlier value), so one emission-time rule cannot mirror it. It would also hide the
  mechanism from every test.
- *Re-plumb class and description through `core/abel/Colors.ts` and `core/decoration/WithLinkType.ts` wholesale.* That
  is the most literal mirror, but it touches every colour on every class and description row. CLAUDE.md: "Do not
  refactor while porting". It is allowed as push-forward when the engine's pins stay byte-identical.

**Evidence.** State already uses both core ports, and `state-arrow`, `state-line` and `state-text` are at 0 diffs.
Description's style path already calls `asColor` (`style-reads.ts#stylePaint`), and `style-comp-bg` and
`style-root-bg-comp` are at 0.

### D3: Hold the invariant in the refusal gate's existing render, plus an authored gate

**Decision.**
- `tests/helpers/svg-colour-validity.ts` exports `invalidColours(svg): string[]`. Valid means `#hex` (3, 4, 6 or 8
  digits), `none`, `black`, `white` or `url(#…)` in `fill`, `stroke` or `stop-color`: exactly what the 5,938 cached
  oracles emit.
- `refusal-coverage-gate.ts#measure` already renders every committed fixture once. It also records `invalidColours`,
  and each part asserts the list is empty. A row may be excused only by an allowlist entry that names an issue.
- The authored gate holds the probes (D5).

**Rejected.**
- *A separate every-row render gate.* That doubles the render cost on the CI shards; the slowest shard was 9m20s on the
  last PR.
- *A field in the survey's `parity-*.json`.* The survey is a producer, not a test: a regression would only show at the
  next survey.

### D4: No new divergence

Nothing here is library-forced. Every residual is a bug or a separable issue (D1). `DIVERGENCES.md`,
`oracle/accepted-divergences.json` and the #143 `colorOrNeutral` sites stay unchanged. The class cascade guard in
`style-cascade-class.ts#cascadeHex`, which leaves an unparsed token unset (`.agent-notes/
si26-jar-unresolvable-colour-token-is-white.md`, "G2 N36"), was never a documented divergence. It contradicts
`ValueImpl.java:103`, so T2c ports the jar's answer.

### D5: Hold the probes in an authored gate

- **The probes.** Move the 27 in-scope probes from `measurements/probes/` to
  `tests/fixtures/unresolved-colour/<name>.puml` + `<name>.svg`. They are held by
  `tests/oracle/svg-conformance/unresolved-colour.authored.test.ts`, modelled on `edge-label-embed.authored.test.ts`:
  - rows are the `.puml` files on disk, each with its jar `.svg`;
  - every row asserts `invalidColours(ours)` is `[]`. The jar's own list is asserted `[]` as a fixture check;
  - a `ZERO` row asserts 0 diffs;
  - an `OPEN` row asserts its diff count never rises and carries a `reason`. Until the row's task lands, that reason
    names `#145` and its task id. After the task, it names a filed issue.
- **The `invalidColours` exception for OPEN rows.** At T1a, all 17 open rows emit an invalid value. So T1a's `OPEN`
  entries carry `invalid: true`, which skips the colour assertion for that row only. Each task removes the flag as it
  lands. At exit, no row carries it.
- **The render path.** `renderSync` + `DeterministicMeasurer`, as `edge-label-embed.authored.test.ts` does.
- **Out-of-scope probes** stay in `measurements/probes/`, outside the gate.

### D6: The public d.ts does not move

Every touched module is internal. T0 snapshots `dist/*.d.ts`, and T4 diffs them. Any change is stop 5.

## Operational readiness

- **Observability:** N/A. A browser-safe pure library with no service, SLIs or traces. The gates are the monitors.
- **Rollback:** Reversible. Revert the squash commit; the `pre-squash` tag keeps the per-task history.
- **Scalability:** N/A. A regex over output that is already rendered. Each authored row is under 0.1 s.
- **On-call:** N/A (library). The failure mode is a conformant row lost, caught by `verdict-diff.mjs` and the ratchets.
- **Backwards compatibility:** no API, d.ts or data contract changes (D6). Only the SVG for unresolvable tokens changes,
  towards the jar.
- **Irreversible changes:** none.
