/**
 * The post-parse `hide unlinked` / `hide stereotype` passes, split out of
 * `sequence-parse-helpers.ts` (which re-exports them) to keep that file under
 * the 500-line cap (sdd1 T1b). Bodies unchanged.
 */
import type { Participant, ParticipantBadge, SequenceDiagramAST, SequenceEvent, StereotypeRule } from './ast.js';
import { Stereotype } from '../../core/stereo/Stereotype.js';
import { GUILLEMET_DOUBLE_COMPARATOR } from '../../core/stereo/StereotypeDecoration.js';
import { displayLines } from './display-lines.js';
import type { Paint } from '../../core/paint.js';
import { anyBadgeFor, visibleStereotypeLines, type ParticipantLayoutCtx } from './sequence-layout-participant-label.js';

// ---------------------------------------------------------------------------
// hide unlinked (CommandHideUnlinked.java, T13)
// ---------------------------------------------------------------------------

/** Every participant id referenced by an event, recursing into frame
 *  branches (an `alt` branch's messages still "link" the participant).
 *  @see sequencediagram/SequenceDiagram.java (removeHiddenParticipants) */
export function linkedParticipantIds(events: readonly SequenceEvent[]): Set<string> {
  const linked = new Set<string>();
  for (const event of events) collectLinkedIds(event, linked);
  return linked;
}

function collectLinkedIds(event: SequenceEvent, linked: Set<string>): void {
  if (event.kind === 'message') {
    linked.add(event.from);
    linked.add(event.to);
  } else if (event.kind === 'messageExo') {
    // `isAlone` asks every event `dealWith(p)`, and `MessageExo.dealWith`
    // answers `participant == someone` (`MessageExo.java:90-92`) — so an exo
    // message links its ONE endpoint and nothing else.
    // @see sequencediagram/SequenceDiagram.java:535-541
    linked.add(event.participant);
  } else if (event.kind === 'note') {
    for (const p of event.participants) linked.add(p);
  } else if (event.kind === 'activate' || event.kind === 'deactivate') {
    linked.add(event.participantId);
  } else if (event.kind === 'frame') {
    for (const branch of event.branches) for (const inner of branch) collectLinkedIds(inner, linked);
  }
}

/**
 * `hide|show [GENDER] stereotype` (`options.stereotypeRules`): what each
 * participant's DISPLAYED stereotype keeps, `Participant#visibleStereotypeText`
 * (`Participant.java:142-166`, upstream `0801eabbca2`). Every participant
 * holds the diagram's one `StereotypeVisibility`, read at draw time, so the
 * rules reach declarations above them; applied post-parse for the same reason
 * `applyHideUnlinked` is. `getUsedStyles` still merges the whole stereotype
 * (`:82-91`), so it is kept and only flagged:
 * - every label shown: the `Stereotype` itself, unchanged;
 * - none: hidden ({@link Participant.stereotypeHidden});
 * - some: the kept labels, space-joined, as plain text
 *   ({@link Participant.stereotypeText}).
 */
export function applyHideStereotype(ast: SequenceDiagramAST): void {
  const rules = ast.options.stereotypeRules ?? [];
  if (rules.length === 0) return;
  for (const p of ast.participants) {
    if (p.stereotype === undefined) continue;
    const visible = visibleStereotypeText(p, rules);
    if (visible === SHOWN) continue;
    p.stereotypeHidden = true;
    if (visible !== undefined) p.stereotypeText = visible;
  }
}

/** The `Stereotype` itself stays: every label is shown. */
const SHOWN = Symbol('shown');

/** `Participant#visibleStereotypeText` (`Participant.java:142-166`): labels
 *  are `Stereotype#getLabels(Guillemet.DOUBLE_COMPARATOR)`; a stereotype with
 *  none (a bare spot) is judged on its `toString()`. */
function visibleStereotypeText(p: Participant, rules: readonly StereotypeRule[]): string | typeof SHOWN | undefined {
  const stereotype = Stereotype.build(p.stereotype!, false);
  const name = displayLines(p.display)[0];
  const labels = stereotype.getLabels(GUILLEMET_DOUBLE_COMPARATOR);
  if (labels.length === 0) return isLabelShown(rules, stereotype.toString(), p.id, name) ? SHOWN : undefined;
  const kept = labels.filter((label) => isLabelShown(rules, label, p.id, name));
  if (kept.length === labels.length) return SHOWN;
  return kept.length === 0 ? undefined : kept.join(' ');
}

/** `StereotypeVisibility#isLabelShown` (`StereotypeVisibility.java:69-75`):
 *  the last rule that applies wins; none, shown. A rule with no gender
 *  applies to every label, a `<<name>>` one to that label on every
 *  participant, any other to the participant named by code or display name
 *  (`applies`, `:77-84`). */
function isLabelShown(
  rules: readonly StereotypeRule[],
  label: string,
  code: string,
  name: string | undefined,
): boolean {
  let shown = true;
  for (const rule of rules) {
    const applies =
      rule.gender === undefined ||
      (rule.gender.startsWith('<<') ? rule.gender === label : rule.gender === code || rule.gender === name);
    if (applies) shown = rule.show;
  }
  return shown;
}

/** The stereotype rows a head draws: none once `hide stereotype` has dropped
 *  it from `Participant#getDisplay` (`Participant.java:125-135`). */
export function displayedStereotypeLines(p: Participant): readonly string[] {
  return p.stereotypeHidden === true ? [] : visibleStereotypeLines(p);
}

/** The badge `Display#createStereotype` draws from the DISPLAYED stereotype
 *  (`Display.java:671-676`): none once `hide stereotype` has dropped it. */
export function displayedBadgeOf(p: Participant, ctx: ParticipantLayoutCtx, fill: Paint): ParticipantBadge | undefined {
  return p.stereotypeHidden === true ? undefined : anyBadgeFor(p, ctx, fill);
}

/** `hide unlinked` (`options.hideUnlinked`): drop participants no event
 *  references, and prune them out of any box's `participantIds` too so a
 *  box background doesn't span a column that no longer renders.
 *  @see sequencediagram/command/CommandHideUnlinked.java */
export function applyHideUnlinked(ast: SequenceDiagramAST): void {
  if (ast.options.hideUnlinked !== true) return;
  const linked = linkedParticipantIds(ast.events);
  ast.participants = ast.participants.filter((p) => linked.has(p.id));
  for (const box of ast.boxes) {
    box.participantIds = box.participantIds.filter((id) => linked.has(id));
  }
}
