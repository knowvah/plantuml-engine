/**
 * How a branch's leading and trailing arrows read as instructions and labels, split out of `conditional-builder.ts`
 * (500-line cap, dss T4a).
 */
import type { ActivityIf, ActivityNode } from '../ast.js';

/**
 * `Branch#isEmpty` is `InstructionList#isEmpty` (`Branch.java:205-207`), and `-> label;` / `-[#color]->` only set the
 * pending link rendering, never an instruction (`CommandArrow3.java:96-110`; `note-dispatch.ts#caseIsEmpty`): a branch
 * holding nothing else is empty.
 */
export function instructionsOf(nodes: readonly ActivityNode[]): readonly ActivityNode[] {
  return nodes.filter((n) => n.kind !== 'arrow-label');
}

/** The last `-> label;` before a branch's first instruction: its pending link rendering's display. */
function leadingArrowLabel(body: readonly ActivityNode[]): string | undefined {
  let label: string | undefined;
  for (const n of body) {
    if (n.kind !== 'arrow-label') break;
    if (n.label !== '') label = n.label;
  }
  return label;
}

/**
 * `Branch#getDisplayPositive` (`Branch.java:228-236`): a branch whose first tile's in-link has a display draws that
 * instead of the `then (y)` / `else (n)` text, so `-> text;` before the first instruction relabels the branch.
 */
export function withBranchArrowLabels(node: ActivityIf): ActivityIf {
  const thenLabel = leadingArrowLabel(node.thenBranch) ?? node.thenLabel;
  const elseLabel = leadingArrowLabel(node.elseBranch) ?? node.elseLabel;
  return {
    ...node,
    ...(thenLabel !== undefined ? { thenLabel } : {}),
    ...(elseLabel !== undefined ? { elseLabel } : {}),
    elseIfBranches: node.elseIfBranches.map((e) => {
      const label = leadingArrowLabel(e.body) ?? e.label;
      return label === undefined ? e : { ...e, label };
    }),
  };
}
