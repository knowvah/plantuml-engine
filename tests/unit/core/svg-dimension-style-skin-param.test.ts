/**
 * sds (#193) contract test: every per-engine `SkinParam` port mirrors `SkinParam#svgDimensionStyle`,
 * `!valueIs("svgdimensionstyle", "false")` (`SkinParam.java:1216-1218`), where `valueIs` is `equalsIgnoreCase`
 * (`SkinParam.java:367-369`): unset and `true` are true, `false` and `FALSE` are false. The ports are separate mirrors
 * of one upstream class (decisions.md D2), so one suite runs against each.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/skin/SkinParam.java:1216-1218
 */
import { describe, expect, it } from 'vitest';
import { Pragma } from '../../../src/core/skin/Pragma.js';
import { createSpriteRegistry } from '../../../src/core/sprite-registry.js';
import { buildMindmapStyleBuilder, createMindmapSkinParam } from '../../../src/core/style/mindmap-style-builder.js';
import { SkinParam as ActivityLegacySkinParam } from '../../../src/diagrams/activity-legacy/activity-legacy-skin-param.js';
import { SkinParam as BoardSkinParam } from '../../../src/diagrams/board/board-skin-param.js';
import { SkinParam as ChartSkinParam } from '../../../src/diagrams/chart/chart-skin-param.js';
import { SkinParam as CheneerSkinParam } from '../../../src/diagrams/cheneer/cheneer-skin-param.js';
import { SkinParam as EbnfSkinParam } from '../../../src/diagrams/ebnf/ebnf-skin-param.js';
import { SkinParam as GanttSkinParam } from '../../../src/diagrams/gantt/gantt-skin-param.js';
import { SkinParam as MindmapSkinParam } from '../../../src/diagrams/mindmap/mindmap-skin-param.js';
import { SkinParam as NwdiagSkinParam } from '../../../src/diagrams/nwdiag/nwdiag-skin-param.js';
import { SkinParam as PacketSkinParam } from '../../../src/diagrams/packetdiag/packet-skin-param.js';
import { SkinParam as RegexSkinParam } from '../../../src/diagrams/regex/regex-skin-param.js';
import { SaltSkinParam } from '../../../src/diagrams/salt/PSystemSalt.js';
import { SkinParam as TimingSkinParam } from '../../../src/diagrams/timing/timing-skin-param.js';
import { SkinParam as WbsSkinParam } from '../../../src/diagrams/wbs/wbs-skin-param.js';
import { SkinParam as WireSkinParam } from '../../../src/diagrams/wire/wire-skin-param.js';

/** The port surface under test. */
interface DimensionStylePort {
  svgDimensionStyle(): boolean;
}

/** The `SkinParamSource` every non-salt port is built from. */
interface PortSource {
  readonly style: ReturnType<typeof createMindmapSkinParam>;
  readonly skinparam: ReadonlyMap<string, string>;
  readonly sprites: ReturnType<typeof createSpriteRegistry>;
  readonly pragma: Pragma;
}

type PortFactory = (skinparam: ReadonlyMap<string, string>) => DimensionStylePort;

function sourceOf(skinparam: ReadonlyMap<string, string>): PortSource {
  return {
    style: createMindmapSkinParam({}),
    skinparam,
    sprites: createSpriteRegistry(),
    pragma: Pragma.createEmpty(),
  };
}

const PORTS: Readonly<Record<string, PortFactory>> = {
  timing: (sp) => new TimingSkinParam(sourceOf(sp)),
  gantt: (sp) => new GanttSkinParam(sourceOf(sp)),
  mindmap: (sp) => new MindmapSkinParam(sourceOf(sp)),
  wbs: (sp) => new WbsSkinParam(sourceOf(sp)),
  nwdiag: (sp) => new NwdiagSkinParam(sourceOf(sp)),
  'activity-legacy': (sp) => new ActivityLegacySkinParam(sourceOf(sp)),
  // sds T4: regex re-exports ebnf's port (`regex-skin-param.ts`), so its row exercises the same class.
  ebnf: (sp) => new EbnfSkinParam(sourceOf(sp)),
  regex: (sp) => new RegexSkinParam(sourceOf(sp)),
  board: (sp) => new BoardSkinParam(sourceOf(sp)),
  cheneer: (sp) => new CheneerSkinParam(sourceOf(sp)),
  wire: (sp) => new WireSkinParam(sourceOf(sp)),
  packetdiag: (sp) => new PacketSkinParam(sourceOf(sp)),
  chart: (sp) => new ChartSkinParam(sourceOf(sp)),
  salt: (sp) =>
    new SaltSkinParam({ styleBuilder: buildMindmapStyleBuilder({ skinparam: sp, styles: [] }), skinparam: sp }),
};

/** The value a `skinparam svgDimensionStyle <value>` line leaves; `undefined` = no such line. */
function dimensionStyleOf(factory: PortFactory, value: string | undefined): boolean {
  const skinparam = new Map(value === undefined ? [] : [['svgDimensionStyle', value]]);
  return factory(skinparam).svgDimensionStyle();
}

describe('SkinParam#svgDimensionStyle ports (SkinParam.java:1216-1218)', () => {
  for (const [engine, factory] of Object.entries(PORTS)) {
    it(`${engine}: unset/true are true, false/FALSE are false, the key is case-insensitive`, () => {
      expect(dimensionStyleOf(factory, undefined)).toBe(true);
      expect(dimensionStyleOf(factory, 'true')).toBe(true);
      expect(dimensionStyleOf(factory, 'false')).toBe(false);
      expect(dimensionStyleOf(factory, 'FALSE')).toBe(false);
      expect(factory(new Map([['SVGDIMENSIONSTYLE', 'False']])).svgDimensionStyle()).toBe(false);
    });
  }
});
