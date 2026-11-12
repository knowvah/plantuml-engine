# T2b — `SmetanaForGit`, `GitDiagram`, `GitDiagramFactory`, export

**Read:** D1, D2, D3, D4; `gitlog/{SmetanaForGit,GitDiagram,GitDiagramFactory}.java`;
`command/PSystemAbstractFactory.java`; `src/diagrams/bpm/{bpm-export,index,BpmDiagram}.ts`;
`src/diagrams/json/{layout,json-node-position}.ts` (the json bridge over the same `read: 'exact'` frame);
`src/diagrams/dot/index.ts` (an existing non-command factory plugin).

**Write-set:** `src/diagrams/git/{SmetanaForGit,GitDiagram,GitDiagramFactory,git-export}.ts`; `tests/unit/git/**`.

**Do:**
1. `GitDiagramFactory#createSystem`: skip the first line, then add each line while another follows, so the closing tag
   is never added (`GitDiagramFactory.java:60-68`). Iterate the preprocessed source as upstream's `iterator2` does.
   Check `PSystemAbstractFactory` and the port's dispatcher for what an empty body or a non-`@startgit` block does.
2. `GitDiagram`: extends the port's `TitledDiagram`, type `GIT`, style name `null` (`GitDiagram.java:56`). It builds
   `gnodes`, keeps the discarded second `GNodeBuilder` (D1), describes itself as `"(Git)"`, and creates
   `SmetanaForGit` lazily with the diagram's skin param (D4).
3. `SmetanaForGit`:
   - `initGraph` builds the D2 graph through T1c's node kind, in `nodes` (insertion) order, named `N<num>`. Edges go
     per node per `getDowns()`, child→parent, skipping a null endpoint (`:185-191`).
   - Lay out with `layoutGraph(…, { read: 'exact' })`, then `yMirror = new Mirror(max(cy + h))` (`:170-177`). Use the
     engine's centre and size, never ours.
   - `getPosition` is `(cx − w/2, yMirror.inv(cy + h/2))`; `getSize` is the engine's `w × h`.
   - `calculateDimension` is the max of `pos + size` over nodes, so edges do not count.
   - `drawMe` applies the `{root, element, gitDiagram}` stroke and line colour, draws every box, then every edge
     with `arrowColor()`.
4. `git-export.ts`: copy `bpm-export.ts` (D3). Use `TitledDiagram`'s margins, background and warnings, style name
   `activityDiagram`, `data-diagram-type="GIT"`, and handwritten through `UGraphicHandwritten`.
5. Tests:
   - The factory on `"@startgit\n@endgit"` gives zero commits and a 0×0 text block.
   - `juzane-95` end to end through `GitDiagram` + export. Assert element order and kinds (5 rects with their texts,
     then 4 path + arrow pairs), every text attribute, colours, stroke widths and the dasharray. Box sizes and
     positions are engine-decided (D9) and not asserted.
   - `cov-style`'s source exports byte-identical to `cov-preproc-var`'s (D4).
   - `figagi-40` renders end to end in under the survey's 60 s, with the time journaled.

## Acceptance
- Given `juzane-95`, when exported, then the SVG has the oracle's element sequence, text content, fonts, colours and
  strokes, and differs from it only in numeric geometry.
- Given a `<style>` or `skinparam` line in a git source, then the output does not change.
- Given an empty body, then the export is the 21×21 empty canvas `cov-empty` shows.

Observability N/A. Rollback Reversible.
