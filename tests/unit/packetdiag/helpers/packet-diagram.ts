/** A `PacketDiagram` over an empty or given style source, for the model and draw tests. */
import { Pragma } from '../../../../src/core/skin/Pragma.js';
import { createSpriteRegistry } from '../../../../src/core/sprite-registry.js';
import { createMindmapSkinParam } from '../../../../src/core/style/mindmap-style-builder.js';
import { PreprocessingArtifact } from '../../../../src/core/tim/PreprocessingArtifact.js';
import { SkinParam } from '../../../../src/diagrams/packetdiag/packet-skin-param.js';
import { PacketDiagram } from '../../../../src/diagrams/packetdiag/PacketDiagram.js';

export function packetSkinParam(): SkinParam {
  return new SkinParam({
    style: createMindmapSkinParam({}),
    skinparam: new Map<string, string>(),
    sprites: createSpriteRegistry(),
    pragma: Pragma.createEmpty(),
  });
}

export function emptyPacketDiagram(): PacketDiagram {
  return new PacketDiagram({ lines: [] }, new PreprocessingArtifact(), packetSkinParam());
}

/** One `[start, end, desc]` field per entry, height 1, rotation 0. */
export type Field = readonly [number, number, string];

export function packetOf(fields: readonly Field[], configure?: (d: PacketDiagram) => void): PacketDiagram {
  const diagram = emptyPacketDiagram();
  configure?.(diagram);
  for (const [start, end, desc] of fields) diagram.addPacketItemRange(start, end, 1, desc, 0);
  return diagram;
}

/** `packet-tcp-header`'s fields (`test-results/dot-cache/packet/packet-tcp-header/in.puml`). */
export const TCP_HEADER: readonly Field[] = [
  [0, 15, 'Source Port'],
  [16, 31, 'Destination Port'],
  [32, 63, 'Sequence Number'],
  [64, 95, 'Acknowledgment Number'],
  [96, 99, 'Data Offset'],
  [100, 105, 'Reserved'],
  [106, 106, 'URG'],
  [107, 107, 'ACK'],
  [108, 108, 'PSH'],
  [109, 109, 'RST'],
  [110, 110, 'SYN'],
  [111, 111, 'FIN'],
  [112, 127, 'Window Size'],
];
