# T2: `nonode` parses, everywhere upstream's key list reaches, and is never a colour

**Writes:**
- `src/core/link-style-regex.ts` (`STYLE_KEY1`, `STYLE_KEY2`, `UBREX_KEY1`, `UBREX_KEY2`)
- `src/core/decoration/WithLinkType.ts` (`applyStyle`)
- `src/diagrams/state/state-transitions.ts` (P1: the local `STYLE_WORD`)
- every other port copy of the key list (step 1 finds them)
- `tests/unit/core/link-style-regex.test.ts` (or the existing test for it), `tests/unit/state/state-nonode.test.ts`
- the gate

**Reads:** README P1 to P3; `CommandLinkElement.java:77-93`, `WithLinkType.java:126-166`, the 11 consumers
(`grep -rln 'CommandLinkElement.LINE_STYLE\|UBREX_LINE_STYLE\|LINE_STYLE_MULTIPLES' ~/git/knowvah/plantuml/src/main/java/net`).

## Steps

1. **Enumerate.** `grep -rn "norank" src/` lists every copy of the key list. For each, find the upstream consumer it
   mirrors. A copy whose upstream reads `CommandLinkElement.LINE_STYLE`/`UBREX_LINE_STYLE` gets `nonode` in
   upstream's position (after `node`, `:82-86`). Where the copy exists only because the port never imported the
   shared constant (P1 is one), import the shared constant instead: upstream has one list, not two. Journal the
   table of copies and what you did to each.
2. **Red.**
   - `A -[nonode]-> B : go` parses in state; the transition keeps `arrowStyle: 'nonode'` and a plain arrow.
   - `A -[nonode,dashed]-> B : go` is dashed; its line colour is the theme's, not white (P3).
   - `WithLinkType.applyStyle('nonode')` sets no specific colour and does not set node style (`:157-161`).
   - `component A` / `A -[nonode]-> B : go` parses in description (draws a plain link).
3. **Green.** Port the keyword and the no-op branch with `@see` lines.
4. **Measure.** Expected: `snl-issue-nonode`, `snl-nonode-plain-state`, `snl-nonode-desc` reach 0 (if a residual
   remains, find its mechanism before pinning it OPEN). `snl-vega-nonode-override` leaves the syntax error and stays
   OPEN on T3/T4 (its second transition is node style). Every node-style row is unchanged.
5. **Push-forward probes** (README): `-[nonode]->` in activity-legacy, class and sequence, each with its oracle.

## Acceptance
- Given `A -[nonode]-> B : go`, when parsed in state or description, then there is no refusal and one plain transition.
- Given `nonode` in an arrow style, when the style applies, then no specific colour is set.
- Given every engine's survey, when T2 lands, then verdict-diff shows 0 lost.

Observability: N/A. Rollback: Reversible.
