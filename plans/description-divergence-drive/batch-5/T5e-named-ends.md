# T5e — the rows ended by a standing ruling

Commit: `docs(divergences): name the description rows left to a ruling`.

D8 names them. For each, prove the claim first:

- **LaTeX** `kezodo-14`, `vimulo-11`, `gevozu-46`, `sunuju-01`, `barufu-21`: list each remaining diff, and show it sits under the image atom or follows from its size (`DIVERGENCES.md`, "LaTeX rendering engine"; sizing rule cdd8 D6). A diff with no such link is a bug, and goes back to a task. The memory's `<latex>` box guard `core/svek/image/leaf-sizing.ts:182` is codd's lead: `gevozu`, `sunuju` went 164 to 68 with it, so check it still applies.
- **Smetana** `zomoba-18`, `revezi-19`: fix what is not geometry and record the delta (`DIVERGENCES.md`, "`!pragma layout smetana|vizjs`"). Do not chase a Smetana number (CLAUDE.md).
- **Oracle error** `usecase/fepuvo-06`: a test strips comments from both sides and compares. If clean, name it under "Descriptive diagrams". Then decide what our own malformed comment means: if the jar's bytes are malformed the same way, that is mirroring. `description.diff-baseline` holds it as `status: "error"` and stays.

`oracle/accepted-divergences.json` is not touched (D7).

## Acceptance
- Given `DIVERGENCES.md`, then each row above is named with its mechanism.
- Given the fepuvo test, then it passes.

Observability: N/A — no new observable operations. Rollback: Reversible.
