/**
 * Jar SVG fragments of the right panel of one player, copied from the planning probe oracles
 * (`plans/timing-engine-port/probes/<slug>.puml`, rendered by `scripts/oracle-render.sh`), in drawing order.
 */

/** `cov-concise-basic`: `WU` Idle@0, Waiting@100, Idle@300; panel origin (25, 35). */
export const CONCISE_BASIC: readonly string[] = [
  '<polygon points="37,40,63,40,75,52,63,64,37,64,25,52" fill="#E2E2F0" style="stroke:#006400;stroke-width:1.5;stroke-linejoin:miter;stroke-miterlimit:10;"/>',
  '<polygon points="87,40,163,40,175,52,163,64,87,64,75,52" fill="#E2E2F0" style="stroke:#006400;stroke-width:1.5;stroke-linejoin:miter;stroke-miterlimit:10;"/>',
  '<polygon points="187,40,225,40,225,64,187,64,175,52" fill="#E2E2F0" style="stroke:#E2E2F0;stroke-width:1.5;stroke-linejoin:miter;stroke-miterlimit:10;"/>',
  '<path d="M225,40 L187,40 L175,52 L187,64 L225,64" style="stroke:#006400;stroke-width:1.5;" fill="#E2E2F0"/>',
  '<text x="40.325" y="55.333" fill="#333" font-size="12" textLength="19.35" font-weight="700">Idle</text>',
  '<text x="104.975" y="55.333" fill="#333" font-size="12" textLength="40.05" font-weight="700">Waiting</text>',
  '<text x="187" y="55.333" fill="#333" font-size="12" textLength="19.35" font-weight="700">Idle</text>',
];

/** `cov-rectangle`: `R` A@0, B@10, `{-}`@20; panel origin (25, 35). */
export const RECTANGLE: readonly string[] = [
  '<rect x="25" y="40" width="50" height="24" fill="#F1F1F1" style="stroke:#333;stroke-width:0.5;"/>',
  '<rect x="75" y="40" width="50" height="24" fill="#F1F1F1" style="stroke:#333;stroke-width:0.5;"/>',
  '<line x1="125" y1="52" x2="175" y2="52" style="stroke:#333;stroke-width:0.5;"/>',
  '<text x="45.319" y="55.889" fill="#333" font-size="14" font-weight="700">A</text>',
  '<text x="95.319" y="55.889" fill="#333" font-size="14" font-weight="700">B</text>',
];

/** `cov-special-states` concise `C`: `{hidden}`@0, `{-}`@10, `{A,B}`@20, `quoted state`@30; origin (51.7, 35). */
export const SPECIAL_CONCISE: readonly string[] = [
  '<line x1="101.7" y1="52" x2="151.7" y2="52" style="stroke:#006400;stroke-width:1.5;"/>',
  '<polygon points="163.7,40,189.7,40,201.7,52,189.7,64,163.7,64,151.7,52" fill="#E2E2F0" style="stroke:#006400;stroke-width:1.5;stroke-linejoin:miter;stroke-miterlimit:10;"/>',
  '<polygon points="213.7,40,251.7,40,251.7,64,213.7,64,201.7,52" fill="#E2E2F0" style="stroke:#E2E2F0;stroke-width:1.5;stroke-linejoin:miter;stroke-miterlimit:10;"/>',
  '<path d="M251.7,40 L213.7,40 L201.7,52 L213.7,64 L251.7,64" style="stroke:#006400;stroke-width:1.5;" fill="#E2E2F0"/>',
  '<text x="172.688" y="55.333" fill="#333" font-size="12" font-weight="700">A</text>',
  '<text x="213.7" y="55.333" fill="#333" font-size="12" textLength="65.925" font-weight="700">quoted state</text>',
];

/** `cov-state-colors` concise `C`: `A #pink`@0, `B : comment`@10; origin (33.025, 35). */
export const COLORS_CONCISE: readonly string[] = [
  '<polygon points="45.025,52,71.025,52,83.025,64,71.025,76,45.025,76,33.025,64" fill="#FFC0CB" style="stroke:#006400;stroke-width:1.5;stroke-linejoin:miter;stroke-miterlimit:10;"/>',
  '<polygon points="95.025,52,133.025,52,133.025,76,95.025,76,83.025,64" fill="#E2E2F0" style="stroke:#E2E2F0;stroke-width:1.5;stroke-linejoin:miter;stroke-miterlimit:10;"/>',
  '<path d="M133.025,52 L95.025,52 L83.025,64 L95.025,76 L133.025,76" style="stroke:#006400;stroke-width:1.5;" fill="#E2E2F0"/>',
  '<text x="54.012" y="67.333" fill="#333" font-size="12" font-weight="700">A</text>',
  '<text x="95.025" y="67.333" fill="#333" font-size="12" font-weight="700">B</text>',
  '<text x="95.025" y="49.333" fill="#333" font-size="12" textLength="49.275" font-weight="700">comment</text>',
];

/** `cov-relative-time` `A`: x@0, y@+10, z@+5.5; origin (25, 35). */
export const RELATIVE: readonly string[] = [
  '<polygon points="37,40,113,40,125,52,113,64,37,64,25,52" fill="#E2E2F0" style="stroke:#006400;stroke-width:1.5;stroke-linejoin:miter;stroke-miterlimit:10;"/>',
  '<polygon points="137,40,168,40,180,52,168,64,137,64,125,52" fill="#E2E2F0" style="stroke:#006400;stroke-width:1.5;stroke-linejoin:miter;stroke-miterlimit:10;"/>',
  '<polygon points="192,40,230,40,230,64,192,64,180,52" fill="#E2E2F0" style="stroke:#E2E2F0;stroke-width:1.5;stroke-linejoin:miter;stroke-miterlimit:10;"/>',
  '<path d="M230,40 L192,40 L180,52 L192,64 L230,64" style="stroke:#006400;stroke-width:1.5;" fill="#E2E2F0"/>',
  '<text x="72" y="55.333" fill="#333" font-size="12" font-weight="700">x</text>',
  '<text x="149.5" y="55.333" fill="#333" font-size="12" font-weight="700">y</text>',
  '<text x="192" y="55.333" fill="#333" font-size="12" font-weight="700">z</text>',
];

