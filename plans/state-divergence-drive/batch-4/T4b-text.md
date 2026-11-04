# T4b — text

Commit: `fix(state): text alignment, exposant and wrap positions`.

## Context, each a *lead*
- `exposant-03`, `juvagu-33`: `<sup>` on a state body is 0.667 lower, `@y` only. SI30 ported the atom (`.claude/memory/creole-exposant-port-status.md`); look at the line's y advance.
- `jafazu-60`, `rejike-58`: `skinparam wrapWidth 150`, `@x` off by 0.744.
- `judova-36`: `title { HorizontalAlignment left }` on a state diagram. `rovado-96`: `center header` multi-line. `guligu-53`, `zinupo-20`: `|_` tree in a title, x off by 8.
- `fatupo-62`'s table note and its `|=`: T5a.

The chrome ones may be shared with other engines: `docs/parity-report.md` lists who else, and a core fix must keep `verdict-diff.mjs` at 0 lost.

## Acceptance
- Given each row named above, when rendered, then it is conformant, or a journal line names what remains.

Observability: N/A — no new observable operations. Rollback: Reversible.
