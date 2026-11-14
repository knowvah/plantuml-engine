# T4c: `scale` with a sprite stereotype on a node body

**Row:** `gazizi-80-fula677`.

`scale 0.5`, a 48×48 16-level `sprite $Kubernetes`, then `node Kubernetes <<$Kubernetes>> [ = Kubernetes / Description
of k8s ]`. Our page is 100×103 and the jar's 85×65, and the survey's first structural diff is a `text/@font-size`.

## Lead (verify before acting)

A `<<$sprite>>` stereotype draws the sprite in place of the stereotype label. Read `Stereotype#getSprite` and how
`EntityImageDescription` builds the stereotype block for a sprite, and how `scale` reaches the drawing
(`UGraphic` scale versus scaled geometry). #149 is open for USymbol group titles under `scale`: if this row turns out
to be the same mechanism, fix it here and comment on #149.

## Acceptance
- Given `gazizi-80-fula677`, when it is measured, then `n=0`.
- Given a unit test in `tests/unit/class/cogr-T4c.test.ts`, then the page size and the body title's font size match
  the oracle.

Observability is N/A. Rollback is Reversible.
