## Observation: activity's parity note class says "no library forces them" but its rows are all named divergences
- **Context**: version-builtin T1b, rewriting the activity row note in `scripts/parity-dashboard-notes.ts`.
- **Finding**: activity uses `noteClass: 'openDefect'`, whose class text reads "An engine exists, and what remains are bugs still to fix. No library forces them." After #155 all 5 activity rows short of conformant are named divergences: 3 KaTeX (library-forced), 1 QR (MIT edition), 1 ledgered by ruling. `NoteClass` has no member for "accepted divergences only".
- **Impact**: the dashboard's class text misdescribes the activity row. Fixing it needs a new note class (symbol, CLASS_TEXT, CLASS_ORDER) — a dashboard change, not done here.
- **Confidence**: High

## Observation: docs-site/parity.md is not written by parity:dashboard
- **Context**: same task; the brief lists `docs-site/parity.md` as a regenerated output.
- **Finding**: `docs-site/parity.md` and `docs-site/divergences.md` are gitignored (`.gitignore:67-68`) copies written by `docs-site/copy-reports.mjs`, which runs as the first step of `docs:dev`/`docs:build`. `npm run parity:dashboard` writes only `docs/parity-report.md`.
- **Impact**: never commit or "regenerate" `docs-site/parity.md` at a batch close; run `node docs-site/copy-reports.mjs` only to refresh the local copy.
- **Confidence**: High