/** `cov-constraint` concise `WU`: initial `Absent`, Waiting@0, ok@500, constraint 200 to 350; origin (124.4, 138). */
export const CONSTRAINT_WU: readonly string[] = [
  '<polygon points="63.05,155,112.4,155,124.4,167,112.4,179,63.05,179" fill="#E2E2F0" style="stroke:#E2E2F0;stroke-width:1.5;stroke-linejoin:miter;stroke-miterlimit:10;"/>',
  '<path d="M63.05,155 L112.4,155 L124.4,167 L112.4,179 L63.05,179" style="stroke:#006400;stroke-width:1.5;" fill="#E2E2F0"/>',
  '<text x="75.05" y="170.333" fill="#333" font-size="12" textLength="37.35" font-weight="700">Absent</text>',
  '<polygon points="136.4,155,362.4,155,374.4,167,362.4,179,136.4,179,124.4,167" fill="#E2E2F0" style="stroke:#006400;stroke-width:1.5;stroke-linejoin:miter;stroke-miterlimit:10;"/>',
  '<polygon points="386.4,155,424.4,155,424.4,179,386.4,179,374.4,167" fill="#E2E2F0" style="stroke:#E2E2F0;stroke-width:1.5;stroke-linejoin:miter;stroke-miterlimit:10;"/>',
  '<path d="M424.4,155 L386.4,155 L374.4,167 L386.4,179 L424.4,179" style="stroke:#006400;stroke-width:1.5;" fill="#E2E2F0"/>',
  '<text x="229.375" y="170.333" fill="#333" font-size="12" textLength="40.05" font-weight="700">Waiting</text>',
  '<text x="386.4" y="170.333" fill="#333" font-size="12" textLength="12.675" font-weight="700">ok</text>',
  '<line x1="228.4" y1="146.5" x2="295.4" y2="146.5" style="stroke:#8B0000;stroke-width:1.5;"/>',
  '<polygon points="233.4,150.5,233.4,142.5,225.4,146.5" fill="#8B0000" style="stroke:#8B0000;stroke-width:1;stroke-linejoin:miter;stroke-miterlimit:10;"/>',
  '<polygon points="290.4,150.5,290.4,142.5,298.4,146.5" fill="#8B0000" style="stroke:#8B0000;stroke-width:1;stroke-linejoin:miter;stroke-miterlimit:10;"/>',
  '<text x="238.275" y="138.833" fill="#8B0000" font-size="12" textLength="47.25">{150 ms}</text>',
];

/** `cov-notes` concise `WU`: Idle@0, Waiting@100, `note top of WU : first note`; origin (84.4, 118). */
export const NOTES_WU: readonly string[] = [
  '<polygon points="96.4,156,122.4,156,134.4,168,122.4,180,96.4,180,84.4,168" fill="#E2E2F0" style="stroke:#006400;stroke-width:1.5;stroke-linejoin:miter;stroke-miterlimit:10;"/>',
  '<polygon points="146.4,156,284.4,156,284.4,180,146.4,180,134.4,168" fill="#E2E2F0" style="stroke:#E2E2F0;stroke-width:1.5;stroke-linejoin:miter;stroke-miterlimit:10;"/>',
  '<path d="M284.4,156 L146.4,156 L134.4,168 L146.4,180 L284.4,180" style="stroke:#006400;stroke-width:1.5;" fill="#E2E2F0"/>',
  '<text x="99.725" y="171.333" fill="#333" font-size="12" textLength="19.35" font-weight="700">Idle</text>',
  '<text x="146.4" y="171.333" fill="#333" font-size="12" textLength="40.05" font-weight="700">Waiting</text>',
  '<path d="M134.4,118 L134.4,141 L205.125,141 L205.125,128 L195.125,118 L134.4,118" style="stroke:#333;stroke-width:0.5;" fill="#FEFFDD"/>',
  '<path d="M195.125,118 L195.125,128 L205.125,128 L195.125,118" style="stroke:#333;stroke-width:0.5;" fill="#FEFFDD"/>',
  '<text x="140.4" y="133.111" fill="#333" font-size="13" textLength="49.725" font-weight="700">first note</text>',
];

/** `cov-robust-basic` left panel of `WB`: Idle, Processing, Waiting; origin (25, 35), available width 59.4. */
export const ROBUST_BASIC_LEFT: readonly string[] = [
  '<text x="25" y="89.333" fill="#333" font-size="12" textLength="19.35">Idle</text>',
  '<text x="25" y="69.333" fill="#333" font-size="12" textLength="59.4">Processing</text>',
  '<text x="25" y="49.333" fill="#333" font-size="12" textLength="40.05">Waiting</text>',
];

/** `cov-robust-basic` right panel of `WB`: the step waveform; origin (84.4, 35). */
export const ROBUST_BASIC_RIGHT: readonly string[] = [
  '<line x1="84.4" y1="85" x2="134.4" y2="85" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="134.4" y1="65" x2="234.4" y2="65" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="234.4" y1="45" x2="334.4" y2="45" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="334.4" y1="85" x2="384.4" y2="85" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="134.4" y1="65" x2="134.4" y2="85" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="234.4" y1="45" x2="234.4" y2="65" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="334.4" y1="45" x2="334.4" y2="85" style="stroke:#006400;stroke-width:2;"/>',
];

/** `cov-define-states` left panel of `R` (`has Idle,Busy,Off`, `has "Long Label" as LL`); origin (25, 35). */
export const DEFINE_STATES_LEFT: readonly string[] = [
  '<text x="25" y="109.333" fill="#333" font-size="12" textLength="59.4">Long Label</text>',
  '<text x="25" y="89.333" fill="#333" font-size="12" textLength="15.9">Off</text>',
  '<text x="25" y="69.333" fill="#333" font-size="12" textLength="26.7">Busy</text>',
  '<text x="25" y="49.333" fill="#333" font-size="12" textLength="19.35">Idle</text>',
];

