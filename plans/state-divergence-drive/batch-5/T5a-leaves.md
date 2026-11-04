# T5a — hidden entities, skins, json leaves, table notes

Commit: `fix(state): hidden entities, skins and json leaves`.

## Context, each a *lead*
- `hide <<hidden>>` (`kocago-20`, `sagica-63`): `SvekResult.java:85` draws through `UHidden.HIDDEN`. The jar still emits `g class="entity" id="ent0001"`, where ours starts at a link. Read `UHidden`, and what `hide <<x>>` does to DOT.
- `skin debug` (`sumiri-68`, `niveno-60`), `skin rose` (`nimana-36`): `.agent-notes/` and `src/core/` skin loading; state's `rx` empty against `7.5`.
- `json foo1 {` in a state diagram (`maruju-55`): `EntityImageJson`, drawn as our plain box (`renderer.ts:75-77` calls this a known gap). The class engine has the port: reuse before writing.
- `|= header |` in a note (`fatupo-62`): creole table, widths 189.556 against empty, `@x` 97.87 against 110.139.

## Acceptance
- Given each row named above, when rendered, then it is conformant, or a journal line names what remains.

Observability: N/A — no new observable operations. Rollback: Reversible.
