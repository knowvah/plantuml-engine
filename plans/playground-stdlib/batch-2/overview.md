# Batch 2: CI, sprites, rulings

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T4](T4-ci-and-payload.md) | Docs and e2e CI build the stdlib; chunk payload check | orchestrator | `.github/workflows/docs.yml`, `.github/workflows/ci.yml` | T2, T3 | [x] |
| [T5](T5-sprites-and-rulings.md) | Sprite/assetStore measurement; `aws` v1 ruling issue | orchestrator | `plans/playground-stdlib/followups.md`, `tests/e2e/playground-stdlib.spec.ts` (fixme number) | T2, T3 | [x] |

T4 and T5 write disjoint files and may run in either order. Batch 2 closes with the README gates.
