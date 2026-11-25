import { describe, expect, it } from 'vitest';

import { normalizeSvg } from './normalize.js';
import { svgComments } from './svg-comments.js';
import { TRANSITION_MILLIS_TOKEN, normaliseTransitionNodeId } from './transition-node-id.js';

// Literal jar strings from plans/state-node-label/measurements/probes/jar/ (snl-issue, snl-arrow-node-upper,
// snl-left, snl-start-end, snl-multiline).
describe('normaliseTransitionNodeId (snl D2)', () => {
  it('maps a jar path id and the port id for the same transition to the same string', () => {
    expect(normaliseTransitionNodeId('A-transition_A_B__go__1795555265179')).toBe(
      normaliseTransitionNodeId('A-transition_A_B__go__0'),
    );
    expect(normaliseTransitionNodeId('A-transition_A_B__go__0')).toBe(
      `A-transition_A_B__go__${TRANSITION_MILLIS_TOKEN}`,
    );
  });

  it('rewrites the digit tail before -to- and in a -backto- id', () => {
    expect(normaliseTransitionNodeId('transition_A_B__go__1795555395289-to-B')).toBe(
      `transition_A_B__go__${TRANSITION_MILLIS_TOKEN}-to-B`,
    );
    expect(normaliseTransitionNodeId('B-backto-transition_A_B__go__1795555395289')).toBe(
      `B-backto-transition_A_B__go__${TRANSITION_MILLIS_TOKEN}`,
    );
    expect(normaliseTransitionNodeId('transition_A_B__go__1795555395289-A')).toBe(
      `transition_A_B__go__${TRANSITION_MILLIS_TOKEN}-A`,
    );
  });

  it('rewrites only the last digit run of a label with underscores and digits', () => {
    expect(normaliseTransitionNodeId('transition_A_B__go__now__1795555395290')).toBe(
      `transition_A_B__go__now__${TRANSITION_MILLIS_TOKEN}`,
    );
    expect(normaliseTransitionNodeId('transition_A_B__go_2__7')).toBe(
      `transition_A_B__go_2__${TRANSITION_MILLIS_TOKEN}`,
    );
  });

  it('rewrites a comment naming a pseudo-state end', () => {
    expect(normaliseTransitionNodeId('link *start* to transition_*start*_A__init__1795555395490')).toBe(
      `link *start* to transition_*start*_A__init__${TRANSITION_MILLIS_TOKEN}`,
    );
  });

  it('is inert on entity and link ids and on a transition_ name with no digit tail', () => {
    for (const s of ['ent0003', 'lnk4', 'transition_x', 'A-to-B', 'link A to B', 'transition_1x'])
      expect(normaliseTransitionNodeId(s)).toBe(s);
  });
});

describe('normaliseTransitionNodeId wiring', () => {
  const jar =
    '<svg><text>transition_A_B__go__17</text><!--link A to transition_A_B__go__1795555395289-->' +
    '<path id="A-transition_A_B__go__1795555395289"/></svg>';
  const port =
    '<svg><text>transition_A_B__go__17</text><!--link A to transition_A_B__go__0-->' +
    '<path id="A-transition_A_B__go__0"/></svg>';

  it('normalizeSvg rewrites attribute values on both sides, never text content', () => {
    expect(normalizeSvg(port)).toEqual(normalizeSvg(jar));
    const textNode = normalizeSvg(port).children?.[0]?.children?.[0];
    expect(textNode).toEqual({ type: 'text', text: 'transition_A_B__go__17' });
  });

  it('svgComments rewrites comment text on both sides', () => {
    expect(svgComments(port)).toEqual(svgComments(jar));
    expect(svgComments(jar)).toEqual([`link A to transition_A_B__go__${TRANSITION_MILLIS_TOKEN}`]);
  });
});