/** `cov-define-states` right panel of `R`: Idle@0, Long Label@10, Off@20; origin (84.4, 35). */
export const DEFINE_STATES_RIGHT: readonly string[] = [
  '<line x1="84.4" y1="45" x2="134.4" y2="45" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="134.4" y1="105" x2="184.4" y2="105" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="184.4" y1="85" x2="234.4" y2="85" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="134.4" y1="45" x2="134.4" y2="105" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="184.4" y1="85" x2="184.4" y2="105" style="stroke:#006400;stroke-width:2;"/>',
];

/** `cov-special-states` left panel of `R`; origin (25, 89). */
export const SPECIAL_ROBUST_LEFT: readonly string[] = [
  '<text x="25" y="163.333" fill="#333" font-size="12" textLength="17.85">{...}</text>',
  '<text x="25" y="143.333" fill="#333" font-size="12" textLength="14.625">{?}</text>',
  '<text x="25" y="123.333" fill="#333" font-size="12" textLength="19.35">Idle</text>',
  '<text x="25" y="103.333" fill="#333" font-size="12" textLength="26.7">Busy</text>',
];

/** `cov-special-states` right panel of `R`: {...}@0, {?}@10, {Idle,Busy}@20 (a hatched block); origin (51.7, 89). */
export const SPECIAL_ROBUST_RIGHT: readonly string[] = [
  '<line x1="51.7" y1="159" x2="101.7" y2="159" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="101.7" y1="139" x2="151.7" y2="139" style="stroke:#006400;stroke-width:2;"/>',
  '<rect x="151.7" y="99" width="100" height="20" fill="#E2E2F0" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="151.7" y1="99" x2="151.7" y2="119" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="156.7" y1="99" x2="156.7" y2="119" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="161.7" y1="99" x2="161.7" y2="119" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="166.7" y1="99" x2="166.7" y2="119" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="171.7" y1="99" x2="171.7" y2="119" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="176.7" y1="99" x2="176.7" y2="119" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="181.7" y1="99" x2="181.7" y2="119" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="186.7" y1="99" x2="186.7" y2="119" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="191.7" y1="99" x2="191.7" y2="119" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="196.7" y1="99" x2="196.7" y2="119" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="201.7" y1="99" x2="201.7" y2="119" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="206.7" y1="99" x2="206.7" y2="119" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="211.7" y1="99" x2="211.7" y2="119" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="216.7" y1="99" x2="216.7" y2="119" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="221.7" y1="99" x2="221.7" y2="119" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="226.7" y1="99" x2="226.7" y2="119" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="231.7" y1="99" x2="231.7" y2="119" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="236.7" y1="99" x2="236.7" y2="119" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="241.7" y1="99" x2="241.7" y2="119" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="246.7" y1="99" x2="246.7" y2="119" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="151.7" y1="119" x2="251.7" y2="119" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="151.7" y1="99" x2="251.7" y2="99" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="101.7" y1="139" x2="101.7" y2="159" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="151.7" y1="99" x2="151.7" y2="139" style="stroke:#006400;stroke-width:2;"/>',
];

/** `cov-state-colors` left panel of `R`; origin (25, 101). */
export const COLORS_ROBUST_LEFT: readonly string[] = [
  '<text x="25" y="135.333" fill="#333" font-size="12">X</text>',
  '<text x="25" y="115.333" fill="#333" font-size="12">Y</text>',
];

/** `cov-state-colors` right panel of `R`: X #lightblue@0, Y@10; origin (25 + the width of X, 101). */
export const COLORS_ROBUST_RIGHT: readonly string[] = [
  '<line x1="33.025" y1="131" x2="83.025" y2="131" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="83.025" y1="111" x2="133.025" y2="111" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="83.025" y1="111" x2="83.025" y2="131" style="stroke:#006400;stroke-width:2;"/>',
];

/** `cov-at-player` left panel of `WB`; origin (25, 35). */
export const AT_PLAYER_WB_LEFT: readonly string[] = [
  '<text x="25" y="89.333" fill="#333" font-size="12" textLength="18.75">idle</text>',
  '<text x="25" y="69.333" fill="#333" font-size="12" textLength="27.975">Proc.</text>',
  '<text x="25" y="49.333" fill="#333" font-size="12" textLength="40.05">Waiting</text>',
];

/** `cov-at-player` right panel of `WB`: idle@0, Proc.@200, Waiting@300; origin (65.05, 35). */
export const AT_PLAYER_WB_RIGHT: readonly string[] = [
  '<line x1="65.05" y1="85" x2="165.05" y2="85" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="165.05" y1="65" x2="215.05" y2="65" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="215.05" y1="45" x2="365.05" y2="45" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="165.05" y1="65" x2="165.05" y2="85" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="215.05" y1="45" x2="215.05" y2="65" style="stroke:#006400;stroke-width:2;"/>',
];

/** `cov-constraint` left panel of `WB`; origin (25, 35). */
export const CONSTRAINT_WB_LEFT: readonly string[] = [
  '<text x="25" y="109.333" fill="#333" font-size="12" textLength="52.8">Initializing</text>',
  '<text x="25" y="89.333" fill="#333" font-size="12" textLength="18.75">idle</text>',
  '<text x="25" y="69.333" fill="#333" font-size="12" textLength="59.4">Processing</text>',
  '<text x="25" y="49.333" fill="#333" font-size="12" textLength="40.05">Waiting</text>',
];

