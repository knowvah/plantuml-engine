# T3a — `TimingDiagram`, `timing-skin-param.ts`

**Write-set:** `src/diagrams/timing/{TimingDiagram,timing-skin-param}.ts`, `tests/unit/timing/**`,
`tests/architecture/layering.test.ts` if an import needs an allowlist entry.

**Read:** D2, D6, D7, D13, D16; `TimingDiagram.java` (430 lines); `src/diagrams/nwdiag/{NwDiagram,nwdiag-skin-param}.ts`
(the shape); `src/core/TitledDiagram.ts`; `src/core/java-hash-set.ts`.

**Do:**

1. `timing-skin-param.ts`: a copy of `nwdiag-skin-param.ts` (D2), widened only by members a timing class reaches;
   unreached members throw `unported:`.
2. `TimingDiagram.ts`: the fields in Java order (`marginX1 = 5` public static, `marginX2 = 5`, `codes`, `players`,
   `clocks`, `messages`, `highlights`, the ruler built from the skin param at construction, `now`, `lastPlayer`,
   `timeAxisStategy = AUTOMATIC`, `compactByDefault = false`), `getTextBlock` with `withMargin(10, 10)`,
   `drawInternal` in its exact order (backgrounds, border, highlights back, vlines, players, time axis, messages,
   highlight lines and captions), the D7 quirks, every factory method of the interface contract.
3. Keep `black()`, `getBorderStroke()`, `getStyleSignature()` as named.

**Tests:** build `cov-concise-basic` and `cov-robust-basic` by calling `createPlayer*`, `addTime`, `setState` directly
(no parser yet); the drawn SVG body and `calculateDimension` (+20 margin) equal the oracle's 251 × 106 and 410 × 135
minus the document chrome; `createPlayerClock` with `compact = true` and `compactByDefault = false` builds a non-compact
clock (D7); `getUTranslateForPlayer` of an unknown player throws.

## Acceptance
- Given two probes built by direct calls, then `getTextBlock` draws the oracle's body and dimension.
- Given `npm test`, then it passes with the new files covered ≥90 %.

Observability N/A. Rollback Reversible.
