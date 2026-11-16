# Decisions (uts)

## Auto-confirmed (unattended)

Planned without a person present (`/plan-mission --unattended next`, 2026-11-16; `next` resolved to #148: #136 is
blocked by open issues, #148 has no "Blocked by"). Each decision lists what was rejected and the evidence, so the user
can audit it.

### D1: A usecase reads `EntityImageDescription`'s styles, as the jar builds it

**Decision.** In `description-entity-style.ts`, a usecase and a business usecase take the same path as every other
`EntityImageDescription` symbol:
- `title` is `{root, element, componentDiagram, <symbolSNames>, title}` merged with the stereotype
  (`EntityImageDescription.java:142-153`). For `usecase-business` that is `{…, usecase, business, title}` (`USymbols`'
  `USECASE_BUSINESS` SNames; `symbolSNames` already returns them);
- the builder is the entity's own (`builderAt(node.styleGeneration)`), which mirrors `Entity.getCurrentStyleBuilder`
  (`Entity.java:755-763`).

`isUsecase` loses both callers and is removed (dead code in a file being modified).

**Rejected.**
- *Add `title` to the signature, keep the last builder.* Fixes 5 probes, not `style-after-usecase`: the jar keeps the
  default there, which only the entity's builder explains (`Entity.java:761-764`).
- *Keep the `EntityImageUseCase` reading and special-case `title` skinparams onto it.* Mirrors a class upstream never
  constructs (`GeneralImageBuilder.java:169-175`). CLAUDE.md: "A structural divergence IS the bug: re-mirror rather
  than patch with special cases."
- *Port `EntityImageUseCase` as a separate image.* Dead upstream; drawing through it would be drawing what the jar does
  not.

**Evidence.** The planning experiment (README, "Starting state"): both changes took all 6 probes to 0 diffs and moved
no usecase or component verdict.

### D2: Separable residuals are filed, not chased

A probe whose remaining diffs after D1 come from a different mechanism is measured, filed as a `queue:ready` +
`parity` issue with `file:line`, and moved to `OPEN` naming it. "Hard" is not separable; a mechanism exposed by D1's
own change (for example a sizer that reads the old `title`) belongs to T1b.

### D3: Hold the probes in an authored gate

Move the 6 probes from `measurements/probes/` to `tests/fixtures/usecase-title-style/<name>.puml` + `<name>.svg`, held
by `tests/oracle/svg-conformance/usecase-title-style.authored.test.ts`, modelled on `edge-label-embed.authored.test.ts`:
- rows are the `.puml` files on disk, each with its jar `.svg`;
- a `ZERO` row asserts 0 diffs;
- an `OPEN` row asserts its diff count never rises and carries a `reason` naming `#148` and its task (before T1b), or a
  filed issue (after);
- render path: `renderSync` + `DeterministicMeasurer`, compared with `compareSvg(ours, jar, 'deterministic')`.

**Rejected.** *Registering the probes in the description parity corpus* (`oracle/goldens/svg-description/README.md`,
"How an authored fixture reaches the parity corpus"). That route needs `svek-N.dot` parity rows and a survey re-run per
fixture; the gate holds the same assertion at a fraction of the CI cost, as #145 and the edge-label-embed mission did.

### D4: No new divergence, no public d.ts change

Nothing here is library-forced. `DIVERGENCES.md` and `oracle/accepted-divergences.json` stay unchanged. T0 snapshots
`dist/*.d.ts`, T2 diffs them; any change is stop 5.

## Operational readiness

- **Observability:** N/A. A browser-safe pure library with no service, SLIs or traces. The gates are the monitors.
- **Rollback:** Reversible. Revert the squash commit; the `pre-squash` tag keeps the per-task history.
- **Scalability:** N/A. Six more renders in the test suite, each under 0.1 s.
- **On-call:** N/A (library). The failure mode is a conformant row lost, caught by `verdict-diff.mjs`, the description
  ratchets and the censuses.
- **Backwards compatibility:** no API, d.ts or data contract change (D4). Only usecase SVG under title or late style
  blocks changes, towards the jar.
- **Irreversible changes:** none.
