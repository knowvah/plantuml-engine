# Batch 3: other label sites

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T4](T4-label-sites.md) | Probe every other `getTextBlock` → `Snake.withLabel` site with an embed; pin each | orchestrator | `tests/fixtures/edge-label-embed/act3-*`, authored gate, `src/` per finding | T3 | [x] |

**Close:** the README gates, `npm run svg:survey` + `verdict-diff.mjs 229a5a836` (0 lost), census check,
`npm run parity:dashboard`, journal.
