# T2c: `equalsLike` over `getWithNewlines(code)` (M3, D3)

## Context

Upstream empties a package's `desc` when `entity.getDisplay().equalsLike(Display.getWithNewlines(pragma,
entity.getName()))` (`EntityImageDescription.java:180-183`; `Display.java:118-122`: list equality). The same test
picks `fcTitle` over `fc` for a non-package desc (`:184-186`). Ours compares raw strings:

- `EntityImageDescriptionDelegates.ts:352` `labels.displayText === labels.codeName` (renderer, and every sizer that
  builds a real `EntityImageDescription`);
- `leaf-sizing-folder.ts:137` `node.display === node.id` (folder sizer).

The display is split on real newlines; the code keeps the `\n` escape. `ptw-ctl-newline`
(`package "First line\nSecond line" {}`, no wrap setting) draws the name twice: 25 diffs, height 100 against 78.

## Write-set

- `src/core/svek/image/EntityImageDescriptionDelegates.ts#buildDesc`: `displayEqualsCode` compares
  `Display.getWithNewlines(Pragma.createEmpty(), labels.codeName)`'s lines with `labels.displayText.split('\n')`.
- `src/core/svek/image/leaf-sizing-folder.ts#folderBlockDims`: the same comparison for `labelText`.
- One shared helper if both need it (check `docs/catalog.md` for an existing `equalsLike`); name it `equalsLike` with
  `@see Display.java:118-122`.
- Update the `Display#equalsLike` note in `EntityImageDescription.ts:84-85` (it says "approximated as plain string
  equality"): it must say what the code now does.
- Tests: unit tests for both sites; the gate's ZERO/OPEN.

## Steps

1. Red: `buildDesc` for symbol `package_`, code `First line\nSecond line` (escape), display `First line` + real
   newline + `Second line` returns an empty block of width `minimumWidth`; the folder sizer's label block is `[0, 0]`.
2. Green, then measure. Expected to 0: `ptw-ctl-newline`, `ptw-newline`.
3. Check a non-package symbol whose code holds `\n` (e.g. `node "a\nb"`): the `fcTitle` branch is now taken
   (`:184-186`). Author that probe with its oracle; it must not lose (push-forward rule).
4. Pin, commit (`fix(description): compare a package name as upstream equalsLike does`), notes.

## Acceptance (Given/When/Then)

- Given `package "First line\nSecond line" {}`, when rendered, then the name is drawn once, as the title, and
  `ptw-ctl-newline` has 0 diffs.
- Given the same with `package { MaximumWidth 100 }` and a long second line, then `ptw-newline` has 0 diffs.
- Given a package whose display differs from its code (`as P`), then the label is still drawn (`ptw-as-label` 0).

Observability N/A. Rollback Reversible.
