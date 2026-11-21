/**
 * The SVG groups teoz draws a participant's head, tail and lifeline, and a
 * message's arrow, in (plantuml#2935, upstream `0862a60af19`).
 *
 * Upstream builds each `UGroup` on the model object -- `Participant
 * #groupTypeHead/Tail/Lifeline` (`Participant.java:233-262`) and
 * `AbstractMessage#groupTypeMessage` (`AbstractMessage.java:319-326`) -- and
 * the teoz tiles open it around the component they draw. Here the geometry
 * carries the inputs (`ParticipantGeo.uid`/`sourceLine`, `MessageGeo.group`)
 * and these builders mirror the four methods, names kept.
 *
 * Each `UGroup` is backed by an `EnumMap`, so the attribute order in the tag
 * is `UGroupType`'s declaration order, not the `put` order (`UGroup.ts#asMap`);
 * `DATA_PARTICIPANT` is put and never written (`XmlDocument
 * #applyGroupAttribute`, `xml-writer.ts`). The unused `Pragma` argument of the
 * participant methods is dropped.
 *
 * @see net/sourceforge/plantuml/sequencediagram/Participant.java:233-262
 * @see net/sourceforge/plantuml/sequencediagram/AbstractMessage.java:315-326
 */

import { UGroup, UGroupType } from '../../core/klimt/shape/UGroup.js';
import type { MessageGroupGeo, ParticipantGeo } from './ast.js';

/** `new UGroup(location)`: the location's position, when the source had one. */
function locatedGroup(sourceLine: number | undefined): UGroup {
  return new UGroup(sourceLine === undefined ? null : { position: sourceLine });
}

/** `Participant#groupTypeTail` (`Participant.java:233-242`). */
export function groupTypeTail(p: ParticipantGeo): UGroup {
  const group = locatedGroup(p.sourceLine);
  group.put(UGroupType.CLASS, 'participant participant-tail');
  group.put(UGroupType.DATA_QUALIFIED_NAME, p.id);
  group.put(UGroupType.DATA_PARTICIPANT, p.id);
  group.put(UGroupType.DATA_ENTITY_UID, p.uid);
  group.put(UGroupType.DATA_UID, `${p.uid}-tail`);
  return group;
}

/** `Participant#groupTypeHead` (`Participant.java:244-252`). */
export function groupTypeHead(p: ParticipantGeo): UGroup {
  const group = locatedGroup(p.sourceLine);
  group.put(UGroupType.CLASS, 'participant participant-head');
  group.put(UGroupType.DATA_QUALIFIED_NAME, p.id);
  group.put(UGroupType.DATA_PARTICIPANT, p.id);
  group.put(UGroupType.DATA_ENTITY_UID, p.uid);
  group.put(UGroupType.DATA_UID, `${p.uid}-head`);
  return group;
}

/** `Participant#groupTypeLifeline` (`Participant.java:254-262`). */
export function groupTypeLifeline(p: ParticipantGeo): UGroup {
  const group = locatedGroup(p.sourceLine);
  group.put(UGroupType.CLASS, 'participant-lifeline');
  group.put(UGroupType.DATA_UID, `${p.uid}-lifeline`);
  group.put(UGroupType.DATA_QUALIFIED_NAME, p.id);
  group.put(UGroupType.DATA_PARTICIPANT, p.id);
  group.put(UGroupType.DATA_ENTITY_UID, p.uid);
  return group;
}

/** `AbstractMessage#groupTypeMessage` (`AbstractMessage.java:319-326`). */
export function groupTypeMessage(m: MessageGroupGeo): UGroup {
  const group = locatedGroup(m.sourceLine);
  group.put(UGroupType.CLASS, 'message');
  group.put(UGroupType.DATA_PARTICIPANT_1, m.participant1);
  group.put(UGroupType.DATA_PARTICIPANT_2, m.participant2);
  group.put(UGroupType.DATA_UID, m.uid);
  return group;
}
