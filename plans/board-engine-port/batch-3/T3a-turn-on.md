# T3a — Turn the port on

**Read:** `packetdiag/index.ts`, `src/registered-plugins.ts`, `core/assemble-svg.ts:300-325`, `core/EmbeddedDiagram.ts:287`, `tests/unit/board/*.test.ts`, pep journal rows 15-18, D2.

**Do, in one commit:**

1. Rewrite `board/index.ts` per D2, exporting `boardPlugin` with `type: 'board'` so `registered-plugins.ts` needs no edit. Style name `activityDiagram` (`DiagramType.java:295`).
2. Delete `ast.ts`, `parser.ts`, `layout.ts`, `renderer.ts`. Grep first: `git grep -n "board/\(ast\|parser\|layout\|renderer\)"`.
3. Delete `tests/unit/board/{layout,renderer,parser}.test.ts`; rewrite `annotations.test.ts` and `lengthadjust-lad-t2f.test.ts`'s surviving cases against the factory and the new draw. Old assertions on old geometry are not a spec.
4. Move `BOARD` to `finalizeTitledDiagramFragment` in `core/assemble-svg.ts`; `tests/unit/core/assemble-svg-lad-t1a.test.ts` moves `BOARD` beside `PACKET` (pep journal row 16). Check `cov-chrome-all` against its oracle.
5. `npm run catalog`.

**Expected fallout, each re-measured with its own tool and shrink-only:**

- `oracle/goldens/document-background.json`: `board-black` 18, `board-gradient` 20.
- `oracle/goldens/svg-lengthadjust/authored-baseline.json`: the four `board-*` rows (18 to 22). Adopt only the `board-*` rows; that tool also downgrades unrelated rows (pep journal row 18), which are not adopted. A rise is stop 2.
- `oracle/goldens/diagram-style-scope.json`: `board__selector-activitydiagram` 15. Strike dss follow-on 21's board half in `planning/next-missions.md:104` when it reaches 0.
- The routing gate logs 4 `[FIXED]` lines; T4 re-pins them.
- Coverage: read the per-file report; 90/90/90 is the floor.

## Acceptance
- Given `renderSync` of gasaxu, then the result carries `data-diagram-type="BOARD"` from the new engine, and `git grep -n "board/parser"` is empty.
- Given the survey, when `board-moves` compares to b0, then lost is 0; the journal has each row's verdict, and any nonzero row its mechanism and owner.
- Given the gates, then they pass.

Observability N/A. Rollback Reversible.
