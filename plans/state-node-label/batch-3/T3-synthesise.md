# T3: decide node style and build the leaf and its two links, as the command does

**Writes:**
- `src/diagrams/state/state-node-style.ts` (Create; D3)
- `src/diagrams/state/ast.ts` (`StateKind` `'transitionLabel'`; correct P4's comment)
- `src/diagrams/state/state-parse-state.ts` (clock + leaf counter on `ParseState`)
- `src/diagrams/state/parser.ts#initParseState` (read `options?.clock`)
- the transition handler that today calls `emitTransition` for a parsed arrow (find it: `grep -rn emitTransition src/diagrams/state`)
- `tests/unit/state/state-node-style.test.ts` (Create)
- the gate

**Reads:** D1, D3; `CommandLinkStateCommon.java:157-395`; `CucaDiagram.java:196-235`; `state-link-add.ts`.

## Steps

1. **Red.** Exact-value tests on `parseState` output:
   - `skinparam stateDiagramEdgeLabelStyle node` / `A --> B : go`: one `'transitionLabel'` state with id
     `transition_A_B__go__0`, display `go`, stereotype `transition`; transitions `A → leaf` (no decors, length 2, no
     label) and `leaf → B` (arrow, length 2); creation indexes in upstream order (leaf uid before the two links).
   - The same with a clock `{ nowMillis: () => 1000, zone: 'UTC' }` and the line twice: ids `…__1000`, `…__1001`
     (D1), two leaves.
   - `A -[node]-> B : go` without the skinparam: node style. `A -[nonode]-> B : go` with it: the plain path.
     `skinparam statediagramedgelabelstyle NODE`: node style (`equalsIgnoreCase`, `:306-307`; skinparam keys are
     case-insensitive — check how the port reads them).
   - `A --> B` (no label) under the skinparam: the plain path (`:193`).
   - `A -left-> B : go`: both links inverted, two extra ticks (`:361-364`).
   - `A -[#red,dashed,node]-> B : go`: both links carry `#red,dashed`; `A -[node,dotted]-> B : go`: `dotted`
     (upstream's three regexes, `:369-375`, verbatim).
   - `A --> B <<hot>> : go`: neither link has the stereotype.
   - `[*] --> A : init`: the id uses the start entity's **name** (`*start*` in the jar comment; find the port's name
     for it).
   - Inside `state C { X --> Y : inner }`: the leaf is a child of `C` (`quarkInContext`, current group).
2. **Green.** Port the four functions into `state-node-style.ts` (D3), and call them from the transition handler
   where `executeArg` branches (`:190-196`). Route both links through `emitTransition`. Read `Display#toString` and
   port it for the id.
3. **Measure.** Record every row's movement. Expected: no `ZERO` row moves; node-style rows change shape (the
   leaf has no image yet).

## Acceptance
- Given the issue repro, when parsed, then the AST holds one `'transitionLabel'` leaf `transition_A_B__go__0` and the
  two transitions with upstream's decors, lengths and order.
- Given `A --> B : go` twice, when parsed with a fixed clock, then two distinct leaves exist.
- Given `-[nonode]->` under the skinparam, or no label, when parsed, then the plain single transition is built.

Observability: N/A. Rollback: Reversible.
