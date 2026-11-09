# T1b — `CommandLinkActivity`

**Java:** `activitydiagram/command/CommandLinkActivity.java` (460 lines): `getRegexConcat` `:79-118`, `executeArg`,
`getEntity` (`:312` on, with `createInnerActivity` at `:317`), and the colour, stereotype, URL, arrow style and
direction handling it delegates to (`ColorParser.exp2/exp3`, `StereotypePattern`, `UrlBuilder`,
`CommandLinkElement.LINE_STYLE`, `LinkDecor`, `Direction`).

**Writes:** `src/diagrams/activity-legacy/command/CommandLinkActivity.ts` (split by method, D11),
`ActivityDiagramFactory.ts` (replace its placeholder), `tests/unit/activity-legacy/CommandLinkActivity.test.ts`.
**Reads:** `src/core/url/UrlBuilder.ts#transform` (the `%pLN`, `%g`, `%s` expander), the class and description link
grammars (`src/diagrams/description/link-grammar-regex.ts`) for how ported link regexes are written here.

## What to build

Every `FIRST` branch (`STAR`, `CODE`, `BAR`, `QUOTED` with `as`), every `FIRST2` branch (`STAR2` with `top` or a
digit, `OPENBRACKET2`, `CODE2`, `BAR2`, `QUOTED2`, `QUOTED_INVISIBLE2`), stereotypes on both ends, `#color` on both
ends, a URL, arrow body, `[style]` on either side of the direction, the direction words and abbreviations, the
`[label]`, `in <partition>`, and the missing-source case that links from `getLastEntityConsulted()` or the current
`ConditionalContext`'s branch. Keep `explainArg` only if our `Command` interface has a slot for it; otherwise journal
that it is skipped.

## Acceptance
- Given each of the 28 probes' link lines, when parsed, then the leaf types, display texts, link directions and
  labels equal what the probe's oracle draws (`data-qualified-name`, `<!--link A to B-->` comments).
- Given `bokuba-91-poda774` (`(*) --> VerifyReservation`, `--> ===Y1===`, ...), then 6 leaves and 5 links in the
  order of its `svek-1.dot`.
- Given `(*) --> {`, then an `INNER_ACTIVITY` group opens.
- Given a line that matches nothing in the Java regex (for example `A -> B`, a single dash), then the command does
  not match.

Observability: N/A — no new observable operations. Rollback: Reversible.
