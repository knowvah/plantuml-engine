/**
 * plantuml#2935 (upstream `0862a60af19`): teoz wraps each participant's head,
 * tail and lifeline, and each message's arrow, in an attributed `<g>`.
 *
 * - `LivingSpace#drawLineAndLiveboxes` (`teoz/LivingSpace.java:151-157`): the
 *   lifeline group holds the line only; the liveboxes follow it, outside.
 * - `LivingSpace#drawHeadOrTail` (`:214-223`): head/tail group around the
 *   url and the component, so a `create` head drawn by its message gets one.
 * - `CommunicationTile#drawU` (`:369-371`), `CommunicationTileSelf#drawU`
 *   (`:157-159`), `CommunicationExoTile#drawU` (`:153-155`): the message
 *   group wraps the arrow component only -- not the multicast arrows drawn
 *   before it (`:338`) nor the created head (`:351-366`).
 * - Attributes: `Participant#groupTypeHead/Tail/Lifeline`
 *   (`Participant.java:233-262`), `AbstractMessage#groupTypeMessage`
 *   (`AbstractMessage.java:319-326`); the uids are `"part" + cpt` from 1
 *   (`SequenceDiagram.java:105,179`) and `"msg" + (++messageCount)`
 *   (`:200,206`); `data-source-line` is the creating command's
 *   `LineLocation` (`UGroup(LineLocation)`).
 * - An empty group (the hidden arrow's) is dropped by
 *   `SvgGraphics#closeTopPendingElement` (`SvgGraphics.java:1197-1202`).
 *
 * Expected tags: `scripts/oracle-render.sh` on SOURCE, jar 1.2026.11beta1
 * (upstream a720bdd), 2026-11-19.
 */
import { describe, expect, it } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderFixtureSequence } from '../../oracle/svg-conformance/render-fixture-sequence.js';
import { UGroupType } from '../../../src/core/klimt/shape/UGroup.js';
import type { MessageEvent, ParticipantGeo } from '../../../src/diagrams/sequence/ast.js';
import type { EventProcessingContext } from '../../../src/diagrams/sequence/sequence-layout-events.js';
import { messageGroupOf } from '../../../src/diagrams/sequence/sequence-layout-message.js';
import { groupTypeHead, groupTypeMessage } from '../../../src/diagrams/sequence/sequence-groups.js';

const SOURCE = [
  '@startuml',
  'participant "A:x" as A',
  'A -> B : hello',
  'activate B',
  'B -> B : self',
  'B --> A : back',
  'return done',
  '[-> A : exo',
  'A ->] : out',
  'create C',
  'A -> C : make',
  'A -> B & C : multi',
  'A -[hidden]-> B',
  'B <- A : rev',
  'note over A : n',
  'destroy C',
  '@enduml',
  '',
].join('\n');

const svg = renderFixtureSequence(SOURCE, new DeterministicMeasurer());

const head = (n: number, code: string, line: number): string =>
  `<g class="participant participant-head" data-qualified-name="${code}" data-entity-uid="part${n}" id="part${n}-head" data-source-line="${line}">`;
const tail = (n: number, code: string, line: number): string =>
  `<g class="participant participant-tail" data-qualified-name="${code}" data-entity-uid="part${n}" id="part${n}-tail" data-source-line="${line}">`;
const lifeline = (n: number, code: string, line: number): string =>
  `<g class="participant-lifeline" data-qualified-name="${code}" data-entity-uid="part${n}" id="part${n}-lifeline" data-source-line="${line}">`;
const message = (id: number, p1: number, p2: number, line: number): string =>
  `<g class="message" data-entity-1="part${p1}" data-entity-2="part${p2}" id="msg${id}" data-source-line="${line}">`;

/** Every attributed `<g ...>` opening tag, in document order. */
function attributedGroups(doc: string): string[] {
  return [...doc.matchAll(/<g [^>]*>/g)].map((m) => m[0]).filter((t) => !t.includes('font-family'));
}

