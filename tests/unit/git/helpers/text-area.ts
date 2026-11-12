import { GitTextArea } from '../../../../src/diagrams/git/GitTextArea.js';

/** A `GitTextArea` holding `lines`, as `GitDiagramFactory#createSystem` fills it. */
export function textAreaOf(lines: readonly string[]): GitTextArea {
  const area = new GitTextArea();
  for (const line of lines) area.add(line);
  return area;
}
