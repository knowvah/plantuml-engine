# Batch 0: brief, baseline, Path ruling issue

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the start, file the Path ruling issue, restore the planning oracles | orchestrator | this brief | — | [x] |

## T0

`<base>` is the mission base sha named in the execution prompt.

```sh
git status --porcelain   # only plans/factories-tail-port/ may appear
git branch --show-current   # must print feature/parity-queue
dot -V   # must print 16.1.0
git config --worktree commit.gpgsign false
git add plans/factories-tail-port
git commit -m "docs(ftp): add the factories-tail-port brief"
node -p "new Date().toISOString()"   # journal row 1: the mission start
```

If `/tmp/ftp-plan/fx/` is gone, restore it as [task-contract.md](../task-contract.md#restoring-the-planning-oracles)
says.

The every-engine baseline is the committed `tests/oracle/svg-conformance/parity-*.json` at `<base>`. `verdict-diff.mjs`
reads it from the ref, so T0 needs no survey. Snapshot the base `dist/*.d.ts` for T4: run `npm run build`, then copy
the files to `/tmp/ftp-base-dts/`.

### The Path ruling issue (D5)

File it with `gh issue create --label needs-ruling --label parity`, using the title and body below. Then add
`Blocked by #<new>` to #136's body (`gh issue edit 136 --body-file ...`, keeping the existing body). If either command
is denied, do not work around it. Leave the text in `.agent-notes/ftp-T0.md`, and T4 reports it.

**Title:** `Ruling needed: path under SecurityProfile.INSECURE writes a PNG into an SVG request`

**Body:**

> `PSystemPathFactory` (`PSystemBuilder.java:178-179`) is registered only when the security profile is `INSECURE`.
> The pinned oracle runs as LEGACY (`SecurityProfile.java:114-135`, with no `PLANTUML_SECURITY_PROFILE` in
> `scripts/oracle-render.sh`), and so does the library by default (`DEFAULT_SECURITY_PROFILE`). In that profile,
> `path X` is an error page on both sides, which is conformant. #135 pins those rows.
>
> The library accepts `RenderOptions.securityProfile: 'INSECURE'`. In that profile the jar does two things:
> - It writes `GraphicsPath`'s 50×50 PNG to the output stream whatever the requested format (`PSystemPath.java:58-63`,
>   `GraphicsPath.java:66-89`, a `DirectOsDiagram`). Measured with `-tsvg` and `path ABCabc`: the `.svg` file is a
>   285-byte PNG.
> - It throws `IllegalArgumentException` from `UMotif.convertFromChar` (`UMotif.java:93-101`) for any character
>   outside `A-Z`/`a-w`, which gives the crash-report page.
>
> `renderSync` returns an SVG string, so it cannot return those PNG bytes. Options:
> 1. Leave the factory unregistered in every profile, and name the INSECURE case in `DIVERGENCES.md`.
> 2. Register it under INSECURE, and draw the motif as SVG (a 50×50 page with one black polyline).
> 3. Register it under INSECURE, and return the PNG through a channel the API does not have today.
>
> Rows: `tests/fixtures/factories/cov-path-valid.puml` and `cov-path-invalid.puml` (default-profile error pairs, from
> #135). No corpus row reaches this factory.

## Acceptance
- Given the driver has checked out `feature/parity-queue`, when T0 finishes, then `git log -1` is the brief commit,
  and journal row 1 holds the start time and the new issue number (or the denial).
- Given `/tmp/ftp-plan/fx/`, then it holds 27 `.puml`/`.svg` pairs.

Observability is N/A: there are no new observable operations. Rollback is Reversible.
