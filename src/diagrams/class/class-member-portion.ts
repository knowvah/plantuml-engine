/**
 * `CucaDiagram#showPortion`'s fold for a member portion (`net/atmp/CucaDiagram.java:576-586`): the LAST matching
 * command wins, across every form of the command. The port keeps a global list and per-entity flags, so a source order
 * number on both says which came last: `hide members` then `show a fields` shows `a`'s fields, the reverse hides them.
 *
 * @see ~/git/plantuml/src/main/java/net/atmp/CucaDiagram.java:576-586
 */
import type { Classifier, HideTarget } from './ast.js';
import { directiveAppliesTo } from './class-directives-removal.js';
import type { ClassDiagramAST } from './ast.js';

type Portion = 'fields' | 'methods';

/** The targets of a global `hide` that reach a portion: `EntityPortion.MEMBER` is both (`EntityPortion.java:52-55`). */
const GLOBAL_TARGETS: Readonly<Record<Portion, readonly HideTarget[]>> = {
  fields: ['members', 'fields'],
  methods: ['members', 'methods'],
};

export function lastGlobalSeq(
  directives: ClassDiagramAST['directives'],
  classifier: Classifier,
  portion: Portion,
): number {
  let last = -1;
  for (const d of directives) {
    if (GLOBAL_TARGETS[portion].includes(d.target) && directiveAppliesTo(d, classifier))
      last = Math.max(last, d.seq ?? -1);
  }
  return last;
}

/**
 * The classifier's own flag when its command came after every global one that reaches this portion (a flag with no
 * order number, a kind-gender `hide object fields`, is taken as last, as before), else what the global ones say.
 */
export function memberPortionSuppressed(
  classifier: Classifier,
  directives: ClassDiagramAST['directives'],
  portion: Portion,
  globalAnswer: boolean,
): boolean {
  const own = portion === 'fields' ? classifier.suppressFields : classifier.suppressMethods;
  if (own === undefined) return globalAnswer;
  const seq = portion === 'fields' ? classifier.suppressFieldsSeq : classifier.suppressMethodsSeq;
  return seq === undefined || seq > lastGlobalSeq(directives, classifier, portion) ? own : globalAnswer;
}