/** `cov-constraint` right panel of `WB`: initial Initializing, the waveform, the constraint 0 to 50; origin (124.4, 35). */
export const CONSTRAINT_WB_RIGHT: readonly string[] = [
  '<line x1="84.4" y1="105" x2="124.4" y2="105" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="124.4" y1="85" x2="224.4" y2="85" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="224.4" y1="65" x2="274.4" y2="65" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="274.4" y1="45" x2="424.4" y2="45" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="124.4" y1="85" x2="124.4" y2="105" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="224.4" y1="65" x2="224.4" y2="85" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="274.4" y1="45" x2="274.4" y2="65" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="125.9" y1="80" x2="147.9" y2="80" style="stroke:#8B0000;stroke-width:1.5;"/>',
  '<polygon points="118.9,84,118.9,76,126.9,80" fill="#8B0000" style="stroke:#8B0000;stroke-width:1;stroke-linejoin:miter;stroke-miterlimit:10;"/>',
  '<polygon points="154.9,84,154.9,76,146.9,80" fill="#8B0000" style="stroke:#8B0000;stroke-width:1;stroke-linejoin:miter;stroke-miterlimit:10;"/>',
  '<text x="106.938" y="72.333" fill="#8B0000" font-size="12" textLength="59.925">{50 ms lag}</text>',
];

/** `cov-robust-edges` (tests/fixtures/timing) left panel of `S`: Init, A, B, {-}, C right-aligned beside a wider panel; origin (25, 35), available width 143.475. */
export const ROBUST_EDGES_LEFT: readonly string[] = [
  '<text x="107.5" y="89.333" fill="#333" font-size="12" textLength="15.975">Init</text>',
  '<text x="107.5" y="79.333" fill="#333" font-size="12">A</text>',
  '<text x="107.5" y="69.333" fill="#333" font-size="12">B</text>',
  '<text x="107.5" y="59.333" fill="#333" font-size="12" textLength="11.925">{-}</text>',
  '<text x="107.5" y="49.333" fill="#333" font-size="12">C</text>',
];

/** `cov-robust-edges` right panel of `S` (40 pixels height): initial Init, a hidden change at 10, a comment on A; origin (168.475, 35). */
export const ROBUST_EDGES_RIGHT: readonly string[] = [
  '<line x1="128.475" y1="85" x2="168.475" y2="85" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="168.475" y1="75" x2="218.475" y2="75" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="268.475" y1="65" x2="318.475" y2="65" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="318.475" y1="55" x2="368.475" y2="55" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="368.475" y1="45" x2="418.475" y2="45" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="168.475" y1="75" x2="168.475" y2="85" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="318.475" y1="55" x2="318.475" y2="65" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="368.475" y1="45" x2="368.475" y2="55" style="stroke:#006400;stroke-width:2;"/>',
  '<text x="170.475" y="72.333" fill="#333" font-size="12" textLength="19.275">first</text>',
];

/** `cov-binary` right panel of `EN`: low@0, high@5, low@10 (a step with a zero-length first line); origin (30, 35). */
export const BINARY_BASIC: readonly string[] = [
  '<line x1="30" y1="57" x2="30" y2="57" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="30" y1="57" x2="80" y2="57" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="80" y1="43" x2="80" y2="57" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="80" y1="43" x2="130" y2="43" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="130" y1="43" x2="130" y2="57" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="130" y1="57" x2="180" y2="57" style="stroke:#006400;stroke-width:2;"/>',
];

/** `cov-clock-pulse-offset` right panel of `C0` (`period 50`): origin (30, 35). */
export const CLOCK_C0: readonly string[] = [
  '<line x1="30" y1="43" x2="30" y2="57" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="30" y1="43" x2="55" y2="43" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="55" y1="43" x2="55" y2="57" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="55" y1="57" x2="80" y2="57" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="80" y1="43" x2="80" y2="57" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="80" y1="43" x2="105" y2="43" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="105" y1="43" x2="105" y2="57" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="105" y1="57" x2="130" y2="57" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="130" y1="43" x2="130" y2="57" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="130" y1="43" x2="155" y2="43" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="155" y1="43" x2="155" y2="57" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="155" y1="57" x2="180" y2="57" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="180" y1="43" x2="180" y2="57" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="180" y1="43" x2="205" y2="43" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="205" y1="43" x2="205" y2="57" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="205" y1="57" x2="230" y2="57" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="230" y1="43" x2="230" y2="57" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="230" y1="43" x2="255" y2="43" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="255" y1="43" x2="255" y2="57" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="255" y1="57" x2="280" y2="57" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="280" y1="43" x2="280" y2="57" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="280" y1="43" x2="280" y2="43" style="stroke:#006400;stroke-width:1.5;"/>',
];

/** `cov-clock-pulse-offset` right panel of `C1` (`period 50 pulse 15 offset 10`): origin (30, 80). */
export const CLOCK_C1: readonly string[] = [
  '<line x1="30" y1="102" x2="40" y2="102" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="40" y1="88" x2="40" y2="102" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="40" y1="88" x2="55" y2="88" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="55" y1="88" x2="55" y2="102" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="55" y1="102" x2="90" y2="102" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="90" y1="88" x2="90" y2="102" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="90" y1="88" x2="105" y2="88" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="105" y1="88" x2="105" y2="102" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="105" y1="102" x2="140" y2="102" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="140" y1="88" x2="140" y2="102" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="140" y1="88" x2="155" y2="88" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="155" y1="88" x2="155" y2="102" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="155" y1="102" x2="190" y2="102" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="190" y1="88" x2="190" y2="102" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="190" y1="88" x2="205" y2="88" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="205" y1="88" x2="205" y2="102" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="205" y1="102" x2="240" y2="102" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="240" y1="88" x2="240" y2="102" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="240" y1="88" x2="255" y2="88" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="255" y1="88" x2="255" y2="102" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="255" y1="102" x2="280" y2="102" style="stroke:#006400;stroke-width:1.5;"/>',
];

