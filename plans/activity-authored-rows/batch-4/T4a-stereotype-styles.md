# T4a — Stereotype and class styles on diamonds, circles, repeat; positional `<style>` (item 15)

**State at planning:** 18 corpus rows, Σ 355, plus `unknown/dijapi-54-jiza111`.

| Row | Diffs | Source | First diff (ours / jar) |
|---|---|---|---|
| `gexufa-76-paga835` | 1 | `repeat :Enter data; <<r>>` ... `repeat while (...) <<b>>`, `.r`/`.b` classes | diamond fill `#F1F1F1` / `#00F` |
| `totave-53-fiju801` | 2 | `repeat <<r>>` ... `repeat while ... <<b>>` | both diamonds `#F1F1F1` / `#F00`, `#00F` |
| `makage-63-rilo111` | 1 | two `<style>` blocks, each before its own `if` (item 15) | second diamond text `#00F` / `#F00` |
| `mebake-09-voxo642` | 2 | `diamond { HorizontalAlignment center }`, a multi-line `if` | text `x` 79.675 / 91.878 |
| `tusaxu-17-rasi651`, `dadelu-44-xuvu530` | 2, 5 | `start <<#green;line:red>>`, `end <<#blue>>`, `stop <<#blue;line:red>>` | circle fill `#222` / `#008000` |
| `dorupa-68-vobi706`, `tocoxa-40-pasa193` | 3 each | `start { LineThickness 5 }`, `stop`, `end` (dorupa under `scale 5`) | stroke-width 1 / 5 |
| `gefuni-32-ruli676` | 3 | `:start2 on; <<#AAAAAA;line:blue;text:red>>` | box fill `#F1F1F1` / `#AAA` |
| `nutuzi-66-numo166` | 4 | `skinparam ConditionEndStyle hline`, `arrow { LineColor blue }`, fork/if in a repeat | lines `#181818` / `#00F` |
| `vikexo-00-zame595` | 4 | `.s2n { LineThickness 2 }` on a floating note and a note | path stroke-width 0.5 / 2 |
| `dajuko-60-lozu517` | 9 | eight `.class { BackgroundColor }` on boxes and diamonds | diamond fills `#F1F1F1` / `#E10` |
| `zovacu-12-zate765` | 15 | `<<procedure>> <<#lightblue>>`, coloured arrows in an `if`/`else if` | line geometry |
| `vupecu-35-tisa672` | 28 | `if (decision) then (yes) <<foo>>` | diamond fill `#F1F1F1` / `#FFC0CB` |
| `kiveda-60-robo606` | 29 | `diamond { LineThickness 2; ArrowThickness 0.5; FontName Arial Narrow; FontSize 18 }` | diamond `#FFC0CB` / `#E0FFFF` |
| `botuge-46`, `gebeke-27` | 59 each | `:previous / action;<<continuous>>` before a `while`, `detach` | height 239 / 210 |
| `lobiki-30-cija465` | 126 | two positional `diamond` styles (item 15) around a `repeat` | width 182 / 197 |
| `unknown/dijapi-54-jiza111` | — | two positional `<style>` blocks: first diamond `#F00`, jar `#00B` (item 15) | `polygon[1]` fill |

`FtileFactoryDelegatorIf.java:79-80` merges the diamond style `withTOBECHANGED(stereotype)` (`vupecu-35`). Item 15:
dss D2 said "a bucket is a snapshot"; the jar reads a `<style>` positionally, so the diamond after the second block
takes the second value (`makage-63`, `lobiki-30`, `dijapi-54`).

**Read (leads):** `FtileFactoryDelegatorIf.java:76-90`, the repeat and while delegators' diamond styles,
`CommandStart3`/`CommandStop3`/`CommandEnd3` and `CircleStart`/`CircleEnd`/`CircleStop` (the stereogroup colours
and the merged `start`/`stop`/`end` style), how a `<style>` block mid-source changes `currentStyleBuilder` for
commands after it (`CommandStyleMultilinesCSS`, `TitledDiagram#getCurrentStyleBuilder`, `muteStyle`), and
`activity-box-builder-at.ts` (smc follow-on 2: only plain boxes capture the builder current at their command;
`InstructionIf.java:104`, `InstructionRepeat.java:105` capture it too).

**Do:** item 15 first (the builder capture for if, repeat and while: `makage-63`, `lobiki-30`, `dijapi-54`), then
the stereotype reads, then the circles.

**Measure:** the rows; activity and unknown surveys.

## Acceptance
- Given the 14 rows at or under 29 diffs, then each is conformant and pinned.
- Given `botuge-46`, `gebeke-27`, `lobiki-30`, `dijapi-54`, then each is conformant and pinned, or journaled with its
  remaining mechanism and owner.
- Given the activity and unknown surveys, then 0 lost.

Observability N/A. Rollback Reversible.
