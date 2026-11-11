# T1b — `LanguageDescriptor`

Read [D9](../decisions.md#d9--port-languagedescriptor-whole) and [task-contract.md](../task-contract.md).

**Java:** `syntax/LanguageDescriptor.java` (whole file; `getType` :360, `getKeyword` :364). Its constructor reads `HColorSet` and
`SkinParam` only in the part that fills `preproc`/skinparam lists: read the imports before assuming what is needed. `TreeSet`
ordering is `String.compareTo`, a UTF-16 code-unit comparison, which JS's default `sort()` matches.

**Write:** `src/core/syntax/LanguageDescriptor.ts` (one full transcription of the `add` sequence, in order),
`tests/unit/factories/LanguageDescriptor.test.ts`.

**Interface output** (consumed by T2d):
```ts
export class LanguageDescriptor {
  getType(): ReadonlySet<string>;
  getKeyword(): ReadonlySet<string>;
}
```

## Acceptance
- Given `new LanguageDescriptor().getKeyword()`, then its sorted names equal the `<text>` lines after the third in
  `test-results/dot-cache/unknown/mefure-90-gitu244/in.svg`, one for one (strip the `* `/bullet the creole list adds).
- Given `getType()`, then the same against `xasanu-61-guze787`.

Observability: N/A — no new observable operations. Rollback: Reversible.
