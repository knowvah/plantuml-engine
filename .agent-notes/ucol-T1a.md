## Observation: the jar emits colours inside `style=`, including one named colour
- **Context**: ucol T1a, deciding whether `invalidColours` should scan `style` attributes.
- **Finding**: `UGraphicSvg` writes `style="stroke:#hex;stroke-width:…;"` on ~140k shapes across the 5,938 cached
  oracles; every one passes the D3 rule. The single exception is the Batik-drawn `@startmath` row
  `unknown/caruta-83-deta919` (`backgroundColor yellow`): the jar emits `<g style="fill:yellow; stroke:yellow;">`, and
  so do we. A `grep 'fill:'` with a `;` boundary misses `stroke:yellow` there, because Batik separates with `; `.
- **Impact**: the refusal gate subtracts the golden's own offenders before checking ours (the golden is read whole
  only when ours has a candidate). Any future rule over `style` must accept jar-emitted named colours on the math path.
- **Confidence**: High

## Observation: the refusal gate's corpus is wider than `test-results/dot-cache`
- **Context**: ucol T1a, adding the every-row colour assertion.
- **Finding**: the gate also renders `oracle/goldens/svg-*` with `withJarCompatibleStyleInput` and the include store.
  On `5bab49f41` every fixture in both trees draws only valid colours (all 4 parts green, empty allowlist).
- **Impact**: the planning corpus scan (`measure-colours.mts corpus`) covers only the dot-cache tree; the gate is the
  authority.
- **Confidence**: High
