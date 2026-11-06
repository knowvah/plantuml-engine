# T3b — Authored probes

**Read:** D4, D7, D10, `docs/svg-conformance.md` (error pages), `tests/fixtures/packet/` (naming: `<slug>.puml` and `<slug>.svg` side by side, flat), `TitledDiagram.java`, `UgDiagram.java:117-131`.

**Do:**

1. Copy `plans/board-engine-port/probes/*.puml` to `tests/fixtures/board/` (a `node -e` one-liner over `readdirSync`; a shell loop is not on the allowlist).
2. Author the D4 additions as `tests/fixtures/board/cov-<topic>.puml`, using the topic prefixes `build-authored-baseline.mts` maps: `chrome|embed|scale|dpi`, `style|skin|theme|mono|hand|back|dark|reverse`, `label|creole|long|emoji|sprite`, anything else `grid-*`.
3. `scripts/oracle-render.sh tests/fixtures/board tests/fixtures/board/cov-*.puml`. Exit 200 means some source is a jar error; SVGs may nest under the relative input path, so move them up (pep journal row 19). Planning expects `cov-grid-plus-first` and `cov-grid-empty` to be errors and the other 18 probes to draw `BOARD`.
4. `npx jiti plans/board-engine-port/measurements/probe-dir.mts tests/fixtures/board`, and fix every drawn nonzero row, Java first.

Expected seams: `!option handwritten` through `TitledDiagram` (cep journal row 13), `reversecolor` and `monochrome` through the colour mapper, `<style>` document `Margin`, emoji through the asset store, `{{board}}` through `core/EmbeddedDiagram.ts:287`.

## Acceptance
- Given `probe-dir` over `tests/fixtures/board`, then every fixture where the jar draws is at 0 diffs, or journaled with mechanism, Java citation and its D7 end.
- Given every jar error, then ours errors too, and the journal lists the oracle's message beside ours.
- Given the batch close's all-engine `verdict-diff`, then lost is 0, and a shared-seam fix names any other bucket it moved.

Observability N/A. Rollback Reversible.
