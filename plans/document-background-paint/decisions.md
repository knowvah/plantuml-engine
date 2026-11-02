# Decisions (user-approved 2026-10-31)

| ID | Decision | One line |
|---|---|---|
| D1 | Recover the gradient at the style origin | `document BackgroundColor` is parsed with skinparam's `(color, paint)` pair, so the theme is identical whichever syntax set it. |
| D2 | One shared `SvgGraphics`-constructor helper | json-family/state/class/description finalizers call it; sequence/activity keep their verified copies. |
| D3 | mindmap/salt mirror the wbs carrier | string → `background`, gradient → `backgroundGradient`; mindmap `calculateBackColor` returns any colour. |
| D4 | hcl: jar-compatible white, extended valid | `HclDiagramFactory.java:86-92` ignores `<style>`; extended mode honours it (ruling 2026-10-23). |
| D5 | One authored fixture set + ratchet | `tests/fixtures/document-background/`, per-row verdict + diff count, shrink-only. |
| D6 | Standing conventions | Worktrees, unsigned commits, squash per batch, the user signs; 0 losses in 28 engines; d.ts identical. |

Out of scope: timing, ebnf, regex (unported engines; `planning/mission-guide.md`
lists them as open phases). Their document background arrives with their port.

## D1 — the origin

**Context.** Upstream reads every document background as
`style.value(PName.BackGroundColor).asColor(...)` (`TitledDiagram.java:280-289`);
`asColor` goes through `HColorSet`, which returns an `HColorGradient` for
`c1<sep>c2` (`HColorSet.java:78-119`). `SvgGraphics`' constructor then takes the
gradient branch (`SvgGraphics.java:178-183`: `createSvgGradient` + `paintBackcolor("url(#…)")`,
`backcolorString = null` ⇒ no root `background:`).
Ours: `resolveDocumentBackground` (`src/core/style-map-element.ts:479-489`)
returns `resolveColor(bg)` — the raw `red/blue` string — into
`theme.colors.background` (`style-map-theme.ts:115,207`). Only
`skinparam backgroundColor` recovers the gradient (`skinparam-key-handlers-table-a.ts:50-57`,
`parseColor` `paint.ts:134`). Result (2026-10-31 probe): invalid SVG
`background:red/blue` / `fill="red/blue"` on activity, class, component,
object, usecase, state, sequence, json, yaml.

**Decision.** The style path parses the value with the same parse the
skinparam handler uses and writes the same pair: `theme.colors.background`
= the flattened colour that handler stores, `theme.colors.backgroundGradient`
= the `Gradient`. A solid value is unchanged.

**Consequences.** sequence and activity are fixed by T1a alone (their
renderers already forward `theme.colors.backgroundGradient`,
`sequence/renderer-document.ts:143-150`, `activity/renderer.ts:441-446`). Every other
reader of `theme.colors.background` sees the flattened colour, as under the
equivalent skinparam — the close survey catches any mover.

## D2 — the finalizer helper

`src/core/svg-backcolor.ts` (new) ports the constructor's three branches
(`SvgGraphics.java:176-192`): gradient → def + `url(#id)` rect, no root
background, ALWAYS painted; `null` → nothing; solid → root background, rect
unless `#00000000`/`#000000`/`#FFFFFF`. Rect at (0,0), sized by the caller to
the final canvas (`:207-212,819-821`). Gradient ids come from the existing
seeded def counter (`paintToSvg`, `svg-defs-seeded.ts`) — never random.
sequence/activity (`assemble-svg-{sequence,activity}.ts`) are NOT migrated:
no refactor while porting; convergence is an exit follow-on.

## D3 — mindmap, salt

`wbs/index.ts:203-208`, `gantt/index.ts:200-204`, `files/index.ts:181-185`
already carry a gradient backcolor as `backgroundGradient`. salt
(`salt/index.ts:160-165`) drops it (falls back to `#FFFFFF`); mindmap
(`MindMapDiagram.ts:103-111`) throws on a non-`HColorSimple` — upstream
`calculateBackColor` returns any `HColor`. Mirror both.

## D4 — hcl

`HclDiagramFactory.java:86-92` has `applyStyles` commented out: the jar draws
hcl white whatever the `<style>`. Jar-compatible mode (`withJarCompatibleStyleInput`)
must stay white; extended mode honours it (ruling 2026-10-23, DIVERGENCES
"Extensions") and must emit a valid gradient through D2's branches.
json/yaml honour the document background in both modes, as the jar does.

## D5 — gating

`tests/fixtures/document-background/<engine>-{black,gradient}.{puml,svg}`
(jar oracles via `scripts/oracle-render.sh` only), gated by
`tests/oracle/svg-conformance/document-background.ratchet.test.ts` with
`oracle/goldens/document-background.json`: per row `{ conformant, diffCount }`,
rendered through `renderSync` + `withJarCompatibleStyleInput` + `DeterministicMeasurer`,
compared with `compareSvg`. Shrink-only (pattern: `files.authored.ratchet.test.ts`).
The json-family manifest/positional gates are unchanged.

## D6 — conventions

As jff: per-task worktrees (`mkwt.sh`), unsigned commits, `--no-ff` merges,
squash per batch at the end (memory `squash-per-batch-at-end`), the user signs
(`git rebase --force-rebase -S <base>`) and pushes; never dot-engine, the
fork, the jar, cached oracle bytes.
