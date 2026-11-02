# Fixtures and probe matrix

## Probe matrix (planning, 2026-10-31, main fe794c0a9)

`<style> document { BackgroundColor <c> }` over a minimal body. Jar via
`scripts/oracle-render.sh`; ours via `renderSync` (extended mode) or
`renderFixtureJson`. Signature = root `background:` · `<linearGradient>` count ·
(0,0) rect. Scratch sources: the planning session's scratchpad `jff2-probe/`;
T0b re-authors them in-tree.

| engine | black: jar → ours | gradient `red/blue`: jar → ours | in scope |
|---|---|---|---|
| json | `#000000`, no rect → **extra rect** | def + url rect → **`background:red/blue`, `fill="red/blue"`** | yes |
| yaml | same as json → **extra rect** | same → **invalid** | yes |
| hcl | jar white (ignores `<style>`) → ours honours (extended, D4) | jar white → **invalid** (extended) | yes (D4) |
| state | `#000000`, no rect → **extra rect** | def + url → **invalid** | yes |
| class | OK | def + url → **invalid** | yes |
| object | OK | def + url → **invalid** | yes |
| component | OK | def + url → **invalid** | yes |
| usecase | OK | def + url → **invalid** | yes |
| sequence | not probed (black handled, `assemble-svg-sequence.ts:38-44`) | def + url → **invalid** (style path never yields the gradient) | yes |
| activity | not probed (black handled, `assemble-svg-activity.ts:50-55`) | def + url → **invalid** | yes |
| mindmap | OK | def + url → **throws** `ClassCastException` (`MindMapDiagram.ts:108-109`) | yes |
| salt | OK | def + url → def + rect but **root `background:#FFFFFF`** | yes |
| gantt, wbs, files | OK | OK | re-check |
| nwdiag | OK | jar `#000000` (gradient flattened) → OK | re-check — **T0b: unported** (ours = "unknown diagram type" sentinel); out, like timing (journal 5) |
| board, packet, chart | T0b: `background:black` (not `#000000`) + unrelated diffs | T0b: `background:red/blue` + unrelated diffs | rows kept, not fixed (journal 7) |
| chronology | jar: "not recognized" error page | same | out — error-page rule (journal 6) |
| timing, ebnf, regex | — | — | out (unported) |

## Authored rows T0b creates (`tests/fixtures/document-background/`)

`<engine>-black` and `<engine>-gradient` for every engine above except the
out-of-scope three: 20 engines × 2 = 40 rows (sequence and activity also take
a `-skinparam-gradient` control row each — the already-working path — so a
regression there is visible: 42). Bodies minimal (one or two elements);
gradient `red/blue` (policy `/`) except one `|` and one `-` row (json,
class) to cover `HColorSet`'s other separators (`HColorSet.java:78-119`).
Final list journaled by T0b (journal 4): 18 engines × {black, gradient} + json/class `gradient-pipe`/`gradient-dash` + sequence/activity `skinparam-gradient` = 42 rows (nwdiag, chronology dropped).

## Counts per checkpoint

| checkpoint | dbg rows conformant / total | Σ dbg diffCount | 28-engine conformant losses | notes |
|---|---|---|---|---|
| main `fe794c0a9` (b0, T0b pin) | 18 / 42 | 346 | — | mindmap-gradient renders an error page (29), not a throw |
| b1 (T1a + T1b) | 21 / 43 | 340 | 0 (0 movers in 28 engines) | seq/act-gradient 3→0; +row `sequence-style-gradient-then-skinparam-black` (0, user ruling, journal 14) |