/** The markup between `open` and its matching `</g>`. */
function groupBody(doc: string, open: string): string {
  const start = doc.indexOf(open);
  if (start === -1) throw new Error(`no group ${open}`);
  let depth = 0;
  const re = /<g\b[^>]*?(\/?)>|<\/g>/g;
  re.lastIndex = start;
  for (let m = re.exec(doc); m !== null; m = re.exec(doc)) {
    if (m[0] === '</g>') depth--;
    else if (m[1] !== '/') depth++;
    if (depth === 0) return doc.slice(start + open.length, m.index);
  }
  throw new Error(`unclosed group ${open}`);
}

/** The element names directly inside a group body (`<g>`, `<line>`, ...). */
function topLevelNames(body: string): string[] {
  const names: string[] = [];
  let depth = 0;
  for (const m of body.matchAll(/<(\/?)(\w+)\b[^>]*?(\/?)>/g)) {
    const [, closing, name, selfClosing] = m;
    if (closing === '/') depth--;
    else {
      if (depth === 0) names.push(name!);
      if (selfClosing !== '/') depth++;
    }
  }
  return names;
}

describe('teoz participant and message groups (plantuml#2935)', () => {
  it('emits every group in the jar order, with the jar attributes', () => {
    expect(attributedGroups(svg)).toEqual([
      lifeline(1, 'A', 1),
      lifeline(2, 'B', 2),
      lifeline(3, 'C', 9),
      head(1, 'A', 1),
      head(2, 'B', 2),
      tail(1, 'A', 1),
      tail(2, 'B', 2),
      tail(3, 'C', 9),
      message(1, 1, 2, 2),
      message(2, 2, 2, 4),
      message(3, 2, 1, 5),
      message(4, 2, 1, 6),
      message(5, 1, 1, 7),
      message(6, 1, 1, 8),
      head(3, 'C', 9),
      message(7, 1, 3, 10),
      message(8, 1, 2, 11),
      // msg9 is the hidden arrow: its group is empty, so it is dropped.
      message(10, 1, 2, 13),
    ]);
  });

  it('puts only the line in the lifeline group; the livebox follows it outside', () => {
    expect(topLevelNames(groupBody(svg, lifeline(2, 'B', 2)))).toEqual(['g']);
    const after = svg.slice(svg.indexOf(lifeline(2, 'B', 2)));
    const closeAt = after.indexOf(lifeline(3, 'C', 9));
    // B's livebox is the untitled `<g><rect .../></g>` between B's and C's lifeline groups.
    expect(after.slice(0, closeAt)).toMatch(
      /<\/g><\/g><g>(<title><\/title>)?<rect [^>]*width="10" height="94"[^>]*\/><\/g>$/,
    );
  });

  it('wraps the head and tail component, url and all', () => {
    expect(topLevelNames(groupBody(svg, head(1, 'A', 1)))).toEqual(['rect', 'text']);
    expect(topLevelNames(groupBody(svg, tail(3, 'C', 9)))).toEqual(['rect', 'text']);
  });

  it('wraps a flat, a self and an exo arrow component', () => {
    expect(topLevelNames(groupBody(svg, message(1, 1, 2, 2)))).toEqual(['polygon', 'line', 'text']);
    expect(topLevelNames(groupBody(svg, message(2, 2, 2, 4)))).toEqual(['line', 'line', 'line', 'polygon', 'text']);
    expect(topLevelNames(groupBody(svg, message(5, 1, 1, 7)))).toEqual(['polygon', 'line', 'text']);
  });

  it('leaves the multicast arrow, the note and the destroy cross outside every group', () => {
    const multi = message(8, 1, 2, 11);
    // The `& C` arrow is drawn just before the message group opens.
    expect(svg.slice(0, svg.indexOf(multi))).toMatch(/<\/g><polygon [^>]*\/><line [^>]*\/>$/);
    const tailOfDoc = svg.slice(svg.indexOf(message(10, 1, 2, 13)));
    expect(topLevelNames(tailOfDoc.slice(tailOfDoc.indexOf('</g>') + 4))).toEqual([
      'path',
      'path',
      'text',
      'line',
      'line',
    ]);
  });
});

