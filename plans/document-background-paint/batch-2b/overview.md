# Batch 2b — chrome gradient, klimt-carrier rect (user ruling 2026-11-02, D7)

Added after B2: two pre-existing document-background defects no authored row
covered (journal 24-25). T2p (orchestrator) authors the rows and pins them at
today's counts; T2e and T2f then run in parallel (disjoint files).

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T2p | authored rows + jar oracles, pinned at today's measure; count assertion | orchestrator | `tests/fixtures/document-background/*`, `oracle/goldens/document-background.json`, `tests/unit/oracle/document-background.test.ts` | B2 close | [ ] |
| [T2e](T2e-klimt-carrier-rect.md) | gantt/mindmap/salt/wbs: the background rect leads the content at the final size | typescript-pro (sonnet, effort high), dbp-T2e | see spec | T2p | [ ] |
| [T2f](T2f-chrome-gradient.md) | title/header/footer/caption/legend/mainframe paint an inherited gradient | typescript-pro (opus, effort high), dbp-T2f | see spec | T2p | [ ] |
| close | merge both; gates `b2b`; chain vs `b2-eng`; dbg re-pin; journal every mover | orchestrator | per close-procedure | T2e, T2f | [ ] |
