// @vitest-environment node
/**
 * Unit tests for `scripts/lib/oracle-route.ts#routeBucket` (mission
 * oracle-gap-capture, T2; plans/oracle-gap-capture/decisions.md D2): a new
 * oracle lands in the bucket of the JAR's diagram type, not the manifest's.
 */
import { describe, it, expect } from 'vitest';

import { routeBucket } from '../../../scripts/lib/oracle-route.js';

describe('routeBucket', () => {
  it('routes by the jar type: manifest sequence, jar ACTIVITY -> activity', () => {
    expect(routeBucket('sequence', 'ACTIVITY', false)).toBe('activity');
  });

  it.each([
    ['SEQUENCE', 'sequence'],
    ['CLASS', 'class'],
    ['STATE', 'state'],
    ['TIMING', 'timing'],
  ])('jar %s -> %s', (jarType, bucket) => {
    expect(routeBucket('unknown', jarType, false)).toBe(bucket);
  });

  it('sends a jar error page to unknown, whatever the manifest says', () => {
    expect(routeBucket('sequence', 'NONE', true)).toBe('unknown');
    expect(routeBucket('class', 'CLASS', true)).toBe('unknown');
  });

  it('keeps dot, hcl and yaml in their manifest bucket, even for an error page', () => {
    expect(routeBucket('dot', 'NONE', true)).toBe('dot');
    expect(routeBucket('hcl', 'HCL', false)).toBe('hcl');
    expect(routeBucket('yaml', 'YAML', false)).toBe('yaml');
  });

  it('keeps an object row stamped CLASS in object (EXPECTED_TAG.object)', () => {
    expect(routeBucket('object', 'CLASS', false)).toBe('object');
  });

  it('sends DESCRIPTION and untyped output to unknown', () => {
    expect(routeBucket('class', 'DESCRIPTION', false)).toBe('unknown');
    expect(routeBucket('component', 'DESCRIPTION', false)).toBe('unknown');
    expect(routeBucket('usecase', 'NONE', false)).toBe('unknown');
  });
});