/** `cov-clock-time` right panel of `clk` (`period 1`, an untitled player): origin (30, 21). */
export const CLOCK_TIME_CLK: readonly string[] = [
  '<line x1="30" y1="29" x2="30" y2="43" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="30" y1="29" x2="55" y2="29" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="55" y1="29" x2="55" y2="43" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="55" y1="43" x2="80" y2="43" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="80" y1="29" x2="80" y2="43" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="80" y1="29" x2="105" y2="29" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="105" y1="29" x2="105" y2="43" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="105" y1="43" x2="130" y2="43" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="130" y1="29" x2="130" y2="43" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="130" y1="29" x2="155" y2="29" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="155" y1="29" x2="155" y2="43" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="155" y1="43" x2="180" y2="43" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="180" y1="29" x2="180" y2="43" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="180" y1="29" x2="205" y2="29" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="205" y1="29" x2="205" y2="43" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="205" y1="43" x2="230" y2="43" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="230" y1="29" x2="230" y2="43" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="230" y1="29" x2="255" y2="29" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="255" y1="29" x2="255" y2="43" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="255" y1="43" x2="280" y2="43" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="280" y1="29" x2="280" y2="43" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="280" y1="29" x2="305" y2="29" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="305" y1="29" x2="305" y2="43" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="305" y1="43" x2="330" y2="43" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="330" y1="29" x2="330" y2="43" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="330" y1="29" x2="330" y2="29" style="stroke:#006400;stroke-width:1.5;"/>',
];

/** `cov-clock-time` right panel of `B`: low@0, high@2, low@5 (ticks in clock periods); origin (30, 66). */
export const CLOCK_TIME_B: readonly string[] = [
  '<line x1="30" y1="88" x2="30" y2="88" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="30" y1="88" x2="130" y2="88" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="130" y1="74" x2="130" y2="88" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="130" y1="74" x2="280" y2="74" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="280" y1="74" x2="280" y2="88" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="280" y1="88" x2="330" y2="88" style="stroke:#006400;stroke-width:2;"/>',
];

/** `vega-clock-decimal-period-offset` right panel of `Clk` (`period 12.5 offset 0.1`); origin (30, 35). */
export const CLOCK_DECIMAL: readonly string[] = [
  '<line x1="30" y1="57" x2="32.5" y2="57" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="32.5" y1="43" x2="32.5" y2="57" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="32.5" y1="43" x2="188.75" y2="43" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="188.75" y1="43" x2="188.75" y2="57" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="188.75" y1="57" x2="345" y2="57" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="345" y1="43" x2="345" y2="57" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="345" y1="43" x2="392.5" y2="43" style="stroke:#006400;stroke-width:1.5;"/>',
];

/** `vega-clock-decimal-period-offset` right panel of `B`: low@0, high@10.5; origin (30, 80). */
export const CLOCK_DECIMAL_BINARY: readonly string[] = [
  '<line x1="30" y1="102" x2="30" y2="102" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="30" y1="102" x2="292.5" y2="102" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="292.5" y1="88" x2="292.5" y2="102" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="292.5" y1="88" x2="392.5" y2="88" style="stroke:#006400;stroke-width:2;"/>',
];

/** `vega-clock-message-from-binary` right panel of `sample` (`period 10`): the ruler holds only tick 10, so the clock starts at -50; origin (30, 35). */
export const CLOCK_ONLY_PERIOD_TICK: readonly string[] = [
  '<line x1="-20" y1="43" x2="-20" y2="57" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="-20" y1="43" x2="5" y2="43" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="5" y1="43" x2="5" y2="57" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="5" y1="57" x2="30" y2="57" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="30" y1="43" x2="30" y2="57" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="30" y1="43" x2="55" y2="43" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="55" y1="43" x2="55" y2="57" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="55" y1="57" x2="80" y2="57" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="80" y1="43" x2="80" y2="57" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="80" y1="43" x2="80" y2="43" style="stroke:#006400;stroke-width:1.5;"/>',
];

/** `vega-clock-message-from-binary` right panel of `threshold`: a binary player with no state is one low line; origin (30, 80). */
export const BINARY_NO_STATE: readonly string[] = [
  '<line x1="30" y1="102" x2="80" y2="102" style="stroke:#006400;stroke-width:2;"/>',
];

/** `cov-analog` left panel of `VDD` (no bounds: min 0, max 6 as `0.0` and `6.0`, `20 pixels height`); origin (25, 35), available width 29.063. */
export const ANALOG_VDD_LEFT: readonly string[] = [
  '<text x="32.638" y="50.889" fill="#333" font-size="14" textLength="19.425" font-weight="700">0.0</text>',
  '<text x="32.638" y="46.889" fill="#333" font-size="14" textLength="19.425" font-weight="700">6.0</text>',
];

/** `cov-analog` right panel of `VDD`: 0@0, 0@2, 6@3, 0.5@5; origin (54.063, 35). */
export const ANALOG_VDD_RIGHT: readonly string[] = [
  '<line x1="54.063" y1="47" x2="54.063" y2="47" style="stroke:#333;stroke-width:0.5;"/>',
  '<line x1="54.063" y1="47" x2="154.063" y2="47" style="stroke:#333;stroke-width:0.5;"/>',
  '<line x1="154.063" y1="47" x2="204.063" y2="43" style="stroke:#333;stroke-width:0.5;"/>',
  '<line x1="204.063" y1="43" x2="304.063" y2="46.667" style="stroke:#333;stroke-width:0.5;"/>',
  '<line x1="304.063" y1="46.667" x2="354.063" y2="46.667" style="stroke:#333;stroke-width:0.5;"/>',
];

/** `cov-analog` left panel of `VCC` (`between -4.5 and 6.5`, `ticks num on multiple 3`); origin (25, 70), available width 29.063. */
export const ANALOG_VCC_LEFT: readonly string[] = [
  '<text x="28" y="154.434" fill="#333" font-size="14" textLength="24.063" font-weight="700">-3.0</text>',
  '<text x="32.638" y="131.525" fill="#333" font-size="14" textLength="19.425" font-weight="700">0.0</text>',
  '<text x="32.638" y="108.616" fill="#333" font-size="14" textLength="19.425" font-weight="700">3.0</text>',
  '<text x="32.638" y="85.707" fill="#333" font-size="14" textLength="19.425" font-weight="700">6.0</text>',
];

