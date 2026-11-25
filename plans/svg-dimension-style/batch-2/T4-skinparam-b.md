# T4: skin-param engines, part B

**Rows:** `ebnf`, `regex`, `board`, `chen`, `wire`, `packet`, `chart`.
**Writes:**
- `SkinParam` ports: `src/diagrams/{ebnf,board,wire,chart}/<engine>-skin-param.ts`,
  `packetdiag/packet-skin-param.ts`, `cheneer/cheneer-skin-param.ts`. Regex has none: `regex/regex-skin-param.ts:20`
  re-exports ebnf's `SkinParam`;
- exporters: `src/diagrams/{ebnf,regex,board,wire,packetdiag,chart}/index.ts`, `cheneer/renderer.ts`;
- a unit test per port; the gate.

**Reads:** T3's diff (the pattern, already landed), each port's `getlengthAdjust()`, D1, D2.

## Steps

The same four steps as [T3](T3-skinparam-a.md), for these 6 ports and 7 exporters. Regex's exporter calls ebnf's
port, so one unit test covers both.

## Acceptance
- Given `skinparam svgDimensionStyle false` in an ebnf, regex, board, chen, wire, packetdiag or chart diagram, when
  rendered, then the root has no `style`, `width` or `height`.
- Given each port with the key unset, `true`, `false` or `FALSE`, when `svgDimensionStyle()` is called, then it
  returns `true`, `true`, `false`, `false`.
- Given these engines without the skinparam, when rendered, then the output is byte-identical to the base.
- Given the gate after T4, then its `OPEN` list is empty.

Observability is N/A. Rollback is Reversible.
