/**
 * Fitness function for DIVERGENCES.md's shape. Commit 82b9128ea inserted an
 * entry with JavaScript's String.prototype.replace, whose replacement string
 * held "$`" twice (`$i = 1$`, "skips a `$`"). "$`" expands to the text before
 * the match, so each became a copy of the file's first 24,789 characters, and
 * the file carried three titles and stale duplicate sections for ten days.
 * "$'" would duplicate the tail the same way. Either shows up as a repeated
 * heading, which no hand edit of this file has needed.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const TITLE = '# Intentional Divergences from Upstream PlantUML';
const HEADING = /^#{1,3} .*$/gm;

const text = readFileSync(join(REPO, 'DIVERGENCES.md'), 'utf8');

describe('DIVERGENCES.md', () => {
  it('opens with its title and carries it once', () => {
    expect(text.startsWith(`${TITLE}\n`)).toBe(true);
    expect(text.split(TITLE).length - 1).toBe(1);
  });

  it('repeats no heading', () => {
    const headings: readonly string[] = text.match(HEADING) ?? [];
    const repeated = headings.filter((h, i) => headings.indexOf(h) !== i);
    expect(repeated).toEqual([]);
  });
});
