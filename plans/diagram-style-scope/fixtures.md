# Probe results and rows

## Measured on main `4f653cac9` (planning, 2026-11-02)

**Document background, root selector forms.** Jar | ours for `#AAAAAA`:

| engine | `<own> { document }` | `<own> { BackgroundColor }` | `document { <own> }` | foreign `{ document }` |
|---|---|---|---|---|
| sequence | AAA / white | AAA / white | AAA / white | white / AAA |
| json, yaml | AAA / AAA | AAA / white | AAA / white | white / AAA |
| activity, class, component, state | AAA / AAA | AAA / AAA | AAA / white | white / AAA |
| object | white / AAA | white / AAA | white / white | AAA / AAA |
| usecase | white / AAA | white / AAA | white / white | white / AAA |
| files | white / white | white / white | white / white | white / AAA |
| gantt, mindmap, salt, wbs | correct in all four | | | |

class's foreign probe used `usecaseDiagram`, every other engine `classDiagram`.
Order: the jar takes the last declared across all 17 orderings; class wrong on 6.

**Cascade.** Extra diffs over the same body with no `<style>`, `<x>Diagram` / `element` / `root`:

| engine | BackgroundColor | LineColor | FontColor |
|---|---|---|---|
| activity | 13 / 13 / 13 | 49 / 40 / 0 | 9 / 7 / 0 |
| component | 14 / 2 / 2 | 16 / 2 / 0 | 8 / 7 / 7 |
| usecase | 6 / 2 / 2 | 7 / 1 / 0 | 6 / 5 / 5 |
| object | 4 / 2 / 2 | 5 / 0 / 0 | 5 / 0 / 0 |
| class | 3 / 3 / 3 | 2 / 2 / 2 | 1 / 1 / 1 |
| state | 2 / 1 / 2 | 1 / 10 / 1 | 1 / 0 / 0 |
| sequence, json, yaml | document background only | 0 | 0 |

The builder returned the expected value on the signature for every row the jar's output confirms.
Not yet proven: reader coverage, state's rect width (115 vs 170 on `bg-diag`, `bg-root`), nested
`{{ }}` declaration order. T0c measures them.

## Rows (`tests/fixtures/diagram-style-scope/`, `tools/gen-rows.py`)

| group | rows | what it pins |
|---|---|---|
| `selector` | 58 | 14 engines × 4 forms; files + board × `activityDiagram` |
| `variant` | 6 | sequence: solid, gradient, black, over-doc, mismatched, title |
| `order` | 54 | sequence, class, json × 13 style orderings + 5 skinparam orderings |
| `element-order` | 6 | re-declared and competing element selectors; skinparam then default |
| `scope` | 15 | bucket leaks, themes, skins, dark mode, malformed, nested embed |
| `cascade` | 117 | 9 engines × bg/line/font × 4 forms + a style-free baseline |
| T0d: `lanes`, `loops`, `sdl`, `flatnote`, `pseudo`, `hist`, `conc`, `cluster`, `notes`, `kinds`, `generic`, `syms`, `clusters`, `links`, `d2`, `d3`, `d5`, `nested`, `x` | 190 | T0c's probes: reader sites and D2/D3/D5 cases the groups above miss (`tools/gen-probe-rows.py`) |

## Counts per checkpoint

| checkpoint | rows conformant / total | Σ diffCount | 28-engine conformant losses | notes |
|---|---|---|---|---|
| main `4f653cac9` (b0) | 101 / 256 | 2169 | — | 1 jar error page: `sequence__scope-malformed-brace`; seeded pre-fix |
| T0d (b0, 446 rows) | 144 / 446 | 7335 | — | 190 probe rows added pre-fix, no src change; the original 256 unmoved |
| b1 (T1a, T1b; 456 rows) | 196 / 456 | 7395 | 0 | 7 rows added by T1b's probes, seeded pre-fix (4 conformant after the fix); the 449 fell from Σ 7335+40 to 7269 |
| b2 (T2a; 456 rows) | 272 / 456 | 6569 | 0 | 127 fell, 0 rose; state 99 → 100 (`lonuti-97` pinned, golden 97 → 98 entries) |
| b2 + 38 probe rows (494) | 287 / 494 | 6901 | 0 | T2a's probes promoted, seeded at the current measure; 2 more were jar error pages, dropped |
| b3 (T3a-T3g; 574 rows) | 489 / 574 | 5263 | deferred to the b4 chain | 80 rows added by the tasks, all conformant; 49 corpus fixtures moved, Σ 2753 → 1608, 23 reach 0, 2 rise with element counts now equal to the jar's (journal row 35); chain deferred, journal row 49 |
