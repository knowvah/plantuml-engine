# gip T5 — issue comments (gh issue comment denied by the auto-mode classifier, 2026-11-11)

## For #131

git-engine-port (gip) finished on `feature/parity-queue`, squashed to one unsigned commit (not pushed; per-task history on the local tag `git-engine-port/pre-squash`).

- `gitlog/` ported file for file into `src/diagrams/git/`, registered at `PSystemBuilder.java:191`. Layout goes through `core/graph-layout` with `SmetanaForGit`'s graph: a new `box` node kind (no `fixedsize`/`label`) and a raw `ranksep=0.35`. Every other engine's DOT is byte-identical, and no row moved in any other bucket.
- The 4 `@startgit` rows no longer hit the unknown-type sentinel. `juzane-95` and `mebafo-26` are **structural-match**. `lagapi-44` and `figagi-40` differ only in numbers, plus 1 and 10 curves with a different cubic-piece count. figagi renders in ~0.3 s.
- Every residue is proven Smetana-vs-graphviz arithmetic: our DOT equals a hand trace of `SmetanaForGit#initGraph`; dot-engine equals real `dot -Tdot` 16.1.0 to dot's printed precision; and real dot, given the jar's box sizes, reproduces the jar's node positions. The residue is named in `DIVERGENCES.md`'s new git table: U-BOX (`poly_init` rounding, graphviz `2b255ca79`, 8.0.4), the default `\N` label, U-ARROW, U-CLIP, and U-NS on the two large rows. No new divergence was added. `oracle/accepted-divergences.json` is unchanged.
- 55 authored fixtures, rendered by the jar: 1 zero-diff, 8 jar crash pages (modern git's `* /` octopus lines and a commit right above `*-.` both crash the jar) paired with our error page, and 46 pinned at verdict + `maxDelta`. The new `svg-git` ratchet has a structural tier.
- `CLAUDE.md` still says "`@startgit` (`SmetanaForGit`, unbuilt)". That edit is yours to make.

## For #136

#131 (git-engine-port) done: the 4 `@startgit` rows moved from the unknown-type sentinel to drawn. 2 are structural-match; 2 are diverged on curve piece counts only, with their residue named under the Smetana ruling. Overall conformant 5,708 / 5,927, unchanged; structural-match 120 → 122; 0 lost in any engine. No new issue.
