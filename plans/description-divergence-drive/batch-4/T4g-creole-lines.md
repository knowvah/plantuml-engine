# T4g — creole rules and underline stroke

Commit: `fix(creole): draw rules and underlines at the jar's stroke`.

## Context
`usecase/nixura-77` and `unknown/xikefu-26` (`[__init__]`): `line` `stroke-width` 1 against 0.5. The jar's `UGraphic` keeps the entity's stroke on an underline, and our `line` resets to 1, or the other way round. `AtomText` draws underlines (`creole/atom/AtomText.java` *lead*) and `StripeTable`, `CreoleHorizontalLine.java` draws rules. The change lands in shared creole, so `verdict-diff`, and it may move rows in other engines: a gain is fine, and a loss is stop 1.

`xusuxe-62`'s `#FFF` against `#000` with one child short is a sprite with text (`cloudogu`): take it if a re-read says so, otherwise T5d.

## Rows
`nixura-77`, `xikefu-26`.

## Acceptance
- Given `xikefu-26`, when rendered, then both `line`s have `stroke-width="0.5"`, with zero diffs.
- Given `nixura-77`, then rules and underlines match.

Observability: N/A — no new observable operations. Rollback: Reversible.
