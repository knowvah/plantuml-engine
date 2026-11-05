# T2c — Text height floors at 10, and stereotype text counts as ink

**Row:** `tenalu-53-meri239` after T2a: `rect/@height` 40 against 42, `line/@y1` 31 against 33.167, and everything at `+0.167`.

**Two mechanisms, both read:**

1. `AtomText.java:179-181`, `if (h < 10) h = 10`. Jar on 2026-11-05: an object name block is 14 tall at sizes 6, 8, 9 and 10 (margin 4 + 10) and 15 at 11. The baseline does not move: `y` stays `2 + 0.7778 * size`.
2. `LimitFinder.java` `drawText`: `y -= dim.getHeight() - 1.5`, against the rect's `y - 1` (`:185`). A 12 px stereotype's baseline sits 9.333 down, so its ink top is `9.333 - 10.5 = -1.167`, past the rect's `-1`. That gives `y = 7.167` with two or more leaves; a sole leaf takes the degenerated path and stays at `7` (`GraphvizImageBuilder.java:214`, planning probes a and f). This is dss follow-on 22, and the `+0.167` on 3 stereotyped json leaves recorded at `planning/next-missions.md:940`.

**Read:** those lines; `class-object-map-header.ts#measureStereo`, `headerRows`, `baselineOffsetFor`; `class-object-sizing.ts` `bodyInkWidth`; `class-classifier-ink-reservation.ts`; `AtomTextUtils.ts:39`.

**Do:** per D5. The probe grid decides the floor's home. Add the stereotype's text to the object, map and json ink.

**Red, authored grid under `tests/fixtures/odd-T2c/` with oracles:** object, map and json at `FontSize` 6, 8, 9, 10 and 11, each with and without a stereotype, each beside a second leaf; a field row and a map cell at size 8. Planning's `/tmp` probes are the seed, and `<style> object { FontSize N }` is the shortest form.

**Measure, extra bucket:** `json`, because the header formula is shared.

## Acceptance
- Given `tenalu-53`, when compared, then conformant.
- Given each grid row, when compared with its oracle, then 0 diffs.
- Given `json`, then 0 rows lost.

Observability N/A. Rollback Reversible.
