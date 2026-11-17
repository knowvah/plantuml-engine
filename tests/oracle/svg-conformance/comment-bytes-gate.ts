/**
 * class-comment-bytes (ccb, #151, D4): the comment-byte assertion the class and object golden ratchets make on the
 * render they already compared, and the open list it reads (`oracle/goldens/svg-<engine>/comment-open.json`).
 *
 * - A pin not in the open list: its comment sequence equals the golden's.
 * - A pin in the open list: its `commentMismatch` never rises above the recorded `count`, and is above 0 (a fixed pin
 *   must leave the list).
 */
import { readFileSync } from 'node:fs';
import { expect } from 'vitest';

import { commentMismatch, firstCommentDiff, svgComments } from './svg-comments.js';

/** One open-list row: the pin, its recorded mismatch ceiling, and the mechanism or issue that holds it. */
export interface CommentOpenEntry {
  readonly slug: string;
  readonly tree?: string;
  readonly count: number;
  readonly reason: string;
}

interface CommentOpenFile {
  readonly fixtures: readonly CommentOpenEntry[];
}

/** The open list keyed `<tree>/<slug>`, an entry without `tree` taking `defaultTree`. */
export function readCommentOpen(path: string, defaultTree: string): ReadonlyMap<string, CommentOpenEntry> {
  const file = JSON.parse(readFileSync(path, 'utf8')) as CommentOpenFile;
  return new Map(file.fixtures.map((e) => [`${e.tree ?? defaultTree}/${e.slug}`, e]));
}

/** Asserts the comment bytes of `ours` against `golden` for the pin `name`, under its open entry if it has one. */
export function assertCommentBytes(
  name: string,
  ours: string,
  golden: string,
  open: CommentOpenEntry | undefined,
): void {
  const oursComments = svgComments(ours);
  const jarComments = svgComments(golden);
  const first = firstCommentDiff(oursComments, jarComments);
  if (open === undefined) {
    expect(first, `${name}: comment bytes differ from the golden — first diff: ${first}`).toBe('');
    return;
  }
  const mismatch = commentMismatch(oursComments, jarComments);
  expect(mismatch, `${name}: comments now equal the golden — remove it from comment-open.json`).toBeGreaterThan(0);
  expect(
    mismatch,
    `${name}: comment mismatch rose above ${String(open.count)} (${open.reason}) — first diff: ${first}`,
  ).toBeLessThanOrEqual(open.count);
}
