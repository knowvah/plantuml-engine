# T5c — embedded and math labels

Commit: `docs(stdd): name the embedded and math rows`.

## Context
D8. `xetase-70-zaza808`'s `{{` label: `.agent-notes/xetase-embedded-diagram-label.md` says edge-label measurement never constructs an `EmbeddedDiagram`, in four engines. Re-measure that claim against `EmbeddedDiagram.java:126-152` and today's seams: the
oracle seam memories record later changes (`.claude/memory/oracle-seam-embedded-42x42.md`). If a state-only fix is honest, do it. If not, file a `queue:ready` issue chained on #136 with the measurement. `corumi-91-mizo869`: after T4a, what remains should be
the KaTeX divergence in `DIVERGENCES.md`. Name it there with the row, or fix what is not KaTeX.

## Acceptance
- Given `xetase-70`, when T5c closes, then it is conformant or named on an issue, with evidence quoted.
- Given `corumi-91`, then every remaining diff is inside the math block, or is journaled.

Observability: N/A — no new observable operations. Rollback: Reversible.