/** `cov-analog` right panel of `VCC`: tick lines at -3, 0, 3, 6, then 3@0 and -1.5@3; origin (54.063, 70). */
export const ANALOG_VCC_RIGHT: readonly string[] = [
  '<line x1="54.063" y1="150.545" x2="354.063" y2="150.545" style="stroke:#333;stroke-width:0.5;stroke-dasharray:3,5;"/>',
  '<line x1="54.063" y1="127.636" x2="354.063" y2="127.636" style="stroke:#333;stroke-width:0.5;stroke-dasharray:3,5;"/>',
  '<line x1="54.063" y1="104.727" x2="354.063" y2="104.727" style="stroke:#333;stroke-width:0.5;stroke-dasharray:3,5;"/>',
  '<line x1="54.063" y1="81.818" x2="354.063" y2="81.818" style="stroke:#333;stroke-width:0.5;stroke-dasharray:3,5;"/>',
  '<line x1="54.063" y1="104.727" x2="54.063" y2="104.727" style="stroke:#333;stroke-width:0.5;"/>',
  '<line x1="54.063" y1="104.727" x2="204.063" y2="139.091" style="stroke:#333;stroke-width:0.5;"/>',
  '<line x1="204.063" y1="139.091" x2="354.063" y2="139.091" style="stroke:#333;stroke-width:0.5;"/>',
];

/** `cov-ticks-every` left panel of `A` (`ticks every 2`, values 1, 4, 2): labels 0.0, 2.0, 4.0; origin (25, 35), available width 24.425. */
export const TICKS_EVERY_LEFT: readonly string[] = [
  '<text x="28" y="130.889" fill="#333" font-size="14" textLength="19.425" font-weight="700">0.0</text>',
  '<text x="28" y="88.889" fill="#333" font-size="14" textLength="19.425" font-weight="700">2.0</text>',
  '<text x="28" y="46.889" fill="#333" font-size="14" textLength="19.425" font-weight="700">4.0</text>',
];

/** `cov-ticks-every` right panel of `A`: tick lines then the polyline; origin (49.425, 35). */
export const TICKS_EVERY_RIGHT: readonly string[] = [
  '<line x1="49.425" y1="127" x2="199.425" y2="127" style="stroke:#333;stroke-width:0.5;stroke-dasharray:3,5;"/>',
  '<line x1="49.425" y1="85" x2="199.425" y2="85" style="stroke:#333;stroke-width:0.5;stroke-dasharray:3,5;"/>',
  '<line x1="49.425" y1="43" x2="199.425" y2="43" style="stroke:#333;stroke-width:0.5;stroke-dasharray:3,5;"/>',
  '<line x1="49.425" y1="106" x2="49.425" y2="106" style="stroke:#333;stroke-width:0.5;"/>',
  '<line x1="49.425" y1="106" x2="99.425" y2="43" style="stroke:#333;stroke-width:0.5;"/>',
  '<line x1="99.425" y1="43" x2="149.425" y2="85" style="stroke:#333;stroke-width:0.5;"/>',
  '<line x1="149.425" y1="85" x2="199.425" y2="85" style="stroke:#333;stroke-width:0.5;"/>',
];

/** `cov-binary-notes` (tests/fixtures/timing) right panel of `B`: initial high, {low,high}@0, high@10 : up, low@20, a top note, a bottom note, a constraint 10 to 20; origin (30, 35). */
export const BINARY_NOTES: readonly string[] = [
  '<line x1="30" y1="93" x2="30" y2="93" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="30" y1="93" x2="30" y2="107" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="30" y1="93" x2="30" y2="107" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="35" y1="93" x2="35" y2="107" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="40" y1="93" x2="40" y2="107" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="45" y1="93" x2="45" y2="107" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="50" y1="93" x2="50" y2="107" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="55" y1="93" x2="55" y2="107" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="60" y1="93" x2="60" y2="107" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="65" y1="93" x2="65" y2="107" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="70" y1="93" x2="70" y2="107" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="75" y1="93" x2="75" y2="107" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="80" y1="93" x2="80" y2="107" style="stroke:#006400;stroke-width:2;"/>',
  '<text x="82" y="102.333" fill="#333" font-size="12" textLength="13.35">up</text>',
  '<line x1="80" y1="93" x2="130" y2="93" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="130" y1="93" x2="130" y2="107" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="130" y1="107" x2="180" y2="107" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="85.5" y1="52" x2="124.5" y2="52" style="stroke:#8B0000;stroke-width:1.5;"/>',
  '<polygon points="90.5,56,90.5,48,82.5,52" fill="#8B0000" style="stroke:#8B0000;stroke-width:1;stroke-linejoin:miter;stroke-miterlimit:10;"/>',
  '<polygon points="119.5,56,119.5,48,127.5,52" fill="#8B0000" style="stroke:#8B0000;stroke-width:1;stroke-linejoin:miter;stroke-miterlimit:10;"/>',
  '<text x="84.712" y="44.333" fill="#8B0000" font-size="12" textLength="40.575">{10 ms}</text>',
  '<path d="M130,43 L130,66 L197.881,66 L197.881,53 L187.881,43 L130,43" style="stroke:#333;stroke-width:0.5;" fill="#FEFFDD"/>',
  '<path d="M187.881,43 L187.881,53 L197.881,53 L187.881,43" style="stroke:#333;stroke-width:0.5;" fill="#FEFFDD"/>',
  '<text x="136" y="58.111" fill="#333" font-size="13" textLength="46.881" font-weight="700">top note</text>',
  '<path d="M130,116 L130,139 L219.494,139 L219.494,126 L209.494,116 L130,116" style="stroke:#333;stroke-width:0.5;" fill="#FEFFDD"/>',
  '<path d="M209.494,116 L209.494,126 L219.494,126 L209.494,116" style="stroke:#333;stroke-width:0.5;" fill="#FEFFDD"/>',
  '<text x="136" y="131.111" fill="#333" font-size="13" textLength="68.494" font-weight="700">bottom note</text>',
];

/** `cov-analog-constraint` (tests/fixtures/timing) left panel of `A` (`between 0 and 10`); origin (25, 35), available width 20.575. */
export const ANALOG_CONSTRAINT_LEFT: readonly string[] = [
  '<text x="35.787" y="147.889" fill="#333" font-size="14" font-weight="700">0</text>',
  '<text x="28" y="63.889" fill="#333" font-size="14" textLength="15.575" font-weight="700">10</text>',
];

