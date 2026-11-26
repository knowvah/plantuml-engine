# Batch 3: synthesise the leaf and links

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T3 | `shouldUseNodeStyle` + `createTransitionWithIntermediateNode` at parse time (D1, D3) | orchestrator or `typescript-pro` | see T3 | T2 | [x] |

After T3 the AST is right and the layout still treats the leaf as an unknown kind. Rows may move either way until T4;
only the gate's ceilings for rows T3 does not own may rise, and only with the journal naming T4 as the reason. Every
survey row must stay put (no corpus row uses node style).
