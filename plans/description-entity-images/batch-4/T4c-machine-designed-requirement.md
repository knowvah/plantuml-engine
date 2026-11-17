# T4c: machine, designed domain, requirement, and the dispatch

## Context

`GeneralImageBuilder.java:235-255` picks the image, in this order: machine/specification → `EntityImageMachine`;
designed/solved → `EntityImageDesignedDomain`; any `REQUIREMENT` → `EntityImageRequirement`; then lexical, causal,
biddable, plain → `EntityImageDomain` with `X`, `C`, `B`, `P`. Every domain branch tests `LeafType.DOMAIN` and a
non-null stereotype, so a `requirement` takes `EntityImageRequirement` whatever its stereotype. Port the chain literally,
branch for branch, including the final `UnsupportedOperationException`.

In `rukitu`, `Onboard LiveBox` (`<<Designed>>`) is a box with a 4px left stripe; each requirement is a dashed ellipse
(`stroke-dasharray:7,7`). The jar draws no `<g class="entity">` wrapper around these images (issue #147, leads).

## Steps
1. Port the three images into `src/core/descdiagram/`.
2. Dispatch on `leafType` + stereotype in `renderer-entity.ts#drawEntity`, and size from the same image in the layout,
   with the DOT shape `svek-1.dot` in `test-results/dot-cache/unknown/rukitu-26-seme622/` shows for each node.
3. Check the `left to right direction` and `set separator none` paths against `rukitu`; both are existing description
   behaviour, so a residual there is D6.

## Write-set
`src/core/descdiagram/EntityImage{Machine,DesignedDomain,Requirement}.ts` (create), `renderer-entity.ts`,
`layout-dot-tree.ts`, tests.

## Acceptance
- Given `rukitu-26-seme622`, when measured, then it reaches zero diffs with `dotEqual: true`, or its residual is
  separable and filed (D6).
- Given `dei-domain-each`, `dei-requirement` and `dei-domain-group`, when measured, then each reaches zero, or its
  residual is journaled with the producer's `file:line`.
- Given the dispatch chain, when unit-tested with every stereotype alias of `Stereotype.java:210-233`, then each picks
  the image the Java picks.

Observability is N/A. Rollback is Reversible.
