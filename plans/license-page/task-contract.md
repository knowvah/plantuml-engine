# Task contract

Every task follows these steps in order. A task file adds only what is specific to it.

1. **Read the source first.** Open `~/git/knowvah/plantuml/src/main/java/net/sourceforge/plantuml/version/License.java`
   (`header1` `:112-129`, `header2` `:131-153`, `end3` `:155-238`, `addMit` `:241-265`) and the issue body
   (`gh issue view 179`). Quote `file:line` before you say why a line differs. The issue is the source of truth for
   every character of the new text; `decisions.md` D1's sketch is annotation.
2. **Check before you build.**
   - `src/diagrams/version/License.ts` already mirrors upstream's methods; change line tables and the method bodies
     that read them, nothing else.
   - The vkt mission did this kind of row signing before: `plans/version-key-tools/batch-2/T2a-authored-rows.md`,
     `T2b-ledger-divergences.md`, and its journal.
   - Run `ls .agent-notes | grep -iE "ufp|vkt|licen"` and read what matches.
3. **Red.** Before a code change, change the test to the new expected lines and watch it fail. Assert exact strings
   and exact dimensions; never assert only "is defined" or a length alone.
4. **Green.** Port, do not fit. Every new line table carries a JSDoc naming the ruling item it implements and the
   upstream lines it replaces (`ruling 2026-11-12 item 6; replaces License.java:218-225`).
5. **Measure, alone:** `npx vitest run tests/unit/version`, then the authored ratchet (README "Measurement
   commands"); read the counts.
6. **Commit** with Conventional Commits: lines ≤80, footer `Refs: #179`, and the harness's `Co-Authored-By` trailer.
   Prettier runs on commit.
7. **Notes.** Write `.agent-notes/lic-<task>.md` for anything unexpected, using the template in
   `~/.claude/rules/memory.md`.

**Every task:**
- Observability is N/A: there are no new observable operations.
- Rollback is Reversible: revert the commit.
- Agent: the orchestrator, or a `typescript-pro` subagent whose prompt is this file, `decisions.md` and the task file.
- Write-sets are plans. Change another file in this repository when the work needs it, and journal why.

A subagent's claim is a claim until you have read the source yourself (`.claude/memory/verify-agent-claims-si31.md`).
Never run two writers at once.

## Batch close

1. Run the README gates, with `uptime` below ~10.
2. Run `npm run svg:survey`, then `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`. It
   must show 0 lost in every engine. (The license rows are authored rows, outside the survey; the survey proves no
   corpus row moved.)
3. Run `npm run parity:dashboard`. Commit `docs/parity-report.md` with the `parity-*.json` files only if they changed
   beyond `generatedAt`; otherwise leave them at HEAD and journal it.
4. Tick the overview and the README, append the counts and the close sha to the journal, and commit.
