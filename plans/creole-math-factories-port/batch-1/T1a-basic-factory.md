# T1a — `PSystemBasicFactory`

Read [D3](../decisions.md#d3--port-psystembasicfactory-the-base-the-four-line-factories-share) and
[task-contract.md](../task-contract.md).

**Java:** `command/PSystemBasicFactory.java:75-101` (`createSystem`), `PSystemAbstractFactory.java` (`buildEmptyError`),
`core/UmlSource.java` (`getTotalLineCount`, `isStartDef`, `removeInitialNoise`), `utils/StartUtils.java`
(`isEndDirective`). Precedent for what a plugin's `parse` must do with an empty block: `src/diagrams/dot/parser.ts`,
`src/diagrams/dot/index.ts:23`.

**Write:** `src/core/command/PSystemBasicFactory.ts`, `tests/unit/factories/PSystemBasicFactory.test.ts`.

**Build:** a generic helper, `createSystem<P>(factory, source, preprocessing)`, mirroring the loop: skip initial noise; the
start line goes to `initDiagram`; the first blank line after it is skipped (only while `first`); the end directive returns
the diagram, or `buildEmptyError` when `getTotalLineCount() == 2 && !isStartDef()`; a `null` from `executeLine` yields the
standard `Syntax Error?` refusal. Check `src/core/parse-refusal.ts` and `src/core/dispatcher-types.ts:310-324` for how an
empty test and a syntax error are expressed in this port.

**Interface output** (consumed by T2a, T2b, T2c):
```ts
export interface BasicFactory<P> {
  initDiagram(source: UmlSource, startLine: string, preprocessing: PreprocessingArtifact): P;
  executeLine(source: UmlSource, system: P, line: string, preprocessing: PreprocessingArtifact): P | undefined;
}
export function createSystem<P>(factory: BasicFactory<P>, source: UmlSource, preprocessing: PreprocessingArtifact): P | ParseRefusal;
```

## Acceptance
- Given a factory and a source with only `@startcreole` and `@endcreole`, when `createSystem` runs, then it returns the empty
  refusal the Welcome page comes from (`cov-creole-empty`).
- Given `@startdef(id=e)` with no body, then it returns the diagram: the `isStartDef` branch (`cov-def-empty`).
- Given blank lines directly after the start line, then they are skipped, but a blank later line reaches `executeLine`
  (`cov-creole-blank-first`, `cov-creole-blank-mid`).
- Given `executeLine` returns `undefined`, then the result is the `Syntax Error?` refusal.

Observability: N/A — no new observable operations. Rollback: Reversible.
