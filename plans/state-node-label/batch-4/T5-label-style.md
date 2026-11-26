# T5: the label's font is the merged arrow style of the state diagram, with the leaf's stereotype

**Writes:** `src/core/svek/image/EntityImageTransitionLabel.ts`, the state call site that hands it a style, their
tests, the gate.

**Reads:** D4; `EntityImageTransitionLabel.java:60-82` (as of `fc7def70a`); `StyleQueries.ARROW`; how the port merges
a style query with a diagram `SName` and a stereotype today (`grep -rn "withStereotype\|StyleQueries" src/core | head`).

## Steps

1. **Red.** Exact font assertions from the jar svgs:
   - `snl-skinparam-font` (`ArrowFontColor red`, `ArrowFontSize 18`): `fill="#F00"`, `font-size="18"`,
     `textLength="20.025"`;
   - `snl-style-statediagram-arrow` (`stateDiagram { arrow { FontColor red; FontStyle bold } }`): `#F00`, `700`;
   - `snl-vega-transition-label-arrow-style` (`arrow { FontSize 16; LineColor Blue; FontColor Green }`): read the
     jar svg for the label and the line colours;
   - `snl-stereotype`: `#000`, 13 (the transition's `<<hot>>` never reaches the leaf or links).
2. **Green.** Build the font from the merged `ARROW + stateDiagram` query with the leaf's `<<transition>>`
   stereotype. Take the diagram `SName` from the caller (D4). Reuse the port's style merge; no new resolver.
3. **Measure.** Expected to reach 0: the four rows above.

## Acceptance
- Given `skinparam ArrowFontColor red` and `ArrowFontSize 18`, when the label renders, then its text is `#F00` at 18.
- Given a `<<hot>>` stereotype on a node-style transition, when rendered, then neither the label nor the links take
  `.hot`'s style.

Observability: N/A. Rollback: Reversible.
