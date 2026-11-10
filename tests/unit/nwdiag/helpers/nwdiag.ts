/** A nwdiag `SkinParam` over the default style, and a model builder, for the unit tests. */
import { Pragma } from '../../../../src/core/skin/Pragma.js';
import { createSpriteRegistry } from '../../../../src/core/sprite-registry.js';
import { createMindmapSkinParam } from '../../../../src/core/style/mindmap-style-builder.js';
import { Network } from '../../../../src/diagrams/nwdiag/core/Network.js';
import type { NPlayField } from '../../../../src/diagrams/nwdiag/next/NPlayField.js';
import { SkinParam } from '../../../../src/diagrams/nwdiag/nwdiag-skin-param.js';

export function nwdiagSkinParam(): SkinParam {
  return new SkinParam({
    style: createMindmapSkinParam({}),
    skinparam: new Map<string, string>(),
    sprites: createSpriteRegistry(),
    pragma: Pragma.createEmpty(),
  });
}

/** `NwDiagram#createNetwork`: `new Network(playField.getLast(), playField.createNewStage(), name)`. */
export function createNetwork(field: NPlayField, networks: Network[], name: string): Network {
  const network = new Network(field.getLast(), field.createNewStage(), name);
  networks.push(network);
  return network;
}
