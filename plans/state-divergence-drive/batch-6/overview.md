# Batch 6 — layout inputs and the residue

Re-classify first. Earlier batches will have moved these rows, and geometry rows often vanish once the labels and headers sizing them are right.

```sh
npm run svg:survey -- state --out /tmp/stdd-b6.json
npx jiti plans/state-divergence-drive/measurements/row-diffs.mts /tmp/stdd-b6.json /tmp/stdd-b6-diffs.json
node plans/state-divergence-drive/measurements/classify.mjs /tmp/stdd-b6-diffs.json plans/state-divergence-drive/measurements/b6-rows.md
```

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T6a | Concurrent regions | orchestrator | `state-composite-concurrent.ts` | T5a | [x] |
| T6b | History and qualified endpoints | orchestrator | `parser.ts`, `state-link-add.ts`, `state-composite-pass*.ts` | T6a | [x] |
| T6c | `dotEqual` and `layoutEqual` false rows | orchestrator | `state-dot-graph.ts`, `state-composite-pass*.ts`, `state-leaf-node.ts` | T6b | [x] |
| T6d | Name every row left | orchestrator | `DIVERGENCES.md`, issues | T6c | [x] |

Close: [task-contract.md](../task-contract.md).
