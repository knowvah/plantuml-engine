# T2a: fixtures

**Writes:**
- `tests/fixtures/factories/<slug>.{puml,svg}` for the 27 probes (`cov-welcome-named.svg` is the jar's `foo.svg`) and
  every authored addition;
- `plans/factories-tail-port/measurements/jar-variants.mjs`: a copy of lsp's, with the drawn markers `BPM` (Crash) and
  no-type drawn pages (Welcome, ListFonts). Key the markers on `[From` being absent.

**Read:** lsp T2b (`plans/listsprite-factory-port/batch-2/T2b-fixtures.md`) and journal row 6; `decisions.md` D9, D12.

**Do:**
1. Copy the probes with their r1 oracles.
2. Author a fixture for each branch that has none, rendered with `scripts/oracle-render.sh`. At least:
   - **Welcome:** `@startuml` with a `!define` that leaves two lines; an `@startuml` whose only body line is a
     `skinparam` (three lines, not Welcome).
   - **ListFonts:** `listfonts` after a `title` (two body lines, so the single-line gate fails); `listfont` with a
     creole argument.
   - **Crash:** `crash when drawing` then `crash when finalizing` (last wins); a blank line between two commands;
     `crash  when drawing` with a tab.
   - **Path:** `PATH ABC` (case: the `Pattern2` is case-sensitive or not; read `Pattern2.cmpile`).
3. Run `jar-variants.mjs` over every fixture, 3 runs each. Every drawn fixture must be `stable` (stop 5). Error and
   crash pages are expected to vary (D12).
4. Measure the family (`fixtures.mts` with no `--dir`, the `cov-welcome-*`, `cov-listfont*`, `cov-crash-*` and
   `cov-path-*` slugs). Journal the table: zero, error pair, named divergence (#169), open → T2b.

## Acceptance
- Given `fixtures.mts` over this mission's slugs, then every row is 0, `error-pair`, a `cov-listfont*` drawn page
  (#169), or named in a T2b sub-task.
- Given `jar-variants.mjs`, then every drawn fixture prints `stable`.

Observability is N/A: there are no new observable operations. Rollback is Reversible: revert the commit.
