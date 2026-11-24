# Batch 2: the adapter

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T2a](T2a-adapter.md) | `ActivityLegacyElkAdapter`: the leaf and link half, unit-tested | orchestrator or `typescript-pro` | `activity-legacy-elk-adapter.ts` + test | T1 | [x] |
| [T2b](T2b-clusters.md) | The cluster half: partitions, inner activities, empty partitions, unit-tested | orchestrator or `typescript-pro` | the adapter (or `activity-legacy-elk-cluster.ts`) + test | T2a | [x] |

Serial: both write the adapter. Nothing calls the adapter until T3a, so no ratchet score may move in this batch: a
moved score here is a bug in shared code. Close with the task contract's "Batch close".
