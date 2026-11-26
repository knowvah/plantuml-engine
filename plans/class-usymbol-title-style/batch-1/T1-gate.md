# T1: the authored gate

**Context.** Decision D3. The 19 planning probes (all but `cuts-issue`, which duplicates the uts row
`skin-title-allowmixing`) become authored fixtures, held by a gate in the shape of
`tests/oracle/svg-conformance/usecase-title-style.authored.test.ts`.

**Read-set.** `usecase-title-style.authored.test.ts` (the template), `measurements/plan-baseline.txt`,
`measurements/probes/`.

**Write-set.**
- `tests/fixtures/class-usymbol-title-style/<row>.puml` + `<row>.svg`: copy each probe and its `jar/<row>.svg`. Drop
  the `cuts-` prefix from the row names (`component`, `style-after`, ...).
- `tests/oracle/svg-conformance/class-usymbol-title-style.authored.test.ts`: the same three describe blocks as the
  template (manifest shape, `ZERO`, `OPEN` never rises). Its doc comment cites `EntityImageDescription.java:142-177`,
  `Entity.java:760-772`, `GeneralImageBuilder.java:162-180` and this issue.

**Steps.**
1. Put `ctl-plain`, `title-font`, `embed-class`, `embed-desc` and `embed-group` in `ZERO` (0 at base). The three
   `embed-*` rows guard the trap the planning experiment hit (decisions.md D1, "Trap").
2. Every other row is `OPEN` at its `plan-baseline.txt` count, with reason `#195 T2` (stroke, fill, colour) or
   `#195 T3` (a size delta remains once T2 lands). Name the separable ones now: `stereo` holds
   `#195 exit: class usecase stereotype sizing (85 diffs without any title skinparam)` until T4 files it, and
   `title-shadow` holds `#260`.
3. Run the gate and read the count: 19 rows, 5 zero, 14 open, all green.

## Acceptance
- Given the fixtures directory, when the manifest test runs, then the rows equal the `.puml` files on disk, each with
  a jar `.svg`.
- Given the base `src/`, when the gate runs, then every `OPEN` row sits at its baseline count and all five `ZERO` rows at
  0.

Observability: N/A. Rollback: Reversible.
