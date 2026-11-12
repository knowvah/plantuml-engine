# lsp T4: issue comments not posted

`gh issue comment` was denied by the auto-mode classifier on 2026-11-12 (external system writes). Per the brief, the
text is left here for the user to post.

## For #134

listsprite-factory-port (lsp) is done on `feature/parity-queue`: one unsigned commit on `b7cbbcc47`, not pushed. The
per-task history is on the local tag `listsprite-factory-port/pre-squash`.

- `ListSpriteDiagramFactory`, `ListSpriteDiagram` and `CommandListSprite` are ported into `src/core/klimt/sprite/` and
  registered at `PSystemBuilder.java:170`. `@startsprites` routes to the new `'sprites'` plugin, and the page prints
  `data-diagram-type="HELP"`.
- Corpus: `folutu-01-xuzo995` and `nujapi-78-mota753` went from diverged to conformant. Both are pinned in
  `svg-factories`, which grows from 41 to 43 slugs with 19 pins.
- Authored: 47 `cov-sprites-*` fixtures. 42 are zero-diff and 5 are error pairs (2026-10-10 rule), so none is open.
  All 42 drawn pages are byte-stable over three jar renders.
- `cov-refuse-listsprite` (svg-utility, ufp follow-on 4) now draws with 0 diffs. Its weighted score was 192.
- Survey against the base: 0 lost, 2 gained. No divergence added, no ruling needed, and `dist/*.d.ts` is unchanged.
- Gates: `npm test` (47969 passed), `typecheck`, `lint`, `build` and `format:check` all pass.

Follow-ons are in `planning/next-missions.md` under "listsprite-factory-port (lsp)": hoist the copied common commands
and skin param, add `CommandSpriteBase64` to the other 22 engine dispatchers, and fix the stale D7 footnote list.

## For #136

#134 (ListSprite) is done: listsprite-factory-port, one unsigned commit on `feature/parity-queue`, not pushed. Counts:
the `unknown` bucket goes from 969 to 971 conformant (`folutu-01-xuzo995`, `nujapi-78-mota753`; diverged 63 → 61),
with 0 lost in any engine. Authored: 47 `cov-sprites-*` fixtures, 42 zero-diff and 5 error pairs. The svg-utility
`cov-refuse-listsprite` gap is closed. No issue was filed and no ruling is needed.
