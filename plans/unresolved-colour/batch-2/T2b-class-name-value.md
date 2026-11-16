# T2b: class `name:value` colour parts (M2) and the link's trailing colour

**Probes:**
- `class-line` and `class-line-override` (`#line:red;line:zzblue`): 3 diffs each, stroke `zzblue` → `#181818`;
- `class-package-line`: 2 diffs, the package path stroke;
- `class-link-colors` (`A --> B #line:zzblue`): 58 diffs. We emit `stroke="#line"` and the diagram is 15px taller.
  It reproduces with `#line:red` (56 diffs, measured in planning), so the trailing colour grammar is broken
  independently of resolution.

**Upstream.**
- `Colors.java:105-113`: a `name:value` part puts `set.getColorOrNull(value)` under `ColorType.getType(name)`. A null
  is still a `map.put`, so `#line:red;line:zzblue` leaves LINE null, which means the default.
- `CommandLinkClass.java:160` puts `color().getRegex()` after ENT2 and **before** the optional `: LABEL_LINK`, with
  `color()` = `ColorParser.simpleColor(ColorType.LINE)` (`:173-175`). `:368` calls `link.setColors(…)`. So
  `#line:red` is one COLOR capture, and `red` is never a label.
- The package: `command/CommandPackage.java:93` captures `color()`, and `:207-208` builds `Colors` and calls `p.setColors`.

**Port sites** (leads, not conclusions):
- `src/diagrams/class/class-declaration-extractors.ts#parseColorsData` and `parseDeclarationColors` (`line` and `text`
  values are stored raw);
- `src/core/color-override.ts#resolveBareOrBackColor` (the `back:` part is stored raw, about line 118);
- `src/diagrams/class/class-relationship-parser.ts:456` (the trailing `REL_COLOR` spec) and
  `class-relationship-colors.ts`;
- the class package colour reader (grep `CommandPackage.java` under `src/diagrams/class/`).

A resolvable value keeps today's representation. An unresolvable one becomes "unset, and clears any earlier value for
that key". `core/abel/Colors.ts:71-90` is the faithful reference port.

## Acceptance
- Given `class A #line:zzblue`, when rendered, then the box and divider strokes are the default `#181818`, at 0 diffs.
- Given `class A #line:red;line:zzblue`, when rendered, then the strokes are the default (the null replaced red).
- Given `A --> B #line:red`, when parsed, then the link carries LINE = red and no label, and `class-link-colors` drops
  to 0 diffs with `#line:zzblue` (or its residual is filed per D1).
- Given `class A #line:red` and `#back:blue;text:red`, when rendered, then the output is byte-identical to `<base>`.
