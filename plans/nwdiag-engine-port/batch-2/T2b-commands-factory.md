# T2b — Commands, factory, skin param

**Read:** `NwDiagramFactory.java`; the 8 `Command*.java` files at the package root; `CommandFootboxIgnored.java`;
`CommonCommands#addCommonCommands1`; `src/diagrams/packetdiag/PacketDiagramFactory.ts`, `packet-skin-param.ts`,
`src/diagrams/board/BoardDiagramFactory.ts`, `src/core/command/UBrexCommandFootboxIgnored.ts`; D1, D8, D11.

**Do:**

1. One file per command at `src/diagrams/nwdiag/` (D1), each a `SingleLineCommand2` port in the shape packet's commands
   use, with the regex built leaf for leaf: `CommandNwDiagInit` (`^(nwdiag)?\s*\{?$`), `CommandComment`,
   `CommandElement` (`NAME` `[-.%pLN_]+`, `DEFINITION` `\[(.*)\]`, `;?`), `CommandGroup`, `CommandNetwork`,
   `CommandLink`, `CommandProperty` (D8: the value keeps a trailing `;` when unquoted), `CommandEndSomething`.
   `%pLN` expands as the repo's other ports expand it; find the helper rather than writing a class by hand.
2. `NwDiagramFactory.ts`: `createEmptyDiagram`, then the command list in Java's order: common commands 1, the 8
   commands, then footbox-ignored. Reuse whatever `PacketDiagramFactory.ts` and `BoardDiagramFactory.ts` reuse for
   common commands and the refusal shape. An empty diagram follows their empty-diagram path to the Welcome page
   (`cov-empty`, D11). Export `parseNwdiag`.
3. `nwdiag-skin-param.ts`, mirroring `packet-skin-param.ts`.

**Tests:** each regex against Java's accept and refuse cases, including `address = 210.x.x.x/24;` (value
`210.x.x.x/24;`), `address = "10.0.0.0/24";` (value `10.0.0.0/24`), a blank line, `nwdiag {`, `{`, `a -- b;`,
`a -- b [shape = cloud]` (refused: `ligalo-62-suvu444`'s `Syntax Error?` at line 3); the factory on each of the 4
jar-error rows gives the jar's line and message from `oracle/goldens/stock-error-pages.json`; an empty source gives
the empty-diagram result.

## Acceptance
- Given `ligalo-62-suvu444`, when parsed, then the refusal names line 3 and `Syntax Error?`.
- Given `torazi-09-gago377` and `zeceme-22-rade890`, then line 13 `Element already in another group.` and line 6
  `Cannot nest group`.
- Given `cov-net-address-semicolon`'s network property, then the network's own address is `210.x.x.x/24;`.
- Given `npm test`, then it passes with every new file at 90/90/90.

Observability N/A. Rollback Reversible.