/** `cov-analog-constraint` right panel of `A`: initial 5, 2@0, 8@10, a constraint 0 to 10 (offset 1); origin (45.575, 35). */
export const ANALOG_CONSTRAINT_RIGHT: readonly string[] = [
  '<line x1="45.575" y1="102" x2="45.575" y2="127.2" style="stroke:#333;stroke-width:0.5;"/>',
  '<line x1="45.575" y1="127.2" x2="95.575" y2="76.8" style="stroke:#333;stroke-width:0.5;"/>',
  '<line x1="95.575" y1="76.8" x2="145.575" y2="76.8" style="stroke:#333;stroke-width:0.5;"/>',
  '<line x1="49.575" y1="52" x2="91.575" y2="52" style="stroke:#8B0000;stroke-width:1.5;"/>',
  '<polygon points="54.575,56,54.575,48,46.575,52" fill="#8B0000" style="stroke:#8B0000;stroke-width:1;stroke-linejoin:miter;stroke-miterlimit:10;"/>',
  '<polygon points="86.575,56,86.575,48,94.575,52" fill="#8B0000" style="stroke:#8B0000;stroke-width:1;stroke-linejoin:miter;stroke-miterlimit:10;"/>',
  '<text x="50.287" y="44.333" fill="#8B0000" font-size="12" textLength="40.575">{10 ms}</text>',
];

/** `cov-projections` (tests/fixtures/timing) right panel of `Clk` (`period 50 pulse 15 offset 10`); origin (45.575, 35). */
export const PROJ_CLOCK: readonly string[] = [
  '<line x1="45.575" y1="57" x2="55.575" y2="57" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="55.575" y1="43" x2="55.575" y2="57" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="55.575" y1="43" x2="70.575" y2="43" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="70.575" y1="43" x2="70.575" y2="57" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="70.575" y1="57" x2="105.575" y2="57" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="105.575" y1="43" x2="105.575" y2="57" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="105.575" y1="43" x2="120.575" y2="43" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="120.575" y1="43" x2="120.575" y2="57" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="120.575" y1="57" x2="155.575" y2="57" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="155.575" y1="43" x2="155.575" y2="57" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="155.575" y1="43" x2="170.575" y2="43" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="170.575" y1="43" x2="170.575" y2="57" style="stroke:#006400;stroke-width:1.5;"/>',
  '<line x1="170.575" y1="57" x2="195.575" y2="57" style="stroke:#006400;stroke-width:1.5;"/>',
];

/** `cov-projections` right panel of `B`: low@0, high@100; origin (45.575, 80). */
export const PROJ_BINARY: readonly string[] = [
  '<line x1="45.575" y1="102" x2="45.575" y2="102" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="45.575" y1="102" x2="145.575" y2="102" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="145.575" y1="88" x2="145.575" y2="102" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="145.575" y1="88" x2="195.575" y2="88" style="stroke:#006400;stroke-width:2;"/>',
];

/** `cov-projections` left panel of `A` (`between 0 and 10`); origin (25, 125), available width 20.575. */
export const PROJ_ANALOG_LEFT: readonly string[] = [
  '<text x="35.787" y="220.889" fill="#333" font-size="14" font-weight="700">0</text>',
  '<text x="28" y="136.889" fill="#333" font-size="14" textLength="15.575" font-weight="700">10</text>',
];

/** `cov-projections` right panel of `A`: 2@0, 8@100; origin (45.575, 125). */
export const PROJ_ANALOG_RIGHT: readonly string[] = [
  '<line x1="45.575" y1="200.2" x2="45.575" y2="200.2" style="stroke:#333;stroke-width:0.5;"/>',
  '<line x1="45.575" y1="200.2" x2="145.575" y2="149.8" style="stroke:#333;stroke-width:0.5;"/>',
  '<line x1="145.575" y1="149.8" x2="195.575" y2="149.8" style="stroke:#333;stroke-width:0.5;"/>',
];

/** `cov-concise-basic` (oracle 251x106): every drawn element of the jar's body, in order, document chrome excluded. */
export const CONCISE_BASIC_BODY: readonly string[] = [
  '<line x1="20" y1="20" x2="20" y2="74" style="stroke:#333;stroke-width:0.5;"/>',
  '<line x1="230" y1="20" x2="230" y2="74" style="stroke:#333;stroke-width:0.5;"/>',
  '<line x1="25" y1="20" x2="25" y2="74" style="stroke:#333;stroke-width:0.5;stroke-dasharray:3,5;"/>',
  '<line x1="75" y1="20" x2="75" y2="74" style="stroke:#333;stroke-width:0.5;stroke-dasharray:3,5;"/>',
  '<line x1="125" y1="20" x2="125" y2="74" style="stroke:#333;stroke-width:0.5;stroke-dasharray:3,5;"/>',
  '<line x1="175" y1="20" x2="175" y2="74" style="stroke:#333;stroke-width:0.5;stroke-dasharray:3,5;"/>',
  '<line x1="225" y1="20" x2="225" y2="74" style="stroke:#333;stroke-width:0.5;stroke-dasharray:3,5;"/>',
  '<line x1="20" y1="20" x2="230" y2="20" style="stroke:#333;stroke-width:0.5;"/>',
  '<text x="25" y="30.889" fill="#333" font-size="14" textLength="62.213" font-weight="700">Web User</text>',
  '<line x1="20" y1="35" x2="88.213" y2="35" style="stroke:#333;stroke-width:0.5;"/>',
  '<line x1="88.213" y1="35" x2="98.213" y2="20" style="stroke:#333;stroke-width:0.5;"/>',
  '<polygon points="37,40,63,40,75,52,63,64,37,64,25,52" fill="#E2E2F0" style="stroke:#006400;stroke-width:1.5;stroke-linejoin:miter;stroke-miterlimit:10;"/>',
  '<polygon points="87,40,163,40,175,52,163,64,87,64,75,52" fill="#E2E2F0" style="stroke:#006400;stroke-width:1.5;stroke-linejoin:miter;stroke-miterlimit:10;"/>',
  '<polygon points="187,40,225,40,225,64,187,64,175,52" fill="#E2E2F0" style="stroke:#E2E2F0;stroke-width:1.5;stroke-linejoin:miter;stroke-miterlimit:10;"/>',
  '<path d="M225,40 L187,40 L175,52 L187,64 L225,64" style="stroke:#006400;stroke-width:1.5;" fill="#E2E2F0"/>',
  '<text x="40.325" y="55.333" fill="#333" font-size="12" textLength="19.35" font-weight="700">Idle</text>',
  '<text x="104.975" y="55.333" fill="#333" font-size="12" textLength="40.05" font-weight="700">Waiting</text>',
  '<text x="187" y="55.333" fill="#333" font-size="12" textLength="19.35" font-weight="700">Idle</text>',
  '<line x1="25" y1="74" x2="25" y2="79" style="stroke:#333;stroke-width:2;"/>',
  '<line x1="75" y1="74" x2="75" y2="79" style="stroke:#333;stroke-width:2;"/>',
  '<line x1="125" y1="74" x2="125" y2="79" style="stroke:#333;stroke-width:2;"/>',
  '<line x1="175" y1="74" x2="175" y2="79" style="stroke:#333;stroke-width:2;"/>',
  '<line x1="225" y1="74" x2="225" y2="79" style="stroke:#333;stroke-width:2;"/>',
  '<line x1="25" y1="74" x2="225" y2="74" style="stroke:#333;stroke-width:2;"/>',
  '<text x="21.941" y="88.556" fill="#333" font-size="11">0</text>',
  '<text x="65.822" y="88.556" fill="#333" font-size="11" textLength="18.356">100</text>',
  '<text x="165.822" y="88.556" fill="#333" font-size="11" textLength="18.356">300</text>',
];

