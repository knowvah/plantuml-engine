# Decisions (vb)

## Auto-confirmed (unattended)

Planned with nobody present (`/plan-mission --unattended next --branch feature/parity-queue`, 2026-11-16). `next`
resolved to #155: no issue was `queue:planned`; #136 is blocked by open issues (#155 among them); #155 is the
lowest-numbered `queue:ready` issue with no "Blocked by" reference and no `needs-ruling` label. Its title begins
"Ruling:", but the ruling is already in its body (README, "Objective"), so it is not parked. Each decision lists what
was rejected and the evidence, so the user can audit it.

### D1: `%version()` returns `versionString()` through the existing seam

**Upstream.** `GetVersion#executeReturnFunction` → `Version.versionString()` (`tim/builtin/GetVersion.java:63-66`) →
`CompilationInfo.VERSION` (`version/Version.java:47-49`).

**Ours.** `GetVersion` → `env.getVersionString()` (`src/core/tim/builtin/GetVersion.ts:37`); the default environment
answers `'unknown'` (`TimEnvironment.ts:140`).

**Decision.** `createDefaultTimEnvironment()` answers `versionString()` from `src/core/version.ts`, the port's
`Version.versionString()` analog that the error page and the `version` page already use. `GetVersion` stays as it is;
its header JSDoc changes from "a deliberate divergence … reads a compiled-in constant" to say it returns the port's
version by ruling #155, with the `@see` kept.

**Rejected.**
- *Call `versionString()` inside `GetVersion`, bypassing the seam.* The seam is how tests and hosts vary the answer
  (`string-functions.test.ts:248-255` already injects `'1.2.3'`); removing it is a refactor the ruling does not ask for.
- *Return `$version$` (option a).* Ruled against on #155.
- *Read `package.json` at runtime.* Forbidden in `src/` (CLAUDE.md, Architecture); `VERSION` already mirrors it.

### D2: No `0.0.999` fallback branch where the version cannot be unknown

The ruling adds "If 'Unknown', use something like `0.0.999`." In this port the only source of `unknown` is the default
environment's literal, which D1 removes. `VERSION` is a string literal (`src/core/version.ts:19`) that
`tests/unit/core/version.test.ts:12-16` pins equal to `package.json#version`, so `versionString()` cannot return an
unknown value. Per `code-principles.md` (no guards for states provable impossible), no fallback branch is added.

**Rejected.** *Add `VERSION || '0.0.999'`.* Dead code: the guarded state is excluded by a literal and a fitness test.
If execution finds a reachable unknown path (README push-forward), the constant goes there, citing #155.

### D3: `rekefe-90-baju604` is ledgered as an accepted divergence signed by the #155 ruling

`docs/svg-conformance.md` ("The divergence accounting model") allows exactly two states for a non-conformant row, and
adding a ledger entry "requires maintainer sign-off". The ruling chose option (c), which reads "with the row named as
a divergence"; that is the sign-off. The entry:

- `match.id` `svg-activity/rekefe-90-baju604` (the `svg-<type>/<slug>` form `emitter.golden.test.ts:150-155` parses;
  the survey type is `activity`);
- `scope` naming the activity svg-conformance survey; `acceptedAt` `2026-11-09`; `acceptedBy` `maintainer`;
- `reason` quoting the ruling and #155, the upstream chain (D1), the oracle's dev-build `$version$`, and the measured
  bound (`maxΔ`, the 5 attribute paths) from T1b's survey;
- no `surveyBlind`: the survey sees the difference.

`DIVERGENCES.md` gains a `### %version() prints this port's version` entry under "Preprocessor (TIM)", category "kept
by user ruling (2026-11-09, #155)", in the form of "Error pages print this port's version". The parity-report note
(`scripts/parity-dashboard-notes.ts`, `activity.detail`) names the row as a signed divergence instead of "waits on
#155".

**Rejected.** *Name it in `DIVERGENCES.md` only, as the activity LaTeX/QR rows are.* Those are library-forced
divergences already described by a section; this one is a per-row maintainer ruling, which is what the ledger records
(precedent: the #143 `svg-unknown/*` entries, ledger lines 166 and 220).

### D4: Scope stops at `%version()`

- The `<?plantuml $version$?>` processing instruction stays `VERSION_PLACEHOLDER` (`src/core/klimt/document-shell.ts:36`,
  upstream `SvgGraphics.java:307`). The ruling covers the builtin only, and the instruction is jar-identical today.
- `Defines`' `PLANTUML_VERSION` environment entry (`preproc/Defines.java:68`) is not reachable from any builtin here:
  `getEnvironmentValue` accepts only `dirpath`/`filedate`/`filename`/`filenameNoExtension` (`TimEnvironment.ts:82`).
  Unchanged.
- No public API moves: `src/index.ts` exports neither `TimEnvironment` nor `createDefaultTimEnvironment`. A
  `dist/*.d.ts` change is stop 5.

## Operational readiness

- **Observability:** N/A. A pure library; no new operation, log or metric.
- **Rollback:** Reversible. Revert the squash commit; the ledger entry and docs revert with it.
- **Scalability:** N/A. One string constant.
- **On-call:** N/A. The only failure mode is a wrong version string, caught by the unit tests and the version
  fitness test.
- **Backwards compatibility:** output change only — `%version()` prints `0.2.0` instead of `unknown`. No API, type or
  data contract changes. Not a breaking change.
