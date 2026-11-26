# T1: the gate, and the comparator's clock normalisation

**Writes:**
- `tests/oracle/svg-conformance/normalize.ts`, `tests/oracle/svg-conformance/svg-comments.ts`
- their unit tests (`compare.test.ts` or a new `transition-id-normalise.test.ts` beside them)
- `tests/fixtures/state-node-label/*.puml` + `*.svg` (copy `measurements/probes/*.puml` and `probes/jar/*.svg`;
  do **not** re-render: the committed jar svgs are the oracle)
- `tests/oracle/svg-conformance/state-node-label.authored.test.ts`

**Reads:** D2, D5, D6; the two template gates named in the task contract.

## Steps

1. **Red.** Unit tests for D2 on literal jar strings taken from `measurements/probes/jar/`:
   - `A-transition_A_B__go__1795555265179` and the port's `A-transition_A_B__go__0` normalise equal;
   - `transition_A_B__go__1795555265179-to-B`, `B-backto-transition_A_B__go__1795555395289`;
   - the comment `link *start* to transition_*start*_A__init__1795555395490`;
   - inert: `ent0003`, `lnk4`, a state named `transition_x` with no digit tail, `transition_1` as display text in a
     `<text>` node (decide whether text content is in scope: the jar never puts the id in text; keep the rewrite to
     attribute values and comments, and say so in the test name).
2. **Green.** One exported function (for example `normaliseTransitionNodeId`) used by both files. JSDoc `@see`
   `CommandLinkStateCommon.java:388-395` and decisions.md D2.
3. **Fixtures.** 31 rows. Keep the `snl-` slugs.
4. **Gate.** Lists: `ZERO` (0 diffs and 0 comment mismatches), `OPEN` (`maxDiffs`, `maxComments`, `reason`), and
   `SMETANA` (D5: element-set assertions + `maxDiffs`). Render each row through production `renderSync` with the
   survey's options, as `measure.mts` does. At T1: `ZERO` holds the two remove controls; every other row is OPEN at
   today's numbers, reason = its owner task from the README table.
5. **Measure** (contract step 5), then the full survey in the background: every survey row's diff count and
   verdict must equal `<base>`'s (stop condition 8). Journal the comparison.

## Acceptance
- Given a jar id and the port's id for the same transition, when both pass through `normalizeSvg`/`svgComments`,
  then they are equal.
- Given any committed survey row, when the survey reruns after D2, then its diff count and verdict are unchanged.
- Given the gate at T1, when it runs, then it passes with 2 ZERO rows and 29 OPEN/SMETANA rows at today's ceilings.

Observability: N/A. Rollback: Reversible.
