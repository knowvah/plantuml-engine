# T2b — `TimeConstraint`, `TimeMessage`, `Highlight`, `TimeArrow`

**Write-set:** `src/diagrams/timing/{TimeConstraint,TimeMessage,Highlight}.ts`, `src/diagrams/timing/graphic/TimeArrow.ts`,
`tests/unit/timing/**`, and an `ArrowConfiguration` port if the catalog has none (batch-2 overview).

**Read:** D3, D7, D13; `TimeConstraint.java` (183 lines), `TimeMessage.java`, `Highlight.java`, `graphic/TimeArrow.java`;
the `SName.constraintArrow`, `SName.highlight` and `SName.timeline` reads; `Colors`/`ColorParser` ports.

**Do:**

1. `TimeConstraint.ts`: the `<->` arrow between two ticks on one player, its label, `getConstraintHeight`, drawing
   through `ArrowConfiguration` and the `constraintArrow` style.
2. `TimeMessage.ts`: two `TickInPlayer`s, the label `Display`, the arrow style from `-[#red,dotted]>` (`WithLinkType`
   reads, java), `getStyle`.
3. `Highlight.ts`: `drawHighlightsBack` (the band), `drawHighlightsLines` (the dashed edges), `getCaption`; colours
   from `Colors` with `ColorType.BACK` and the `;line:` part.
4. `graphic/TimeArrow.ts`: `create(pt1, pt2, label, skinParam, message)`, the arrow head and label placement.

**Tests:** `cov-messages` (`WU -> WB : URL`, and `-[#red]>` to `WU@350`), `cov-message-dotted` (`-[dotted]>`,
`-[#blue,bold]>`), `cov-constraint` (`<->` with `{50 ms lag}` and `{150 ms}`), `cov-highlight` (gold band with
`DimGrey` lines and caption, and a bare band): the drawn paths, polygons and text positions equal the oracle's, built
with ticks and points from the oracle.

## Acceptance
- Given those four probes' oracles, when each class draws onto a klimt `UGraphicSvg`, then its fragment equals the
  oracle fragment for that element.
- Given `npm test`, then it passes with the new files covered ≥90 %.

Observability N/A. Rollback Reversible.
