# flp-T3c — the D4 ruling issue

## Observation: #136 comment denied; text to post by hand
- **Context**: T3c filed the D4 `needs-ruling` issue as #174 (labels `needs-ruling`, `parity`) and then tried
  `gh issue comment 136`, which the auto-mode classifier denied.
- **Finding**: #136 needs this comment (or a `Blocked by #174` body line):
  > Blocked by #174 (flow-engine-port, #132): `bemixo-79-xulu250` and 38 multi-box `@startflow` fixtures are
  > multiset-equal to the jar but cannot pass the positional compare, because the jar's box order and post-shift
  > layout follow Java identity hashes. #174 asks how to count them.
- **Impact**: #136's v1.0 checklist will not list #174 until it is posted.
- **Confidence**: High