/**
 * A multi-line note or participant block creates its participant at the
 * block's first BODY line, blank or not (`lines.subExtract(1, 1)` before
 * `lines.getLocation()`, `FactorySequenceNoteCommand.java:156-160`,
 * `FactorySequenceNoteOverSeveralCommand.java:235-238`,
 * `CommandParticipantMultilines.java:147-156`), and at no line for an empty
 * body (`BlocLines.java:406-410`); a multi-line `ref over` reads it before
 * the extract, so at its first line (`CommandReferenceMultilinesOverSeveral
 * .java:141-142`). Expected: the jar on MULTI_LINE, 2026-11-19.
 */
const MULTI_LINE = [
  '@startuml',
  'note over A',
  '  body of A',
  'end note',
  'note over B',
  'end note',
  'participant C [',
  '',
  '  =C',
  ']',
  'ref over D',
  '  r',
  'end ref',
  'note over E, F',
  '  ef',
  'end note',
  'A -> F',
  '@enduml',
  '',
].join('\n');

describe('the location of a participant a multi-line block creates', () => {
  it('is the first body line, none for an empty body, and the first line for ref over', () => {
    const svgOf = renderFixtureSequence(MULTI_LINE, new DeterministicMeasurer());
    expect(attributedGroups(svgOf).filter((t) => t.startsWith('<g class="participant-lifeline"'))).toEqual([
      lifeline(1, 'A', 2),
      '<g class="participant-lifeline" data-qualified-name="B" data-entity-uid="part2" id="part2-lifeline">',
      lifeline(3, 'C', 7),
      lifeline(4, 'D', 10),
      lifeline(5, 'E', 14),
      lifeline(6, 'F', 14),
    ]);
  });
});

describe('group inputs', () => {
  const ctx = (ids: readonly string[]): EventProcessingContext =>
    ({
      participantMap: new Map(ids.map((id, i) => [id, { id, uid: `part${i + 1}` } as ParticipantGeo])),
    }) as EventProcessingContext;
  const event = (uid: string | undefined): MessageEvent =>
    ({ kind: 'message', from: 'A', to: 'B', ...(uid === undefined ? {} : { uid }) }) as MessageEvent;

  it('resolves both endpoints to their participant uids (AbstractMessage.java:322-323)', () => {
    expect(messageGroupOf(event('msg4'), 'A', 'B', ctx(['A', 'B']))).toEqual({
      uid: 'msg4',
      participant1: 'part1',
      participant2: 'part2',
    });
  });

  it('refuses a message that never went through addMessage (SequenceDiagram.java:206)', () => {
    expect(() => messageGroupOf(event(undefined), 'A', 'B', ctx(['A', 'B']))).toThrow(
      'message reached layout without a uid',
    );
  });

  it('refuses an endpoint with no participant', () => {
    expect(() => messageGroupOf(event('msg1'), 'A', 'Z', ctx(['A']))).toThrow('message endpoint Z has no participant');
  });

  it('writes no data-source-line without a location (UGroup.java:49-52)', () => {
    const head = groupTypeHead({ id: 'A', uid: 'part1' } as ParticipantGeo).asMap();
    expect(head.has(UGroupType.DATA_SOURCE_LINE)).toBe(false);
    expect([...head.keys()]).toEqual([
      UGroupType.CLASS,
      UGroupType.DATA_QUALIFIED_NAME,
      UGroupType.DATA_ENTITY_UID,
      UGroupType.DATA_PARTICIPANT,
      UGroupType.DATA_UID,
    ]);
    const message = groupTypeMessage({ uid: 'msg1', participant1: 'part1', participant2: 'part1', sourceLine: 7 });
    expect(message.asMap().get(UGroupType.DATA_SOURCE_LINE)).toBe('7');
  });
});
