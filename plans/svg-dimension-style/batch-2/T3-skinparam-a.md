# T3: skin-param engines, part A

**Rows:** `timing`, `gantt`, `mindmap`, `wbs`, `salt`, `nwdiag`, `actleg`.
**Writes:**
- `SkinParam` ports: `src/diagrams/{timing,gantt,mindmap,wbs,nwdiag}/<engine>-skin-param.ts`, `salt/PSystemSalt.ts`
  (its `SkinParam` class, near `:145`), `activity-legacy/activity-legacy-skin-param.ts`;
- exporters: `src/diagrams/{timing,gantt,mindmap,wbs,salt,nwdiag}/index.ts`, `activity-legacy/renderer.ts`;
- a unit test per port (the port's existing test file if it has one, else a new one beside the engine's tests);
- the gate.

**Reads:** `src/diagrams/wbs/index.ts:150-210` (the model: `svgGraphic` sets the klimt option, `drawFragment` the
fragment), each port's `getlengthAdjust()`, D1, D2.

## Steps

1. **Red:** the unit tests (task contract step 3) for all 7 ports.
2. Add to each port, beside `getlengthAdjust()`:
   ```ts
   /**
    * `!valueIs("svgdimensionstyle", "false")`: `valueIs` is `equalsIgnoreCase` (SkinParam.java:367-369).
    * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/skin/SkinParam.java:1216-1218
    */
   svgDimensionStyle(): boolean {
     return this.getValue('svgDimensionStyle')?.toLowerCase() !== 'false';
   }
   ```
   Check the port's `getValue` first: it must clean the key (`cleanForKey`) and return the trimmed value, or
   `null`. Mirror whatever it returns; do not change `getValue`.
3. In each exporter, where `getlengthAdjust()` is read:
   - on the klimt option: `svgDimensionStyle: diagram.getSkinParam().svgDimensionStyle()`
     (`TextBlockExporter.java:420`);
   - on the fragment: `...(skinParam.svgDimensionStyle() ? {} : { svgDimensionStyle: false as const })`, return type
     `RenderFragment & SvgDimensionStyleFlag`.
   Mindmap reads `getlengthAdjust()` once (`mindmap/index.ts:140`, inside `drawFragment`); salt, activity-legacy read
   it inline on the option. Follow each file's own shape.
4. Run the measurer, each engine's ratchets, and the gate. Move the 7 rows to `EXACT`.

## Acceptance
- Given `skinparam svgDimensionStyle false` (or `FALSE`) in a timing, gantt, mindmap, wbs, salt, nwdiag or legacy
  activity diagram, when rendered, then the root has no `style`, `width` or `height`.
- Given each port with the key unset, `true`, `false` or `FALSE`, when `svgDimensionStyle()` is called, then it
  returns `true`, `true`, `false`, `false`.
- Given these engines without the skinparam, when rendered, then the output is byte-identical to the base.

Observability is N/A. Rollback is Reversible.
