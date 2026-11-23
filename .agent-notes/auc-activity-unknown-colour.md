## Observation: a jar error page's banner changes between runs
- **Context**: auc T1, re-rendering 30 planning oracles with `scripts/oracle-render.sh` and comparing byte for byte.
- **Finding**: the 13 drawn rows matched; all 17 error pages differed. `PSystemError` decorates the page with a banner that varies run to run (`PSystemError.java:272,328-349`: the black "dedication" block vs the yellow advert), so page size and content change; the `No such color` / `Syntax Error?` text stays.
- **Impact**: never `cmp` a jar error page against an earlier render, and never ratchet a diff count against one as if it measured our drawing. Assert the message only.
- **Confidence**: High

## Observation: `-[]->` is not an arrow in activity
- **Context**: auc T2a, the brief warned our parser hands `memberLook` an empty colour for `-[]->`.
- **Finding**: `STYLE_COLORS_MULTIPLES` needs one `LINE_STYLE` token inside the brackets (`CommandLinkElement.java:88-94`), so the jar draws `-[]->` as an activity-list box labelled `[]->`; our `ARROW_HEAD` (`dispatch-support.ts:264`) has the same requirement. `""` never reaches `memberLook`.
- **Impact**: a brief's "our parser does X" is a claim; render it. `getColor("")` would throw upstream (`ColorTrieNode.java:241-250`).
- **Confidence**: High

## Observation: a single activity swimlane is never drawn
- **Context**: auc T2b, `|#zzblue|L1|` stored the neutral but no `#D3D3D3` appeared.
- **Finding**: `Swimlanes.drawU` calls `drawWhenSwimlanes` only when `swimlanes().size() > 1` (`Swimlanes.java:253-259`); with one lane the jar draws no lane, title or fill, and ours matches. Lane-colour probes need two lanes.
- **Impact**: any lane-colour or lane-title probe must declare at least two lanes, or it measures nothing.
- **Confidence**: High

## Observation: `else (-[#c]-> label)` colour only works after an `elseif`
- **Context**: auc T2a, `act-else-when` never got the neutral.
- **Finding**: `ActivityIf.elseLabelColor` is read only by `layout/conditional-builder-long.ts:151`; the two-branch path (`walk-if-with-links.ts:273`, `applyInColor`) answers only the first tile's in-link, missing `Branch.getInColor`'s `labelPositive` step (`Branch.java:166-167`). Valid colours drop too (4 diffs on `#red`). Filed #230.
- **Impact**: an `else` WHEN colour fixture on a two-branch `if` is not yet a colour-resolution test.
- **Confidence**: High

## Observation: `npm run svg:survey` runs ~16 minutes on this machine
- **Context**: auc batch closes, load ~5-10.
- **Finding**: the every-engine survey took 16m23s; `npm test -- --maxWorkers=4` took ~8m. A foreground Bash call caps at 10 minutes, so run the survey in the background with an exit marker written into its own log.
- **Impact**: headless sessions must wait on the survey with a log-marker loop, not a single foreground call.
- **Confidence**: High
