/**
 * `CucaDiagramFileMakerSvek#getOrderedLinks`: the links svek lays out and draws, regrouped so that links with the
 * same two entities (in either direction) sit next to each other, a new one after the last of its group.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/CucaDiagramFileMakerSvek.java:90-114
 */
import type { Link } from '../../core/abel/Link.js';
import type { ActivityDiagram } from './ActivityDiagram.js';

/** @see CucaDiagramFileMakerSvek.java:90-96 */
export function getOrderedLinks(diagram: ActivityDiagram): Link[] {
  const result: Link[] = [];
  for (const l of diagram.getLinks()) addLinkNew(result, l);

  return result;
}

/** @see CucaDiagramFileMakerSvek.java:98-114 */
function addLinkNew(result: Link[], link: Link): void {
  for (let i = 0; i < result.length; i++) {
    const other = result[i]!;
    if (other.sameConnections(link)) {
      while (i < result.length && result[i]!.sameConnections(link)) i++;

      if (i === result.length) result.push(link);
      else result.splice(i, 0, link);

      return;
    }
  }
  result.push(link);
}
