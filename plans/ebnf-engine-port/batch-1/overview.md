# Batch 1 — upstream seams

Serial (D11). Each file is new or gains an unused method, and nothing reaches it from `renderSync` until T4a, so
`npm test` stays green and the unit tests are the measure.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T1a | `CharInspector`, `CharInspectorImpl`, `BlocLines#inspector`; `I18n` and its bundles | typescript-pro or orchestrator | `src/core/utils/{CharInspector,CharInspectorImpl,I18n,i18n-bundles}.ts`, `src/core/utils/BlocLines.ts`, `tests/unit/core/utils/**` | T0 | [x] |
| T1b | `UBrexCommandMultilines2` | typescript-pro or orchestrator | `src/core/command/UBrexCommandMultilines2.ts`, `tests/unit/core/command/**` | T1a | [x] |
| T1c | `FloatingNote` and its layering entry | typescript-pro or orchestrator | `src/diagrams/activity/ftile/vcompact/FloatingNote.ts`, `tests/architecture/layering.test.ts`, `tests/unit/activity/ftile/vcompact/**` | T0 | [x] |

## Interface contracts

T1a outputs, consumed by T1b, T3a and T2a:
- `interface CharInspector { peek(ahead: number): string; jump(): void }`; `peek` returns `'\0'` past a line's end
  and when exhausted, as Java's `char` 0 (`CharInspector.java`, `CharInspectorImpl.java`).
- `BlocLines#inspector(): CharInspector` and `#inspectorWithNewlines(): CharInspector` (`BlocLines.java:399-405`).
- `I18n.getLocalizedValue(language: string | null, key: string, defaultValue: string): string` (D6).

T1b output, consumed by T3b: `abstract class UBrexCommandMultilines2<S> implements MultilineCommand<S>`, constructor
`(patternStart: UnicodeBracketedExpression, strategy: MultilinesStrategy, trimEnd: Trim, end: Lazy<UnicodeBracketedExpression>)`,
abstract `explainNow(lines)` and `executeNow(system, lines, pass)`, overridable `syntaxWithFinalBracket()` and
`finalVerification(lines)`, `getStartingPattern()`.

T1c output, consumed by T3a and T3b: `FloatingNote.create(note: Display, skinParam, sname: SName): FloatingNote`, a
`TextBlock` with `calculateDimension`, `drawU`, `getStartingX`, `getEndingX`; `createOpale` and `setOpale` too.

## Batch close

Per [task-contract.md](../task-contract.md#batch-close), steps 1 and 4 (no survey yet).
