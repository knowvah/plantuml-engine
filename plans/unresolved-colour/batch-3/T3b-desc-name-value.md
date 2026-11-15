# T3b: description `name:value` colour parts (M2)

**Probes** (1 diff each, raw `zzblue` where the jar draws the default):
- `comp-text` (`component C #text:zzblue`) and `deploy-node-text` (`node N #text:zzblue`): the name text fill;
- `uc-back` (`usecase U #back:zzblue`): the ellipse fill (jar `#F1F1F1`);
- `comp-link-colors` (`[A] --> [B] #text:zzblue : l`): the label fill.

**Upstream.**
- Entity: `CommandCreateElementFull` / `CommandCreateElementMultilines` capture `color()` (`ColorParser.simpleColor(
  ColorType.BACK)`), which builds `Colors`. Then `Colors.java:105-113`: a `name:value` part is `getColorOrNull`, a null
  still claims the key, and the default draws.
- Link: `CommandLinkElement.java:118` captures `color()`, and `:329` calls `link.setColors(…)`. Same `Colors` branch.

**Port sites.**
- `src/diagrams/description/renderer-color-override.ts#parseColorOverride`: `line`, `text` and `back` values are stored
  raw (lines 60-67). `back` goes through `paint.ts#parseColor`, which passes an unknown token through.
- `src/diagrams/description/link-colors.ts#parseLinkColors`, line 41.

Leave the bare-token branches alone. `Colors.java:103` uses the throwing `getColor`, so the #143 `colorOrNeutral`
already covers them (D4).

## Acceptance
- Given `component C #text:zzblue`, when rendered, then the name text is the default `#000`, at 0 diffs.
- Given `usecase U #back:zzblue`, then the ellipse fill is the default `#F1F1F1`.
- Given `[A] --> [B] #text:zzblue : l`, then the label is the default colour.
- Given `component C #text:red;text:zzblue`, then the text is the default (the null replaced red). Author this probe
  and its oracle.
- Given `#back:blue;text:red` on a component, then the output is byte-identical to `<base>`.
