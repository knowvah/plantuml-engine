# T2b: fixtures and the family table

**Writes:** `tests/fixtures/factories/cov-sprites-*.{puml,svg}`.

**Read:** `oracle/goldens/svg-factories/README.md` ("Authored root"), `plans/creole-math-factories-port/measurements/fixtures.mts`,
`plans/chen-eer-engine-port/measurements/jar-variants.mjs`, `decisions.md` D6, D7, D9.

**Do:**
1. Copy the 29 probes into `tests/fixtures/factories/`, with each oracle beside it as `<slug>.svg`, rendered with
   `scripts/oracle-render.sh` (the jar writes `<slug>.svg`; for an `@start... name` line, it writes `name.svg`).
2. Author more where a branch has no fixture. At least:
   - each remaining sprite form: `sprite $x jar:...` with a png path, base64 (`CommandSpriteBase64`), `[WxH/4z]`,
     `[WxH/8z]`, multiline SVG (`CommandSpriteSvgMultiline`), an SVG sprite with a `viewBox` only;
   - chrome one element at a time: `title` alone, `legend left`, `mainframe`, multi-line `caption`;
   - `scale 0.5`, `scale 200 width`, `skinparam dpi 192`;
   - the wrap boundary: a row whose `x` lands exactly on 1024 and one just past it (`x > 1024`, not `>=`);
   - `listsprite` with no sprites under `@startuml` (only the `listsprite` line plus a blank, so it is not single-line);
   - a sprite whose name is wider than its image, and one narrower (centring both ways in `mergeTB`);
   - a `<style>` with `activityDiagram { BackGroundColor ... }` (the `HELP` style name).
3. `node plans/chen-eer-engine-port/measurements/jar-variants.mjs /tmp/lsp-T2b/variants 3 tests/fixtures/factories/cov-sprites-*.puml`.
   Every drawn fixture must be `stable` (D7, stop 5).
4. `npx jiti plans/creole-math-factories-port/measurements/fixtures.mts <every cov-sprites-* slug>`, and journal the
   family table: zero, error pair, open with first diff. Group the open rows by mechanism; each group is a T2c sub-task.

## Acceptance
- Given `tests/fixtures/factories/`, then every `cov-sprites-*.puml` has its `.svg`.
- Given the jar-variants run, then 0 rows are `order-only` or `geometry`.
- Given the family table, then each open row names its first diff and its T2c sub-task in the journal.

Observability is N/A: there are no new observable operations. Rollback is Reversible: revert the commit.
