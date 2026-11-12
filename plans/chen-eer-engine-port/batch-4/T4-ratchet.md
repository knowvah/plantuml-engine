# T4: the `svg-cheneer` ratchet and the DOT-parity gate

**Writes:**
- `oracle/goldens/svg-cheneer/{README.md,ratchet.json,authored-baseline.json}`;
- `tests/oracle/svg-conformance/{cheneer.golden.ratchet.test.ts,render-fixture-cheneer.ts}`, plus
  `cheneer.diff-baseline.ratchet.test.ts` if any fixture stays nonzero;
- `oracle/goldens/cheneer/<slug>/{input.puml,svek-1.dot}`, `oracle/goldens/cheneer/size-backlog.json`,
  `tests/oracle/cheneer-dot-parity.test.ts`;
- `scripts/parity-dashboard-goldens.ts`, `docs/parity-report.md`.

**Read:**
- `regex.golden.ratchet.test.ts`, `render-fixture-regex.ts` and `oracle/goldens/svg-regex/README.md`;
- `tests/oracle/activity-legacy-dot-parity.test.ts`;
- `tests/oracle/dot-parity-backlogs.ts`;
- the T4 rows of `plans/regex-engine-port/decision-journal.md` and `plans/legacy-activity-engine-port/decision-journal.md`.

**Do:**
1. Copy regex's ratchet test and README with `cheneer` substituted. `ratchet.json` stays empty, because there is no
   corpus row.
2. Run `npx jiti plans/chen-eer-engine-port/measurements/build-authored-baseline.mts <HEAD sha>` and read it. Then rerun
   it with `--write`. A nonzero row must be an error pair or in `OPEN_ROWS`, with its citation.
3. Run `npx jiti plans/chen-eer-engine-port/measurements/pin-cheneer-dot.mts --authored /tmp/ceep-dots`, read it, then
   rerun it with `--write`. Copy activity-legacy's DOT-parity test with the directory substituted. Fixtures that are
   `EQUAL` but not size-exact go in `size-backlog.json`, which can only shrink.
4. In `scripts/parity-dashboard-goldens.ts`, add `'svg-cheneer'` to `unknown`'s list with a `ceep D3` comment.
   `unmappedGoldenFamilies` must stay empty. Regenerate `docs/parity-report.md` (`npm run parity:dashboard`).
5. Time the new suites locally at `uptime` below ~10, and journal the wall time (CI risk).

## Acceptance
- Given `npm test`, then the new suites pass and collect the expected counts (read them).
- Given a label deliberately broken in one fixture (local, not committed), then both the ratchet and the DOT gate fail
  on that fixture.
- Given the dashboard, then `unmappedGoldenFamilies` is empty.

Observability is N/A: there are no new observable operations. Rollback is Reversible: revert the commit.
