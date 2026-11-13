# ftp-T0

## Observation: gh issue edit on #136 denied by the auto-mode classifier
- **Context**: T0 files the Path ruling issue and adds `Blocked by #178.` to #136.
- **Finding**: `gh issue create` succeeded (#178, labels needs-ruling + parity).
  `gh issue edit 136 --body-file ...` was denied ("External System Writes").
  Per the brief it was not worked around.
- **Impact**: The maintainer must append `Blocked by #178.` to #136's body by
  hand. T4 reports it.
- **Confidence**: High
