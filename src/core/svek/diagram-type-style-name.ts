/**
 * `DiagramType#getStyleName`: the `SName` a diagram kind's style signatures carry (`activityDiagram` for every
 * kind the table does not list, as upstream's trailing `return`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/core/DiagramType.java:234-296
 */
import type { DiagramType } from '../TitledDiagram.js';
import type { SName } from '../style/SName.js';

const STYLE_NAMES: Readonly<Partial<Record<DiagramType, SName>>> = {
  SEQUENCE: 'sequenceDiagram',
  STATE: 'stateDiagram',
  CLASS: 'classDiagram',
  OBJECT: 'objectDiagram',
  ACTIVITY: 'activityDiagram',
  DESCRIPTION: 'componentDiagram',
  MINDMAP: 'mindmapDiagram',
  WBS: 'wbsDiagram',
  GANTT: 'ganttDiagram',
  SALT: 'saltDiagram',
  YAML: 'yamlDiagram',
  HCL: 'yamlDiagram',
  JSON: 'jsonDiagram',
  TIMING: 'timingDiagram',
  NWDIAG: 'nwdiagDiagram',
  EBNF: 'ebnf',
  REGEX: 'regex',
  CHRONOLOGY: 'ganttDiagram',
  CHART: 'chartDiagram',
  PACKET: 'packetdiagDiagram',
};

/** @see DiagramType.java:234-296 */
export function getStyleName(diagramType: DiagramType): SName {
  return STYLE_NAMES[diagramType] ?? 'activityDiagram';
}
