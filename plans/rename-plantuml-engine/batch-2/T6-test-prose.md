# T6 — remaining test comments

**Context.** Comments only; no assertion changes.

**Task.** Replace the project name in comments/describe text of:
`tests/oracle/{class-dot-parity.test.ts,description-parity.ratchet.test.ts,svek-dot.ts}`,
`tests/unit/class/{aepp-T1g-sametail-lost-edge,allowmixing-gate,class-arrow-length,class-nested-generics}.test.ts`,
`tests/unit/core/graph-layout-svek-read.test.ts`,
`tests/unit/core/klimt/sprite/PSystemListArchimateSpritesFactory.test.ts`,
`tests/unit/core/tim/TContext.test.ts`, `tests/unit/core/utils/SignatureUtils.test.ts`,
`tests/unit/git/render.test.ts`, `tests/unit/preprocessor.test.ts`, `tests/unit/sequence/group-routing.test.ts`,
`tests/unit/state/state-guards.test.ts`. If a match turns out to be an assertion on rendered text (e.g. the error
banner), it was T3's: fix it here and journal the move.

**Write-set.** The 15 files above, `PENDING`.

**Acceptance criteria.**
- Given `git grep -nIE "plantuml-ts|PlantumlTs|PLANTUML_TS" -- tests`, then the only file is
  `tests/architecture/legacy-name.test.ts`.
- Given `npm test`, then the file/test counts equal T5's.

Observability: N/A — no new observable operations. Rollback: Reversible.
