# T4b — Planning probes into fixtures, then the D11 probes

**Write-set:** `tests/fixtures/timing/**` (`<slug>.puml` + `<slug>.svg`), `oracle/capture-clock.json` (rows the oracle
script records for zone-dependent fixtures).

**Read:** D11; how `tests/fixtures/regex/` is laid out and registered (rep T3b's journal row; the authored-fixture
registration that `fixtures.mts` and `render-fixture-*.ts` read); `.claude/memory/probe-past-authored-rows.md`.

**Do:**

1. Copy all 46 `plans/timing-engine-port/probes/*.puml` into `tests/fixtures/timing/`, render their oracles there with
   `scripts/oracle-render.sh` (absolute out-dir), and run `fixtures.mts`.
2. Author the D11 list, one concern per file, `cov-` prefixed; render; run `fixtures.mts`.
3. Each fixture that is not 0 diffs and not an `error-pair` gets a journal line with its first diff and owner (T4d), or
   a fix here if the mechanism is one line with its Java quote.
4. Layer-crossing probes: at least one source mixing every player kind with a message, a constraint, a note, a
   highlight and `scale`; and one with `<style>` and `skinparam` together (`.claude/memory/probe-past-authored-rows.md`:
   green rows hid defects that crossings exposed).

## Acceptance
- Given `fixtures.mts`, then every fixture prints 0 diffs or `error-pair`, or is named in the journal with its owner.
- Given `capture-clock.test.ts`, then it passes (every zone-dependent fixture has its row).

Observability N/A. Rollback Reversible.
