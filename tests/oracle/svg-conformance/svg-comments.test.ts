import { describe, it, expect } from 'vitest';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { assertCommentBytes, readCommentOpen } from './comment-bytes-gate.js';
import { commentMismatch, firstCommentDiff, svgComments } from './svg-comments.js';

describe('svgComments', () => {
  it('returns every comment body in document order, untrimmed', () => {
    const svg = '<svg><!--class A--><g><!--link A to B--><path/></g><!-- x\ny --></svg>';
    expect(svgComments(svg)).toEqual(['class A', 'link A to B', ' x\ny ']);
  });

  it('returns an empty list for an SVG without comments', () => {
    expect(svgComments('<svg><g/></svg>')).toEqual([]);
  });
});

describe('commentMismatch', () => {
  it('is 0 for byte-equal sequences', () => {
    expect(commentMismatch(['class A', 'class B'], ['class A', 'class B'])).toBe(0);
  });

  it('counts comments only ours has and only the jar has', () => {
    expect(commentMismatch(['class A', 'class X::B'], ['class A', 'class B', 'link A to B'])).toBe(3);
  });

  it('counts a repeated comment once per extra copy (multiset)', () => {
    expect(commentMismatch(['class A', 'class A'], ['class A'])).toBe(1);
  });

  it('is 1 when the multisets agree and the order does not', () => {
    expect(commentMismatch(['class B', 'class A'], ['class A', 'class B'])).toBe(1);
  });
});

describe('firstCommentDiff', () => {
  it('names the first differing position and both sides', () => {
    expect(firstCommentDiff(['class A', 'class X::B'], ['class A', 'class B'])).toBe(
      '#1 ours "class X::B" jar "class B"',
    );
  });

  it('names a missing comment as undefined', () => {
    expect(firstCommentDiff(['class A'], ['class A', 'link A to B'])).toBe('#1 ours undefined jar "link A to B"');
  });

  it('is empty for equal sequences', () => {
    expect(firstCommentDiff(['class A'], ['class A'])).toBe('');
  });
});

describe('assertCommentBytes (ccb D4)', () => {
  const golden = '<svg><!--class A--><!--class B--><!--link A to B--></svg>';

  it('passes a pin whose comments equal the golden', () => {
    expect(() => assertCommentBytes('class/pin-a', golden, golden, undefined)).not.toThrow();
  });

  it('fails a pin whose golden has one comment edited, naming the slug and the comment', () => {
    const tampered = golden.replace('class B', 'class Z');
    expect(() => assertCommentBytes('class/pin-a', golden, tampered, undefined)).toThrow(
      /class\/pin-a: comment bytes differ.*#1 ours "class B" jar "class Z"/,
    );
  });

  it('fails an open pin whose comments now match, saying to remove it', () => {
    const open = { slug: 'pin-a', count: 2, reason: 'D3' };
    expect(() => assertCommentBytes('class/pin-a', golden, golden, open)).toThrow(
      /class\/pin-a: comments now equal the golden — remove it from comment-open.json/,
    );
  });

  it('holds an open pin at or below its count, and fails it above', () => {
    const ours = '<svg><!--class A--><!--class X::B--></svg>';
    expect(() =>
      assertCommentBytes('class/pin-a', ours, golden, { slug: 'pin-a', count: 3, reason: 'D3' }),
    ).not.toThrow();
    expect(() => assertCommentBytes('class/pin-a', ours, golden, { slug: 'pin-a', count: 2, reason: 'D3' })).toThrow(
      /class\/pin-a: comment mismatch rose above 2 \(D3\)/,
    );
  });
});

describe('readCommentOpen', () => {
  it('keys entries by tree and slug, with the default tree for an entry without one', () => {
    const dir = mkdtempSync(join(tmpdir(), 'ccb-open-'));
    const path = join(dir, 'comment-open.json');
    writeFileSync(
      path,
      JSON.stringify({
        fixtures: [
          { slug: 'a', count: 1, reason: 'D1' },
          { slug: 'b', tree: 'unknown', count: 2, reason: 'D2' },
        ],
      }),
    );
    expect([...readCommentOpen(path, 'class').keys()]).toEqual(['class/a', 'unknown/b']);
    expect(readCommentOpen(path, 'class').get('unknown/b')?.count).toBe(2);
  });
});
