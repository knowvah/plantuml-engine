## Observation: gh issue comment denied; the #133 and #136 close-out texts are here
- **Context**: ceep T5 close-out comments.
- **Finding**: `gh issue comment` was denied by the auto-mode classifier (External System Writes). Not worked around.
- **Impact**: post the two texts below by hand.
- **Confidence**: High

### #133

chen-eer-engine-port (ceep) is done on `feature/parity-queue`, as one unsigned commit on `03efe4694` (per-task history on the local tag `chen-eer-engine-port/pre-squash`). Nothing is pushed.

- `cheneer/` is ported file for file into `src/diagrams/cheneer/` on the `CucaDiagram` base. The four `EntityImageChen*` images and `MiddleSubset` are in `src/core/svek/`. It is registered at `PSystemBuilder.java:199`.
- It draws through real graphviz. One-leaf diagrams go through a new shared `EntityImageDegenerated`, and `!pragma layout elk` goes through ELK.
- The corpus has no `@startchen` row, so every row is authored: 91 fixtures (upstream's 4 vega Chen fixtures, 44 planning probes and 43 more), all byte-stable on the jar.
  - 78 are zero-diff and 13 are error pairs. None is open.
  - The 66 jar `svek-1.dot` files are structurally equal and size-exact.
  - The 8 ELK fixtures are zero-diff.
- Gates: `svg-cheneer` ratchet (empty `ratchet.json` plus `authored-baseline.json`) and `tests/oracle/cheneer-dot-parity.test.ts`.
- Every engine: 0 conformant lost against `03efe4694`, and overall verdicts are unchanged (6067 conformant). `dist/*.d.ts` is identical, and no divergence was added.
- Shared fixes along the way:
  - The "Empty description" page now lists the start line and the next line, and names the upstream type (`PSystemCommandFactory.java:117-121`).
  - `DotInputGraph` now carries `!pragma ratio` and `aspect`.
- `npm test`, typecheck, lint, build and format:check all pass.

Follow-ons are in `planning/next-missions.md`, ceep section. None blocks this issue.

### #136

#133 (Chen EER) ran on 2026-11-12. It is one unsigned commit on `feature/parity-queue`.
- 91 authored `@startchen` fixtures: 78 zero-diff, 13 error pairs, 0 open. There are no corpus rows.
- 66 DOTs are equal, and the ELK path is zero-diff.
- Every engine: 0 conformant lost, and overall survey verdicts are unchanged (6067 conformant, 122 structural-match, 94 diverged, 4 oracle-error).
- No issue was filed and no ruling is needed.
