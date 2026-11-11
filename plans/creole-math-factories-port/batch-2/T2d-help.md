# T2d — `Help`, `HelpFactory`, the five commands

Read [D8](../decisions.md#d8--help-font-lists-the-hosts-fonts-port-it-and-put-the-row-on-a-needs-ruling-issue) and
[task-contract.md](../task-contract.md).

**Java:** `help/Help.java` (`getTextBlock` :80, `getDefaultMargins` :76), `help/HelpFactory.java` (`initCommandsList`), the five
`help/CommandHelp*.java`, `theme/ThemeUtils.java:204-217` (`getAllThemeNames`), `klimt/color/HColorSet.java:51-53` (`names`).

**Write:** `src/diagrams/help/{Help,HelpFactory,CommandHelpColor,CommandHelpFont,CommandHelpKeyword,CommandHelpType,CommandHelpTheme}.ts`,
`src/core/themes-source.ts` (Modify: export the sorted theme names; `THEME_SOURCES` is the data), `tests/unit/factories/Help.test.ts`.

`Help extends TitledDiagram`, type `HELP`, `previous` undefined; `add(CharSequence)` appends a line; `getTextBlock` uses `Display.create(lines)`,
`UFontFactory.serif(16)`, `blackBlueTrue`, `getSkinParam().sheet(fc, LEFT, CreoleMode.FULL).createSheet(display)`, and `SheetBlock1(sheet, LineBreakStrategy.NONE, ClockwiseTopRightBottomLeft.none())`; margin `same(0)`. Each command is `SingleLineCommand2` over `help` + spaces + a word
(`colors?`, `fonts?`, `keywords?`, `types?`, `themes?`), case-insensitive per `RegexLeaf` (`cov-help-upper`), and adds three header lines
then `* <name>` lines.

`help font` reads a `GraphicsEnvironment` seam returning no names (D8): add a `// D8` comment and a named `availableFontFamilyNames()`
helper, never a bundled list. `help theme` reads the theme names (the keys of `THEME_SOURCES`, `src/core/themes-source.ts:15`, sorted like `getAllThemeNames` :215;
planning found the oracle lists 44 names and the keys are 43: `_none_` is missing. Read how `ThemeUtils` and the jar's `themes/`
resources treat `puml-theme-_none_.puml` and whether `!theme _none_` is special, then mirror the list the jar enumerates, with the reason in a comment).

`initCommandsList` has only the five commands and **no CommonCommands**: `title`, `scale`, `skinparam` before `help` fail the whole
factory. Registered for `@startuml` in T3a; there the factory is reached in upstream order and can refuse.

**Interface output** (consumed by T3a): `helpPlugin: SyncPlugin`, command-factory (no `factoryBase` override).

## Acceptance
- Given `ficame-31-lece592` (`help color`), when rendered, then zero diffs and 179×2513.
- Given `kesexi-71-dubu320` (`help themes`), `mefure-90-gitu244` (`help keyword`) and `xasanu-61-guze787` (`help type`), then zero diffs.
- Given `cov-help-two`, then the second page's lines follow the first (`help type` then `help theme`, 189×1649).
- Given `help font` (`cikoge-60-riti614`), then the page draws its three header lines and no font names (D8).

Observability: N/A — no new observable operations. Rollback: Reversible.
