# T3g — name what remains, file the ruling

Read [D4](../decisions.md#d4--math-and-latex-a-batik-shaped-complete-document-with-a-katex-body),
[D7](../decisions.md#d7--math-sizing-residuals-are-this-missions-work-in-the-existing-metrics-module),
[D8](../decisions.md#d8--help-font-lists-the-hosts-fonts-port-it-and-put-the-row-on-a-needs-ruling-issue),
[D12](../decisions.md#d12--divergences-and-acceptances) and [task-contract.md](../task-contract.md).

**Write:** `DIVERGENCES.md`, one new GitHub issue, and `.agent-notes/cmf-T3g.md`.

**`DIVERGENCES.md`:** extend "LaTeX rendering engine — KaTeX, not JLaTeXMath (permanent)" with a section naming, per row, every math or
latex row in scope that is not conformant, its mechanism (glyph paths versus KaTeX's output; or a specific formula KaTeX cannot parse), and
the forcing library. No row is named by category. Run `factory-rows.mjs` first and list them from its output. Every row must be either
conformant, here, or on the ruling issue.

**The ruling issue** (D8), labelled `needs-ruling`, not `queue:ready`: "Ruling needed: `help font` lists host fonts". Body: the row
`cikoge-60-riti614`, `cov-help-fonts`, that `CommandHelpFont` reads `GraphicsEnvironment.getAvailableFontFamilyNames()`, what we draw now
(three header lines, no names), the options (a library-forced entry, or a port-defined list), and that #135's `ListFonts` shares the
question. Add `Blocked by #<new>` to #136. If `gh issue create` is denied, leave the text in `.agent-notes/cmf-T3g.md` and journal it.

## Acceptance
- Given `factory-rows.mjs`, then every row is conformant, or named in `DIVERGENCES.md` with its mechanism, or on the ruling issue.
- Given `git diff <base> HEAD -- oracle/accepted-divergences.json`, then it is empty.

Observability: N/A — no new observable operations. Rollback: Reversible.
