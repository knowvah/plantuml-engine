# Batch 1: pin, fixtures, block label

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T1a](T1a-pin-rows.md) | Pin the two #185 rows in the svg-class ratchet (D1, D2) | orchestrator | tool copy, goldens, `ratchet.json`, baselines | T0 | [x] |
| [T1b](T1b-group3015-fixtures.md) | Upstream `group3015` fixtures, outer + nested compare (D3) | orchestrator | `tests/fixtures/embedded-diagram-3015/`, its test, `EmbeddedDiagram.ts` JSDoc | T0 | [x] |
| [T1c](T1c-block-description.md) | An embed's source is labelled `block` (D4) | orchestrator | `internal-render-options.ts`, `index.ts`, the `readLines` callers, a test | T1b | [x] |

Run serially, in the order above:
- T1a and T1b share no file, but one checkout and one measurement load means serial is cheaper than juggling.
- T1c comes after T1b because T1b's nested-payload helper and fixture directory are where T1c's error-page oracle
  test lives.

Close the batch per `task-contract.md` after T1c.

**Interface T1b → T1c:** the nested-payload comparison in
`tests/unit/core/embedded-diagram-preprocess-3015.test.ts`. It is a function
`nestedPayloads(svg: string): string[]` (decoded `data:image/svg+xml` documents, in document order), plus the fixture
directory URL. T1c adds its error-page case to the same file.

Observability is N/A for every task. Rollback is Reversible: revert the task commit.
