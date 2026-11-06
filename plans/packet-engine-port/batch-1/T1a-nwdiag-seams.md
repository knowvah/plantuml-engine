# T1a — `VerticalLine` and `toSet` at their upstream home

**Read:** `nwdiag/VerticalLine.java` (whole), `nwdiag/NwDiagram.java:288-303`, `PacketIndicator.java:53,198-214`, `CommandNumRange.java:118`, `tests/architecture/layering.test.ts` (the `ALLOWLIST` shape), D3.

**Do:**

1. `src/diagrams/nwdiag/VerticalLine.ts`: the whole class, `skip` loop and `arcTo` branch included, though packet always passes an empty set (`Collections.emptySet()`, `PacketIndicator.java:211`). `UPath` and `HColors.none().bg()` already exist under `core/klimt/`.
2. `src/diagrams/nwdiag/NwDiagram.ts`: `export class NwDiagram` with only `static toSet` and the module-level pattern `p`. The class doc says #124 grows it in place. Java's `Matcher.find` loop over `\s*(\w+)\s*=\s*("([^"]*)"|[^\s,]+)`: transcribe with `g`, and keep `HashMap` last-wins on a repeated key.
3. Two `ALLOWLIST` entries, `src/diagrams/packetdiag/PacketIndicator.ts` and `src/diagrams/packetdiag/command/CommandNumRange.ts` to their nwdiag targets, each `why` quoting the Java import or call. If the test asserts an entry's `from` exists, add the entries in T1c and T2a instead, and journal it.
4. Check that nothing walks `src/diagrams/*` expecting an `index.ts` (catalog generator, `registered-plugins`, `diagram-type-set` tests). `npm run catalog`.

## Acceptance
- Given `new VerticalLine(24, 56, new Set())` drawn on a `UGraphicSvg`, then the SVG holds one `<path d="M0,24 L0,56" ... fill="none"/>`, matching `packet-tcp-header`'s tick shape before translation.
- Given a skip set `{40}` with `y1 = 24, y2 = 56`, then the path breaks at 37 and resumes at 49 with an arc, as `VerticalLine.java` does.
- Given `toSet('len = 4, color="pale green", rotate=270')`, then the map is `len→4`, `color→pale green`, `rotate→270`; given `undefined`, then it is empty.
- Given `layering.test.ts`, then it passes with the two new entries and no other change.

Observability N/A. Rollback Reversible.
