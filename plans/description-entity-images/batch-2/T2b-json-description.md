# T2b: `json` in description

## Context

Description has no `json` command, so `gacoxo` (`json` in `database { }` in `cloud { }`, unclosed at `@enduml`) is a
Syntax Error. Class and state already adapt the shared `src/core/command/CommandCreateJson.ts`
(`class/class-json-commands.ts`, `state/state-json-commands.ts`).

## Steps
1. Add `leafType` and `jsonValue` to `DescriptiveNode` (`ast.ts:31`, D2). Absent keeps today's path.
2. Add a `command-json.ts` adapter over `jsonCommands`, registered in upstream order (D3): after the multiline element
   and note commands, before archimate (`DescriptionDiagramFactory.java:129-131`). Its multiline body must be consumed
   the way the shared port expects; follow the class adapter's pending-body pattern.
3. Layout (`layout-dot-tree.ts`, near the `symbol === 'port'` branch at `:225`): size a `json` leaf from
   `EntityImageJson.calculateDimension`, with the DOT shape upstream's `SvekNode` gives a JSON leaf (read
   `GraphvizImageBuilder`/`SvekNode` for the shape; `svek-1.dot` in `test-results/dot-cache/unknown/gacoxo-93-guti295/`
   shows the jar's node line).
4. Render (`renderer-entity.ts#drawEntity`, `:336`): dispatch `leafType === 'json'` to `EntityImageJson.drawU`, with the
   `<g class="entity">` wrapper exactly as the oracle shows (or none, if it shows none).
5. Style: resolve the json's style from description's root signature (`componentDiagram` and friends) through
   `src/core/style/style-reads.ts`, never a hard-coded colour.

## Write-set
`src/diagrams/description/{ast,command-table,parser,parse-state,layout-dot-tree,renderer-entity}.ts`, new
`src/diagrams/description/command-json.ts`, tests under `tests/unit/description/`.

## Acceptance
- Given `gacoxo-93-guti295`, when measured, then it is not an error page, and `dotEqual` is true in the `unknown` survey.
- Given `dei-json-top`, `dei-json-single`, `dei-json-group`, when measured, then each reaches zero diffs, or its residual
  is journaled with the producer's `file:line`.
- Given every pinned description golden, when the ratchet runs, then the pass count is unchanged.

Observability is N/A. Rollback is Reversible.