/** `cov-robust-basic` (oracle 410x135): every drawn element of the jar's body, in order, document chrome excluded. */
export const ROBUST_BASIC_BODY: readonly string[] = [
  '<line x1="20" y1="20" x2="20" y2="103" style="stroke:#333;stroke-width:0.5;"/>',
  '<line x1="389.4" y1="20" x2="389.4" y2="103" style="stroke:#333;stroke-width:0.5;"/>',
  '<line x1="84.4" y1="20" x2="84.4" y2="103" style="stroke:#333;stroke-width:0.5;stroke-dasharray:3,5;"/>',
  '<line x1="134.4" y1="20" x2="134.4" y2="103" style="stroke:#333;stroke-width:0.5;stroke-dasharray:3,5;"/>',
  '<line x1="184.4" y1="20" x2="184.4" y2="103" style="stroke:#333;stroke-width:0.5;stroke-dasharray:3,5;"/>',
  '<line x1="234.4" y1="20" x2="234.4" y2="103" style="stroke:#333;stroke-width:0.5;stroke-dasharray:3,5;"/>',
  '<line x1="284.4" y1="20" x2="284.4" y2="103" style="stroke:#333;stroke-width:0.5;stroke-dasharray:3,5;"/>',
  '<line x1="334.4" y1="20" x2="334.4" y2="103" style="stroke:#333;stroke-width:0.5;stroke-dasharray:3,5;"/>',
  '<line x1="384.4" y1="20" x2="384.4" y2="103" style="stroke:#333;stroke-width:0.5;stroke-dasharray:3,5;"/>',
  '<line x1="20" y1="20" x2="389.4" y2="20" style="stroke:#333;stroke-width:0.5;"/>',
  '<text x="25" y="30.889" fill="#333" font-size="14" textLength="84" font-weight="700">Web Browser</text>',
  '<line x1="20" y1="35" x2="110" y2="35" style="stroke:#333;stroke-width:0.5;"/>',
  '<line x1="110" y1="35" x2="120" y2="20" style="stroke:#333;stroke-width:0.5;"/>',
  '<text x="25" y="89.333" fill="#333" font-size="12" textLength="19.35">Idle</text>',
  '<text x="25" y="69.333" fill="#333" font-size="12" textLength="59.4">Processing</text>',
  '<text x="25" y="49.333" fill="#333" font-size="12" textLength="40.05">Waiting</text>',
  '<line x1="84.4" y1="85" x2="134.4" y2="85" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="134.4" y1="65" x2="234.4" y2="65" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="234.4" y1="45" x2="334.4" y2="45" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="334.4" y1="85" x2="384.4" y2="85" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="134.4" y1="65" x2="134.4" y2="85" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="234.4" y1="45" x2="234.4" y2="65" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="334.4" y1="45" x2="334.4" y2="85" style="stroke:#006400;stroke-width:2;"/>',
  '<line x1="84.4" y1="103" x2="84.4" y2="108" style="stroke:#333;stroke-width:2;"/>',
  '<line x1="134.4" y1="103" x2="134.4" y2="108" style="stroke:#333;stroke-width:2;"/>',
  '<line x1="184.4" y1="103" x2="184.4" y2="108" style="stroke:#333;stroke-width:2;"/>',
  '<line x1="234.4" y1="103" x2="234.4" y2="108" style="stroke:#333;stroke-width:2;"/>',
  '<line x1="284.4" y1="103" x2="284.4" y2="108" style="stroke:#333;stroke-width:2;"/>',
  '<line x1="334.4" y1="103" x2="334.4" y2="108" style="stroke:#333;stroke-width:2;"/>',
  '<line x1="384.4" y1="103" x2="384.4" y2="108" style="stroke:#333;stroke-width:2;"/>',
  '<line x1="84.4" y1="103" x2="384.4" y2="103" style="stroke:#333;stroke-width:2;"/>',
  '<text x="81.341" y="117.556" fill="#333" font-size="11">0</text>',
  '<text x="125.222" y="117.556" fill="#333" font-size="11" textLength="18.356">100</text>',
  '<text x="225.222" y="117.556" fill="#333" font-size="11" textLength="18.356">300</text>',
  '<text x="325.222" y="117.556" fill="#333" font-size="11" textLength="18.356">500</text>',
];
