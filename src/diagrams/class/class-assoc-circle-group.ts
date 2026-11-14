/**
 * The group an association-class point (the `(A,B) .. C` circle) is created in.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/objectdiagram/AbstractClassOrObjectDiagram.java:244-249
 *   `Association`'s constructor: `if (entity1.getQuark().getParent() == entity2.getQuark().getParent())
 *   quark = entity1.getQuark().getParent().child(idShort); else quark = quarkInContext(true, cleanId(idShort));`
 *   so the point joins the pair's shared group, and otherwise the current group.
 */
import type { ClassDiagramAST, Classifier } from './ast.js';
import { registerInNamespace } from './class-namespace.js';
import { idLeaf } from './class-relationship-parser.js';

/** The namespace id the point lives in: the pair's shared parent, else the group being parsed. */
export function coupleCircleNamespace(
  ast: ClassDiagramAST,
  [aId, bId]: readonly [string, string],
  activeNamespace: string | null,
): string | null {
  const parentOf = (id: string): string | null => ast.classifiers.find((c) => c.id === id)?.namespace ?? null;
  const shared = parentOf(aId);
  return shared === parentOf(bId) ? shared : activeNamespace;
}

/** Put `circle` into its group, after the classifiers already registered (creation order). */
export function placeCoupleCircle(
  ast: ClassDiagramAST,
  circle: Classifier,
  pair: readonly [string, string],
  activeNamespace: string | null,
): void {
  const nsId = coupleCircleNamespace(ast, pair, activeNamespace);
  if (nsId === null) return;
  circle.namespace = nsId;
  registerInNamespace(ast.namespaces, nsId, circle.id);
}

/**
 * The 4-entity `(A,B) .. (C,D)` overload creates both points in the current group:
 * `getCurrentGroup().getQuark().child(tmp1)` (`AbstractClassOrObjectDiagram.java:121-125`).
 */
export function placeInCurrentGroup(ast: ClassDiagramAST, circle: Classifier, activeNamespace: string | null): void {
  if (activeNamespace === null) return;
  circle.namespace = activeNamespace;
  registerInNamespace(ast.namespaces, activeNamespace, circle.id);
}

/**
 * `Link#idCommentForSvg` (`abel/Link.java:106-113`) names each end by `Entity#getName()`, the quark's own
 * name (`Entity.java:686-688`, `Quark.java:84-86`), never the qualified one. A couple's real endpoints are
 * classifiers whose AST id is qualified with the diagram's separator (`set namespaceSeparator` is stored on
 * `ast.namespaceSeparator`; absent means the default `.`, `AbstractEntityDiagram.java:88`), so the leaf is
 * split with that separator, the way `parseRelationshipLine` does for a plain link.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/abel/Link.java:106-113
 */
export function coupleEndName(ast: ClassDiagramAST, id: string): string {
  return idLeaf(id, ast.namespaceSeparator === undefined ? '.' : ast.namespaceSeparator);
}
